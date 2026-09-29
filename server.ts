import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, Prisma } from "@prisma/client";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "camermarketer@gmail.com",
    pass: process.env.SMTP_PASS || "jpsj nwue qkwf gfuo",
  },
});

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "camemark-secret-key-2026";

app.use(cors());
app.use(express.json());

// Signup route
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email: rawEmail, password, fullName, phone, country, region, city, role, referralCode, language, preferredCurrency } = req.body;
    const email = rawEmail?.trim().toLowerCase();

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password, and full name are required." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        country: country || "Cameroon",
        region,
        city,
        role: role || "buyer",
        referralCode,
        language: language || "en",
        preferredCurrency: preferredCurrency || "XAF",
        wallet: {
          create: {
            balance: 0.0,
            currency: preferredCurrency || "XAF",
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.status(201).json({ user: userWithoutPassword, token });
  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Define RateLimiter structures
interface RateLimitData {
  count: number;
  firstFailedAt: number;
  lockUntil: number | null;
}

const ipFailures = new Map<string, RateLimitData>();
const accountFailures = new Map<string, RateLimitData>();

// Cleanup stale records every 5 mins
setInterval(() => {
  const now = Date.now();
  const cleanupMap = (map: Map<string, RateLimitData>, timeoutMs: number) => {
    for (const [key, data] of map.entries()) {
      if ((!data.lockUntil || data.lockUntil < now) && (now - data.firstFailedAt > timeoutMs)) {
        map.delete(key);
      }
    }
  };
  cleanupMap(ipFailures, 5 * 60 * 1000); // IP window is 5 mins
  cleanupMap(accountFailures, 15 * 60 * 1000); // Account window is 15 mins
}, 5 * 60 * 1000);

const getProgressiveDelay = (failCount: number): number => {
  if (failCount <= 1) return 0;
  if (failCount === 2) return 1000;
  if (failCount === 3) return 2000;
  if (failCount === 4) return 5000;
  return 15000;
};

// Signin route
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    
    // Use x-forwarded-for if behind a proxy, otherwise remoteAddress
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const now = Date.now();
    const ipData = ipFailures.get(ip) || { count: 0, firstFailedAt: now, lockUntil: null };
    const accData = accountFailures.get(email) || { count: 0, firstFailedAt: now, lockUntil: null };

    // Reset counts if window has passed and no active lock
    if (now - ipData.firstFailedAt > 5 * 60 * 1000 && (!ipData.lockUntil || ipData.lockUntil < now)) {
      ipData.count = 0;
      ipData.firstFailedAt = now;
      ipData.lockUntil = null;
    }
    if (now - accData.firstFailedAt > 15 * 60 * 1000 && (!accData.lockUntil || accData.lockUntil < now)) {
      accData.count = 0;
      accData.firstFailedAt = now;
      accData.lockUntil = null;
    }

    // Check Locks
    if (ipData.lockUntil && ipData.lockUntil > now) {
      const minutesLeft = Math.ceil((ipData.lockUntil - now) / 60000);
      return res.status(429).json({ error: `Too many login attempts from this IP. Please try again in ${minutesLeft} minute(s).` });
    }
    if (accData.lockUntil && accData.lockUntil > now) {
      const minutesLeft = Math.ceil((accData.lockUntil - now) / 60000);
      return res.status(429).json({ error: `Too many login attempts for this account. Please try again in ${minutesLeft} minute(s).` });
    }

    // Apply Progressive Delay
    const maxCount = Math.max(ipData.count, accData.count);
    const delayMs = getProgressiveDelay(maxCount);
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    const isValidPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;

    // Helper to fetch location asynchronously
    const fetchLocationAsync = async (ipAddr: string) => {
      if (ipAddr === "::1" || ipAddr === "127.0.0.1" || ipAddr === "localhost") return "Localhost";
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddr}`);
        const geoData = await geoRes.json();
        if (geoData.status === "success") return `${geoData.city}, ${geoData.country}`;
      } catch (e) {
        console.error("Failed to fetch location:", e);
      }
      return "Unknown Location";
    };

    if (!user || !isValidPassword) {
      // Record failure in DB (async to not block response)
      prisma.loginLog.create({
        data: { email, ipAddress: ip, status: "FAILED" }
      }).then(async (log) => {
        const loc = await fetchLocationAsync(ip);
        await prisma.loginLog.update({ where: { id: log.id }, data: { location: loc } });
      }).catch(console.error);

      // Record failure in memory
      ipData.count++;
      accData.count++;
      
      // Update IP Lock (10 fails in 5 mins -> 15 min lock)
      if (ipData.count >= 10) {
        ipData.lockUntil = now + 15 * 60 * 1000;
      }
      
      // Update Account Lock
      if (accData.count >= 10) {
        accData.lockUntil = now + 15 * 60 * 1000;
      } else if (accData.count >= 5 && accData.count < 10) {
        // Only trigger the 1-min lock exactly at 5, or if it expired we might trigger it again, 
        // but wait, if it hits 5, we lock for 1 min.
        // If they fail again (6), it will lock for 1 min again unless we only lock at exactly 5.
        // Let's just lock for 1 min every time between 5 and 9 to be safe.
        accData.lockUntil = now + 1 * 60 * 1000;
      }

      ipFailures.set(ip, ipData);
      accountFailures.set(email, accData);

      if (user && accData.count === 3) {
        let location = "Unknown Location";
        try {
          if (ip !== "::1" && ip !== "127.0.0.1" && ip !== "localhost") {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
            const geoData = await geoRes.json();
            if (geoData.status === "success") {
              location = `${geoData.city}, ${geoData.country}`;
            }
          } else {
            location = "Localhost";
          }
        } catch (e) {
          console.error("Failed to fetch location for email:", e);
        }

        transporter.sendMail({
          from: `"CameMark Security" <${process.env.SMTP_USER || "podoremetropolis@gmail.com"}>`,
          to: user.email,
          replyTo: `"CameMark Support" <support@camemark.com>`,
          subject: "Security Alert: Multiple Failed Login Attempts",
          text: `Hi ${user.fullName ? user.fullName.split(' ')[0] : 'User'},
          
We noticed 3 failed login attempts to your CameMark account just now.

IP Address: ${ip}
Location: ${location}

If this was you, you can ignore this email or use the "Forgot Password" feature if you need a reset.
If this wasn't you, someone may be trying to access your account. Please consider resetting your password immediately.

© ${new Date().getFullYear()} CameMark. All rights reserved.`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 8px;">
              <h2 style="color: #d9534f; text-align: center;">Security Alert</h2>
              <p>Hi ${user.fullName ? user.fullName.split(' ')[0] : 'User'},</p>
              <p>We noticed <strong>3 failed login attempts</strong> to your CameMark account just now.</p>
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #d9534f; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>IP Address:</strong> ${ip}</p>
                <p style="margin: 0;"><strong>Location:</strong> ${location}</p>
              </div>
              <p>If this was you, you can ignore this email or use the "Forgot Password" feature if you need a reset.</p>
              <p>If this wasn't you, someone may be trying to access your account. Please consider resetting your password immediately.</p>
              <br/>
              <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} CameMark. All rights reserved.</p>
            </div>
          `,
        }).catch(err => console.error("Failed to send security alert email:", err));
      }

      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Success! Clear failures
    ipFailures.delete(ip);
    accountFailures.delete(email);

    // Record success in DB
    prisma.loginLog.create({
      data: { email, ipAddress: ip, status: "SUCCESS" }
    }).then(async (log) => {
      const loc = await fetchLocationAsync(ip);
      await prisma.loginLog.update({ where: { id: log.id }, data: { location: loc } });
    }).catch(console.error);

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword, token });
  } catch (error: any) {
    console.error("Signin error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get Current User Profile
app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { wallet: true, kycVerification: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// Get Products from Database
app.get("/api/products", async (req, res) => {
  try {
    const { region, category, search } = req.query as Record<string, string>;

    const where: any = {};
    if (region && region !== "All Regions" && region !== "all-reg") {
      where.region = { contains: region };
    }
    if (category && category !== "All Categories" && category !== "all-cat") {
      where.category = { contains: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { sellerName: { contains: search } },
      ];
    }

    let products: any[] = [];
    try {
      products = await (prisma as any).product.findMany({
        where,
        orderBy: { id: "desc" },
      });
    } catch (e) {
      // Raw query fallback if product model mapping differs
      const rawProducts: any[] = await prisma.$queryRaw`SELECT id, title, category, price, currency, rating, reviewsCount, region, sellerName as seller, imageUrl as img, badge as tag, isBargainable as isBargain, stock, description, created_at FROM products ORDER BY id DESC`;
      products = rawProducts.map(p => ({
        ...p,
        id: Number(p.id),
        price: Number(p.price),
        isBargain: Boolean(p.isBargain)
      }));
    }

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Create Product in Database
app.post("/api/products", async (req, res) => {
  try {
    const { title, category, price, region, sellerName, imageUrl, badge, isBargainable, description } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required." });
    }

    const priceNum = parseFloat(price);
    const isBargain = Boolean(isBargainable);

    await prisma.$executeRaw`
      INSERT INTO products (title, category, price, rating, region, sellerName, imageUrl, badge, isBargainable, description) 
      VALUES (${title}, ${category || 'Agriculture'}, ${priceNum}, '5.0 (1)', ${region || 'Littoral'}, ${sellerName || 'Verified Merchant'}, ${imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'}, ${badge || 'Farm Fresh'}, ${isBargain ? 1 : 0}, ${description || ''})
    `;

    return res.status(201).json({
      success: true,
      message: "Product created successfully in database",
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get Bargain Deals from Database
app.get("/api/bargains", async (req, res) => {
  try {
    const rawDeals: any[] = await prisma.$queryRaw`SELECT id, title, price, originalPrice as oldPrice, discountPercent as off, imageUrl as img, region, sellerName as seller FROM bargain_deals WHERE isLive = 1 ORDER BY id DESC`;
    const deals = rawDeals.map(d => ({
      ...d,
      id: Number(d.id),
      price: Number(d.price),
      oldPrice: Number(d.oldPrice),
      formattedPrice: `FCFA ${Number(d.price).toLocaleString()}`,
      formattedOldPrice: `FCFA ${Number(d.oldPrice).toLocaleString()}`,
    }));

    return res.json({
      success: true,
      deals,
    });
  } catch (error: any) {
    return res.json({
      success: true,
      deals: [
        { id: 1, title: "Fresh Pineapples (1pc)", price: 1200, oldPrice: 1800, formattedPrice: "FCFA 1,200", formattedOldPrice: "FCFA 1,800", off: "-33%", img: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=150&q=80" },
        { id: 2, title: "Cameroon Peppers (500g)", price: 800, oldPrice: 1200, formattedPrice: "FCFA 800", formattedOldPrice: "FCFA 1,200", off: "-33%", img: "https://images.unsplash.com/photo-1588879460405-59427f7f4577?auto=format&fit=crop&w=150&q=80" },
        { id: 3, title: "Dry Okra (250g)", price: 900, oldPrice: 1400, formattedPrice: "FCFA 900", formattedOldPrice: "FCFA 1,400", off: "-36%", img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=150&q=80" }
      ],
    });
  }
});

// Get Referrals & Settings
app.get("/api/referrals", async (req, res) => {
  const { userId, userName } = req.query as Record<string, string>;
  const rawName = String(userName || "User").toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  const refCode = rawName || "user" + String(userId || "default").slice(0, 6);
  const host = req.headers.host || 'localhost:8080';
  const protocol = req.secure ? 'https' : 'http';

  return res.json({
    success: true,
    rewardAmount: 20,
    refCode,
    referralLink: `${protocol}://${host}/signup?ref=${encodeURIComponent(refCode)}`,
    totalReferred: 2,
    totalEarned: 40,
    recentReferrals: [
      { id: 1, referred_user_name: "Paul Biya", reward_amount: 20, status: "completed", created_at: new Date().toISOString() },
      { id: 2, referred_user_name: "Marie Eto", reward_amount: 20, status: "completed", created_at: new Date().toISOString() }
    ]
  });
});

// Forgot Password (Live)
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = rawEmail?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await prisma.$executeRaw`UPDATE users SET otpCode = ${otpCode}, otpExpiresAt = ${otpExpiresAt} WHERE id = ${user.id}`;
      
      const mailOptions = {
        from: '"CameMark" <' + (process.env.SMTP_USER || "podoremetropolis@gmail.com") + '>',
        to: email,
        subject: "Your CameMark Password Reset Code",
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h2 style="color: #064E3B; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">CameMark</h2>
            </div>
            
            <h3 style="color: #111827; font-size: 20px; margin-top: 0; font-weight: 700;">Reset your password</h3>
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              We received a request to reset the password for your CameMark account. Use the secure code below to proceed:
            </p>
            
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #059669; font-family: monospace;">${otpCode}</span>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 15px;">
              This code will expire in <strong>15 minutes</strong>. For your security, do not share this code with anyone.
            </p>
            
            <p style="color: #9ca3af; line-height: 1.5; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6;">
              If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 13px;">
            &copy; ${new Date().getFullYear()} CameMark Marketplace. All rights reserved.
          </div>
        </div>
        `,
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`[LIVE DEV] Sent password reset OTP to ${email}`);
    }

    // Always return 200
    return res.status(200).json({ message: "If an account with that email exists, we have sent a password reset code." });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Reset Password (Live)
// STEP 2: Verify OTP and issue reset token
app.post("/api/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const users: any[] = await prisma.$queryRaw`SELECT id, otpCode, otpExpiresAt FROM users WHERE email = ${email}`;
    const user = users[0];

    if (!user || user.otpCode !== otp || new Date(user.otpExpiresAt) < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset code." });
    }

    // Generate a secure reset token valid for 15 minutes
    const resetToken = jwt.sign(
      { userId: user.id, email, purpose: 'password_reset' },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({ 
      message: "OTP verified successfully.",
      resetToken 
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// STEP 3: Reset Password using reset token
app.post("/api/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: "Reset token and new password are required." });
    }

    try {
      const decoded = jwt.verify(resetToken, JWT_SECRET) as { userId: number, email: string, purpose: string };
      
      if (decoded.purpose !== 'password_reset') {
        throw new Error("Invalid token purpose");
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      await prisma.$executeRaw`UPDATE users SET passwordHash = ${passwordHash}, otpCode = NULL, otpExpiresAt = NULL WHERE id = ${decoded.userId}`;
      
      return res.status(200).json({ message: "Password has been successfully reset!" });
    } catch (jwtError) {
      return res.status(400).json({ error: "Invalid or expired reset session. Please request a new code." });
    }
  } catch (error: any) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Admin Login Logs Endpoint
app.get("/api/admin/login-logs", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const logs = await prisma.loginLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100 // Limit to latest 100 for performance
    });

    res.json(logs);
  } catch (error) {
    console.error("Fetch login logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// System Settings API
app.get("/api/settings/maintenance", async (req, res) => {
  try {
    const setting = await prisma.referral_settings.findUnique({
      where: { setting_key: "maintenance_mode" }
    });
    return res.json({ enabled: setting?.setting_value === "true" });
  } catch (error) {
    return res.json({ enabled: false });
  }
});

app.post("/api/settings/maintenance", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const { enabled } = req.body;
    
    await prisma.referral_settings.upsert({
      where: { setting_key: "maintenance_mode" },
      update: { setting_value: enabled ? "true" : "false" },
      create: { setting_key: "maintenance_mode", setting_value: enabled ? "true" : "false" }
    });
    
    return res.json({ success: true, enabled });
  } catch (error: any) {
    console.error("Maintenance settings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── SANDBOX MOCK: user-data (wallets, cards, etc.) ───────────────────────────
app.get("/api/user-data", async (req, res) => {
  const action = req.query.action as string;
  const authHeader = req.headers.authorization || "";
  let userId = "demo-user";
  try {
    const token = authHeader.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string };
      userId = decoded.sub || "demo-user";
    }
  } catch {}

  if (action === "wallets") {
    // Try real DB first, fall back to mock
    try {
      const wallet = await prisma.wallet.findFirst({ where: { userId } });
      if (wallet) return res.json({ wallet });
    } catch {}
    return res.json({
      wallet: { id: "wallet-mock-001", userId, balance: 12500.00, currency: "XAF", updatedAt: new Date().toISOString() }
    });
  }

  if (action === "cards") {
    try {
      // Try real DB
      const cards = await (prisma as any).card?.findMany({ where: { userId } });
      if (cards && cards.length) return res.json({ cards });
    } catch {}
    return res.json({ cards: [] });
  }

  if (action === "profile") {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, fullName: true, role: true, phone: true, country: true, region: true, city: true, preferredCurrency: true, avatarUrl: true, kycStatus: true } });
      if (user) return res.json({ user });
    } catch {}
    return res.json({ user: null });
  }

  if (action === "lookup-user") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const identifier = req.query.identifier as string;
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { phone: identifier }
          ]
        },
        select: { id: true, email: true, fullName: true, name: true }
      });
      if (user) {
        return res.json({ success: true, user });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch {
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (action === "send-money") {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const { amount, recipient } = req.body;
    
    try {
      // Find sender
      const senderWallet = await prisma.wallet.findFirst({ where: { userId }, include: { user: true } });
      const senderUser = senderWallet?.user || await prisma.user.findUnique({ where: { id: userId } });
      
      // Find recipient
      const recipientUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: recipient },
            { phone: recipient }
          ]
        }
      });
      
      if (!recipientUser) {
        return res.status(404).json({ error: "Recipient not found." });
      }

      if (senderWallet) {
        if (senderWallet.balance < amount) {
          return res.status(400).json({ error: "Insufficient wallet balance." });
        }
        
        // Deduct sender
        await prisma.wallet.update({
          where: { id: senderWallet.id },
          data: { balance: senderWallet.balance - amount }
        });
        
        // Add to recipient wallet
        const recipientWallet = await prisma.wallet.findFirst({ where: { userId: recipientUser.id } });
        if (recipientWallet) {
          await prisma.wallet.update({
             where: { id: recipientWallet.id },
             data: { balance: recipientWallet.balance + amount }
          });
        } else {
          // Create wallet if doesn't exist
          await prisma.wallet.create({
             data: { userId: recipientUser.id, balance: amount, currency: senderWallet.currency }
          });
        }
        
        // Create transaction logs
        const ref = `TRF-${Date.now()}`;
        // Sender log
        await prisma.transaction.create({
          data: {
            userId,
            amount: -amount,
            currency: senderWallet.currency,
            type: "transfer_out",
            status: "completed",
            merchant: `Transfer to ${recipientUser.fullName || recipientUser.name}`,
            reference: ref
          }
        });
        // Recipient log
        await prisma.transaction.create({
          data: {
            userId: recipientUser.id,
            amount: amount,
            currency: senderWallet.currency,
            type: "transfer_in",
            status: "completed",
            merchant: `Transfer from ${senderUser?.fullName || senderUser?.name || 'User'}`,
            reference: ref
          }
        });
        
        // Sender Notification
        await prisma.notification.create({
          data: {
             userId,
             title: "Funds Sent",
             message: `You successfully sent ${senderWallet.currency} ${amount} to ${recipientUser.fullName || recipientUser.name}.`
          }
        });
        
        // Recipient Notification
        await prisma.notification.create({
          data: {
             userId: recipientUser.id,
             title: "Funds Received",
             message: `You have received ${senderWallet.currency} ${amount} from ${senderUser?.fullName || senderUser?.name || 'a user'}.`
          }
        });

        // Email to sender
        if (senderUser?.email) {
           sendInvoiceEmail(senderUser.email, senderUser.fullName || senderUser.name || "User", amount, senderWallet.currency, `Transfer to ${recipientUser.fullName || recipientUser.name}`, "transfer", ref);
        }
        
        // Email to recipient
        if (recipientUser.email) {
           sendInvoiceEmail(recipientUser.email, recipientUser.fullName || recipientUser.name || "User", amount, senderWallet.currency, `Received from ${senderUser?.fullName || senderUser?.name || 'User'}`, "deposit", ref);
        }
        
        return res.json({ success: true, message: "Money sent successfully." });
      }
    } catch (e) {
       console.error("Local Send Money Error:", e);
    }
    
    // Sandbox fallback if no real DB hit
    return res.json({ success: true, message: "[SANDBOX] Money sent successfully." });
  }

  if (action === "admin-stats") {
    const filter = req.query.filter as string;
    let whereClause: any = {};
    let whereClauseUsers: any = {};
    let whereClauseForum: any = {};

    const now = new Date();
    if (filter === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      whereClause = { createdAt: { gte: startOfDay } };
      whereClauseUsers = { createdAt: { gte: startOfDay } };
      whereClauseForum = { registered_at: { gte: startOfDay } };
    } else if (filter === "weekly") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      whereClause = { createdAt: { gte: startOfWeek } };
      whereClauseUsers = { createdAt: { gte: startOfWeek } };
      whereClauseForum = { registered_at: { gte: startOfWeek } };
    } else if (filter === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      whereClause = { createdAt: { gte: startOfMonth } };
      whereClauseUsers = { createdAt: { gte: startOfMonth } };
      whereClauseForum = { registered_at: { gte: startOfMonth } };
    } else if (filter === "yearly") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      whereClause = { createdAt: { gte: startOfYear } };
      whereClauseUsers = { createdAt: { gte: startOfYear } };
      whereClauseForum = { registered_at: { gte: startOfYear } };
    }

    try {
      const usersCount = await (prisma as any).user?.count({ where: whereClauseUsers }) || await (prisma as any).users?.count({ where: whereClauseUsers }) || 0;
      const sellersCount = await (prisma as any).user?.count({ where: { ...whereClauseUsers, role: "seller" } }) || await (prisma as any).users?.count({ where: { ...whereClauseUsers, role: "seller" } }) || 0;
      const totalOrders = await (prisma as any).order?.count({ where: whereClause }) || await (prisma as any).orders?.count({ where: whereClause }) || 0;
      
      const orders = await (prisma as any).order?.findMany({ where: whereClause }) || await (prisma as any).orders?.findMany({ where: whereClause }) || [];
      const revenue = orders.reduce((sum: number, order: any) => sum + (parseFloat(order.totalPrice?.toString() || "0")), 0);
      
      const productsListed = await (prisma as any).products?.count({ where: whereClause }) || await (prisma as any).product?.count({ where: whereClause }) || 0;
      const pendingCount = await (prisma as any).KycVerification?.count({ where: { status: "pending" } }).catch(() => 0) || await (prisma as any).kyc_verifications?.count({ where: { status: "pending" } }).catch(() => 0) || 0;
      
      const forumRegistrations = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM forum_registrations 
        ${filter === 'today' ? Prisma.sql`WHERE DATE(registered_at) = CURDATE()` : 
          filter === 'weekly' ? Prisma.sql`WHERE YEARWEEK(registered_at, 1) = YEARWEEK(CURDATE(), 1)` : 
          filter === 'monthly' ? Prisma.sql`WHERE MONTH(registered_at) = MONTH(CURDATE()) AND YEAR(registered_at) = YEAR(CURDATE())` : 
          filter === 'yearly' ? Prisma.sql`WHERE YEAR(registered_at) = YEAR(CURDATE())` : 
          Prisma.empty}
      `.catch(() => [{ count: 0n }]);

      return res.json({
        usersCount,
        sellersCount,
        totalOrders,
        totalSales: revenue,
        revenue,
        productsListed,
        pendingCount,
        supportTickets: 0,
        forumRegistrations: Number(forumRegistrations?.[0]?.count || 0)
      });
    } catch (e) {
      console.error("Error fetching admin stats:", e);
      return res.status(500).json({ error: "Failed to fetch stats" });
    }
  }

  return res.status(404).json({ error: "Unknown action" });
});

// ─── TRANZAK PAYMENT FLOW (Live / Sandbox) ──────────────────────────────────
import crypto from "crypto";

// ... [we'll append the route before the tranzak endpoint] ...

app.post("/api/forum-register", async (req, res) => {
  try {
    const { name, email, phone, organization, address, city, country, postalCode, category, paymentStatus, gender } = req.body;
    
    let amount = "30,000 XAF";
    if (category?.includes("50,000")) amount = "50,000 XAF";
    if (category?.includes("100,000")) amount = "100,000 XAF";
    if (category?.includes("500,000")) amount = "500,000 XAF";

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "Name, email, and phone are required" });
    }

    const id = crypto.randomUUID();
    const status = paymentStatus || 'pending';
    
    // First ensure the column exists (handling gender gracefully if not present in schema)
    try {
      await prisma.$executeRaw`ALTER TABLE forum_registrations ADD COLUMN gender VARCHAR(20) DEFAULT ''`;
    } catch (e) {
      // Column might already exist
    }

    await prisma.$executeRaw`
      INSERT INTO forum_registrations 
      (id, name, email, phone, organization, address, city, country, postalCode, category, payment_status, amount_paid, gender) 
      VALUES (${id}, ${name}, ${email}, ${phone}, ${organization || ''}, ${address || ''}, ${city || ''}, ${country || 'Cameroon'}, ${postalCode || ''}, ${category || 'Standard'}, ${status}, ${amount}, ${gender || ''})
    `;

    return res.status(201).json({ success: true, message: "Registration successful", registrationId: id });
  } catch (error) {
    console.error("Forum Register Error:", error);
    return res.status(500).json({ success: false, message: "Failed to save registration", error: String(error) });
  }
});

app.get("/api/admin-forum-registrations", async (req, res) => {
  try {
    const registrations: any[] = await prisma.$queryRaw`SELECT * FROM forum_registrations ORDER BY registered_at DESC`;
    return res.json({ success: true, registrations });
  } catch (error) {
    console.error("Failed to fetch forum registrations:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch registrations", error: String(error) });
  }
});

app.post("/api/forum-success", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  
  try {
    const records: any[] = await prisma.$queryRaw`SELECT * FROM forum_registrations WHERE email = ${email} ORDER BY registered_at DESC LIMIT 1`;
    if (records.length === 0) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }
    
    const registration = records[0];
    
    if (registration.payment_status !== 'completed') {
      await prisma.$executeRaw`UPDATE forum_registrations SET payment_status = 'completed' WHERE id = ${registration.id}`;
      
      // Email logic has been removed and is now handled exclusively by the webhook (/api/tranzak-webhook)
    }
    
    return res.json({ success: true, ticket: registration });
  } catch (err) {
    console.error("Forum Success Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/tranzak-payment", async (req, res) => {
  const { method, amount, currencyCode, description, userEmail, userName, mobileWalletNumber, returnUrl, reference: customRef } = req.body;
  const reference = customRef || ("TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase());
  console.log(`[TRANZAK] Method: ${method}, Amount: ${amount} ${currencyCode}, Ref: ${reference}`);

  // ── Build invoice HTML ────────────────────────────────────────────────────
  const methodLabel: Record<string, string> = {
    web:  "💳 Web Redirect (Visa/Mastercard/MoMo via Tranzak)",
    momo: "📱 Mobile Money (MTN/Orange MoMo)",
    qr:   "📷 QR Code Payment",
  };
  const date      = new Date().toLocaleString("en-GB", { timeZone: "Africa/Douala", dateStyle: "full", timeStyle: "short" });
  const firstName = (userName || "Customer").split(" ")[0];

  const invoiceHtml = `
  <html><head><style>
    body{font-family:'Segoe UI',sans-serif;background:#f4f6f8;margin:0;padding:20px}
    .card{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,.07)}
    .header{background:#064e3b;padding:28px;text-align:center;color:#fff}
    .header h1{margin:0;font-size:22px;font-weight:800;letter-spacing:.5px}
    .content{padding:32px;color:#334155;line-height:1.7}
    table{width:100%;border-collapse:collapse;margin:20px 0;font-size:14px}
    td{padding:11px 14px}
    .label{color:#64748b;font-weight:700;background:#f8fafc}
    .amount-row td{background:#ecfdf5;font-size:18px;font-weight:900;color:#059669;padding:16px 14px}
    .status span{background:#d97706;color:#fff;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700}
    .footer{background:#f8fafc;padding:18px;text-align:center;font-size:12px;color:#94a3b8}
  </style></head>
  <body><div class='card'>
    <div class='header'><h1>CameMark 🇨🇲 — Payment Invoice</h1></div>
    <div class='content'>
      <p>Dear <strong>${firstName}</strong>,</p>
      <p>Your transaction has been <strong>initiated</strong> on CameMark. Here is your invoice:</p>
      <table>
        <tr><td class='label'>TRANSACTION REF</td><td style='font-family:monospace;color:#1e293b'>${reference}</td></tr>
        <tr><td class='label'>DESCRIPTION</td><td>${description || "Payment"}</td></tr>
        <tr><td class='label'>PAYMENT METHOD</td><td>${methodLabel[method] || method}</td></tr>
        <tr><td class='label'>DATE</td><td>${date}</td></tr>
        <tr class='amount-row'><td>AMOUNT</td><td>${Number(amount).toLocaleString()} ${currencyCode || "XAF"}</td></tr>
        <tr><td class='label'>STATUS</td><td class='status'><span>Initiated</span></td></tr>
      </table>
      <p style='color:#64748b;font-size:13px'>If you did not initiate this transaction, contact <a href='mailto:support@camemark.com'>support@camemark.com</a> immediately.</p>
      <p>Thank you for using <strong>CameMark</strong> 🇨🇲</p>
    </div>
    <div class='footer'>&copy; ${new Date().getFullYear()} CameMark. All rights reserved.</div>
  </div></body></html>`;

  const sendInvoice = async () => {
    if (userEmail) {
      try {
        await transporter.sendMail({
          from: `"CameMark Marketplace" <${process.env.SMTP_USER || "camermarketer@gmail.com"}>`,
          to: userEmail,
          bcc: process.env.SMTP_USER || "camermarketer@gmail.com",
          subject: `CameMark Payment Invoice — ${reference}`,
          html: invoiceHtml,
        });
        console.log(`[INVOICE] Email sent to ${userEmail} for ref ${reference}`);
      } catch (emailErr) {
        console.warn(`[INVOICE] Email failed (non-fatal):`, emailErr);
      }
    }
  };

  // Read Tranzak settings
  let appId = "";
  let appKey = "";
  let isSandbox = true;
  
  try {
    const settingsPath = path.join(process.cwd(), 'public', 'api', 'payment_settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (settings.payment) {
        appId = settings.payment.tranzakAppId || "";
        appKey = settings.payment.tranzakAppKey || "";
        isSandbox = settings.payment.environment === "sandbox";
      }
    }
  } catch (err) {
    console.error("Failed to read payment_settings.json:", err);
  }

  // Fallback to Sandbox Mock if no real keys provided
  if (!appId || !appKey || appId === "YOUR_LIVE_APP_ID") {
    console.log("[TRANZAK] Using Mock Sandbox mode (no valid API keys found)");
    await sendInvoice();
    if (method === "web") {
      const targetUrl = returnUrl ? `${returnUrl}?mock_payment=success&ref=${reference}` : `/cards-wallet?mock_payment=success&ref=${reference}`;
      return res.json({
        success: true, sandbox: true, reference,
        data: { links: { paymentAuthUrl: targetUrl }, requestId: reference }
      });
    }
    return res.json({
      success: true, sandbox: true, reference,
      message: `[SANDBOX] ${method === "momo" ? "MoMo USSD push" : "QR payment"} initiated. No real charge.`
    });
  }

  // Real Tranzak API Flow
  console.log(`[TRANZAK] Executing Real Request (${isSandbox ? 'Sandbox' : 'Live'})`);
  const baseUrl = isSandbox ? "https://sandbox.dsapi.tranzak.me" : "https://dsapi.tranzak.me";

  try {
    const authRes = await fetch(`${baseUrl}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, appKey })
    });
    
    if (!authRes.ok) {
      console.error("Tranzak Auth Failed:", await authRes.text());
      return res.status(500).json({ error: "Failed to authenticate with Tranzak" });
    }
    
    const authData = await authRes.json();
    const token = authData.data?.token;

    const requestBody: any = {
      amount,
      currencyCode: currencyCode || "XAF",
      description: description || "Payment",
      mchTransactionRef: reference,
      payerNote: "Payment via CameMark"
    };

    let endpoint = "/xp021/v1/request/create";
    if (method === "momo" && mobileWalletNumber) {
      endpoint = "/xp021/v1/request/create-mobile-wallet-charge";
      requestBody.mobileWalletNumber = mobileWalletNumber;
    } else if (method === "qr") {
      endpoint = "/xp021/v1/request/create-in-store-charge";
    } else {
      requestBody.returnUrl = returnUrl || "http://localhost:8080/cards-wallet?mock_payment=success";
    }

    const paymentRes = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (paymentRes.ok) {
      await sendInvoice();
      const decoded = await paymentRes.json();
      console.log("Tranzak Payment Response:", decoded);
      decoded.reference = reference;
      return res.json(decoded);
    } else {
      const errData = await paymentRes.json();
      console.error("Payment initiation failed, Tranzak response:", errData);
      return res.status(500).json({ error: "Payment initiation failed", details: errData });
    }
  } catch (apiError) {
    console.error("Tranzak API Error:", apiError);
    return res.status(500).json({ error: "Internal payment processing error" });
  }
});

app.get("/api/admin/transactions", async (_req, res) => {
  try {
    const txs: any[] = await prisma.$queryRaw`
      SELECT t.*, u.fullName, u.email 
      FROM transactions t 
      JOIN users u ON t.userId COLLATE utf8mb4_unicode_ci = u.id 
      ORDER BY t.createdAt DESC
    `;
    
    let forumPayments: any[] = [];
    try {
      forumPayments = await prisma.$queryRaw`
        SELECT 
          id,
          'guest' as userId,
          name as fullName,
          email,
          'payment' as type,
          amount_paid as amount,
          'XAF' as currency,
          payment_status as status,
          CONCAT('Forum 2026: ', category) as description,
          id as reference,
          registered_at as createdAt
        FROM forum_registrations
        ORDER BY registered_at DESC
      `;
    } catch (e) {
      console.warn("Could not fetch forum registrations for transactions view", e);
    }
    
    const formatted = txs.map(t => ({
      id: t.id,
      userId: t.userId,
      fullName: t.fullName || "Unknown",
      email: t.email || "Unknown",
      type: t.type,
      amount: Math.abs(parseFloat(t.amount || 0)), // Admin panel might want positive amounts displayed
      currency: t.currency,
      status: t.status,
      description: t.description || t.merchant || "",
      reference: t.reference,
      createdAt: t.createdAt
    }));
    
    const formattedForum = forumPayments.map(f => ({
      id: f.id,
      userId: f.userId,
      fullName: f.fullName,
      email: f.email,
      type: f.type,
      amount: Math.abs(parseFloat((f.amount || "0").replace(/[^0-9.-]+/g,"")) || 0),
      currency: f.currency,
      status: f.status,
      description: f.description,
      reference: f.reference,
      createdAt: f.createdAt
    }));
    
    const combined = [...formatted, ...formattedForum].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    res.json({ success: true, transactions: combined });
  } catch (error) {
    console.error("Failed to fetch admin transactions:", error);
    res.json({ success: false, transactions: [] });
  }
});


app.get("/api/admin/roles", async (_req, res) => {
  try {
    const roles = await prisma.roles_permissions.findMany({
      orderBy: { id: 'asc' }
    });
    const formatted = roles.map(r => ({
      ...r,
      modules: typeof r.modules === 'string' ? JSON.parse(r.modules) : r.modules
    }));
    res.json(formatted);
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

app.put("/api/admin/roles", async (req, res) => {
  try {
    const { roleId, modules } = req.body;
    if (!roleId) return res.status(400).json({ error: "Role ID is required" });
    
    let updatedModules = Array.isArray(modules) ? modules : [];
    
    const existing = await prisma.roles_permissions.findUnique({ where: { id: roleId } });
    if (existing?.role === 'super_admin' && !updatedModules.includes("all")) {
      updatedModules.push("all");
    }
    
    await prisma.roles_permissions.update({
      where: { id: roleId },
      data: { modules: JSON.stringify(updatedModules), updatedAt: new Date() }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to update role:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// ─── ADMIN TICKETS ───────────────────────────────────────────────────────────
app.all("/api/admin-tickets", async (req, res) => {
  const action = req.query.action;
  
  if (action === "list" && req.method === "GET") {
    try {
      const tickets = await prisma.$queryRaw`
        SELECT st.*, u.fullName as userName, u.email as userEmail, c.card_number 
        FROM support_tickets st
        LEFT JOIN users u ON st.userId COLLATE utf8mb4_unicode_ci = u.id
        LEFT JOIN cards c ON st.cardId COLLATE utf8mb4_unicode_ci = c.id
        ORDER BY st.createdAt DESC
      `;
      return res.json(tickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      return res.status(500).json({ error: "Failed to fetch tickets" });
    }
  }
  
  if (action === "respond" && req.method === "POST") {
    try {
      const { ticketId, adminResponse } = req.body;
      if (!ticketId || !adminResponse) {
        return res.status(400).json({ error: "Ticket ID and Response are required" });
      }
      
      await prisma.$executeRaw`
        UPDATE support_tickets 
        SET adminResponse = ${adminResponse}, status = 'resolved' 
        WHERE id = ${ticketId}
      `;
      
      // Get user info to send notification (local mock just creates notification)
      const ticketRows: any[] = await prisma.$queryRaw`
        SELECT u.id, u.email, u.fullName as name, st.subject 
        FROM support_tickets st 
        JOIN users u ON st.userId COLLATE utf8mb4_unicode_ci = u.id 
        WHERE st.id = ${ticketId}
      `;
      
      if (ticketRows.length > 0) {
        const row = ticketRows[0];
        
        await prisma.notifications.create({
          data: {
            id: `notif-${Date.now()}`,
            userId: row.id,
            title: "Ticket Resolved",
            message: `Your ticket '${row.subject}' has been resolved. Please check your email for the admin response.`,
          }
        });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Failed to update ticket:", error);
      return res.status(500).json({ error: "Failed to update ticket" });
    }
  }
  
  return res.status(404).json({ error: "Endpoint not found" });
});

// ─── POPUP BANNER ────────────────────────────────────────────────────────────
app.get("/api/popup-banner", async (req, res) => {
  try {
    const setting = await prisma.referral_settings.findUnique({
      where: { setting_key: "popup_banner_settings" }
    });
    
    let bannerData = {
      enabled: 0,
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      title: "Cameroon E-Commerce Forum 2026",
      linkUrl: "/#forum-2026"
    };

    if (setting && setting.setting_value) {
      try {
        bannerData = { ...bannerData, ...JSON.parse(setting.setting_value) };
      } catch(e) {}
    }

    res.json({
      success: true,
      banner: bannerData
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/popup-banner", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const { enabled, imageUrl, title, linkUrl } = req.body;
    
    const bannerData = JSON.stringify({ enabled, imageUrl, title, linkUrl });
    
    await prisma.referral_settings.upsert({
      where: { setting_key: "popup_banner_settings" },
      update: { setting_value: bannerData },
      create: { setting_key: "popup_banner_settings", setting_value: bannerData }
    });

    res.json({ success: true, message: "Banner settings updated successfully" });
  } catch (error) {
    console.error("Update banner error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── TRANZAK WEBHOOK ─────────────────────────────────────────────────────────
app.post("/api/tranzak-webhook", async (req, res) => {
  try {
    const { eventType, resource } = req.body;
    
    if (eventType === "REQUEST.COMPLETED" && resource && resource.status === "SUCCESSFUL") {
      const registrationId = resource.mchTransactionRef;
      console.log(`[WEBHOOK] Received successful payment for ref: ${registrationId}`);
      
      // Update DB
      await prisma.$executeRaw`
        UPDATE forum_registrations
        SET payment_status = 'completed'
        WHERE id = ${registrationId}
      `;
      
      // Try to fetch registration and send email
      const rows: any[] = await prisma.$queryRaw`
        SELECT * FROM forum_registrations WHERE id = ${registrationId}
      `;
      
      if (rows.length > 0) {
        const registration = rows[0];
        const adminEmail = process.env.SMTP_USER || "camermarketer@gmail.com";
        const email = registration.email;
        
        const ticketHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #064e3b; text-align: center;">CameMark Forum 2026 - Official Ticket</h2>
            <p>Hello ${registration.name},</p>
            <p>Your payment was successful! Your registration is now confirmed. Below are your ticket details:</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Name:</strong> ${registration.name}</p>
              <p><strong>Email:</strong> ${registration.email}</p>
              <p><strong>Phone:</strong> ${registration.phone}</p>
              <p><strong>Pass Type:</strong> ${registration.category}</p>
              <p><strong>Amount Paid:</strong> ${registration.amount_paid}</p>
              <p><strong>Registration ID:</strong> ${registration.id}</p>
            </div>
            
            <p>Please present this ticket at the event entrance.</p>
            <p>Best regards,<br>The CameMark Team</p>
          </div>
        `;

        try {
          await transporter.sendMail({
            from: `"CameMark Forum" <${adminEmail}>`,
            to: email,
            bcc: adminEmail,
            subject: `CameMark Forum Pass Confirmation - ${registration.name}`,
            html: ticketHtml,
          });
          console.log(`[FORUM TICKET] Webhook sent ticket to ${email}`);
        } catch (err) {
          console.warn(`[FORUM TICKET] Webhook Email failed:`, err);
        }
      }
    }
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "podoremetropolis@gmail.com",
    pass: process.env.SMTP_PASS || "ptfjtrjyaidmyqrf",
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

    if (!user || !isValidPassword) {
      // Record failure
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

      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Success! Clear failures
    ipFailures.delete(ip);
    accountFailures.delete(email);

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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

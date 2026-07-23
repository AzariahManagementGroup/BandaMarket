import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

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

// Signin route
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

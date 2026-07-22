"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "camemark-secret-key-2026";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return res.status(201).json({ user: userWithoutPassword, token });
    }
    catch (error) {
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
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid email or password." });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword, token });
    }
    catch (error) {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { wallet: true, kycVerification: true },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const { passwordHash: _, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
    }
    catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
});
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

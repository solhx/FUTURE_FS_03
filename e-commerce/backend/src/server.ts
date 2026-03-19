import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";

dotenv.config();

const app = express();

// Trust proxy for rate limiting behind proxies (fixes express-rate-limit warning)
app.set("trust proxy", 1);

// DB connection moved to startup callback for non-blocking start

// Security middleware
app.use(helmet());

// ── CORS ──
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://urban-nile.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`❌ CORS blocked: ${origin}`);
        callback(new Error(`CORS policy blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle preflight
app.options("*", cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,  // Increased from 10 for better testing (still secure)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});
app.use("/api/auth", authLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check
let isDBConnected = false;

app.get("/api/health", (req, res) => {
  res.status(isDBConnected ? 200 : 503).json({
    success: isDBConnected,
    message: isDBConnected ? "Urban Nile API is running" : "DB not ready yet",
    dbConnected: isDBConnected,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Startup timer
console.time("startup");

const connectWithRetry = async (maxRetries = 3): Promise<void> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await connectDB();
      isDBConnected = true;
      console.log("✅ DB connected successfully");
      break;
    } catch (error) {
      console.error(`DB connection attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) {
        console.error("❌ All DB retries failed. Server starting anyway (requests will fail until DB connects)");
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
      }
    }
  }
};

app.listen(PORT, async () => {
  console.timeEnd("startup");
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  
  // Connect DB non-blocking after server starts
  await connectWithRetry();
});

export default app;
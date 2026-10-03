const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

// Sets several security-related HTTP headers automatically
app.use(helmet());

// Only your actual frontend is allowed to make requests to this API
const allowedOrigins = [
  "http://localhost:5173",
  "https://invoice-app-one-psi.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools like Postman (no origin header) and any origin in the allow-list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

app.use(express.json());

// Slows down repeated login/register attempts against the same IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
    data: null,
  },
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Invoice API is running", data: null });
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);

module.exports = app;

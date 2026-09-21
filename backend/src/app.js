const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Invoice API is running", data: null });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);

module.exports = app;
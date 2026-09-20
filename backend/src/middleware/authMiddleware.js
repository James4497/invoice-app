const jwt = require("jsonwebtoken");
const User = require("../models/User");

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message, data: null });

// Checks the badge (JWT) on every protected request
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return fail(res, 401, "Not authorized. Please log in.");
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return fail(res, 401, "This account no longer exists.");
    }

    req.user = user;
    next();
  } catch (error) {
    return fail(res, 401, "Invalid or expired token. Please log in again.");
  }
};

// Only lets certain roles through, e.g. authorize("admin")
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return fail(res, 403, "You do not have permission to do this.");
  }
  next();
};
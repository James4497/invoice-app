const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const emailRegex = /^\S+@\S+\.\S+$/;

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message, data: null });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if ([name, email, password].some((v) => typeof v !== "string" || !v.trim())) {
      return fail(res, 400, "Name, email and password are required");
    }
    if (!emailRegex.test(email)) {
      return fail(res, 400, "Please provide a valid email address");
    }
    if (password.length < 6) {
      return fail(res, 400, "Password must be at least 6 characters");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return fail(res, 409, "An account with this email already exists");
    }

    // The very first account becomes the admin; everyone after is staff
    const isFirstUser = (await User.countDocuments()) === 0;

    const user = await User.create({
      name,
      email,
      password,
      role: isFirstUser ? "admin" : "staff",
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { user: formatUser(user), token: generateToken(user._id, user.role) },
    });
  } catch (error) {
    console.error(error);
    fail(res, 500, "Something went wrong. Please try again.");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((v) => typeof v !== "string" || !v.trim())) {
      return fail(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return fail(res, 401, "Invalid email or password");
    }

    res.json({
      success: true,
      message: "Login successful",
      data: { user: formatUser(user), token: generateToken(user._id, user.role) },
    });
  } catch (error) {
    console.error(error);
    fail(res, 500, "Something went wrong. Please try again.");
  }
};
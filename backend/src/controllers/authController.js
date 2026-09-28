const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const emailRegex = /^\S+@\S+\.\S+$/;
const CURRENCIES = ["NGN", "USD", "EUR", "GBP"];

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  defaultCurrency: user.defaultCurrency || "NGN",
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

exports.getMe = (req, res) => {
  res.json({
    success: true,
    message: "Current user fetched successfully",
    data: { user: formatUser(req.user) },
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, defaultCurrency } = req.body;

    if (name === undefined && defaultCurrency === undefined) {
      return fail(res, 400, "Provide at least one field to update");
    }
    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return fail(res, 400, "Name cannot be empty");
    }
    if (defaultCurrency !== undefined && !CURRENCIES.includes(defaultCurrency)) {
      return fail(res, 400, `Currency must be one of ${CURRENCIES.join(", ")}`);
    }

    const user = await User.findById(req.user._id);
    if (!user) return fail(res, 404, "User not found");

    if (name !== undefined) user.name = name;
    if (defaultCurrency !== undefined) user.defaultCurrency = defaultCurrency;
    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: formatUser(user) },
    });
  } catch (error) {
    console.error(error);
    fail(res, 500, "Something went wrong. Please try again.");
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if ([currentPassword, newPassword].some((v) => typeof v !== "string" || !v)) {
      return fail(res, 400, "Current and new password are required");
    }
    if (newPassword.length < 6) {
      return fail(res, 400, "New password must be at least 6 characters");
    }
    if (newPassword === currentPassword) {
      return fail(res, 400, "New password must be different from the current one");
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return fail(res, 404, "User not found");

    // 400 rather than 401 on purpose, so the app doesn't mistake a typo for an expired login
    if (!(await user.matchPassword(currentPassword))) {
      return fail(res, 400, "Current password is incorrect");
    }

    user.password = newPassword; // the pre-save hook scrambles it
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
      data: null,
    });
  } catch (error) {
    console.error(error);
    fail(res, 500, "Something went wrong. Please try again.");
  }
};
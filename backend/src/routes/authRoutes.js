const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUsers,
  resetUserPassword,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

router.get("/users", protect, authorize("admin"), getUsers);
router.put("/users/:id/reset-password", protect, authorize("admin"), resetUserPassword);

module.exports = router;
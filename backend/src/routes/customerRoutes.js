const express = require("express");
const {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Everyone below needs a valid badge
router.use(protect);

router.route("/").post(createCustomer).get(getCustomers);

router
  .route("/:id")
  .get(getCustomer)
  .put(updateCustomer)
  .delete(authorize("admin"), deleteCustomer); // admins only

module.exports = router;
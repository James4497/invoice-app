const express = require("express");
const {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  addPayment,
  deleteInvoice,
  getSummary,
} = require("../controllers/invoiceController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Everything below needs a valid badge
router.use(protect);

router.route("/").post(createInvoice).get(getInvoices);

router.post("/:id/payments", addPayment);

router.get("/summary", getSummary);

router
  .route("/:id")
  .get(getInvoice)
  .put(updateInvoice)
  .delete(authorize("admin"), deleteInvoice); // admins only

module.exports = router;
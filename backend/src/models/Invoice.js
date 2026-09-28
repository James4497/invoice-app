const mongoose = require("mongoose");

const round2 = (n) => Math.round(n * 100) / 100;

const itemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unitPrice: { type: Number, required: true, min: 0.01 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    poNumber: { type: String, trim: true, default: "" },
    taxNumber: { type: String, trim: true, default: "" },
    currency: { type: String, enum: ["NGN", "USD", "EUR", "GBP"], default: "NGN" },
    subject: { type: String, trim: true, default: "" },
    items: {
      type: [itemSchema],
      validate: [(items) => items.length > 0, "At least one item is required"],
    },
    total: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: ["unpaid", "part-paid", "paid"], default: "unpaid" },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

invoiceSchema.virtual("balance").get(function () {
  return round2(this.total - this.amountPaid);
});

invoiceSchema.pre("validate", async function () {
  this.total = round2(this.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));

  if (this.amountPaid <= 0) this.status = "unpaid";
  else if (this.amountPaid >= this.total) this.status = "paid";
  else this.status = "part-paid";
});

module.exports = mongoose.model("Invoice", invoiceSchema);
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Counter = require("../models/Counter");

const STATUSES = ["unpaid", "part-paid", "paid"];
const CURRENCIES = ["NGN", "USD", "EUR", "GBP"];

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message, data: null });

const serverError = (res, error) => {
  console.error(error);
  fail(res, 500, "Something went wrong. Please try again.");
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const round2 = (n) => Math.round(n * 100) / 100;

const calcTotal = (items) =>
  round2(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));

// Returns a problem message, or null if the items look fine
const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "At least one item is required";
  }
  for (const item of items) {
    if (!item || typeof item.description !== "string" || !item.description.trim()) {
      return "Each item needs a description";
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      return "Each item quantity must be a number greater than 0";
    }
    if (!Number.isFinite(item.unitPrice) || item.unitPrice <= 0) {
      return "Each item unit price must be a number greater than 0";
    }
  }
  return null;
};

// Keeps only the fields we allow on each item
const cleanItems = (items) =>
  items.map(({ description, quantity, unitPrice }) => ({
    description: description.trim(),
    quantity,
    unitPrice,
  }));

const validateDueDate = (dueDate) => {
  if (dueDate === undefined) return null;
  if (typeof dueDate !== "string" || Number.isNaN(new Date(dueDate).getTime())) {
    return "Due date must be a valid date";
  }
  return null;
};

const validateNotes = (notes) =>
  notes !== undefined && typeof notes !== "string" ? "Notes must be text" : null;

const validateText = (value, label) =>
  value !== undefined && typeof value !== "string" ? `${label} must be text` : null;

const validateCurrency = (currency) => {
  if (currency === undefined) return null;
  return CURRENCIES.includes(currency) ? null : `Currency must be one of ${CURRENCIES.join(", ")}`;
};

exports.createInvoice = async (req, res) => {
  try {
    const { customer, items, dueDate, notes, poNumber, taxNumber, currency, subject } = req.body;

    if (!mongoose.isValidObjectId(customer)) {
      return fail(res, 400, "A valid customer is required");
    }
    const problem =
      validateItems(items) ||
      validateDueDate(dueDate) ||
      validateNotes(notes) ||
      validateText(poNumber, "PO number") ||
      validateText(taxNumber, "Tax number") ||
      validateText(subject, "Subject") ||
      validateCurrency(currency);
    if (problem) return fail(res, 400, problem);

    const foundCustomer = await Customer.findById(customer);
    if (!foundCustomer) return fail(res, 404, "Customer not found");

    // Take the next number from the counter (INV-0001, INV-0002, ...)
    const counter = await Counter.findByIdAndUpdate(
      "invoice",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const invoice = await Invoice.create({
      invoiceNumber: `INV-${String(counter.seq).padStart(4, "0")}`,
      customer,
      items: cleanItems(items),
      dueDate,
      notes,
      poNumber,
      taxNumber,
      currency,
      subject,
      createdBy: req.user._id,
    });
    await invoice.populate("customer", "name email phone");
    await invoice.populate("createdBy", "name");

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: { invoice },
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const filter = {};

    if (req.query.status !== undefined) {
      if (!STATUSES.includes(req.query.status)) {
        return fail(res, 400, "Status must be unpaid, part-paid or paid");
      }
      filter.status = req.query.status;
    }

    if (req.query.customer !== undefined) {
      if (!mongoose.isValidObjectId(req.query.customer)) {
        return fail(res, 400, "Invalid customer ID");
      }
      filter.customer = req.query.customer;
    }

    if (typeof req.query.search === "string" && req.query.search.trim()) {
      filter.invoiceNumber = new RegExp(escapeRegex(req.query.search.trim()), "i");
    }

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      message: "Invoices fetched successfully",
      data: {
        invoices,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.getInvoice = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return fail(res, 400, "Invalid invoice ID");
    }

    const invoice = await Invoice.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("lastEditedBy", "name")
      .populate("createdBy", "name");
    if (!invoice) return fail(res, 404, "Invoice not found");

    res.json({
      success: true,
      message: "Invoice fetched successfully",
      data: { invoice },
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return fail(res, 400, "Invalid invoice ID");
    }

    const { items, dueDate, notes, poNumber, taxNumber, currency, subject } = req.body;
    if (
      [items, dueDate, notes, poNumber, taxNumber, currency, subject].every(
        (v) => v === undefined
      )
    ) {
      return fail(res, 400, "Provide at least one field to update");
    }

    const problem =
      (items !== undefined ? validateItems(items) : null) ||
      validateDueDate(dueDate) ||
      validateNotes(notes) ||
      validateText(poNumber, "PO number") ||
      validateText(taxNumber, "Tax number") ||
      validateText(subject, "Subject") ||
      validateCurrency(currency);
    if (problem) return fail(res, 400, problem);

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return fail(res, 404, "Invoice not found");

    if (invoice.status === "paid") {
      return fail(res, 409, "A fully paid invoice cannot be edited");
    }

    if (items !== undefined) {
      const newItems = cleanItems(items);
      if (calcTotal(newItems) < invoice.amountPaid) {
        return fail(res, 400, "The new total cannot be less than the amount already paid");
      }
      invoice.items = newItems;
    }
    if (dueDate !== undefined) invoice.dueDate = dueDate;
    if (notes !== undefined) invoice.notes = notes;
    if (poNumber !== undefined) invoice.poNumber = poNumber;
    if (taxNumber !== undefined) invoice.taxNumber = taxNumber;
    if (currency !== undefined) invoice.currency = currency;
    if (subject !== undefined) invoice.subject = subject;
    invoice.lastEditedBy = req.user._id;

    await invoice.save(); // total and status are recalculated automatically
    await invoice.populate("customer", "name email phone");
    await invoice.populate("lastEditedBy", "name");
    await invoice.populate("createdBy", "name");

    res.json({
      success: true,
      message: "Invoice updated successfully",
      data: { invoice },
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.addPayment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return fail(res, 400, "Invalid invoice ID");
    }

    const { amount } = req.body;
    if (!Number.isFinite(amount) || amount <= 0) {
      return fail(res, 400, "Payment amount must be a number greater than 0");
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return fail(res, 404, "Invoice not found");

    const balance = round2(invoice.total - invoice.amountPaid);
    if (balance <= 0) return fail(res, 409, "This invoice is already fully paid");

    const payment = round2(amount);
    if (payment > balance) {
      return fail(res, 400, `Payment is more than the outstanding balance of ${balance}`);
    }

    invoice.amountPaid = round2(invoice.amountPaid + payment);
    invoice.lastEditedBy = req.user._id;
    invoice.lastEditedAt = new Date();
    await invoice.save(); // status is recalculated automatically
    await invoice.populate("customer", "name email phone");
    await invoice.populate("lastEditedBy", "name");
    await invoice.populate("createdBy", "name");

    res.json({
      success: true,
      message: "Payment recorded successfully",
      data: { invoice },
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return fail(res, 400, "Invalid invoice ID");
    }

    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return fail(res, 404, "Invoice not found");

    res.json({
      success: true,
      message: "Invoice deleted successfully",
      data: null,
    });
  } catch (error) {
    serverError(res, error);
  }
};
exports.getSummary = async (req, res) => {
  try {
    const [totals, customerCount] = await Promise.all([
      Invoice.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total: { $sum: "$total" },
            amountPaid: { $sum: "$amountPaid" },
          },
        },
      ]),
      Customer.countDocuments(),
    ]);

    const byStatus = { unpaid: 0, "part-paid": 0, paid: 0 };
    let totalInvoiced = 0;
    let totalCollected = 0;

    totals.forEach((row) => {
      byStatus[row._id] = row.count;
      totalInvoiced += row.total;
      totalCollected += row.amountPaid;
    });

    res.json({
      success: true,
      message: "Summary fetched successfully",
      data: {
        totalCustomers: customerCount,
        totalInvoiced: Math.round(totalInvoiced * 100) / 100,
        totalCollected: Math.round(totalCollected * 100) / 100,
        totalOutstanding: Math.round((totalInvoiced - totalCollected) * 100) / 100,
        invoicesByStatus: byStatus,
      },
    });
  } catch (error) {
    serverError(res, error);
  }
};
exports.getReport = async (req, res) => {
  try {
    const now = new Date();

    // Old invoices were saved before the currency field existed, so treat "no currency" as NGN
    const currencyOf = { $ifNull: ["$currency", "NGN"] };

    const [byCurrency, topCustomers, overdue] = await Promise.all([
      // Money and invoice counts, split by currency and status
      Invoice.aggregate([
        {
          $group: {
            _id: { currency: currencyOf, status: "$status" },
            count: { $sum: 1 },
            total: { $sum: "$total" },
            amountPaid: { $sum: "$amountPaid" },
          },
        },
      ]),

      // Five biggest customers by amount invoiced
      Invoice.aggregate([
        {
          $group: {
            _id: { customer: "$customer", currency: currencyOf },
            invoices: { $sum: 1 },
            total: { $sum: "$total" },
            amountPaid: { $sum: "$amountPaid" },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: Customer.collection.name,
            localField: "_id.customer",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: "$customer" },
        {
          $project: {
            _id: 0,
            customerId: "$customer._id",
            name: "$customer.name",
            currency: "$_id.currency",
            invoices: 1,
            total: 1,
            amountPaid: 1,
            outstanding: { $subtract: ["$total", "$amountPaid"] },
          },
        },
      ]),

      // Unpaid invoices that are past their due date
      Invoice.find({ status: { $ne: "paid" }, dueDate: { $lt: now } })
        .populate("customer", "name")
        .sort({ dueDate: 1 })
        .limit(10),
    ]);

    // Group the totals by currency so naira and dollars never get added together
    const currencies = {};
    byCurrency.forEach(({ _id, count, total, amountPaid }) => {
      const cur = _id.currency;
      if (!currencies[cur]) {
        currencies[cur] = {
          currency: cur,
          invoiced: 0,
          collected: 0,
          outstanding: 0,
          byStatus: { unpaid: 0, "part-paid": 0, paid: 0 },
        };
      }
      const row = currencies[cur];
      row.invoiced += total;
      row.collected += amountPaid;
      row.outstanding += total - amountPaid;
      row.byStatus[_id.status] += count;
    });

    const totals = Object.values(currencies).map((c) => ({
      ...c,
      invoiced: round2(c.invoiced),
      collected: round2(c.collected),
      outstanding: round2(c.outstanding),
    }));

    const overdueInvoices = overdue.map((inv) => ({
      _id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      customer: inv.customer?.name || "—",
      currency: inv.currency || "NGN",
      balance: inv.balance,
      dueDate: inv.dueDate,
      daysOverdue: Math.floor((now - inv.dueDate) / 86400000),
    }));

    res.json({
      success: true,
      message: "Report fetched successfully",
      data: { totals, topCustomers, overdue: overdueInvoices },
    });
  } catch (error) {
    serverError(res, error);
  }
};
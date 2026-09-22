const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");

const emailRegex = /^\S+@\S+\.\S+$/;

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message, data: null });

const serverError = (res, error) => {
  console.error(error);
  fail(res, 500, "Something went wrong. Please try again.");
};

// Stops people from typing special search characters that break the search
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Only lets through the fields we allow (ignores anything else in the request)
const pickFields = (body) => {
  const fields = {};
  ["name", "email", "phone", "address"].forEach((key) => {
    if (body[key] !== undefined) fields[key] = body[key];
  });
  return fields;
};

// Returns a problem message, or null if everything looks fine
const validateCustomer = (body, { requireName }) => {
  const { name, email, phone, address } = body;

  if (requireName && name === undefined) return "Customer name is required";
  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return "Customer name cannot be empty";
  }
  if (email !== undefined && email !== "" && (typeof email !== "string" || !emailRegex.test(email))) {
    return "Please provide a valid email address";
  }
  if (phone !== undefined && typeof phone !== "string") return "Phone must be text";
  if (address !== undefined && typeof address !== "string") return "Address must be text";
  return null;
};

exports.createCustomer = async (req, res) => {
  try {
    const problem = validateCustomer(req.body, { requireName: true });
    if (problem) return fail(res, 400, problem);

    const customer = await Customer.create({
      ...pickFields(req.body),
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: { customer },
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const filter = {};
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const regex = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      message: "Customers fetched successfully",
      data: {
        customers,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.getCustomer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return fail(res, 400, "Invalid customer ID");
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) return fail(res, 404, "Customer not found");

    res.json({
      success: true,
      message: "Customer fetched successfully",
      data: { customer },
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return fail(res, 400, "Invalid customer ID");
    }

    const problem = validateCustomer(req.body, { requireName: false });
    if (problem) return fail(res, 400, problem);

    const fields = pickFields(req.body);
    if (Object.keys(fields).length === 0) {
      return fail(res, 400, "Provide at least one field to update");
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, fields, {
      new: true,
      runValidators: true,
    });
    if (!customer) return fail(res, 404, "Customer not found");

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: { customer },
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return fail(res, 400, "Invalid customer ID");
    }

    const hasInvoices = await Invoice.exists({ customer: req.params.id });
    if (hasInvoices) {
      return fail(res, 409, "This customer has invoices and cannot be deleted");
    }

    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return fail(res, 404, "Customer not found");

    res.json({
      success: true,
      message: "Customer deleted successfully",
      data: null,
    });
  } catch (error) {
    serverError(res, error);
  }
};
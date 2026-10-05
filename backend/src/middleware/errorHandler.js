// Catches anything that wasn't already handled inside a controller's own try/catch.
// This is a safety net, not the primary error-handling path — it exists so an
// unexpected crash still returns the app's normal JSON shape instead of a raw
// Express error page or a hung request.
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  // A response may have already started streaming in rare cases — hand off to
  // Express's default handler rather than trying to send a second response.
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
    data: null,
  });
};

// Catches requests to routes that don't exist at all (e.g. a typo'd URL).
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
};

module.exports = { errorHandler, notFound };
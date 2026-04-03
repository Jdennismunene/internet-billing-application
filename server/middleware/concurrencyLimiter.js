let activeTests = 0;
const MAX_ACTIVE = 50;

export const concurrencyLimiter = (req, res, next) => {
  if (activeTests >= MAX_ACTIVE) {
    return res.status(503).json({
      error: "Server is busy. Please try again shortly.",
      retryAfter: 5,
    });
  }

  activeTests++;

  // Decrement on both normal finish and abrupt disconnect
  const decrement = () => {
    activeTests = Math.max(0, activeTests - 1);
  };
  res.on("finish", decrement);
  res.on("close", decrement);

  next();
};

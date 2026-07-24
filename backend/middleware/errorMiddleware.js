/**
 * Centralized error handler middleware.
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('Unhandled Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  
  // Clean message for client consumption
  let clientMessage = err.message || 'An unexpected server error occurred.';
  
  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'This email is already registered.'
    });
  }

  if (err.code === 'P1002' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Database connection failed. Please try again later.'
    });
  }

  // Custom check for Multer limit errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File size exceeded limit. Maximum allowable file size is 10 MB.'
    });
  }

  // Ensure response is always JSON
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    error: clientMessage,
    status: statusCode
  });
};

module.exports = errorMiddleware;

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
  
  // Custom check for Multer limit errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File size exceeded limit. Maximum allowable file size is 10 MB.'
    });
  }

  res.status(statusCode).json({
    error: clientMessage,
    status: statusCode
  });
};

module.exports = errorMiddleware;

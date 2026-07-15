const multer = require('multer');

// Memory storage is standard for streaming files directly to Google Cloud Storage
// or for dynamic local disk fallbacks using buffers.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    // 10MB in bytes is 10,485,760 bytes.
    fileSize: 10 * 1024 * 1024
  }
});

module.exports = upload;

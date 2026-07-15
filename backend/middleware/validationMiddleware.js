const path = require('path');

// Defined file extensions and mime-types to allow
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Some browsers send docx as application/octet-stream, we support it but prioritize standard docx mime
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Rejected extensions to double-check explicitly
const REJECTED_EXTENSIONS = ['.exe', '.zip', '.apk', '.bat', '.js'];

/**
 * Middleware to validate file uploads on backend.
 */
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please select a file to upload.' });
  }

  const file = req.file;
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  // 1. Verify extension is not explicitly blocked
  if (REJECTED_EXTENSIONS.includes(fileExt)) {
    return res.status(400).json({
      error: `File execution block: Files with extension ${fileExt} are strictly prohibited for security reasons.`
    });
  }

  // 2. Verify extension is in the allowed whitelist
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return res.status(400).json({
      error: `Unsupported file type (${fileExt}). Only PDF, JPG, JPEG, PNG, and DOCX are allowed.`
    });
  }

  // 3. Verify mimetype
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype) || 
                       (fileExt === '.docx' && (file.mimetype === 'application/octet-stream' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
  
  if (!isMimeAllowed) {
    return res.status(400).json({
      error: `File type verification failed. The file metadata claims to be ${file.mimetype}, which is not supported.`
    });
  }

  // 4. Verify file size (10 MB = 10,485,760 bytes)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return res.status(400).json({
      error: 'File size exceeded limit. Maximum allowable file size is 10 MB.'
    });
  }

  next();
};

module.exports = {
  validateFileUpload
};

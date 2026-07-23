const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');

// Configure Cloudinary with environment variables
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✓ Cloudinary configured successfully');
} else {
  console.warn('⚠ Cloudinary environment variables not set. Cloudinary uploads will not work.');
}

/**
 * Upload a file to Cloudinary.
 * @param {Object} file Multer file object
 * @returns {Promise<string>} Cloudinary file URL
 */
const uploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        // Use document type for files instead of auto-detection
        resource_type: 'auto',
        // Generate unique public_id to avoid conflicts
        public_id: `documents/${uuidv4()}`,
        // Store original filename as metadata
        original_filename: file.originalname,
        // Allow all file types
        allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar', '7z', 'txt', 'csv'],
        // Set secure URL for HTTPS
        secure: true,
        folder: 'document-vault'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Failed to upload to Cloudinary: ${error.message}`));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Write the file buffer to the upload stream
    uploadStream.end(file.buffer);
  });
};

/**
 * Delete a file from Cloudinary.
 * @param {string} fileUrl The Cloudinary URL stored in the DB
 * @returns {Promise<void>}
 */
const deleteFile = async (fileUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud}/image/upload/{public_id}
    const urlParts = fileUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex !== -1) {
      // Get everything after 'upload/' and remove file extension
      const publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
      
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(publicId);
      console.log(`✓ Successfully deleted Cloudinary file: ${publicId}`);
    }
  } catch (error) {
    console.error(`⚠ Failed to delete Cloudinary file: ${fileUrl}. Error:`, error.message);
    // Don't throw - allow deletion to continue even if cloud file deletion fails
  }
};

/**
 * Check if Cloudinary is properly configured.
 * @returns {boolean} True if Cloudinary is configured
 */
const isCloudinaryEnabled = () => {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
};

module.exports = {
  uploadFile,
  deleteFile,
  isCloudinaryEnabled
};

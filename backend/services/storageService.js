const cloudinaryService = require('./cloudinaryService');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure local uploads directory exists
const localUploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

/**
 * Upload a file to active storage provider (Cloudinary or Local Disk).
 * @param {Object} file Multer file object
 * @returns {Promise<string>} File URL
 */
const uploadFile = async (file) => {
  if (cloudinaryService.isCloudinaryEnabled()) {
    try {
      return await cloudinaryService.uploadFile(file);
    } catch (error) {
      console.warn(`Cloudinary upload failed, falling back to local storage: ${error.message}`);
    }
  }

  // Local storage fallback
  const fileExt = path.extname(file.originalname);
  const uniqueFileName = `${uuidv4()}${fileExt}`;
  const destinationPath = path.join(localUploadDir, uniqueFileName);

  if (file.buffer) {
    await fs.promises.writeFile(destinationPath, file.buffer);
  } else {
    throw new Error('No file buffer found for upload');
  }

  // Return the relative URL path that Express static middleware will serve
  return `/uploads/${uniqueFileName}`;
};

/**
 * Delete a file from active storage provider (Cloudinary or Local Disk).
 * @param {string} fileUrl The URL stored in the DB
 * @returns {Promise<void>}
 */
const deleteFile = async (fileUrl) => {
  if (fileUrl.includes('res.cloudinary.com')) {
    try {
      await cloudinaryService.deleteFile(fileUrl);
    } catch (error) {
      console.error(`Failed to delete Cloudinary file: ${fileUrl}. error:`, error.message);
    }
    return;
  }

  try {
    // Extract the filename from local relative path '/uploads/filename.ext'
    const fileName = path.basename(fileUrl);
    const filePath = path.join(localUploadDir, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`Successfully deleted local file: ${fileName}`);
    }
  } catch (error) {
    console.error(`Failed to delete local file: ${fileUrl}. error:`, error.message);
  }
};

module.exports = {
  uploadFile,
  deleteFile
};

const { bucket, isGcsEnabled } = require('../config/storage');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure local uploads directory exists
const localUploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

/**
 * Upload a file to active storage provider (GCS or Local Disk).
 * @param {Object} file Multer file object
 * @returns {Promise<string>} File URL
 */
const uploadFile = async (file) => {
  if (isGcsEnabled) {
    return new Promise((resolve, reject) => {
      // Generate a unique filename using uuid and original file extension
      const fileExt = path.extname(file.originalname);
      const gcsFileName = `${uuidv4()}${fileExt}`;
      const blob = bucket.file(gcsFileName);
      
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname
          }
        },
      });

      blobStream.on('error', (err) => {
        console.error('GCS Upload Stream Error:', err);
        reject(new Error(`Failed to upload to Google Cloud Storage: ${err.message}`));
      });

      blobStream.on('finish', () => {
        // Public cloud URL for Google Cloud Storage
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } else {
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
  }
};

/**
 * Delete a file from active storage provider (GCS or Local Disk).
 * @param {string} fileUrl The URL stored in the DB
 * @returns {Promise<void>}
 */
const deleteFile = async (fileUrl) => {
  if (isGcsEnabled) {
    try {
      const bucketUrlPrefix = `https://storage.googleapis.com/${bucket.name}/`;
      if (fileUrl.startsWith(bucketUrlPrefix)) {
        const fileName = fileUrl.replace(bucketUrlPrefix, '');
        const file = bucket.file(fileName);
        await file.delete();
        console.log(`Successfully deleted GCS file: ${fileName}`);
      }
    } catch (error) {
      console.error(`Failed to delete GCS file: ${fileUrl}. error:`, error.message);
    }
  } else {
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
  }
};

module.exports = {
  uploadFile,
  deleteFile
};

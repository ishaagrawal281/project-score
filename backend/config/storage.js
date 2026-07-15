const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

let storage = null;
let bucket = null;

const projectId = process.env.GCS_PROJECT_ID;
const keyFilename = process.env.GCS_KEY_FILE;
const bucketName = process.env.GCS_BUCKET_NAME;

if (projectId && bucketName) {
  try {
    const config = { projectId };
    if (keyFilename) {
      config.keyFilename = keyFilename;
    }
    storage = new Storage(config);
    bucket = storage.bucket(bucketName);
    console.log(`Google Cloud Storage client initialized successfully. Bucket: ${bucketName}`);
  } catch (error) {
    console.warn('Failed to initialize Google Cloud Storage client. Local storage fallback will be used:', error.message);
  }
} else {
  console.warn('GCS environment variables (GCS_PROJECT_ID and GCS_BUCKET_NAME) are missing. Running in local storage fallback mode.');
}

module.exports = { storage, bucket, isGcsEnabled: !!bucket };

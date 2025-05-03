const admin = require('../utils/firebase-admin');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Initialize Firebase Storage
const bucket = admin.storage().bucket();

/**
 * Upload a file to Firebase Storage
 * @param {Object} file - The file object from multer
 * @returns {Promise<Object>} - The uploaded file details
 */
const uploadFile = async (file) => {
  try {
    // Create a unique filename
    const fileName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = `uploads/${fileName}`;
    
    // Create a temporary file for processing if file is in memory
    let tempFilePath;
    let fileBuffer;
    
    if (file.buffer) {
      // File is in memory (using memoryStorage)
      fileBuffer = file.buffer;
      
      // Create temp file for content extraction if needed
      tempFilePath = path.join(os.tmpdir(), fileName);
      fs.writeFileSync(tempFilePath, file.buffer);
      
      // Add path property to file object for compatibility with existing code
      file.path = tempFilePath;
    }
    
    // Upload file to Firebase Storage
    if (fileBuffer) {
      // Upload from buffer
      await bucket.file(filePath).save(fileBuffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            size: file.size
          }
        }
      });
    } else {
      // Upload from file path (backward compatibility)
      await bucket.upload(file.path, {
        destination: filePath,
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            size: file.size
          }
        }
      });
    }
    
    // Make the file publicly accessible
    await bucket.file(filePath).makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    
    // Delete the local file if it was created temporarily
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    } else if (file.path && fs.existsSync(file.path) && !file.buffer) {
      // Only delete if it's not a temp file we created
      fs.unlinkSync(file.path);
    }
    
    return {
      fileName,
      filePath,
      publicUrl,
      originalName: file.originalname,
      size: file.size,
      contentType: file.mimetype
    };
  } catch (error) {
    console.error('Error uploading file to Firebase:', error);
    throw new Error(`Failed to upload file to Firebase: ${error.message}`);
  }
};

/**
 * Download a file from Firebase Storage to a temporary location
 * @param {String} filePath - The path of the file in Firebase Storage
 * @returns {Promise<String>} - The path to the downloaded file
 */
const downloadFile = async (filePath) => {
  try {
    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    
    // Download file from Firebase Storage
    await bucket.file(filePath).download({ destination: tempFilePath });
    
    return tempFilePath;
  } catch (error) {
    console.error('Error downloading file from Firebase:', error);
    throw new Error(`Failed to download file from Firebase: ${error.message}`);
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {String} filePath - The path of the file in Firebase Storage
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  try {
    await bucket.file(filePath).delete();
  } catch (error) {
    console.error('Error deleting file from Firebase:', error);
    throw new Error(`Failed to delete file from Firebase: ${error.message}`);
  }
};

module.exports = {
  uploadFile,
  downloadFile,
  deleteFile
};
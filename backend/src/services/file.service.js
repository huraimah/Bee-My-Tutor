const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const geminiService = require('./gemini.service');

// Process uploaded file and extract content
const processFile = async (file) => {
  try {
    const filePath = file.path;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    let fileContent = '';
    
    // Extract text based on file type
    if (fileExtension === '.pdf') {
      fileContent = await extractPdfContent(filePath);
    } else if (fileExtension === '.docx' || fileExtension === '.doc') {
      fileContent = await extractDocxContent(filePath);
    } else {
      throw new Error('Unsupported file type');
    }
    
    // Get file type without the dot
    const fileType = fileExtension.substring(1);
    
    // Extract metadata using Gemini API
    const metadata = await geminiService.extractContentFromMaterial(fileContent, fileType);
    
    return {
      originalFilename: file.originalname,
      filePath: filePath,
      fileSize: file.size,
      fileType: fileType,
      content: fileContent,
      ...metadata
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};

// Extract content from PDF file
const extractPdfContent = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF content:', error);
    throw new Error('Failed to extract content from PDF');
  }
};

// Extract content from DOCX file
const extractDocxContent = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX content:', error);
    throw new Error('Failed to extract content from DOCX');
  }
};

// Delete file from filesystem
const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

module.exports = {
  processFile,
  extractPdfContent,
  extractDocxContent,
  deleteFile
};
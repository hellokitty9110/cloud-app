const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types (you can restrict this)
    cb(null, true);
  }
});

// Upload file
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      owner: req.session.userId
    });

    await file.save();

    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        originalName: file.originalName,
        size: file.size,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get user's files
router.get('/my-files', requireAuth, async (req, res) => {
  try {
    const files = await File.find({ owner: req.session.userId })
      .sort({ uploadedAt: -1 })
      .select('filename originalName size uploadedAt mimetype');

    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to retrieve files' });
  }
});

// Delete file
router.delete('/:fileId', requireAuth, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.fileId, 
      owner: req.session.userId 
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // In a real application, you'd also delete the physical file here
    await File.findByIdAndDelete(req.params.fileId);

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
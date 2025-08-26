// routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/pdf/extract-text
router.post('/extract-text', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const data = await pdfParse(req.file.buffer);
    res.json({
      success: true,
      text: data.text,
    });
  } catch (error) {
    console.error('PDF parse error:', error);
    res.status(500).json({ success: false, message: 'Failed to extract text from PDF', error });
  }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const FormData = require('form-data');

const app = express();
const port = 3001;

// Configure CORS
app.use(cors());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Log the incoming file details
    console.log('Received file:', {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    // Create form data for n8n webhook
    const formData = new FormData();
    
    // Make sure we're using 'file' as the parameter name to match n8n's configuration
    const fileBuffer = Buffer.from(req.file.buffer);
    formData.append('file', fileBuffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    console.log(`Sending to n8n webhook at: ${process.env.N8N_WEBHOOK_URL}`);
    console.log('File details being sent to n8n:', {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size
    });

    try {
      // Forward to n8n webhook
      const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, formData, {
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json'
        },
        // Add timeout and more detailed error handling
        timeout: 30000,
        validateStatus: false
      });
      
      console.log('n8n response status:', n8nResponse.status);
      console.log('n8n response headers:', n8nResponse.headers);
      
      if (n8nResponse.status >= 200 && n8nResponse.status < 300) {
        console.log('n8n response data:', n8nResponse.data);
        res.json({
          message: 'File uploaded successfully to n8n',
          n8nResponse: n8nResponse.data
        });
      } else {
        console.error('n8n error response:', n8nResponse.status, n8nResponse.data);
        res.status(n8nResponse.status).json({ 
          error: `n8n returned error ${n8nResponse.status}`,
          details: n8nResponse.data
        });
      }
    } catch (n8nError) {
      console.error('n8n connection error:', n8nError.message);
      if (n8nError.response) {
        console.error('n8n error status:', n8nError.response.status);
        console.error('n8n error data:', n8nError.response.data);
      }
      res.status(500).json({ 
        error: 'Failed to connect to n8n webhook', 
        details: n8nError.message 
      });
    }
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 
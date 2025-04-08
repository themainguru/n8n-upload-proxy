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

// Parse JSON bodies
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// API Routes
const apiRoutes = express.Router();

// Upload endpoint
apiRoutes.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
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

    // Print the timeout value to verify it's correct
    const timeoutMs = 120000; // 2 minutes in milliseconds
    console.log(`Setting axios timeout to: ${timeoutMs}ms (2 minutes)`);

    try {
      // Forward to n8n webhook
      const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, formData, {
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        },
        // Increase timeout to 2 minutes (120000ms) for longer workflows
        timeout: timeoutMs,
        validateStatus: false,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('n8n response status:', n8nResponse.status);
      
      if (n8nResponse.status >= 200 && n8nResponse.status < 300) {
        // Parse JSON response if available
        let responseData = n8nResponse.data;
        
        // Some successful requests might return empty data
        if (!responseData) {
          responseData = { message: 'File processed successfully (no detailed response)' };
        }
        
        // For responses that contain stringified JSON in 'output' field (a common n8n pattern)
        if (responseData.output && typeof responseData.output === 'string') {
          try {
            // Check if the output is JSON formatted within markdown code blocks
            if (responseData.output.includes('```json')) {
              const jsonMatch = responseData.output.match(/```json\s*([\s\S]*?)\s*```/);
              if (jsonMatch && jsonMatch[1]) {
                const parsedOutput = JSON.parse(jsonMatch[1]);
                responseData.parsedOutput = parsedOutput;
              }
            } else if (responseData.output.startsWith('{') && responseData.output.endsWith('}')) {
              // Direct JSON string
              const parsedOutput = JSON.parse(responseData.output);
              responseData.parsedOutput = parsedOutput;
            }
          } catch (parseError) {
            console.log('Could not parse output as JSON:', parseError.message);
            // Keep the original output string, just couldn't parse it
          }
        }
        
        res.json({
          success: true,
          message: 'File uploaded successfully to n8n',
          data: responseData,
          filename: req.file.originalname,
          fileType: req.file.mimetype
        });
      } else {
        console.error('n8n error response:', n8nResponse.status, n8nResponse.data);
        res.status(n8nResponse.status).json({ 
          success: false,
          error: `n8n returned error ${n8nResponse.status}`,
          details: n8nResponse.data
        });
      }
    } catch (n8nError) {
      console.error('n8n connection error:', n8nError.message);
      let errorDetails = { message: n8nError.message };
      
      if (n8nError.response) {
        console.error('n8n error status:', n8nError.response.status);
        console.error('n8n error data:', n8nError.response.data);
        errorDetails.status = n8nError.response.status;
        errorDetails.data = n8nError.response.data;
      }
      
      if (n8nError.message.includes('timeout')) {
        return res.status(504).json({ 
          success: false, 
          error: 'The request to n8n took too long to process. This might happen with larger files.', 
          details: errorDetails
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to connect to n8n webhook', 
        details: errorDetails
      });
    }
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process file',
      details: error.message
    });
  }
});

// Health check endpoint
apiRoutes.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Mount API routes
app.use('/api', apiRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 
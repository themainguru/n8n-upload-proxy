# n8n Upload Proxy

A simple file upload proxy for sending files to n8n webhooks with proper filenames and MIME types.

## Problem Solved

This tool fixes the common issue of files being uploaded to n8n webhooks as:
- `application/octet-stream` instead of their proper MIME type
- With `.bin` extensions instead of their original filenames

## How It Works

1. React frontend allows selection of files with a clean UI
2. Express server receives files via multipart/form-data
3. Server forwards files to n8n webhooks preserving:
   - Original filenames
   - Correct MIME types
   - File contents

## Installation

```bash
# Install all dependencies for both server and client
npm run install-all
```

## Configuration

Edit the `.env` file to set your n8n webhook URL:

```
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-path
```

## Usage

Start both the server and client:

```bash
npm start
```

Then open your browser to:
```
http://localhost:3000
```

## Development

- Frontend: React (port 3000)
- Backend: Express (port 3001)

## n8n Webhook Configuration

In your n8n webhook node, ensure:
- HTTP Method: POST
- Binary Property Name: `file` (must match the parameter name used in the code) 
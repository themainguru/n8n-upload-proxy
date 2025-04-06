import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
      setResponse(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResponse(null);
      
      const formData = new FormData();
      formData.append('file', file, file.name);
      
      // Send to our local server
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      setResponse(data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to render response data
  const renderResponseData = () => {
    if (!response) return null;
    
    const { data, filename, fileType } = response;
    
    // Handle cases where we have parsed JSON output from n8n
    const parsedOutput = data.parsedOutput || {};
    const coverage = parsedOutput.coverage || '';
    const fileTypeInfo = parsedOutput.file_type || '';
    const notes = parsedOutput.notes || '';
    
    // Check if there's an output string from n8n but not parsed
    const rawOutput = data.output || '';
    
    // Check for threadId (used by some n8n workflows)
    const threadId = data.threadId || '';
    
    return (
      <div className="response-container">
        <div className="file-info">
          <h3>File Information</h3>
          <p><strong>Filename:</strong> {filename}</p>
          <p><strong>Type:</strong> {fileType}</p>
        </div>
        
        {(coverage || fileTypeInfo || notes) && (
          <div className="analysis-results">
            <h3>Analysis Results</h3>
            {coverage && <p><strong>Coverage:</strong> {coverage}</p>}
            {fileTypeInfo && <p><strong>File Type:</strong> {fileTypeInfo}</p>}
            {notes && (
              <div>
                <p><strong>Notes:</strong></p>
                <p className="notes-text">{notes}</p>
              </div>
            )}
          </div>
        )}
        
        {threadId && (
          <div className="thread-info">
            <p><strong>Thread ID:</strong> {threadId}</p>
          </div>
        )}
        
        {rawOutput && !parsedOutput.file_type && (
          <div className="raw-output">
            <h3>Raw Response</h3>
            <pre>{rawOutput}</pre>
          </div>
        )}
        
        <div className="json-view">
          <h3>Complete Response</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>n8n File Upload Proxy</h1>
        <p>Upload files to n8n webhook with proper filenames and MIME types</p>
      </header>
      
      <main className="app-main">
        <section className="upload-section">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="file-input-container">
              <label className="file-input-label">
                <span>Select File</span>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  disabled={loading}
                  className="file-input"
                />
              </label>
              
              {fileName && (
                <div className="selected-file">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{fileName}</span>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={!file || loading}
              className={`upload-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Uploading...</span>
                </>
              ) : (
                'Upload to n8n'
              )}
            </button>
          </form>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </section>
        
        {response && (
          <section className="results-section">
            <h2>Upload Results</h2>
            {renderResponseData()}
          </section>
        )}
      </main>
      
      <footer className="app-footer">
        <p>n8n Upload Proxy &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App; 
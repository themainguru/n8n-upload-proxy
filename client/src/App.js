import React, { useState } from 'react';
import { 
  Layout, 
  Typography, 
  Upload, 
  Button, 
  Card, 
  Spin, 
  message, 
  Divider, 
  Tag, 
  Row, 
  Col, 
  Alert, 
  Collapse, 
  Space 
} from 'antd';
import { 
  UploadOutlined, 
  FileOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Dragger } = Upload;

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  
  const handleFileChange = (info) => {
    if (info.file && info.file.originFileObj) {
      const selectedFile = info.file.originFileObj;
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
      setResponse(null);
      
      message.info({
        content: `File selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`,
        style: {
          marginTop: '20px',
          borderRadius: '8px',
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file');
      message.warning({
        content: 'Please select a file to upload',
        style: {
          marginTop: '20px',
          borderRadius: '8px',
        },
      });
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResponse(null);
      setProcessingStatus('Uploading file...');
      setProgressPercent(10);
      
      const formData = new FormData();
      formData.append('file', file, file.name);
      
      // Add timeout handling for long-running processes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        // Don't abort, just update UI after 10 seconds
        setProcessingStatus('Processing file (this may take a while)...');
        setProgressPercent(50);
      }, 10000);
      
      // After 30 seconds, update again but still wait
      const longTimeoutId = setTimeout(() => {
        setProcessingStatus('Still processing (large files take longer)...');
        setProgressPercent(75);
      }, 30000);
      
      // After 100 seconds show a different message but keep waiting
      const veryLongTimeoutId = setTimeout(() => {
        setProcessingStatus('Processing a complex document (almost done)...');
        setProgressPercent(90);
      }, 100000);
      
      try {
        // Send to our local server
        const response = await fetch('http://localhost:3001/api/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          // Add timeout handling directly in fetch
          headers: {
            'Connection': 'keep-alive',
          },
        });
        
        // Clear timeouts since we got a response
        clearTimeout(timeoutId);
        clearTimeout(longTimeoutId);
        clearTimeout(veryLongTimeoutId);
        
        // Check if the response is valid
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          
          if (response.status === 504) {
            // Gateway timeout, but file might still be processing
            throw new Error('The operation timed out. Your file is still being processed but might take longer than expected.');
          } else if (response.status === 404) {
            throw new Error('The n8n webhook is not active. Please make sure the workflow is active in n8n and try again.');
          } else if (response.status === 520) {
            throw new Error('There was a connection issue with the n8n server. Please try again later.');
          } else {
            throw new Error(data.error || `Upload failed with status ${response.status}`);
          }
        }
        
        const data = await response.json();
        
        setProgressPercent(100);
        setProcessingStatus('Complete!');
        setResponse(data);
        message.success({
          content: 'File has been processed successfully',
          style: {
            marginTop: '20px',
            borderRadius: '8px',
          },
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        clearTimeout(longTimeoutId);
        clearTimeout(veryLongTimeoutId);
        
        console.error('Fetch error:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request was aborted due to timeout. Try a smaller file or try again later.');
        } else if (fetchError.message === 'NetworkError when attempting to fetch resource.') {
          // Check if server is running by making a lightweight request
          try {
            const serverCheck = await fetch('http://localhost:3001/api/health', { 
              method: 'GET',
              signal: AbortSignal.timeout(2000) // 2 second timeout for health check
            });
            if (serverCheck.ok) {
              throw new Error('Network error - server is running but the file upload failed. Try a smaller file.');
            } else {
              throw new Error('Network error - server is running but returned an error. Please check the logs.');
            }
          } catch (healthCheckError) {
            throw new Error('Network error - server is not responding. Ensure the server is running at http://localhost:3001');
          }
        } else {
          throw fetchError;
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An unexpected error occurred');
      setProcessingStatus('');
      setProgressPercent(0);
      
      message.error({
        content: err.message || 'An unexpected error occurred',
        style: {
          marginTop: '20px',
          borderRadius: '8px',
        },
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to extract and format data from n8n response
  const extractDataFromResponse = () => {
    if (!response || !response.data) return null;
    
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
    
    return {
      filename,
      fileType,
      coverage,
      fileTypeInfo,
      notes,
      rawOutput,
      threadId,
      fullData: data
    };
  };

  const responseData = extractDataFromResponse();
  
  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file) => {
      handleFileChange({ file: { originFileObj: file } });
      return false; // Prevent auto upload
    },
    showUploadList: false,
    accept: '*/*',
  };

  // Apple-inspired styles
  const appStyles = {
    layout: {
      minHeight: '100vh',
      background: '#fbfbfd', // Apple's subtle background color
    },
    content: {
      padding: '48px 24px',
      maxWidth: '980px', // Apple's typical content width
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px',
    },
    headerTitle: {
      fontSize: '40px',
      fontWeight: '600',
      lineHeight: '1.1',
      letterSpacing: '-0.015em',
      color: '#1d1d1f',
      margin: '0 0 8px 0',
    },
    headerSubtitle: {
      fontSize: '21px',
      lineHeight: '1.381',
      fontWeight: '400',
      letterSpacing: '0.011em',
      color: '#6e6e73',
    },
    card: {
      borderRadius: '18px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
      border: 'none',
      overflow: 'hidden',
      marginBottom: '24px',
    },
    cardTitle: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.1667',
      letterSpacing: '0.009em',
      color: '#1d1d1f',
    },
    uploadArea: {
      borderRadius: '14px',
      border: '1px dashed #d2d2d7',
      background: '#ffffff',
      transition: 'all 0.2s ease',
      padding: '24px',
      cursor: 'pointer',
      minHeight: '250px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadButton: {
      height: '44px',
      borderRadius: '22px',
      fontWeight: '500',
      fontSize: '17px',
      background: '#0071e3',
      border: 'none',
      boxShadow: 'none',
    },
    footer: {
      background: '#f5f5f7',
      padding: '17px 0',
      color: '#86868b',
      fontSize: '12px',
      textAlign: 'center',
      borderTop: '1px solid #d2d2d7',
    },
    tag: {
      borderRadius: '18px',
      padding: '4px 12px',
      fontWeight: '500',
    },
    resultItem: {
      marginBottom: '16px',
    },
    resultLabel: {
      fontSize: '14px',
      color: '#6e6e73',
      marginBottom: '4px',
    },
    resultValue: {
      fontSize: '17px',
      color: '#1d1d1f',
      fontWeight: '500',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
    },
    collapse: {
      borderRadius: '14px',
      overflow: 'hidden',
      borderColor: '#d2d2d7',
    },
    pre: {
      background: '#f5f5f7',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'SF Mono, Menlo, monospace',
      overflowX: 'auto',
    },
  };

  return (
    <Layout style={appStyles.layout}>
      <Content style={appStyles.content}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 32, borderRadius: '14px' }}
            closable
          />
        )}
        
        <div style={appStyles.header}>
          <div style={appStyles.headerTitle}>n8n Upload Proxy</div>
          <div style={appStyles.headerSubtitle}>
            Upload files to n8n webhooks with correct filename and MIME type
          </div>
        </div>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Upload Card */}
          <Card 
            title={<span style={appStyles.cardTitle}>File Upload</span>}
            style={appStyles.card}
            headStyle={{ borderBottom: 'none', paddingBottom: 0 }}
            bodyStyle={{ padding: '20px 24px 24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Dragger 
                {...uploadProps} 
                disabled={loading}
                style={appStyles.uploadArea}
                height={null}
              >
                {file ? (
                  <div style={{ padding: '16px' }}>
                    <FileOutlined style={{ fontSize: 48, color: '#0071e3', marginBottom: 16 }} />
                    <Paragraph 
                      strong 
                      style={{ 
                        fontSize: '17px', 
                        color: '#1d1d1f',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: '0 0 8px 0'
                      }}
                    >
                      {fileName}
                    </Paragraph>
                    <Text style={{ 
                      fontSize: '15px', 
                      color: '#6e6e73',
                      display: 'block',
                      marginBottom: '12px'
                    }}>
                      {(file.size / 1024).toFixed(2)} KB • {file.type || 'Unknown type'}
                    </Text>
                    <div>
                      <Tag color="#0071e3" style={appStyles.tag}>Ready to upload</Tag>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '32px 16px' }}>
                    <UploadOutlined style={{ fontSize: 48, color: '#0071e3', marginBottom: 16 }} />
                    <Paragraph style={{ fontSize: '19px', fontWeight: 500, color: '#1d1d1f', marginBottom: 8 }}>
                      Drag file here or click to browse
                    </Paragraph>
                    <Paragraph style={{ fontSize: '15px', color: '#6e6e73' }}>
                      <Button type="link" style={{ color: '#0071e3', padding: 0, fontWeight: 500 }}>
                        Click to select a file
                      </Button> or drop it here
                    </Paragraph>
                  </div>
                )}
              </Dragger>
              
              <Button
                type="primary"
                icon={loading ? <Spin size="small" style={{ marginRight: 8 }} /> : null}
                onClick={handleSubmit}
                disabled={!file || loading}
                loading={loading}
                block
                style={appStyles.uploadButton}
              >
                {loading ? processingStatus || 'Uploading...' : 'Upload to n8n'}
              </Button>
              
              {loading && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ 
                    width: '100%', 
                    height: '4px', 
                    background: '#e5e5e5', 
                    borderRadius: '2px', 
                    overflow: 'hidden' 
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: '#0071e3',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#6e6e73', 
                    marginTop: '8px',
                    textAlign: 'center'
                  }}>
                    {processingStatus || 'Processing...'}
                  </div>
                </div>
              )}
            </Space>
          </Card>
          
          {/* Results Section */}
          {responseData && (
            <Card 
              title={<span style={appStyles.cardTitle}>Analysis Results</span>}
              style={appStyles.card}
              headStyle={{ borderBottom: 'none', paddingBottom: 0 }}
              bodyStyle={{ padding: '20px 24px 24px' }}
            >
              <Spin spinning={loading}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} style={appStyles.resultItem}>
                      <div style={appStyles.resultLabel}>Filename</div>
                      <div style={appStyles.resultValue}>{responseData.filename}</div>
                    </Col>
                    <Col xs={24} sm={12} style={appStyles.resultItem}>
                      <div style={appStyles.resultLabel}>File Type</div>
                      <div style={appStyles.resultValue}>{responseData.fileType}</div>
                    </Col>
                    {responseData.fileTypeInfo && (
                      <Col xs={24} sm={12} style={appStyles.resultItem}>
                        <div style={appStyles.resultLabel}>Document Type</div>
                        <div style={appStyles.resultValue}>{responseData.fileTypeInfo}</div>
                      </Col>
                    )}
                    {responseData.coverage && (
                      <Col xs={24} sm={12} style={appStyles.resultItem}>
                        <div style={appStyles.resultLabel}>Coverage</div>
                        <div style={appStyles.resultValue}>{responseData.coverage}</div>
                      </Col>
                    )}
                    {responseData.notes && (
                      <Col span={24} style={appStyles.resultItem}>
                        <div style={appStyles.resultLabel}>Notes</div>
                        <div style={appStyles.resultValue}>{responseData.notes}</div>
                      </Col>
                    )}
                    {responseData.threadId && (
                      <Col span={24} style={appStyles.resultItem}>
                        <div style={appStyles.resultLabel}>Thread ID</div>
                        <Paragraph copyable style={appStyles.resultValue}>{responseData.threadId}</Paragraph>
                      </Col>
                    )}
                  </Row>
                  
                  <Divider style={{ margin: '12px 0 24px' }}>Raw Response</Divider>
                  
                  <Collapse style={appStyles.collapse} bordered={false}>
                    <Panel 
                      header={<span style={{ fontSize: '15px', fontWeight: 500 }}>View Raw Data</span>} 
                      key="1"
                    >
                      <pre style={appStyles.pre}>
                        {JSON.stringify(responseData.fullData, null, 2)}
                      </pre>
                    </Panel>
                  </Collapse>
                </Space>
              </Spin>
            </Card>
          )}
        </Space>
      </Content>
      
      <Footer style={appStyles.footer}>
        n8n Upload Proxy © {new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default App; 
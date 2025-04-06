import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
  Icon,
  FormControl,
  FormLabel,
  Spinner,
  Badge,
  Divider,
  Code,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiCheck, FiAlertTriangle } from 'react-icons/fi';

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
      setResponse(null);
      
      toast({
        title: 'File selected',
        description: `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
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
      
      toast({
        title: 'Upload successful',
        description: 'File has been processed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An unexpected error occurred');
      
      toast({
        title: 'Upload failed',
        description: err.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
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

  return (
    <Box minHeight="100vh" py={5}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex direction="column" alignItems="center" textAlign="center">
            <Heading as="h1" size="xl" mb={2} color="brand.600">n8n Upload Proxy</Heading>
            <Text color="gray.600">Upload files to n8n webhooks with correct filename and MIME type</Text>
          </Flex>
          
          {/* Upload Card */}
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden" boxShadow="sm">
            <CardHeader pb={0}>
              <Heading size="md">File Upload</Heading>
            </CardHeader>
            
            <CardBody>
              <VStack spacing={5} align="stretch">
                <FormControl>
                  <FormLabel htmlFor="file-upload" cursor="pointer">
                    <Flex 
                      direction="column" 
                      align="center" 
                      justify="center" 
                      p={6} 
                      borderWidth="1px" 
                      borderRadius="md" 
                      borderStyle="dashed" 
                      borderColor={file ? "brand.500" : "gray.300"}
                      bg={file ? "brand.50" : "transparent"}
                      _hover={{ borderColor: "brand.400", bg: "gray.50" }}
                      transition="all 0.2s"
                    >
                      {file ? (
                        <VStack spacing={2}>
                          <Icon as={FiFile} w={8} h={8} color="brand.500" />
                          <Text fontWeight="medium" color="brand.700" noOfLines={1}>{fileName}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {(file.size / 1024).toFixed(2)} KB • {file.type || 'Unknown type'}
                          </Text>
                          <Badge colorScheme="green">Ready to upload</Badge>
                        </VStack>
                      ) : (
                        <VStack spacing={2}>
                          <Icon as={FiUpload} w={8} h={8} color="gray.400" />
                          <Text fontWeight="medium">Drag file here or click to browse</Text>
                          <Text fontSize="sm" color="gray.500">Support for CSV, Excel, PDF, etc.</Text>
                        </VStack>
                      )}
                    </Flex>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      disabled={loading}
                    />
                  </FormLabel>
                </FormControl>
                
                <Button
                  colorScheme="brand"
                  size="md"
                  isLoading={loading}
                  loadingText="Uploading..."
                  leftIcon={loading ? <Spinner size="sm" /> : <FiUpload />}
                  onClick={handleSubmit}
                  isDisabled={!file || loading}
                  width="100%"
                >
                  Upload to n8n
                </Button>
                
                {error && (
                  <Flex align="center" bg="red.50" p={3} borderRadius="md" color="red.600">
                    <Icon as={FiAlertTriangle} mr={2} />
                    <Text fontSize="sm">{error}</Text>
                  </Flex>
                )}
              </VStack>
            </CardBody>
          </Card>
          
          {/* Results Section */}
          {responseData && (
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden" boxShadow="sm">
              <CardHeader pb={0}>
                <Flex align="center">
                  <Icon as={FiCheck} color="green.500" mr={2} />
                  <Heading size="md">Analysis Results</Heading>
                </Flex>
              </CardHeader>
              
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                      <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>Filename</Text>
                      <Text fontWeight="medium">{responseData.filename}</Text>
                    </Box>
                    <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                      <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>File Type</Text>
                      <Text fontWeight="medium">{responseData.fileType}</Text>
                    </Box>
                    
                    {responseData.fileTypeInfo && (
                      <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>Document Type</Text>
                        <Badge colorScheme="purple" fontSize="0.9em">{responseData.fileTypeInfo}</Badge>
                      </Box>
                    )}
                    
                    {responseData.coverage && (
                      <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>Coverage</Text>
                        <Badge colorScheme="blue" fontSize="0.9em">{responseData.coverage}</Badge>
                      </Box>
                    )}
                  </SimpleGrid>
                  
                  {responseData.notes && (
                    <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                      <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>Notes</Text>
                      <Text>{responseData.notes}</Text>
                    </Box>
                  )}
                  
                  {responseData.threadId && (
                    <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                      <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>Thread ID</Text>
                      <Code p={2} borderRadius="md">{responseData.threadId}</Code>
                    </Box>
                  )}
                  
                  <Accordion allowToggle>
                    <AccordionItem border="none">
                      <AccordionButton bg="gray.50" borderRadius="md" _hover={{ bg: 'gray.100' }}>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          View Raw Response
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel p={4}>
                        <Box
                          p={3}
                          bg="gray.50"
                          borderRadius="md"
                          fontSize="sm"
                          fontFamily="monospace"
                          overflowX="auto"
                        >
                          <pre>{JSON.stringify(responseData.fullData, null, 2)}</pre>
                        </Box>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </VStack>
              </CardBody>
            </Card>
          )}
          
          {/* Footer */}
          <Flex justifyContent="center" pt={4}>
            <Text fontSize="sm" color="gray.500">
              n8n Upload Proxy &copy; {new Date().getFullYear()}
            </Text>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}

export default App; 
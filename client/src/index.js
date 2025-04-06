import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';

// Extend the theme with custom colors, fonts, etc.
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e0f3ff',
      100: '#b9deff',
      200: '#8ec8ff',
      300: '#62b3ff',
      400: '#379eff',
      500: '#0d85ff', // Primary color
      600: '#0069d9',
      700: '#004fb3',
      800: '#00348c',
      900: '#001a66',
    },
    success: {
      500: '#38b2ac', // Teal
    },
    error: {
      500: '#e53e3e', // Red
    }
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
); 
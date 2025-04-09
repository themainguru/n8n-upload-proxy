import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';

// Configure Apple-inspired theme
const theme = {
  token: {
    colorPrimary: '#FF6B6B',
    colorSuccess: '#4ECDC4',
    colorWarning: '#FFD166',
    colorError: '#EF476F',
    colorInfo: '#118AB2',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 16,
    borderRadius: 12,
    wireframe: false,
    colorBgContainer: '#ffffff',
    colorTextBase: '#1a1a1a',
    colorTextSecondary: '#4a4a4a',
    colorTextTertiary: '#666666',
    colorBgElevated: '#ffffff',
    colorBorder: '#eaeaea',
  },
  components: {
    Button: {
      borderRadius: 24,
      controlHeight: 48,
      fontSize: 16,
      colorPrimary: '#FF6B6B',
      defaultBorderColor: '#eaeaea',
    },
    Card: {
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      colorBorderSecondary: '#eaeaea',
    },
    Input: {
      borderRadius: 12,
    },
    Tag: {
      borderRadius: 20,
    },
    Collapse: {
      borderRadius: 12,
    },
  },
};

// Insert global styles for the body
const style = document.createElement('style');
style.innerHTML = `
  body {
    margin: 0;
    padding: 0;
    background-color: #ffffff;
    color: #1a1a1a;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
); 
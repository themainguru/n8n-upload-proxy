import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';

// Configure Apple-inspired theme
const theme = {
  token: {
    colorPrimary: '#0071e3',
    colorSuccess: '#34c759',
    colorWarning: '#ff9f0a',
    colorError: '#ff3b30',
    colorInfo: '#0071e3',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 15,
    borderRadius: 8,
    wireframe: false, // For a more streamlined look
    colorBgContainer: '#ffffff',
    colorTextBase: '#1d1d1f',
    colorTextSecondary: '#6e6e73',
    colorTextTertiary: '#86868b',
    colorBgElevated: '#ffffff',
    colorBorder: '#d2d2d7',
  },
  components: {
    Button: {
      borderRadius: 22,
      controlHeight: 44,
      fontSize: 17,
      colorPrimary: '#0071e3',
      defaultBorderColor: '#d2d2d7',
    },
    Card: {
      borderRadius: 18,
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
      colorBorderSecondary: 'transparent',
    },
    Input: {
      borderRadius: 8,
    },
    Tag: {
      borderRadius: 12,
    },
    Collapse: {
      borderRadius: 14,
    },
  },
};

// Insert global styles for the body
const style = document.createElement('style');
style.innerHTML = `
  body {
    margin: 0;
    padding: 0;
    background-color: #fbfbfd;
    color: #1d1d1f;
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
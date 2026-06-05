import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111111',
            color: '#ffffff',
            border: '1px solid #2a2a2a',
            borderRadius: '2px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            padding: '8px 12px',
            boxShadow: 'none',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);

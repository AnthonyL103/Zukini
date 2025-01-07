import React from 'react';
import ReactDOM from 'react-dom/client';
import './frontend/index.css';
import App from './frontend/App';
import { ScanProvider } from './frontend/ScanContext'; // Adjust the path if necessary


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ScanProvider>
    <App />
    </ScanProvider>
  </React.StrictMode>
);



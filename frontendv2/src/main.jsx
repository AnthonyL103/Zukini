import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ScanProvider } from './ScanContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ScanProvider>
    <App />
    </ScanProvider>
  </React.StrictMode>
);



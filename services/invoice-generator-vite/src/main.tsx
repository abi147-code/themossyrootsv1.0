import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <App />
    </div>
  </React.StrictMode>
);

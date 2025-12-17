import React, { useEffect, useState } from 'react';
import { Website } from './components/Website';
import { InvoiceTool } from './components/InvoiceTool';
import TokenBridge from './components/TokenBridge';
import { Toaster } from 'react-hot-toast';
import './light-theme.css';

function App() {
  const [view, setView] = useState<'website' | 'tool'>('website');
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      setView('tool');
    }
  }, []);

  return (
    <>
      <TokenBridge />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #0ea15b',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          },
          success: {
            style: {
              background: '#0f172a',
              borderColor: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#0f172a',
              borderColor: '#f97316',
            },
          },
        }}
      />
      <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <div className="light-mode min-h-screen">
        {view === 'website' && (
          <Website 
            onLaunchTool={() => setView('tool')} 
          />
        )}
        
        {view === 'tool' && (
          <InvoiceTool 
            onBack={() => setView('website')}
            showHeader={!isIframe}
          />
        )}
        </div>
      </div>
    </>
  );
}

export default App;

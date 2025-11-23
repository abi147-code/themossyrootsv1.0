import React, { useState, useEffect } from 'react';
import { Website } from './components/Website';
import { InvoiceTool } from './components/InvoiceTool';

function App() {
  const [view, setView] = useState<'website' | 'tool'>('website');
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Force dark mode class on mount because our primary theme is dark (Ink)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      setView('tool');
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <div className="bg-ink min-h-screen text-porcelain">
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
  );
}

export default App;

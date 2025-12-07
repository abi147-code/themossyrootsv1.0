import React, { useEffect, useState } from 'react';
import { Website } from './components/Website';
import { InvoiceTool } from './components/InvoiceTool';
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
  );
}

export default App;

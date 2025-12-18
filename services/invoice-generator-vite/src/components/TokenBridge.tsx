import React, { useEffect } from 'react';

const TokenBridge: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (event: MessageEvent) => {
      // 1. Validate origin (allow localhost:3000 or production dashboard)
      const allowedOrigins = [
        'http://localhost:3000',
        'https://themossyroots.com',
        'https://www.themossyroots.com',
      ];

      if (!allowedOrigins.includes(event.origin)) {
        // Silent ignore for unrelated messages, strict warn if it looks like ours
        if (event.data?.type === 'TMR_TOKEN_BRIDGE') {
          console.warn('[TokenBridge] Rejected token from unauthorized origin:', event.origin);
        }
        return;
      }

      // 2. Validate payload
      if (!event.data || event.data.type !== 'TMR_TOKEN_BRIDGE' || !event.data.token) {
        return;
      }

      const token = (event.data.token || '').trim().replace(/^["']|["']$/g, '');

      // 3. Store in sessionStorage ONLY
      try {
        window.sessionStorage.setItem('tmr-token', token);
        // Clear any potentially confusing localStorage token (optional, but good for hygiene)
        window.localStorage.removeItem('tmr-token');
      } catch (e) {
        console.error('[TokenBridge] Failed to access storage', e);
        return;
      }

      // 4. Emit local event
      window.dispatchEvent(new CustomEvent('tmr-token-bridged', { detail: { token } }));
      console.log('[TokenBridge] Token accepted and bridged.');
    };

    window.addEventListener('message', handler);
    // Suggest readiness to parent
    window.parent?.postMessage({ type: 'TMR_TOKEN_BRIDGE_READY' }, '*');

    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  return null;
};

export default TokenBridge;

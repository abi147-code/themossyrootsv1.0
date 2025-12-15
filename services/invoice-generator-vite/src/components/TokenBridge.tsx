import React, { useEffect } from 'react';

const TokenBridge: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[TokenBridge] registering message listener');

    (window as any)._tmrBridgeListener = true;

    const allowedOrigins = [
      'https://themossyroots.com',
      'https://www.themossyroots.com',
      import.meta.env.VITE_TMR_WEB_URL,
      import.meta.env.VITE_PUBLIC_WEB_URL,
      import.meta.env.VITE_PUBLIC_APP_URL,
    ]
      .filter((origin): origin is string => typeof origin === 'string' && !!origin.trim())
      .map((origin) => origin.replace(/\/+$/, ''));

    const localhostOrigins = ['http://localhost:3000', 'http://localhost:4000', 'http://localhost']
      .map((origin) => origin.replace(/\/+$/, ''));
    localhostOrigins.forEach((origin) => {
      if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    });

    if (allowedOrigins.length === 0) {
      allowedOrigins.push(window.location.origin.replace(/\/+$/, ''));
    }

    const handler = (event: MessageEvent) => {
      console.log('[TokenBridge] message received', {
        origin: event.origin,
        data: event.data,
        allowedOrigins,
      });
      if (!event.data || event.data.type !== 'TMR_TOKEN_BRIDGE') return;
      if (allowedOrigins.length && !allowedOrigins.includes(event.origin)) {
        console.warn('[TokenBridge] rejected token: origin mismatch', {
          origin: event.origin,
          allowedOrigins,
        });
        return;
      }

      const incomingToken =
        typeof event.data.token === 'string' ? event.data.token.trim() : '';
      if (!incomingToken) return;

      window.localStorage.setItem('tmr-token', incomingToken);
      window.sessionStorage.setItem('tmr-token', incomingToken);
      console.log('[TokenBridge] token accepted, bridgedToken set');
      console.log('[TokenBridge] authReady set true');
      window.dispatchEvent(new CustomEvent<string>('tmr-token-bridged', { detail: incomingToken }));
    };

    window.addEventListener('message', handler);
    window.parent?.postMessage({ type: 'TMR_TOKEN_BRIDGE_READY' }, '*');
    return () => {
      window.removeEventListener('message', handler);
      (window as any)._tmrBridgeListener = false;
    };
  }, []);

  return null;
};

export default TokenBridge;

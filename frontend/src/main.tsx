import './buffer-polyfill';

if (typeof Buffer !== 'undefined' && Buffer.alloc) {
    console.log('[Main] Buffer is ready, alloc exists');
} else {
    console.error('[Main] Buffer.alloc is not available!');
    if (typeof Buffer !== 'undefined' && !Buffer.alloc) {
        Buffer.alloc = (size: number) => new Uint8Array(size);
        console.log('[Main] Emergency Buffer.alloc added');
    }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import './styles.css';

const manifestUrl = import.meta.env.VITE_TONCONNECT_MANIFEST_URL || '/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
            <App />
        </TonConnectUIProvider>
    </React.StrictMode>
);
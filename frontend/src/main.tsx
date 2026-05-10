import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import './styles.css';

const manifestUrl = import.meta.env.VITE_TONCONNECT_MANIFEST_URL || 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
            <App />
        </TonConnectUIProvider>
    </React.StrictMode>
);
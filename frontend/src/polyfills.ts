import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {

    if (!window.Buffer) {
        window.Buffer = Buffer;
    }

    if (!window.process) {
        window.process = { env: {} } as any;
    }

    if (!(window as any).global) {
        (window as any).global = window;
    }
}

if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer;
}

if (typeof globalThis.process === 'undefined') {
    globalThis.process = { env: {} } as any;
}

if (typeof (window as any).require === 'undefined') {
    (window as any).require = (module: string) => {
        if (module === 'buffer') return { Buffer };
        if (module === 'process') return { env: {} };
        return null;
    };
}

console.log('[Polyfills] Buffer initialized:', typeof window.Buffer);
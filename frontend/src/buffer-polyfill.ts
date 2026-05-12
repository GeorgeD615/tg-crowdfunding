import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
}

if (typeof globalThis !== 'undefined') {
    globalThis.Buffer = Buffer;
}

import process from 'process';
if (typeof window !== 'undefined') {
    window.process = process;
}
if (typeof globalThis !== 'undefined') {
    globalThis.process = process;
}


if (typeof Buffer !== 'undefined' && Buffer.alloc) {
    console.log('[Polyfills] Buffer loaded successfully, alloc exists:', typeof Buffer.alloc);
    const testBuffer = Buffer.alloc(10);
    console.log('[Polyfills] Buffer.alloc test:', testBuffer instanceof Uint8Array);
}

export { Buffer };
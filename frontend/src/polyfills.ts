import { Buffer } from 'buffer';
import process from 'process';

window.Buffer = Buffer;
window.process = process;

// Global is needed for some TON packages
if (typeof global === 'undefined') {
    (window as any).global = window;
}

if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer;
}
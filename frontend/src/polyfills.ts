import { Buffer } from 'buffer';

// Глобальная инициализация
if (typeof window !== 'undefined') {
    // Устанавливаем Buffer
    if (!window.Buffer) {
        window.Buffer = Buffer;
    }
    
    // Устанавливаем process
    if (!window.process) {
        window.process = { env: {} } as any;
    }
    
    // Устанавливаем global
    if (!(window as any).global) {
        (window as any).global = window;
    }
}

// Для глобальной области видимости
if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer;
}

if (typeof globalThis.process === 'undefined') {
    globalThis.process = { env: {} } as any;
}

// Полифилл для require (если нужно)
if (typeof (window as any).require === 'undefined') {
    (window as any).require = (module: string) => {
        if (module === 'buffer') return { Buffer };
        if (module === 'process') return { env: {} };
        return null;
    };
}

console.log('[Polyfills] Buffer initialized:', typeof window.Buffer);
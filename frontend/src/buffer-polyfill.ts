// Импортируем полную версию Buffer из библиотеки buffer
import { Buffer } from 'buffer';

// Делаем Buffer глобальным
if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
}

if (typeof globalThis !== 'undefined') {
    globalThis.Buffer = Buffer;
}

// Также добавляем process
import process from 'process';
if (typeof window !== 'undefined') {
    window.process = process;
}
if (typeof globalThis !== 'undefined') {
    globalThis.process = process;
}

// Проверяем что Buffer работает
if (typeof Buffer !== 'undefined' && Buffer.alloc) {
    console.log('[Polyfills] Buffer loaded successfully, alloc exists:', typeof Buffer.alloc);
    // Тестируем Buffer.alloc
    const testBuffer = Buffer.alloc(10);
    console.log('[Polyfills] Buffer.alloc test:', testBuffer instanceof Uint8Array);
}

export { Buffer };
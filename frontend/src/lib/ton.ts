import { beginCell } from '@ton/core';

export const CROWD_FUNDING_OPS = {
    DONATE: 0x444f4e45,  // DONE
    WITHDRAW: 0x57495448, // WITH
    REFUND: 0x52454655,   // REFU
} as const;

function toBase64(bytes: Uint8Array): string {
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}

export function buildDonatePayload(amount: bigint): string {
    const body = beginCell()
        .storeUint(CROWD_FUNDING_OPS.DONATE, 32)
        .storeUint(amount, 64)
        .endCell();
    
    return toBase64(body.toBoc());
}

export function buildWithdrawPayload(): string {
    const body = beginCell()
        .storeUint(CROWD_FUNDING_OPS.WITHDRAW, 32)
        .endCell();
    
    return toBase64(body.toBoc());
}

export function buildRefundPayload(): string {
    const body = beginCell()
        .storeUint(CROWD_FUNDING_OPS.REFUND, 32)
        .endCell();
    
    return toBase64(body.toBoc());
}
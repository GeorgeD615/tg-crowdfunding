import { beginCell, Cell } from '@ton/core';

export const CROWD_FUNDING_OPS = {
  DONATE: 0x444f4e45,
  WITHDRAW: 0x57495448,
  REFUND: 0x52454655,
} as const;

export function buildDonateBody(amount: bigint): Cell {
  return beginCell()
    .storeUint(CROWD_FUNDING_OPS.DONATE, 32)
    .storeUint(amount, 64)
    .endCell();
}

export function buildWithdrawBody(): Cell {
  return beginCell()
    .storeUint(CROWD_FUNDING_OPS.WITHDRAW, 32)
    .endCell();
}

export function buildRefundBody(): Cell {
  return beginCell()
    .storeUint(CROWD_FUNDING_OPS.REFUND, 32)
    .endCell();
}
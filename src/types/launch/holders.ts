import type { ApiNetwork } from '../../lib/api/launches/types';

export type Holder = { address: string; balance: string; observedAt: string };

export type HoldersResult = {
  network: ApiNetwork;
  contractId: string;
  asset: string;
  amountScale: number;
  balanceSource: 'token_contract' | 'recorded_trades';
  coverage: 'trade_participants' | 'recorded_trades';
  totalHolders: number;
  nextCursor: string | null;
  items: Holder[];
};

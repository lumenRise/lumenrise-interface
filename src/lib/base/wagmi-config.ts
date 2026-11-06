import { http } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';

import { getBaseChain } from './get-base-chain';
import type { BaseNetwork } from '../networks/types';

const createBaseWagmiConfig = (network: BaseNetwork): ReturnType<typeof createConfig> => {
  const chain = getBaseChain(network);

  return createConfig({
    chains: [chain],
    transports: { [chain.id]: http(chain.rpcUrls.default.http[0]) },
  });
};

export { createBaseWagmiConfig };

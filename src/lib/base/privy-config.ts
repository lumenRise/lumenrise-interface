import type { PrivyClientConfig } from '@privy-io/react-auth';

import { getBaseChain } from './get-base-chain';
import type { BaseNetwork } from '../networks/types';

const createPrivyConfig = (
  network: BaseNetwork,
  dark: boolean,
): PrivyClientConfig => {
  const chain = getBaseChain(network);

  return {
    defaultChain: chain,
    supportedChains: [chain],
    loginMethods: ['wallet'],
    embeddedWallets: { ethereum: { createOnLogin: 'off' } },
    appearance: {
      theme: dark ? 'dark' : 'light',
      accentColor: '#cbff18',
      logo: dark
        ? '/branding/lumenrise-logo-horizontal-for-dark-background.svg'
        : '/branding/lumenrise-logo-horizontal-for-light-background.svg',
      walletChainType: 'ethereum-only',
    },
  };
};

export { createPrivyConfig };

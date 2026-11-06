import type { Chain } from 'viem';
import { base, baseSepolia } from 'viem/chains';

import { getConfiguration } from '../api/config';
import type { BaseNetwork } from '../networks/types';

const getBaseChain = (network: BaseNetwork): Chain => {
  const configuration = getConfiguration();

  if (!('chain' in configuration) || configuration.chain !== 'base') {
    throw new Error('Base configuration is required.');
  }

  const entry = configuration.network.configurations[network.apiNetwork];

  if (
    !entry ||
    entry.chainId !== network.chainId ||
    entry.network !== network.apiNetwork ||
    !('rpcUrl' in entry) ||
    typeof entry.rpcUrl !== 'string' ||
    !entry.rpcUrl.trim()
  ) {
    throw new Error('Base RPC is not configured for ' + network.apiNetwork + '.');
  }

  const url = new URL(entry.rpcUrl);

  if (
    (url.protocol !== 'https:' &&
      !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new Error('Invalid Base RPC configuration.');
  }

  const chain = network.chainId === base.id ? base : baseSepolia;

  return {
    ...chain,
    rpcUrls: { default: { http: [entry.rpcUrl] } },
  };
};

export { getBaseChain };

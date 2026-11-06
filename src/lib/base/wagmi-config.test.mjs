import ts from 'typescript';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';

import { loadBaseChain } from './get-base-chain.fixture.mjs';
import { loadNetworkRegistry } from '../networks/registry.fixture.mjs';

const module = { exports: {} };
const code = ts.transpileModule(readFileSync(new URL('./wagmi-config.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const getBaseChain = loadBaseChain({
  chain: 'base',
  network: { configurations: {
    public: { network: 'public', chainId: 8453, rpcUrl: 'https://rpc.example/base-mainnet' },
    testnet: { network: 'testnet', chainId: 84532, rpcUrl: 'https://rpc.example/base-sepolia' },
  } },
});
const mocks = {
  '@privy-io/wagmi': { createConfig: config => config },
  './get-base-chain': { getBaseChain },
  wagmi: { http: url => ({ type: 'http', url }) },
};
runInNewContext(code, { module, exports: module.exports, require: name => {
  assert.ok(name in mocks, name);
  return mocks[name];
} });
const { resolveNetwork } = loadNetworkRegistry();

for (const id of ['base-mainnet', 'base-sepolia']) test(`wagmi config isolates the selected Base environment: ${id}`, () => {
  const network = resolveNetwork(id);
  const config = module.exports.createBaseWagmiConfig(network);
  assert.deepEqual(Array.from(config.chains, chain => chain.id), [network.chainId]);
  assert.deepEqual(Object.keys(config.transports), [String(network.chainId)]);
  assert.equal(config.transports[network.chainId].type, 'http');
  const expectedUrl = network.apiNetwork === 'public' ? 'https://rpc.example/base-mainnet' : 'https://rpc.example/base-sepolia';

  assert.equal(config.transports[network.chainId].url, expectedUrl);

  assert.deepEqual(Array.from(config.chains[0].rpcUrls.default.http), [expectedUrl]);

  assert.equal('connectors' in config, false);
});

import ts from 'typescript';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';

import { loadBaseChain } from './get-base-chain.fixture.mjs';
import { loadNetworkRegistry } from '../networks/registry.fixture.mjs';

const module = { exports: {} };
const code = ts.transpileModule(readFileSync(new URL('./privy-config.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const getBaseChain = loadBaseChain({
  chain: 'base',
  network: { configurations: {
    public: { network: 'public', chainId: 8453, rpcUrl: 'https://rpc.example/base-mainnet' },
    testnet: { network: 'testnet', chainId: 84532, rpcUrl: 'https://rpc.example/base-sepolia' },
  } },
});
runInNewContext(code, { module, exports: module.exports, require: name => {
  assert.equal(name, './get-base-chain');
  return { getBaseChain };
} });
const { resolveNetwork } = loadNetworkRegistry();

for (const id of ['base-mainnet', 'base-sepolia']) test(`Privy follows the globally selected environment: ${id}`, () => {
  const network = resolveNetwork(id);
  const config = module.exports.createPrivyConfig(network, false);
  const expectedUrl = network.apiNetwork === 'public' ? 'https://rpc.example/base-mainnet' : 'https://rpc.example/base-sepolia';

  assert.deepEqual(Array.from(config.defaultChain.rpcUrls.default.http), [expectedUrl]);

  assert.deepEqual(Array.from(config.supportedChains[0].rpcUrls.default.http), [expectedUrl]);

  assert.equal(config.defaultChain.id, network.chainId);
  assert.deepEqual(Array.from(config.supportedChains, chain => chain.id), [network.chainId]);
  assert.deepEqual(Array.from(config.loginMethods), ['wallet']);
  assert.equal(config.embeddedWallets.ethereum.createOnLogin, 'off');
  assert.equal(config.appearance.walletChainType, 'ethereum-only');
  assert.equal(config.appearance.theme, 'light');
  assert.match(config.appearance.logo, /light-background/);
  assert.ok(!JSON.stringify(config).includes('secret'));
});

test('Privy appearance follows the app theme without changing the selected network', () => {
  const network = resolveNetwork('base-sepolia');
  const config = module.exports.createPrivyConfig(network, true);
  assert.equal(config.defaultChain.id, 84532);
  assert.equal(config.appearance.theme, 'dark');
  assert.match(config.appearance.logo, /dark-background/);
  assert.equal(config.appearance.accentColor, '#cbff18');
});

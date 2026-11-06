import test from 'node:test';
import assert from 'node:assert/strict';

import { loadBaseChain } from './get-base-chain.fixture.mjs';

for (const [apiNetwork, chainId] of [['public', 8453], ['testnet', 84532]]) {
  test(`Base ${apiNetwork} uses only the API RPC, including before launch deployment`, () => {
    const entry = { network: apiNetwork, chainId, rpcUrl: `https://rpc.example/${apiNetwork}`, launchConfigured: false };
    const configuration = { chain: 'base', network: { configurations: { [apiNetwork]: entry } } };
    const getBaseChain = loadBaseChain(configuration);
    const network = { apiNetwork, chainId };
    const chain = getBaseChain(network);

    assert.equal(chain.id, chainId);

    assert.deepEqual(Array.from(chain.rpcUrls.default.http), [entry.rpcUrl]);

    entry.rpcUrl = `https://other-rpc.example/${apiNetwork}`;

    assert.deepEqual(Array.from(getBaseChain(network).rpcUrls.default.http), [entry.rpcUrl]);

    for (const rpcUrl of [undefined, '', 'ftp://rpc.example', 'https://user:password@rpc.example', 'https://rpc.example/#fragment', 'invalid']) {
      entry.rpcUrl = rpcUrl;

      assert.throws(() => getBaseChain(network));
    }

    entry.rpcUrl = 'https://rpc.example';
    entry.chainId = 1;

    assert.throws(() => getBaseChain(network), /not configured/);

    assert.throws(() => loadBaseChain({ network: configuration.network })(network), /Base configuration/);
  });
}

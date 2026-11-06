import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const loadBaseChain = (configuration) => {
  const module = { exports: {} };

  const code = ts.transpileModule(readFileSync(new URL('./get-base-chain.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;

  const mocks = {
    'viem/chains': {
      base: { id: 8453, rpcUrls: { default: { http: ['https://mainnet.base.org'] } } },
      baseSepolia: { id: 84532, rpcUrls: { default: { http: ['https://sepolia.base.org'] } } },
    },
    '../api/config': { getConfiguration: () => configuration },
  };

  runInNewContext(code, {
    module,
    exports: module.exports,
    URL,
    require: (name) => {
      assert.ok(name in mocks, name);

      return mocks[name];
    },
  });

  return module.exports.getBaseChain;
};

export { loadBaseChain };

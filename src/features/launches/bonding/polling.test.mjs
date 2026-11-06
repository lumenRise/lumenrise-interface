import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

function harness(options = {}) {
  const state = { visible: true, ...options };
  const requests = [], refreshes = [];
  const configuration = { params: { asset: 'asset', pair: 'pair' }, version: 1 };
  const config = { values: [configuration] }, live = { values: ['state', 'Open', 10n, 1n, 0n, 'preview'] };
  const metadata = { values: ['asset-name', 'TOK', 7n, 'pair-name', 'USDC', 7n] };
  const vault = { values: [20n, 30n] };
  const tokens = { assetDecimals: 7n, pairDecimals: 7n };
  const mocks = {
    react: { useState: initial => [initial, () => {}], useRef: initial => ({ current: initial }), useEffect() {} },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    '@bluxcc/react': {
      useBlux: () => ({ isReady: true }), useAccount: () => ({}),
      useReadContracts: (calls, network, query) => {
        requests.push({ calls, network, query });
        const kind = calls[0].fn === 'get_config' ? 'config' : calls[0].fn === 'get_state' ? 'live' : calls[0].fn === 'name' ? 'metadata' : 'vault';
        const data = { config, live, metadata, vault }[kind];
        return { data, refetch: async () => {
          refreshes.push(kind);
          return { data: kind === 'config' && state.changed ? { values: [{ ...configuration, version: 2 }] } : data, isError: state.failed === kind };
        } };
      },
    },
    '@tanstack/react-query': { useQueryClient: () => ({}) },
    '@stellar/stellar-sdk': { StrKey: { isValidEd25519PublicKey: () => false } },
    '@/components/ui/toast': { useNotify: () => () => {} },
    '@/lib/launchpad': { useLaunchpad: () => ({}) },
    '@/lib/stellar/network': { API_NETWORK: 'testnet', NETWORK: 'network-passphrase' },
    '@/lib/api/client': { getApiChain: () => 'stellar' },
    '@/features/launches/hooks/queries': { usePageVisible: () => state.visible, useLaunchDetail: () => ({ data: { contractId: 'launch', metadata: {} } }) },
    '@/features/launches/hooks/use-trade-queue': { useTradeQueue() {} },
    './use-wallet-balances': { useWalletBalances: () => ({ balances: {} }) },
    './trade-form': { TradeForm: 'TradeForm' },
    './contract': {
      decodeSnapshot: values => {
        assert.equal(values.length, 7);
        assert.equal(values[1], 'state');
        assert.equal(values[2], 'Open');
        return { config: values[0], state: {}, status: values[2] };
      },
      decodeTokens: values => {
        assert.deepEqual(Array.from(values), [...metadata.values, ...vault.values]);
        return tokens;
      },
      errorMessage: error => error.message,
    },
  };
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL('./bonding-curve-page.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  runInNewContext(code, { module, exports: module.exports, require: name => mocks[name] ?? {} });
  const root = module.exports.BondingCurvePage({ slug: 'token' });
  const page = root.type(root.props);
  return { state, requests, refreshes, page, revalidate: page.props.buy(null, true, () => {}).props.revalidate };
}

test('Stellar caches configuration and metadata while polling changing state and vault balances', async () => {
  const h = harness();
  assert.equal(h.requests.length, 4);
  for (const request of h.requests) {
    assert.equal(request.query.enabled, true);
    if (['get_config', 'name'].includes(request.calls[0].fn)) {
      assert.equal(request.query.staleTime, Infinity);
      assert.equal(request.query.refetchInterval({ state: { status: 'success' } }), false);
      assert.equal(request.query.refetchInterval({ state: { status: 'error' } }), 30_000);
    } else assert.equal(request.query.refetchInterval, 3000);
  }
  await h.revalidate();
  assert.deepEqual(h.refreshes.sort(), ['config', 'live', 'metadata', 'vault']);
});
test('hidden Stellar pages disable all automatic contract reads', () => {
  assert.ok(harness({ visible: false }).requests.every(request => request.query.enabled === false));
});
for (const patch of [{ changed: true }, { failed: 'config' }, { failed: 'metadata' }]) test(`Stellar refuses stale identity before signing: ${JSON.stringify(patch)}`, async () => {
  await assert.rejects(harness(patch).revalidate());
});

for (const selected of ['trades', 'pools']) test(`pool section mounts only while selected: ${selected}`, () => {
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    react: { useState: () => [selected, () => {}], useId: () => 'activity', useEffect() {} },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'motion/react': { motion: { div: 'motion' } },
    '@/hooks/use-reduced-motion': { useReducedMotionPreference: () => true },
    '@/lib/utils': { cn: () => '' },
    '@/components/ui/tabs': { Tabs: 'Tabs', TabsList: 'TabsList', TabsTrigger: 'TabsTrigger', TabsContent: 'TabsContent' },
  };
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL('../trading/trade-activity.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  runInNewContext(code, { module, exports: module.exports, require: name => mocks[name] ?? {} });
  const tree = module.exports.TradeActivity({ trades: 'TRADES', holders: 'HOLDERS', pools: 'POOL' });
  const sections = tree.props.children[1].props.children[1];
  const pool = sections.find(section => section.props.value === 'pools');
  assert.equal(pool.props.children.props.children, selected === 'pools' ? 'POOL' : null);
});

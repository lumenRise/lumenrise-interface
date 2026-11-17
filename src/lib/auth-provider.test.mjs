import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const directory = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function loadSource(filename, globals = {}) {
  const path = resolve(directory, filename);
  const module = { exports: {} };
  const output = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  runInNewContext(output, {
    module, exports: module.exports, AbortSignal, Error, JSON,
    require: (name) => name.startsWith('.') ? loadSource(resolve(dirname(path), `${name}.ts`), globals) : require(name),
    ...globals,
  }, { filename: path });
  return module.exports;
}

const publicUserId = 'ekfvknkfkwsmaka322aa';

test('uses the public ID from the authenticated user endpoint', async () => {
  const signal = new AbortController().signal;

  const provider = loadSource('auth-provider.ts', {
    fetch: async (url, options) => {
      assert.equal(url, 'https://api.blux.cc/users');
      assert.equal(options.headers.Authorization, 'Bearer session-token');
      assert.equal(options.redirect, 'error');
      assert.equal(options.cache, 'no-store');

      return Response.json({ result: { id: publicUserId, user_id: 787 } });
    },
  });

  assert.equal(await provider.getAuthProviderUserId('session-token', signal), publicUserId);
});

test('does not fall back to an internal ID or accept an expired session', async () => {
  for (const response of [
    Response.json({ result: { id: 787 } }),
    Response.json({ result: { id: '787' } }),
    Response.json({ result: { user_id: publicUserId } }),
    Response.json({ error: 'Expired session' }, { status: 401 }),
  ]) {
    const provider = loadSource('auth-provider.ts', { fetch: async () => response });

    assert.equal(
      await provider.getAuthProviderUserId('session-token', new AbortController().signal),
      null,
    );
  }
});

test('does not treat an upstream outage as an unregistered account', async () => {
  const provider = loadSource('auth-provider.ts', {
    fetch: async () => new Response(null, { status: 503 }),
  });

  await assert.rejects(
    provider.getAuthProviderUserId('session-token', new AbortController().signal),
    /temporarily unavailable/,
  );
});

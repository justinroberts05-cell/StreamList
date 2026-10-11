import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

test('production worker precaches real files and serves routes/assets offline', async () => {
  const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
  assert.equal(manifest.display, 'standalone');
  for (const size of [192, 512]) {
    const icon = manifest.icons.find((icon) => icon.sizes === `${size}x${size}`);
    const png = await readFile(`dist${icon.src}`);
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
  const listeners = {};
  const records = new Map();
  let network = true;
  const cache = {
    async addAll(urls) {
      for (const url of urls) {
        const response = await fetch(url);
        assert.equal(response.status, 200, url);
        const local = await readFile(`dist${new URL(url).pathname}`);
        const actual = Buffer.from(await response.arrayBuffer());
        assert.deepEqual(actual, local, url);
        records.set(url, new Response(actual));
      }
    },
    async match(request) { return records.get(typeof request === 'string' ? request : request.url)?.clone(); },
  };
  const caches = { open: async () => cache, keys: async () => ['unrelated-cache'], delete: async () => { throw Error('Must preserve unrelated cache'); }, match: cache.match };
  let claimed = false;
  const self = { location: { href: 'http://127.0.0.1:4173/sw.js' }, clients: { claim: async () => { claimed = true; } }, addEventListener: (name, listener) => { listeners[name] = listener; } };
  runInNewContext(await readFile('dist/sw.js', 'utf8'), { self, caches, URL, fetch: (request) => { assert.ok(network, 'offline response unexpectedly used network'); return fetch(request); } });
  let pending;
  listeners.install({ waitUntil: (promise) => { pending = promise; } });
  await pending;
  listeners.activate({ waitUntil: (promise) => { pending = promise; } });
  await pending;
  assert.ok(claimed);
  network = false;
  async function respond(path, mode) {
    let promise;
    listeners.fetch({ request: { url: `http://127.0.0.1:4173${path}`, method: 'GET', mode }, respondWith: (value) => { promise = value; } });
    return await promise;
  }
  for (const path of ['/', '/movies', '/subscriptions', '/cart', '/about']) {
    assert.equal(await (await respond(path, 'navigate')).text(), await readFile('dist/index.html', 'utf8'));
  }
  for (const url of records.keys()) assert.ok(await respond(new URL(url).pathname, 'cors'), url);
  let intercepted = false;
  listeners.fetch({ request: { url: 'https://api.themoviedb.org/3/search/movie', method: 'GET', mode: 'cors' }, respondWith: () => { intercepted = true; } });
  assert.equal(intercepted, false);
});

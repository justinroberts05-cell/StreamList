import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Generate the worker after Vite has copied public files and written hashed assets.
export function streamListPwa() {
  let config;
  return {
    name: 'streamlist-pwa',
    apply: 'build',
    configResolved(value) { config = value; },
    async closeBundle() {
      const output = resolve(config.root, config.build.outDir);
      async function files(directory, prefix = '') {
        const entries = await readdir(directory, { withFileTypes: true });
        const result = [];
        for (const entry of entries) {
          const name = `${prefix}${entry.name}`;
          if (entry.isDirectory()) result.push(...await files(resolve(directory, entry.name), `${name}/`));
          else if (name !== 'sw.js') result.push(name);
        }
        return result.sort();
      }
      const assets = await files(output);
      const hash = createHash('sha256');
      for (const asset of assets) hash.update(await readFile(resolve(output, asset)));
      const template = await readFile(resolve(config.root, 'service-worker.template.js'), 'utf8');
      hash.update(template);
      await writeFile(resolve(output, 'sw.js'), template
        .replace('__CACHE_VERSION__', hash.digest('hex').slice(0, 16))
        .replaceAll('__PRECACHE_URLS__', JSON.stringify(assets)));
    },
  };
}

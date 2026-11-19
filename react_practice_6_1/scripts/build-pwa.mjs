import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

// Run AFTER Vite: filenames now include their actual content hashes.
const dist = resolve('dist');
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const path = resolve(directory, entry.name);
        return entry.isDirectory() ? filesIn(path) : path;
      }),
    )
  ).flat();
}
const files = (await filesIn(dist))
  .filter((file) => {
    const path = relative(dist, file).split(sep).join('/');
    return !path.startsWith('data/') && path !== 'sw.js';
  })
  .sort();
const source = await readFile('pwa/sw.js', 'utf8');
const hash = createHash('sha256').update(source);
for (const file of files)
  hash.update(relative(dist, file)).update(await readFile(file));
const version = hash.digest('hex').slice(0, 12);
const urls = files.map(
  (file) => '/' + relative(dist, file).split(sep).join('/'),
);
await writeFile(
  resolve(dist, 'sw.js'),
  source
    .replace('__BUILD_VERSION__', JSON.stringify(version))
    .replace('__PRECACHE_URLS__', JSON.stringify(urls)),
);
console.log(
  `PWA ${version}: precached ${urls.length} files (including lazy route chunks).`,
);

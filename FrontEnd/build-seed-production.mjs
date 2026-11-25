import { readFile, writeFile } from 'node:fs/promises';

const inputUrl = new URL('./seed-data.js', import.meta.url);
const outputUrl = new URL('./seed-data.production.js', import.meta.url);

const raw = await readFile(inputUrl, 'utf8');
const source = raw.trim();
const prefix = 'window.SEED = ';

if (!source.startsWith(prefix) || !source.endsWith(';')) {
  throw new Error('Unexpected seed-data.js format.');
}

const jsonText = source.slice(prefix.length, -1).trim();
const seed = JSON.parse(jsonText);

if (!Array.isArray(seed.people)) {
  throw new Error('SEED.people is missing or invalid.');
}

for (const key of ['navyLogo', 'whiteLogo']) {
  if (typeof seed[key] !== 'string' || !seed[key].startsWith('data:image/')) {
    throw new Error(`Invalid or missing ${key}.`);
  }
}

const productionSeed = {
  people: [],
  navyLogo: seed.navyLogo,
  whiteLogo: seed.whiteLogo,
};

await writeFile(
  outputUrl,
  `window.SEED = ${JSON.stringify(productionSeed)};\n`,
  { encoding: 'utf8', mode: 0o644 }
);

console.log('PRODUCTION_SEED_BUILD_OK');
console.log('People:', productionSeed.people.length);
console.log('Navy logo: retained');
console.log('White logo: retained');

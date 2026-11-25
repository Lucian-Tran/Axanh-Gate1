import { readFile, writeFile, rename } from 'node:fs/promises';

const file = new URL('./prepare-demo-cleanup.mjs', import.meta.url);
const temp = new URL('./prepare-demo-cleanup.mjs.fixed', import.meta.url);

let code = await readFile(file, 'utf8');

function replaceOnce(oldText, newText, label) {
  const first = code.indexOf(oldText);

  if (first < 0 || code.indexOf(oldText, first + 1) >= 0) {
    throw new Error(`FIX_FAILED: ${label}`);
  }

  code = code.slice(0, first) + newText +
    code.slice(first + oldText.length);

  console.log(`FIX_OK: ${label}`);
}

// Fix 1: Match actual HTML indentation.
replaceOnce(
  String.raw`\+ '<div class="field">'`,
  String.raw`\+ '  <div class="field">'`,
  'HTML field indentation'
);

// Fix 2: After removing local fallback, only one assignment remains.
replaceOnce(
  "  2,\n  'Remove local API URL assignments'",
  "  1,\n  'Remove local API URL assignments'",
  'API URL assignment count'
);

await writeFile(temp, code, {
  encoding: 'utf8',
  flag: 'wx',
});

await rename(temp, file);

console.log('CLEANUP_SCRIPT_FIXED');

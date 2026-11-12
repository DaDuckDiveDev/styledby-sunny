// Launch check. Run: npm run preflight
// Fails while anything a real client would see is still a placeholder, or the form sends nowhere.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');
const blockers = [];

for (const file of ['index.html', 'book.html']) {
  const html = read(file);
  const tokens = {};
  for (const m of html.matchAll(/\[[A-Z][A-Z ]+\]/g)) tokens[m[0]] = (tokens[m[0]] || 0) + 1;
  for (const [token, n] of Object.entries(tokens)) blockers.push(`${file}: ${token} still a placeholder (${n}x)`);
  const photos = (html.match(/data-placeholder/g) || []).length;
  if (photos) blockers.push(`${file}: ${photos} photo slot(s) without a real photo`);
}

const endpoint = /FORM_ENDPOINT\s*=\s*'([^']*)'/.exec(read('book.js'));
if (!endpoint || !endpoint[1]) blockers.push('book.js: FORM_ENDPOINT is empty, so booking requests are not sent anywhere');
else if (!/^https:\/\//.test(endpoint[1])) blockers.push('book.js: FORM_ENDPOINT must be an https:// URL');

if (blockers.length) {
  console.log(`Not ready to launch. ${blockers.length} item(s) left:\n`);
  for (const b of blockers) console.log('  - ' + b);
  process.exit(1);
}
console.log('Ready to launch: no placeholders left and the booking form has an endpoint.');

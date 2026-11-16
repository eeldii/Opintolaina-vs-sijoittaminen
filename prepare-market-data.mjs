import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const raw = await readFile(new URL('sp500-source.csv', import.meta.url), 'utf8');
const rows = raw.trim().split(/\r?\n/).slice(1).map(line => {
  const [date, price] = line.split(',');
  if (!/^\d{4}-\d{2}-01$/.test(date) || !(Number(price) > 0)) throw new Error('Invalid market row');
  return [date.slice(0, 7), Number(price)];
});
for (let i = 1; i < rows.length; i++) {
  const [year, month] = rows[i - 1][0].split('-').map(Number);
  const expected = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7);
  if (rows[i][0] !== expected) throw new Error(`Missing or repeated month ${expected}`);
}
const dataset = {
  name: 'S&P 500 / S&P Composite, kuukausittainen hintaindeksi',
  source: 'https://datahub.io/core/s-and-p-500',
  originalSource: 'https://www.econ.yale.edu/~shiller/data.htm',
  extensionSource: 'https://fred.stlouisfed.org/series/SP500',
  downloaded: '2026-11-15', currency: 'USD', dividendsIncluded: false,
  sha256: createHash('sha256').update(raw).digest('hex'), rows,
};
await writeFile(new URL('sp500-data.mjs', import.meta.url), `// Static source snapshot; refresh only by explicitly downloading the CSV and running prepare-market-data.mjs.\nexport const SP500_DATA = ${JSON.stringify(dataset)};\n`);
console.log(`${rows.length} consecutive monthly observations: ${rows[0][0]} – ${rows.at(-1)[0]}`);

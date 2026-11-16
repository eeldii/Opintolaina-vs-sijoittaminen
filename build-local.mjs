// One offline entry file, generated from the tested engine; no separate browser engine.
import { readFile, writeFile } from 'node:fs/promises';
const read = name => readFile(new URL(name, import.meta.url), 'utf8');
export async function buildPage() {
  const [template, css, engine, app, market, history, formatter] = await Promise.all([
    read('index.template.html'), read('styles.css'), read('simulation.mjs'), read('app.js'), read('sp500-data.mjs'), read('historical.mjs'), read('input-format.mjs'),
  ]);
  const js = `(() => {\n'use strict';\n${market.replace(/^export /gm, '')}\n${engine.replace(/^export /gm, '')}\n${history.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')}\n${formatter.replace(/^export /gm, '')}\n${app}\n})();`;
  if (/<\/script/i.test(js) || /<\/style/i.test(css)) throw new Error('Unsafe inline closing tag.');
  return template.replace('/* BUILD:CSS */', () => css).replace('/* BUILD:JS */', () => js);
}
if (process.argv[1] && new URL(`file:///${process.argv[1].replaceAll('\\', '/')}`).pathname.endsWith('/build-local.mjs')) {
  await writeFile(new URL('index.html', import.meta.url), await buildPage(), 'utf8');
  console.log('Built offline index.html from the shared simulation engine.');
}

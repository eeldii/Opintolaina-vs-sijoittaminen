// Local verification only. Production index.html needs no server.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
const allowed = new Map([['/', 'index.html'], ['/index.html', 'index.html'], ['/SPEC.md', 'SPEC.md']]);
const server = http.createServer(async (req, res) => {
  const name = allowed.get(new URL(req.url, 'http://localhost').pathname);
  if (!name) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const data = await readFile(new URL(name, import.meta.url));
    res.writeHead(200, { 'Content-Type': name.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch { res.writeHead(500); res.end('Unable to read file'); }
});
server.listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));

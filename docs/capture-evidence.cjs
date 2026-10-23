// Capture real command output, then screenshot the verbatim transcripts.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('C:/Users/cluiz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const dir = path.join(__dirname, 'test-evidence');
fs.mkdirSync(dir, { recursive: true });
const checks = [
  ['backend-build', 'Backend TypeScript build', 'npm.cmd run build --prefix backend'],
  ['backend-tests', 'Backend pipeline and generated program tests', 'npm.cmd test --prefix backend -- --runInBand --verbose'],
  ['frontend-tests', 'Frontend API error handling tests', 'npm.cmd test --prefix frontend -- --run --reporter=verbose'],
  ['frontend-build', 'Frontend production build', 'npm.cmd run build --prefix frontend'],
];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
  const results = [];
  for (const [id, title, command] of checks) {
    const run = spawnSync('cmd.exe', ['/d', '/s', '/c', command], { cwd: root, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1', PYTHON: 'C:/Users/cluiz/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' }, timeout: 180000 });
    const output = ((run.stdout || '') + (run.stderr || '') + (run.error ? '\n' + run.error.message : '')).replace(/\x1b\[[0-9;]*m/g, '');
    const text = `$ ${command}\nExit code: ${run.status}\n\n${output}`;
    fs.writeFileSync(path.join(dir, id + '.log'), text);
    const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:32px;background:#101827;color:#edf2fa;font:18px Consolas,monospace}h1{font:26px Arial}pre{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.45}</style><h1>${title}</h1><p>Captured command transcript • ${new Date().toISOString()}</p><pre>${escape(text)}</pre>`;
    fs.writeFileSync(path.join(dir, id + '.html'), html);
    await page.setContent(html);
    await page.screenshot({ path: path.join(dir, id + '.png'), fullPage: true });
    results.push({ id, title, command, exitCode: run.status });
    console.log(id, run.status);
  }
  fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify(results, null, 2));
  await browser.close();
  if (results.some(r => r.exitCode !== 0)) process.exitCode = 1;
})();

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const { spawn } = require('child_process');
const { chromium } = require('C:/Users/cluiz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const dir = path.join(__dirname, 'test-evidence');
const backend = spawn(process.execPath, ['backend/dist/index.js'], { cwd: root, env: { ...process.env, PORT: '3303' }, stdio: ['ignore', 'pipe', 'pipe'] });
const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) {
    let body = ''; for await (const chunk of req) body += chunk;
    const result = await fetch('http://127.0.0.1:3303' + req.url, { method: req.method, headers: { 'Content-Type': 'application/json' }, body });
    res.writeHead(result.status, { 'Content-Type': 'application/json' }); res.end(await result.text()); return;
  }
  const name = req.url === '/' ? 'index.html' : req.url.split('?')[0].slice(1);
  const file = path.resolve(root, 'frontend/dist', name);
  if (!file.startsWith(path.join(root, 'frontend/dist') + path.sep)) { res.writeHead(403); res.end(); return; }
  res.setHeader('Content-Type', name.endsWith('.js') ? 'application/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html');
  fs.createReadStream(file).on('error', () => { res.statusCode = 404; res.end(); }).pipe(res);
});
(async () => {
  let browser;
  const lines = [];
  const entries = [];
  try {
    await new Promise((resolve, reject) => { backend.stdout.once('data', resolve); backend.once('error', reject); setTimeout(() => reject(new Error('Backend startup timeout')), 15000).unref(); });
    await new Promise(resolve => server.listen(5303, '127.0.0.1', resolve));
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:5303');
    await page.locator('.react-flow__node').first().waitFor();
    assert.equal(await page.locator('.react-flow__node').count(), 6);
    await page.getByRole('button', { name: /Convert/ }).click();
    await page.locator('pre').waitFor();
    const capture = async (id, title) => {
      await page.screenshot({ path: path.join(dir, id + '.png'), fullPage: true });
      entries.push({ id, title, command: 'Automated Chromium browser smoke check', exitCode: 0 });
      lines.push('PASS ' + title);
    };
    assert.match(await page.locator('pre').innerText(), /END IF\nEND/);
    await capture('ui-pseudocode', 'Starter flowchart and matching pseudocode');
    await page.getByRole('button', { name: 'Python', exact: true }).click();
    assert.match(await page.locator('pre').innerText(), /float\(input/);
    await capture('ui-python', 'Python tab displays numeric input and both branches');
    await page.getByRole('button', { name: 'JavaScript', exact: true }).click();
    assert.match(await page.locator('pre').innerText(), /Number\(prompt/);
    await page.getByRole('button', { name: 'Copy', exact: true }).click();
    await page.getByRole('button', { name: /Copied/ }).waitFor();
    assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n'), await page.locator('pre').innerText());
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download/ }).click();
    const download = await downloadEvent;
    assert.equal(download.suggestedFilename(), 'output.js');
    await capture('ui-javascript', 'JavaScript tab copy and file download');
    page.once('dialog', dialog => dialog.accept('"Changed"'));
    await page.locator('.react-flow__node').filter({ hasText: '"Even"' }).dblclick();
    await page.getByRole('button', { name: /Convert/ }).click();
    await page.waitForFunction(() => document.querySelector('pre')?.textContent.includes('Changed'));
    await capture('ui-edit', 'Edited output label is reflected in regenerated code');
    await page.locator('.react-flow__node').filter({ hasText: /^Start$/ }).click();
    await page.keyboard.press('Delete');
    await page.getByRole('button', { name: /Convert/ }).click();
    await page.getByText('Missing START node.', { exact: true }).waitFor();
    await capture('ui-validation', 'Deleting Start produces an actionable validation message');
    assert.deepEqual(errors, []);
    lines.push('PASS no browser page errors');
    fs.writeFileSync(path.join(dir, 'browser-results.json'), JSON.stringify(entries, null, 2));
  } catch (e) { lines.push('FAIL ' + e.stack); process.exitCode = 1; }
  finally {
    fs.writeFileSync(path.join(dir, 'browser-smoke.log'), lines.join('\n'));
    console.log(lines.join('\n'));
    if (browser) await browser.close();
    server.close(); backend.kill();
  }
})();

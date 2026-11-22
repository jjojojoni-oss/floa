/*
 * Merender sprite lukisan ke PNG transparan (lalu art/webp.py mengubahnya jadi WebP).
 *   node art/render.js [filter-nama]
 * Butuh Playwright + Chromium. Ini alat bantu desain; situsnya sendiri tidak membutuhkannya.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const only = process.argv[2];
  const dir = __dirname;
  const outDir = path.join(dir, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const engine = fs.readFileSync(path.join(dir, 'engine.js'), 'utf8');
  const files = fs.readdirSync(path.join(dir, 'sprites')).filter((f) => f.endsWith('.js')).sort();
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1400, height: 1800 } });
  page.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await page.setContent('<!doctype html><html><body style="margin:0;background:transparent"><div id="root"></div></body></html>');
  await page.addScriptTag({ content: engine });
  for (const f of files) await page.addScriptTag({ content: fs.readFileSync(path.join(dir, 'sprites', f), 'utf8') });
  const names = await page.evaluate(() => Object.keys(window.FLOA.sprites));
  for (const name of names) {
    if (only && !name.includes(only)) continue;
    const size = await page.evaluate((n) => {
      const F = window.FLOA;
      const s = F.sprites[n];
      const root = document.getElementById('root');
      root.innerHTML = '';
      const svg = F.el('svg', { xmlns: F.NS, width: s.w, height: s.h, viewBox: s.viewBox || `0 0 ${s.w} ${s.h}`, id: 'art' }, root);
      svg.style.display = 'block';
      F.defs(svg, s.seed || 1);
      s.draw(svg, F.rng(s.seed || 1));
      return { w: s.w, h: s.h, scale: s.scale || 2 };
    }, name);
    await page.setViewportSize({ width: Math.max(200, Math.ceil(size.w)), height: Math.max(200, Math.ceil(size.h)) });
    const el = await page.$('#art');
    await el.screenshot({ path: path.join(outDir, `${name}.png`), omitBackground: true });
    console.log('rendered', name, `${size.w}x${size.h}`);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

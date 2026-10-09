import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import articles from '../lib/social-articles.json';

for (const route of ['/', '/about/', '/books/', '/projects/', ...Object.keys(articles).map(slug => `/blog/${slug}/`)]) {
  test(`${route} exposes its preview without JavaScript and serves image bytes`, async ({ browser, request }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(route);
    await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    const url = await page.locator('head meta[property="og:image"]').getAttribute('content');
    expect(url).toMatch(/^https:\/\/www\.yella\.dev\/social\/.+\.(png|jpg)$/);
    const image = await request.get(new URL(url!).pathname);
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toMatch(/^image\/(png|jpeg)/);
    const bytes = await image.body();
    expect(bytes.length).toBeGreaterThan(1000);
    expect(bytes.subarray(0, 3).toString('hex')).toBe(url!.endsWith('.png') ? '89504e' : 'ffd8ff');
    await context.close();
  });
}


test('all card titles and subtitles fit the artwork text area', async ({ page }) => {
  const fonts = [400, 700].map(weight => ({ weight, data: readFileSync(`assets/social-fonts/merriweather-latin-${weight}-normal.woff`).toString('base64') }));
  await page.goto('about:blank');
  await page.evaluate(async (fonts) => {
    for (const { weight, data } of fonts) {
      const font = await new FontFace('Merriweather', `url(data:font/woff;base64,${data})`, { weight: String(weight) }).load();
      document.fonts.add(font);
    }
  }, fonts);
  for (const [slug, card] of Object.entries(articles)) {
    const bounds = await page.evaluate((card) => {
      const container = document.createElement('div');
      container.style.cssText = 'position:absolute;left:64px;top:144px;font-family:Merriweather;width:642px';
      const title = document.createElement('div');
      title.style.cssText = `font-size:${card.titleSize}px;font-weight:700;letter-spacing:-1.6px;line-height:1.22`;
      const subtitle = document.createElement('div');
      subtitle.style.cssText = 'margin-top:30px;font-size:25px;font-weight:400;line-height:1.55';
      for (const [parent, lines] of [[title, card.titleLines], [subtitle, card.subtitleLines]] as const) {
        for (const text of lines) {
          const line = document.createElement('div');
          line.style.cssText = 'width:max-content;white-space:nowrap';
          line.textContent = text;
          parent.append(line);
        }
      }
      container.append(title, subtitle);
      document.body.append(container);
      const widths = [...container.querySelectorAll('div > div')].filter(el => el.children.length === 0).map(el => el.getBoundingClientRect().width);
      const bottom = subtitle.getBoundingClientRect().bottom;
      container.remove();
      return { widths, bottom };
    }, card);
    expect(Math.max(...bounds.widths), `${slug}: no line enters the art panel`).toBeLessThanOrEqual(642);
    expect(bounds.bottom, `${slug}: text clears the footer`).toBeLessThanOrEqual(508);
  }
});

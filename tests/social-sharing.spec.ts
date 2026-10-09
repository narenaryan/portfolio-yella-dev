import { expect, test } from '@playwright/test';

for (const route of ['/', '/about/', '/books/', '/projects/', '/blog/building-blog-with-zola-ground-up/']) {
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

import { expect, test } from '@playwright/test';
import articles from '../lib/social-articles.json';
import { articleArtwork } from '../lib/article-artwork';

test('unmapped future articles do not request a missing thumbnail', () => {
  expect(articleArtwork('future-post')).toBeUndefined();
  expect(articleArtwork('toString')).toBeUndefined();
});

for (const route of ['/blog/', '/']) {
  test(`${route} has the correct artwork and accessible link for every article`, async ({ page }) => {
    await page.goto(route);
    const rows = page.locator('a.card');
    await expect(rows).toHaveCount(route === '/blog/' ? Object.keys(articles).length : 3);
    const slugs: string[] = [];
    for (let index = 0; index < await rows.count(); index++) {
      const row = rows.nth(index);
      const href = (await row.getAttribute('href'))!;
      const slug = href.split('/').filter(Boolean).at(-1)!;
      slugs.push(slug);
      expect(Object.hasOwn(articles, slug)).toBe(true);
      const image = row.locator('img');
      await expect(image).toHaveCount(1);
      await expect(image).toHaveAttribute('src', `/artwork/blog/${slug}.webp`);
      await expect(image).toHaveAttribute('alt', '');
      await expect(image).toHaveAttribute('width', '320');
      await expect(image).toHaveAttribute('height', '320');
      await expect(image).toHaveAttribute('loading', index === 0 ? 'eager' : 'lazy');
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBe(320);
      await expect(row).toHaveAccessibleName(new RegExp((await row.locator('h2').innerText()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      await expect(row.locator('a, button, [tabindex]')).toHaveCount(0);
      const artBox = (await image.boundingBox())!;
      const textBox = (await row.locator('.card-body').boundingBox())!;
      expect(artBox.width).toBeCloseTo(artBox.height, 1);
      expect(artBox.x + artBox.width).toBeLessThan(textBox.x);
      expect(artBox.y).toBeCloseTo(textBox.y, 1);
    }
    expect(new Set(slugs).size).toBe(slugs.length);
    if (route === '/blog/') expect(slugs.sort()).toEqual(Object.keys(articles).sort());
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('rows are single keyboard targets with a visible focus indicator', async ({ page }) => {
  await page.goto('/blog/');
  const rows = page.locator('a.card');
  await rows.first().focus();
  for (let index = 0; index < await rows.count(); index++) {
    await expect(rows.nth(index)).toBeFocused();
    await expect(rows.nth(index)).toHaveCSS('outline-style', 'solid');
    if (index < await rows.count() - 1) await page.keyboard.press('Tab');
  }
  const href = (await rows.last().getAttribute('href'))!;
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`${href}/?$`));
  await expect(page.locator('article h1')).toBeVisible();
});

test('clicking the thumbnail opens its article', async ({ page }) => {
  await page.goto('/blog/');
  const row = page.locator('a.card').first();
  const href = (await row.getAttribute('href'))!;
  await row.locator('img').click();
  await expect(page).toHaveURL(new RegExp(`${href}/?$`));
});

test('image space is reserved even when artwork cannot load', async ({ page }) => {
  await page.route('**/artwork/blog/*', route => route.abort());
  await page.goto('/blog/');
  for (const image of await page.locator('a.card img').all()) {
    const box = (await image.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(72);
    expect(box.width).toBeCloseTo(box.height, 1);
  }
});

test('narrow screens retain every full title without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/blog/');
  for (const heading of await page.locator('a.card h2').all()) {
    // Fractional line heights can round clientHeight and scrollHeight differently.
    expect(await heading.evaluate(el => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight + 1)).toBe(true);
    await expect(heading).toHaveCSS('overflow', 'visible');
    await expect(heading).toHaveCSS('-webkit-line-clamp', 'none');
    await expect(heading).toHaveCSS('text-overflow', 'clip');
  }
  // Also exercise an unbroken title token without changing article source content.
  await page.locator('a.card h2').first().evaluate(el => { el.textContent = 'LongTitle'.repeat(30); });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const image = (await page.locator('a.card img').first().boundingBox())!;
  const heading = (await page.locator('a.card h2').first().boundingBox())!;
  expect(image.x + image.width).toBeLessThan(heading.x);
});

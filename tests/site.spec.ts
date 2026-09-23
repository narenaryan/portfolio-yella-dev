import { expect, test } from '@playwright/test';

test('home page has hero and post cards', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') errors.push(msg.text());
  });

  await page.goto('/');
  await expect(page.getByText(/Staff Cloud Security Engineer/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Blog' }).first()).toBeVisible();
  await expect(page.locator('a[href^="/blog/"]').first()).toBeVisible();

  expect(errors.filter((msg) => msg.includes('Image with src') || msg.includes('invalid "position"'))).toEqual([]);
});

test('blog post renders article and audio', async ({ page }) => {
  await page.goto('/blog/what-ai-needs-from-you/');
  await expect(page.getByRole('heading', { name: /What AI really needs/i })).toBeVisible();
  await expect(page.locator('audio[src*="what-ai-needs-from-you.mp3"]')).toBeVisible();
  await expect(page.locator('.prose')).toContainText('Bring the real problem');
});

test('photography gallery renders photos', async ({ page }) => {
  await page.goto('/photography/');
  await expect(page.getByRole('heading', { name: 'Photography' })).toBeVisible();
  await expect(page.getByRole('figure').first()).toBeVisible();
  await expect(page.getByText(/Alameda beach/i)).toBeVisible();
});

import { expect, test } from '@playwright/test';

const portfolioPages = [
  { title: 'Books', path: '/books', content: 'Building RESTful Web services with Go' },
  { title: 'Projects', path: '/projects', content: 'Whispr' },
];

for (const { title, path, content } of portfolioPages) {
  for (const suffix of ['', '/']) {
    test(`${path}${suffix} renders on direct load and refresh`, async ({ page }) => {
      await page.goto(`${path}${suffix}`);
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
      await expect(page.locator('article')).toContainText(content);
      await page.reload();
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.yella.dev${path}/`);
    });
  }

  test(`legacy /about${path}/ remains readable`, async ({ page }) => {
    await page.goto(`/about${path}/`);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.locator('article')).toContainText(content);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.yella.dev${path}/`);
  });
}

for (const start of ['/', '/about/', '/blog/what-ai-needs-from-you/']) {
  test(`menu navigation stays at the top level from ${start}`, async ({ page }) => {
    for (const { title, path } of portfolioPages) {
      await page.goto(start);
      const link = page.getByRole('navigation').getByRole('link', { name: title, exact: true });
      await expect(link).toHaveAttribute('href', `${path}/`);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${path}/$`));
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    }
    await page.getByRole('navigation').getByRole('link', { name: 'Books', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Books', exact: true })).toBeVisible();
    await page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/books\/$/);
    await expect(page.getByRole('heading', { name: 'Books', exact: true })).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
  });
}

test('About article Books link reaches the Books page', async ({ page }) => {
  await page.goto('/about/');
  await page.locator('article').getByRole('link', { name: "Naren Yellavula's Books" }).click();
  await expect(page).toHaveURL(/\/books\/$/);
  await expect(page.getByRole('heading', { name: 'Books', exact: true })).toBeVisible();
});

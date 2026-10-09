import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { renderMarkdown, type ArticleHeading } from '../lib/markdown';
import { getPosts } from '../lib/content';

const flatten = (headings: ArticleHeading[]): ArticleHeading[] => headings.flatMap(h => [h, ...flatten(h.children)]);
const articlePath = '/blog/run-multi-agent-software-project/';
const visibleNav = (page: Page) => page.locator('.article-toc nav:visible');

async function screenshot(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, scale: 'css' });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

async function openContents(page: Page) {
  const details = page.locator('.toc-mobile');
  if (await details.isVisible() && !await details.evaluate(el => el.hasAttribute('open'))) {
    await details.locator('summary').click();
  }
}

async function active(page: Page, id: string) {
  await expect(page.locator('.toc-desktop [aria-current="location"]')).toHaveAttribute('href', `#${encodeURIComponent(id)}`);
}

async function atHeading(page: Page, id: string) {
  await expect.poll(() => page.locator(`[id="${id}"]`).evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(24);
  await active(page, id);
}

test('same render pass assigns stable, unique Unicode and formatted heading anchors', async () => {
  const source = '# Title\n\n## Hello **world** & [friends](https://example.com) `code`\n\n#### 深入 café\n\n## Repeat\n\n## Repeat\n\n## Repeat-1\n\n## !!!\n\n## ???\n\n## <em>Inline</em> ![image label](x.png)\n\n```md\n## Not a heading\n```';
  const result = await renderMarkdown(source);
  expect(await renderMarkdown(source)).toEqual(result);
  const flat = flatten(result.headings);
  expect(flat.map(h => h.id)).toEqual(['title', 'hello-world-friends-code', '深入-café', 'repeat', 'repeat-1', 'repeat-1-1', 'section', 'section-1', 'inline-image-label']);
  expect(flat[1].text).toBe('Hello world & friends code');
  expect(flat[1].children[0].depth).toBe(4);
  expect(result.headings[0].children).toHaveLength(7);
  for (const { id } of flat) expect(result.html).toContain(`id="${id}" tabindex="-1"`);
  expect((await renderMarkdown('An article without headings.')).headings).toEqual([]);
});

test('all real articles have one rendered target per contents entry', async () => {
  for (const post of await getPosts()) {
    const headings = flatten(post.headings);
    expect(new Set(headings.map(h => h.id)).size).toBe(headings.length);
    for (const { id } of headings) expect(post.html.split(`id="${id}"`)).toHaveLength(2);
  }
});

test('article navigation supports history, repeated clicks, focus and direct hashes', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (/hydration|did not match/i.test(message.text())) errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(articlePath);
  await expect(page.locator('.toc-desktop [aria-current]')).toHaveCount(0);
  await openContents(page);
  const first = 'the-orchestrator-pattern';
  const second = 'the-problem-repository';
  const firstLink = visibleNav(page).getByRole('link', { name: 'The Orchestrator Pattern', exact: true });
  await firstLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`#${first}$`));
  await atHeading(page, first);
  await expect(page.locator(`#${first}`)).toBeFocused();
  await openContents(page);
  await visibleNav(page).getByRole('link', { name: 'The Problem Repository', exact: true }).click();
  await atHeading(page, second);
  await page.goBack();
  await atHeading(page, first);
  await page.goForward();
  await atHeading(page, second);
  // A repeated click must still return to the same heading after manual scrolling.
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'instant' }));
  await openContents(page);
  await visibleNav(page).getByRole('link', { name: 'The Problem Repository', exact: true }).click();
  await atHeading(page, second);
  await page.reload();
  await atHeading(page, second);
  await page.goto(`${articlePath}#choosing-the-right-model-for-each-tier`);
  await atHeading(page, 'choosing-the-right-model-for-each-tier');
  await expect(page.locator('.toc-desktop ol ol')).toContainText('Choosing the right model for each tier');
  expect(errors).toEqual([]);
  await screenshot(page, testInfo, 'article-section');
});

test('long sections, page boundaries, sticky rail and reading width', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(articlePath);
  const geometry = await page.locator('[data-article-content] :is(h1,h2,h3,h4,h5,h6)[id]').evaluateAll(elements => elements.map(el => ({ id: el.id, y: el.getBoundingClientRect().top + window.scrollY })));
  const index = geometry.findIndex((heading, i) => geometry[i + 1] && geometry[i + 1].y - heading.y > 650);
  expect(index).toBeGreaterThanOrEqual(0);
  const heading = geometry[index];
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), heading.y + 350);
  await active(page, heading.id);
  if (testInfo.project.name === 'chromium') {
    await expect.poll(() => page.locator('.toc-desktop').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(24);
    expect(await page.locator('.prose').evaluate(el => el.getBoundingClientRect().width)).toBe(680);
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await active(page, geometry[geometry.length - 1].id);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('.toc-desktop [aria-current]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await screenshot(page, testInfo, 'article-top');
});

test('mobile contents collapse accessibly, with no empty navigation', async ({ page }, testInfo) => {
  await page.goto('/blog/read-my-past-writings/');
  await expect(page.locator('.article-toc')).toHaveCount(0);
  await page.goto('/blog/failure-resume/');
  if (testInfo.project.name === 'mobile-chrome') {
    const details = page.locator('.toc-mobile');
    await expect(details).not.toHaveAttribute('open');
    await expect(visibleNav(page)).toHaveCount(0);
    await details.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open');
    await expect(visibleNav(page).getByRole('link', { name: 'What Helped Me?' })).toBeVisible();
    await screenshot(page, testInfo, 'mobile-expanded');
    await details.locator('summary').press('Space');
    await expect(details).not.toHaveAttribute('open');
    await details.locator('summary').press('Enter');
    await visibleNav(page).getByRole('link', { name: 'What Helped Me?' }).click();
    await expect(details).not.toHaveAttribute('open');
    await active(page, 'what-helped-me');
  } else {
    await expect(page.locator('.toc-mobile')).toBeHidden();
    await expect(visibleNav(page)).toHaveAccessibleName('On this page');
  }
});

test('native anchors and collapsed contents also work without JavaScript', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.name === 'mobile-chrome' ? { width: 393, height: 851 } : { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${testInfo.project.use.baseURL}${articlePath}`);
  await openContents(page);
  await visibleNav(page).getByRole('link', { name: 'The Orchestrator Pattern', exact: true }).click();
  await expect(page).toHaveURL(/#the-orchestrator-pattern$/);
  await expect(page.locator('#the-orchestrator-pattern')).toBeInViewport();
  await context.close();
});

test('smooth navigation, responsive resizing and short sidebar stay usable', async ({ page }, testInfo) => {
  await page.goto(articlePath);
  await openContents(page);
  await visibleNav(page).getByRole('link', { name: 'Git as the Source of Truth', exact: true }).click();
  await atHeading(page, 'git-as-the-source-of-truth');
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${articlePath}$`));
  await expect(page.locator('.site-header')).toBeInViewport();
  await expect(page.locator('.toc-desktop [aria-current]')).toHaveCount(0);
  if (testInfo.project.name === 'chromium') {
    await page.setViewportSize({ width: 1440, height: 400 });
    await page.goto(`${articlePath}#the-shift`);
    await atHeading(page, 'the-shift');
    const link = page.locator('.toc-desktop [aria-current]');
    await expect(link).toBeInViewport();
    await page.setViewportSize({ width: 768, height: 900 });
    await expect(page.locator('.toc-desktop')).toBeHidden();
    await expect(page.locator('.toc-mobile')).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.toc-desktop')).toBeVisible();
  } else {
    await page.setViewportSize({ width: 320, height: 700 });
    await openContents(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('duplicate and non-ASCII anchors navigate in rendered Markdown without changing article files', async ({ page }) => {
  const { html, headings } = await renderMarkdown('## Repeat\n\nText.\n\n## Repeat\n\nText.\n\n### Café 中文\n\nText.\n\n## Repeat-1\n\nText.');
  const flat = flatten(headings);
  await page.route('**/__toc-anchor-fixture/**', route => route.fulfill({
    contentType: 'text/html; charset=utf-8',
    body: `<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>h2,h3 {scroll-margin-top:24px} p {height:100vh}</style></head><body><nav>${flat.map(h => `<a href="#${encodeURIComponent(h.id)}">${h.id}</a>`).join(' ')}</nav>${html}</body></html>`,
  }));
  for (const heading of flat) {
    await page.goto('/__toc-anchor-fixture/');
    await page.getByRole('link', { name: heading.id, exact: true }).click();
    await expect(page.locator(`[id="${heading.id}"]`)).toBeInViewport();
    await page.goto(`/__toc-anchor-fixture/#${encodeURIComponent(heading.id)}`);
    await expect(page.locator(`[id="${heading.id}"]`)).toBeInViewport();
  }
});

test('client navigation mounts fresh contents and real article views remain readable', async ({ page }, testInfo) => {
  await page.goto('/blog/');
  await page.locator('a[href="/blog/never-complain/"]').click();
  await expect(page.locator('.article h1')).toHaveText('Never Complain');
  await openContents(page);
  await visibleNav(page).getByRole('link', { name: 'Why never complain?', exact: true }).click();
  await active(page, 'why-never-complain');
  if (testInfo.project.name === 'chromium') {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/blog/never-complain/#2-collective-complaints');
    await atHeading(page, '2-collective-complaints');
    await screenshot(page, testInfo, 'desktop-sticky');
  } else {
    await page.goto('/blog/never-complain/');
    await screenshot(page, testInfo, 'mobile-collapsed');
    await openContents(page);
    await screenshot(page, testInfo, 'mobile-expanded');
  }
  await page.goto('/blog/');
  await page.locator('a[href="/blog/read-my-past-writings/"]').click();
  await expect(page.locator('.article-toc')).toHaveCount(0);
});

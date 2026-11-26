import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

const api = 'https://jsonplaceholder.typicode.com/posts';
const publicPosts = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  userId: 1,
  title: `Public story ${i + 1}`,
  body: `Body of public story ${i + 1}`,
}));
async function mockPublicApi(context: BrowserContext) {
  let online = true;
  await context.route(
    'https://jsonplaceholder.typicode.com/**',
    async (route) => {
      if (!online) {
        await route.abort('internetdisconnected');
        return;
      }
      const id = Number(new URL(route.request().url()).pathname.split('/')[2]);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'access-control-allow-origin': 'http://127.0.0.1:4173',
          'access-control-allow-credentials': 'true',
          'access-control-allow-headers': 'Authorization, Content-Type',
          'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        },
        body: JSON.stringify(id ? publicPosts[id - 1] : publicPosts),
      });
    },
  );
  return async (value: boolean) => {
    online = value;
    await context.setOffline(!value);
  };
}
async function ready(page: Page, path = '/posts') {
  await page.goto(path);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
}
async function hasData(page: Page, url: string) {
  return page.evaluate(
    async (url) =>
      Boolean(await (await caches.open('folio-public-v1')).match(url)),
    url,
  );
}

test('manifest, installation prerequisites, offline reload, public list/detail and cache miss recovery', async ({
  page,
  context,
}) => {
  const setOnline = await mockPublicApi(context);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page);
  await expect(page.locator('.post-card').first()).toBeVisible();
  await expect.poll(() => hasData(page, '/data/posts.json')).toBe(true);
  const manifest = await (await page.request.get('/manifest.json')).json();
  expect(manifest).toMatchObject({
    name: 'Folio — Ideas worth reading',
    start_url: '/',
    scope: '/',
    display: 'standalone',
  });
  for (const icon of manifest.icons) {
    const response = await page.request.get(icon.src);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
  }
  await page.goto('/community');
  await expect(
    page.getByRole('heading', { name: 'Public story 100', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Read public story' }).first().click();
  await expect(
    page.getByRole('heading', { name: 'Public story 100', exact: true }),
  ).toBeVisible();
  await expect.poll(() => hasData(page, `${api}/100`)).toBe(true);
  await setOnline(false);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Public story 100', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Showing saved data/)).toBeVisible();
  await page.goto('/community');
  await expect(
    page.getByRole('heading', { name: 'Public story 100', exact: true }),
  ).toBeVisible();
  await page.goto('/posts');
  await expect(page.locator('.post-card').first()).toBeVisible();
  await page.locator('.post-card a').first().click();
  await expect(page.locator('.detail-header h1')).toBeVisible();
  await page.reload();
  await expect(page.locator('.detail-header h1')).toBeVisible();
  // This public API detail has never been downloaded, so a meaningful fallback is required.
  await page.goto('/community/99');
  await expect(
    page.getByRole('heading', { name: /A little pause/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Retry connection' }).click();
  await expect(page.getByText(/Still unable to connect/)).toBeVisible();
  await setOnline(true);
  await expect(
    page.getByRole('heading', { name: 'Public story 99', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Showing saved data/)).toHaveCount(0);
  await setOnline(false);
  await page.goto('/not-a-real-page');
  await expect(page.getByText('FOLIO OFFLINE', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Retry connection' }),
  ).toBeVisible();
  await page.goto('/offline');
  await expect(
    page.getByRole('heading', { name: /A little pause/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('explicit update activates the waiting worker, removes old caches and retains public data', async ({
  page,
  context,
}) => {
  await mockPublicApi(context);
  await ready(page);
  await expect.poll(() => hasData(page, '/data/posts.json')).toBe(true);
  const original = await readFile('dist/sw.js', 'utf8');
  const oldShell = await page.evaluate(async () =>
    (await caches.keys()).find((key) => key.startsWith('folio-shell-')),
  );
  try {
    await page.evaluate(async () => {
      await caches.open('folio-shell-obsolete');
      await caches.open('another-app-cache');
    });
    await writeFile(
      'dist/sw.js',
      original.replace(
        /const VERSION = "([^"]+)"/,
        'const VERSION = "$1-update-test"',
      ),
    );
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration())?.update();
    });
    await expect(
      page.getByRole('button', { name: 'Update now' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        async () =>
          (await navigator.serviceWorker.getRegistration())?.waiting?.state,
      ),
    ).toBe('installed');
    await Promise.all([
      page.waitForEvent(
        'framenavigated',
        (frame) => frame === page.mainFrame(),
      ),
      page.getByRole('button', { name: 'Update now' }).click(),
    ]);
    await page.waitForLoadState('domcontentloaded');
    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await caches.keys()).some((key) => key.endsWith('-update-test')),
        ),
      )
      .toBe(true);
    await expect(page.locator('.post-card').first()).toBeVisible();
    // The new cache exists during install, before activate finishes cleanup.
    await expect
      .poll(() => page.evaluate(() => caches.keys()))
      .not.toContain(oldShell);
    await expect
      .poll(() => page.evaluate(() => caches.keys()))
      .not.toContain('folio-shell-obsolete');
    const keys = await page.evaluate(() => caches.keys());
    expect(keys).not.toContain(oldShell);
    expect(keys).not.toContain('folio-shell-obsolete');
    expect(keys).toContain('another-app-cache');
    expect(await hasData(page, '/data/posts.json')).toBe(true);
  } finally {
    await writeFile('dist/sw.js', original);
  }
});

test('runtime cache is bounded, expires entries and excludes authentication and writes', async ({
  page,
  context,
}) => {
  const setOnline = await mockPublicApi(context);
  await ready(page);
  await page.evaluate(async (api) => {
    for (let id = 1; id <= 65; id++)
      await fetch(`${api}/${id}`, { credentials: 'omit' });
  }, api);
  await expect
    .poll(() =>
      page.evaluate(
        async () =>
          (await (await caches.open('folio-public-v1')).keys()).length,
      ),
    )
    .toBe(60);
  await page.evaluate(async (api) => {
    await fetch(`${api}/90`, {
      credentials: 'omit',
      headers: { Authorization: 'Bearer test-only' },
    });
    await fetch(api, { method: 'POST', body: '{}', credentials: 'omit' });
    await fetch(`${api}/91`, { credentials: 'include' });
    await caches.open('folio-public-v1').then((cache) =>
      cache.put(
        `${api}/66`,
        new Response('{"id":66}', {
          headers: { 'X-Folio-Saved-At': '1', 'X-Folio-Source': 'cache' },
        }),
      ),
    );
  }, api);
  expect(await hasData(page, `${api}/90`)).toBe(false);
  expect(await hasData(page, `${api}/91`)).toBe(false);
  expect(await hasData(page, api)).toBe(false);
  await setOnline(false);
  const status = await page.evaluate(
    async (api) => (await fetch(`${api}/66`, { credentials: 'omit' })).status,
    api,
  );
  expect(status).toBe(503);
  expect(await hasData(page, `${api}/66`)).toBe(false);
});

test('Redux shares saved state across routes and preserves URL search, filters and pagination', async ({
  page,
}) => {
  await ready(page);
  const first = page.locator('.post-card').first();
  const href = await first
    .getByRole('link', { name: /Read story/ })
    .getAttribute('href');
  await first
    .getByRole('button', { name: 'Save for this session', exact: true })
    .click();
  await expect(
    page.getByText('Saved for this session: 1', { exact: true }),
  ).toBeVisible();
  await first.getByRole('link', { name: /Read story/ }).click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(
    page.getByRole('button', { name: 'Saved for this session', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: 'All stories' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL(/page=2/);
  await page
    .getByRole('searchbox', { name: 'Search stories' })
    .fill('impossible-search-no-results');
  await expect(page).toHaveURL(/search=impossible-search-no-results/);
  await expect(page).not.toHaveURL(/page=2/);
  await expect(
    page.getByRole('heading', { name: 'Nothing here yet' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page
    .getByRole('combobox', { name: 'Category', exact: true })
    .selectOption('design');
  await page
    .getByRole('combobox', { name: 'Sort by', exact: true })
    .selectOption('title');
  await expect(page).toHaveURL(/category=design.*sort=title/);
  await expect(page.locator('.post-card').first()).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('combobox', { name: 'Category', exact: true }),
  ).toHaveValue('design');
  await expect(
    page.getByRole('combobox', { name: 'Sort by', exact: true }),
  ).toHaveValue('title');
});

test('all main pages fit 320px portrait and narrow landscape; mobile menu works', async ({
  page,
  context,
}) => {
  await mockPublicApi(context);
  await ready(page);
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 740, height: 320 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of [
      '/',
      '/posts',
      '/posts/1',
      '/community',
      '/community/1',
      '/dashboard',
      '/about',
      '/login',
      '/signup',
      '/offline',
    ]) {
      await page.goto(path);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        )
        .toBe(true);
    }
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeVisible();
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Explore' })
      .click();
    await expect(page).toHaveURL(/\/posts$/);
    await expect(
      page.getByRole('button', { name: 'Menu', exact: true }),
    ).toHaveAttribute('aria-expanded', 'false');
  }
});

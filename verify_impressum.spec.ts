import { test, expect } from '@playwright/test';

test('impressum page renders correctly', async ({ page }) => {
  // Mock API response for /api/podcast
  await page.route('**/api/podcast', async (route) => {
    const json = {
      title: 'Starting Grid',
      description: 'Test description',
      imprint_text: '# Impressum\n\nDies ist ein **Test** Impressum mit [Link](https://example.com).'
    };
    await route.fulfill({ json });
  });

  // Navigate to the impressum page directly
  await page.goto('http://localhost:5173/impressum');

  // Verify the heading
  await expect(page.getByRole('heading', { name: 'Impressum' }).first()).toBeVisible({ timeout: 10000 });

  // Verify the rendered markdown content
  await expect(page.getByText('Dies ist ein Test Impressum mit')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Link' })).toBeVisible();

  // Take a screenshot
  await page.screenshot({ path: '/home/jules/verification/impressum-page.png', fullPage: true });
});

test('admin page has impressum field', async ({ page }) => {
  // Add a longer timeout for this test
  test.setTimeout(60000);

  // Mock all possible API requests that might be made
  await page.route('**/api/podcast', async (route) => {
    const json = { title: 'Starting Grid', imprint_text: '# Existing Imprint' };
    await route.fulfill({ json });
  });
  await page.route('**/api/hosts', async (route) => { await route.fulfill({ json: [] }); });
  await page.route('**/api/platforms', async (route) => { await route.fulfill({ json: [] }); });
  await page.route('**/api/episodes', async (route) => { await route.fulfill({ json: [] }); });
  await page.route('**/api/media', async (route) => { await route.fulfill({ json: [] }); });

  await page.route('**/api/login', async (route) => {
    await route.fulfill({ json: { success: true, token: 'fake-token' } });
  });

  // Navigate to Admin and set the token directly in localStorage to bypass login page
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => localStorage.setItem('adminToken', 'fake-token'));
  await page.goto('http://localhost:5173/admin');

  // Wait for the "Über uns" tab which is where the imprint text was added and click it
  await page.getByRole('button', { name: 'Über uns' }).click();

  // Check if Impressum field is visible - wait for the element specifically
  const imprintField = page.getByText('Impressum (Unterstützt Markdown & HTML)');
  await expect(imprintField).toBeVisible({ timeout: 10000 });

  // Take screenshot
  await page.screenshot({ path: '/home/jules/verification/admin-field.png', fullPage: true });
});
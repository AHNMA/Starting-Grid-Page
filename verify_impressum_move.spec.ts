import { test, expect } from '@playwright/test';

test('admin page has impressum field in Website-Einstellungen', async ({ page }) => {
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

  // Ensure we are on the first tab ("Website-Einstellungen")
  await page.getByRole('button', { name: 'Website-Einstellungen' }).click();

  // Check if Impressum field is visible
  const imprintField = page.getByText('Impressum (Unterstützt Markdown & HTML)');
  await expect(imprintField).toBeVisible({ timeout: 10000 });

  // Take screenshot
  await page.screenshot({ path: '/home/jules/verification/admin-impressum-moved.png', fullPage: true });
});
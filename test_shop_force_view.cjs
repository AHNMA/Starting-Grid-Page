const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Mock API um Telemetrie-Hänger zu vermeiden
  await page.route('**/api/podcast', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        seo_title: 'Mock Title',
        logo_url: 'https://via.placeholder.com/150',
        cover_url: 'https://via.placeholder.com/800x400',
        description: 'Mock Description',
        social_links: []
      })
    });
  });

  await page.route('**/api/episodes*', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  // Gehe zum Shop
  await page.goto('http://localhost:4175/shop');

  // Warte bis das Spreadshop Skript geladen und gerendert hat (myShop div ist da)
  await page.waitForSelector('#myShop');

  // Warte auf Zurueck Button
  await page.waitForSelector('button:has-text("Zurück")');

  // Gib Spreadshop Zeit zum Rendern (diesmal sollte er auf die Uebersicht gehen)
  await page.waitForTimeout(5000);

  // Mache einen Screenshot
  await page.screenshot({ path: 'test_shop_force_view.png', fullPage: true });

  await browser.close();
})();

const { chromium } = require('playwright');

(async () => {
    console.log("Starting browser...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1024 }
    });

    // Wir mocken den Podcast Info Endpoint wie zuvor, damit die Seite lädt.
    await context.route('**/api/podcast', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ seo_title: 'Test Podcast', title: 'Starting Grid', host: 'Test', description: 'Test', cover_image: '' })
        });
    });

    const page = await context.newPage();

    console.log("Navigating to http://localhost:5173/shop...");
    await page.goto('http://localhost:5173/shop', { waitUntil: 'networkidle' });

    console.log("Waiting for Spreadshop to load...");
    try {
        await page.waitForSelector('#myShop .sprd-main', { timeout: 15000 });
        console.log("Found .sprd-main in the document!");
    } catch (e) {
        console.log("Timeout waiting for Spreadshop app (.sprd-main).");
    }

    // Wait a bit extra to ensure everything is rendered
    await page.waitForTimeout(5000);

    const screenshotPath = 'test_shop_nostyles.png';
    console.log(`Taking screenshot: ${screenshotPath}...`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await browser.close();
    console.log("Test finished.");
})();

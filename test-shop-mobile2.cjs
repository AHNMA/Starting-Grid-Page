const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // Mobile viewport
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  await page.route('**/api/podcast', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        title: "Starting Grid",
        description: "Test",
        cover_image: "https://sg.letthemrace.net/upload/starting-grid-cover.jpg",
        logo_image: "https://sg.letthemrace.net/upload/starting-grid-logo.png"
      })
    });
  });

  await page.goto('http://localhost:4173/shop');
  await page.waitForTimeout(5000);

  const info = await page.evaluate(() => {
    const header = document.querySelector('.sprd-header');
    const burger = document.querySelector('.sprd-header__burgerbutton');
    const cart = document.querySelector('.sprd-basket-indicator');
    const backBtnText = document.querySelector('a[href="/"] span');

    return {
      headerPos: header ? header.getBoundingClientRect() : null,
      burgerPos: burger ? burger.getBoundingClientRect() : null,
      cartPos: cart ? cart.getBoundingClientRect() : null,
      backBtnTextPos: backBtnText ? backBtnText.getBoundingClientRect() : null
    };
  });

  console.log(JSON.stringify(info, null, 2));

  await browser.close();
})();

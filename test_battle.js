const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:8080');

    // Start game
    await page.click('#start-intro-btn');
    await new Promise(r => setTimeout(r, 500));
    await page.click('.element-btn[data-element="eletricidade"]');
    await new Promise(r => setTimeout(r, 500));

    // Open Adventures modal
    await page.click('.icon-btn[data-target="aventuras"]');
    await new Promise(r => setTimeout(r, 500));

    // Start adventure
    await page.click('#aventuras-tab button'); // "Entrar na Masmorra"
    await new Promise(r => setTimeout(r, 1000));

    // Take a screenshot
    await page.screenshot({ path: '/home/jules/verification/screenshots/verification_battle.png' });

    await browser.close();
    process.exit(0);
})();

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

    // Give user diamonds to buy box
    await page.evaluate(() => {
        diamantes = 1000;
        atualizarUI();
    });

    // Open Caixas modal
    await page.click('.icon-btn[data-target="caixas"]');
    await new Promise(r => setTimeout(r, 500));

    // Check modal contents
    const caixasHtml = await page.evaluate(() => document.getElementById('caixas-container').innerHTML);
    console.log("Caixas HTML:", caixasHtml);

    // Try to click the first button using evaluate
    await page.evaluate(() => {
        const buttons = document.querySelectorAll('#caixas-container .upgrade-btn');
        if (buttons.length > 0) {
            buttons[0].click();
        }
    });
    console.log("Clicked box via evaluate");

    // Wait for the open animation
    await new Promise(r => setTimeout(r, 3000));

    // Check if modal is hidden
    const isModalVisible = await page.evaluate(() => !document.getElementById('modal-overlay').classList.contains('hidden'));
    console.log("Is Modal Visible after clicking box:", isModalVisible);

    await browser.close();
    process.exit(0);
})();

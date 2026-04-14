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

    // Click first box button
    const buyBtn = await page.$('#caixas-container .upgrade-btn');
    if (buyBtn) {
        await buyBtn.click();
        console.log("Clicked box");
        await new Promise(r => setTimeout(r, 100));

        // Wait for the open animation
        await new Promise(r => setTimeout(r, 3000));

        // Check if modal is hidden
        const isModalVisible = await page.evaluate(() => !document.getElementById('modal-overlay').classList.contains('hidden'));
        console.log("Is Modal Visible after clicking box:", isModalVisible);

        // Check what's currently in the modal
        const modalHtml = await page.evaluate(() => document.getElementById('modal-content-box').innerHTML);
        // console.log("Modal HTML:", modalHtml);

        // Check if item was received by looking at the modal content
        const itemReceivedText = await page.evaluate(() => {
            const h2 = document.querySelector('#modal-content-box h2');
            return h2 ? h2.innerText : null;
        });
        console.log("Item received text:", itemReceivedText);

    } else {
        console.log("Could not find box button.");
    }

    await browser.close();
    process.exit(0);
})();

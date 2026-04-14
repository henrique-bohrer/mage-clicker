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

    // Add two 'fogo' and one 'agua' powers to inventory
    await page.evaluate(() => {
        poderesInventario.push('fogo');
        poderesInventario.push('fogo');
        poderesInventario.push('agua');
    });

    // Open Inventario modal
    await page.click('.icon-btn[data-target="inventario"]');
    await new Promise(r => setTimeout(r, 500));

    // Wait for powers to be equipped
    await page.click('#inventario-tab button'); // Click "Equipar o Melhor"
    await new Promise(r => setTimeout(r, 500));

    // Get the length of equipped powers, filtering out 'null'
    const numEquipped = await page.evaluate(() => {
        return poderesEquipados.filter(p => p !== null).length;
    });

    console.log("Number of equipped powers:", numEquipped);

    await browser.close();
    process.exit(0);
})();

const fs = require('fs');

// We simulate loading the game loop enough to trigger gerarBoss
const code = fs.readFileSync('script.js', 'utf8');

// We can just verify if the `dungeons` array has bosses to avoid crash when `gerarBoss` tries to read `aventuraAtual.boss.nome`.
let dungeonsRegex = /const dungeons = (\[.*?\]);/s;
let match = code.match(dungeonsRegex);

if (match && match[1]) {
    try {
        let dungeonsString = match[1];
        // naive eval by making it a valid js assignment
        let dungeonsArr = eval(dungeonsString);
        let allHaveBoss = dungeonsArr.every(d => d.boss && d.boss.nome);
        if (allHaveBoss) {
            console.log("SUCCESS: All dungeons have a boss defined.");
        } else {
            console.log("FAIL: Not all dungeons have a boss defined.");
            console.log(dungeonsArr);
        }
    } catch (e) {
        console.log("FAIL parse", e);
    }
}

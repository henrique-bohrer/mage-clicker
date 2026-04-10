const fs = require('fs');
const path = './script.js';
let script = fs.readFileSync(path, 'utf8');

// Fix 1: Random color in gerarMonstro() -> Use fixed color if defined in a dictionary, else random.
const oldGerarMonstro = `    const nomeMonstro = aventuraAtual.monstros[Math.floor(Math.random() * aventuraAtual.monstros.length)];
    const spriteKey = nomeMonstro.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").split(' ').pop();

    monstroAtual = {
        nome: nomeMonstro,
        hpMax: aventuraAtual.hpMonstro,
        hp: aventuraAtual.hpMonstro,
        cor: \`hsl(\${Math.random() * 360}, 70%, 50%)\`, // Cor aleatória pro monstro
        spriteKey: monsterSprites[spriteKey] ? spriteKey : 'fantasma' // Fallback
    };`;

const newGerarMonstro = `    const nomeMonstro = aventuraAtual.monstros[Math.floor(Math.random() * aventuraAtual.monstros.length)];
    const spriteKey = nomeMonstro.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").split(' ').pop();

    let corBase = \`hsl(\${Math.random() * 360}, 70%, 50%)\`;
    if (spriteKey === 'goblin') corBase = '#228B22'; // Verde
    else if (spriteKey === 'fantasma') corBase = '#FFFFFF'; // Branco
    else if (spriteKey === 'gargula') corBase = '#808080'; // Cinza/Pedra

    monstroAtual = {
        nome: nomeMonstro,
        hpMax: aventuraAtual.hpMonstro,
        hp: aventuraAtual.hpMonstro,
        cor: corBase,
        spriteKey: monsterSprites[spriteKey] ? spriteKey : 'fantasma' // Fallback
    };`;

script = script.replace(oldGerarMonstro, newGerarMonstro);

// Fix 2: 'deus_vazio' string issue in gerarBoss()
const oldGerarBoss = `    let spriteKey = nomeBoss.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/\\s+/g, '_');
    if (!monsterSprites[spriteKey]) {
        spriteKey = spriteKey.split('_').pop(); // Fallback to last word if full name doesn't match
    }`;

const newGerarBoss = `    let spriteKey = nomeBoss.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/\\s+/g, '_');
    if (spriteKey === 'deus_do_vazio') spriteKey = 'deus_vazio'; // specific fix for Deus do Vazio
    if (!monsterSprites[spriteKey]) {
        spriteKey = spriteKey.split('_').pop(); // Fallback to last word if full name doesn't match
    }`;

script = script.replace(oldGerarBoss, newGerarBoss);

fs.writeFileSync(path, script);
console.log('Monster colors and boss string patched.');

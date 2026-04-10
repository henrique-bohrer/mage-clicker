const fs = require('fs');
const path = './script.js';

let script = fs.readFileSync(path, 'utf8');

const oldDungeons = `const dungeons = [
    { id: 'floresta', nome: 'Floresta Sombria', nivelReq: 1, hpMonstro: 50, danoMonstro: 5, bg: '#002200', monstros: ['Goblin', 'Slime', 'Lobo'], recompensaMana: 100, recompensaXP: 50 },
    { id: 'caverna', nome: 'Caverna de Cristal', nivelReq: 3, hpMonstro: 250, danoMonstro: 15, bg: '#000033', monstros: ['Golem', 'Morcego', 'Esqueleto'], recompensaMana: 1000, recompensaXP: 200 },
    { id: 'castelo', nome: 'Castelo Abandonado', nivelReq: 5, hpMonstro: 1500, danoMonstro: 50, bg: '#220000', monstros: ['Vampiro', 'Fantasma', 'Gárgula'], recompensaMana: 5000, recompensaXP: 1000, dropCaixa: 'c1' }
];`;

const newDungeons = `const dungeons = [
    { id: 'floresta', nome: 'Floresta Sombria', nivelReq: 1, hpMonstro: 50, danoMonstro: 5, bg: '#002200', monstros: ['Goblin', 'Slime', 'Lobo'], recompensaMana: 100, recompensaXP: 50, boss: { nome: 'Rei Goblin', hp: 500, dano: 15, cor: '#004400' } },
    { id: 'caverna', nome: 'Caverna de Cristal', nivelReq: 3, hpMonstro: 250, danoMonstro: 15, bg: '#000033', monstros: ['Golem', 'Morcego', 'Esqueleto'], recompensaMana: 1000, recompensaXP: 200, boss: { nome: 'Golem Guardião', hp: 2500, dano: 45, cor: '#444444' } },
    { id: 'castelo', nome: 'Castelo Abandonado', nivelReq: 5, hpMonstro: 1500, danoMonstro: 50, bg: '#220000', monstros: ['Vampiro', 'Fantasma', 'Gárgula'], recompensaMana: 5000, recompensaXP: 1000, dropCaixa: 'c1', boss: { nome: 'Lorde Vampiro', hp: 15000, dano: 150, cor: '#880000' } },
    { id: 'vazio', nome: 'O Vazio Ancestral', nivelReq: 10, hpMonstro: 10000, danoMonstro: 300, bg: '#110022', monstros: ['Sombra', 'Anomalia', 'Eco'], recompensaMana: 50000, recompensaXP: 5000, dropCaixa: 'c2', boss: { nome: 'Deus do Vazio', hp: 100000, dano: 1000, cor: '#4b0082' } }
];`;

script = script.replace(oldDungeons, newDungeons);
fs.writeFileSync(path, script);
console.log('Dungeons array patched.');

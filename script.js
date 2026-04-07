// Variáveis globais
let mana = 0;
let manaPorClique = 1;
let manaPassiva = 0;
let multiplicadorPrestige = 1;
let elementoSelecionado = null;
let lastTime = 0;

let level = 1;
let xp = 0;
let xpMax = 100;
let diamantes = 0;
let totalClicks = 0; // Para quests

// Configuração dos Elementos
const coresElemento = {
    'fogo': '#ff4500',
    'agua': '#1e90ff',
    'ar': '#00fa9a',
    'eletricidade': '#ffd700',
    'terra': '#8b4513',
    'luz': '#ffffff'
};

// Referências DOM
const selectionScreen = document.getElementById('selection-screen');
const gameScreen = document.getElementById('game-screen');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const manaDisplay = document.getElementById('mana-display');
const manaPerSecDisplay = document.getElementById('mana-per-sec-display');
const prestigeDisplay = document.getElementById('prestige-display');
const rebirthBtn = document.getElementById('rebirth-btn');
const rebirthProgressBar = document.getElementById('rebirth-progress-bar');
const rebirthPercentage = document.getElementById('rebirth-percentage');
const upgradesContainer = document.getElementById('upgrades-container');
const levelDisplay = document.getElementById('level-display');
const xpDisplay = document.getElementById('xp-display');
const xpMaxDisplay = document.getElementById('xp-max-display');
const diamondsDisplay = document.getElementById('diamonds-display');
const questsContainer = document.getElementById('quests-container');
const caixasContainer = document.getElementById('caixas-container');
const skinsContainer = document.getElementById('skins-container');

// Quests
let quests = [
    { id: 'q1', nome: 'Aprendiz Rápido', desc: 'Dê 50 cliques.', objetivo: 50, tipo: 'clicks', recompensas: { xp: 50, diamantes: 5 }, completada: false },
    { id: 'q2', nome: 'Acumulador', desc: 'Junte 1.000 Mana.', objetivo: 1000, tipo: 'mana', recompensas: { xp: 100, diamantes: 10 }, completada: false },
    { id: 'q3', nome: 'Dedo Cansado', desc: 'Dê 500 cliques.', objetivo: 500, tipo: 'clicks', recompensas: { xp: 200, diamantes: 25 }, completada: false }
];

// Equipamentos e Inventário
const equipamentosDB = {
    'chapeu_basico': { id: 'chapeu_basico', nome: 'Chapéu Básico', tipo: 'hat', raridade: 'comum', cor: '#ffffff', stats: { click: 1 } },
    'chapeu_pontudo': { id: 'chapeu_pontudo', nome: 'Chapéu Pontudo', tipo: 'hat', raridade: 'incomum', cor: '#00ff00', stats: { click: 2, passiva: 1 } },
    'coroa_rei': { id: 'coroa_rei', nome: 'Coroa do Rei', tipo: 'hat', raridade: 'mitico', cor: '#ff0000', stats: { click: 50, passiva: 50 } },
    'roupa_basica': { id: 'roupa_basica', nome: 'Roupão Básico', tipo: 'robe', raridade: 'comum', cor: '#ffffff', stats: { passiva: 1 } },
    'shorts_hipster': { id: 'shorts_hipster', nome: 'Shorts Hipster', tipo: 'robe', raridade: 'raro', cor: '#0088ff', stats: { click: 5, passiva: 2 } },
    'manto_arcano': { id: 'manto_arcano', nome: 'Manto Arcano', tipo: 'epico', raridade: 'epico', cor: '#aa00ff', stats: { click: 20, passiva: 20 } },
    'cajado_madeira': { id: 'cajado_madeira', nome: 'Graveto', tipo: 'staff', raridade: 'comum', cor: '#ffffff', stats: { dano: 1 } },
    'cajado_cristal': { id: 'cajado_cristal', nome: 'Cajado de Cristal', tipo: 'staff', raridade: 'lendario', cor: '#ffcc00', stats: { dano: 15, click: 10 } }
};

const raridades = {
    'comum': { cor: '#aaaaaa', chance: 75.0, multi: 1 },
    'incomum': { cor: '#00ff00', chance: 15.0, multi: 2 },
    'raro': { cor: '#0088ff', chance: 6.5, multi: 5 },
    'epico': { cor: '#aa00ff', chance: 2.5, multi: 12 },
    'lendario': { cor: '#ffcc00', chance: 0.8, multi: 30 },
    'mitico': { cor: '#ff0000', chance: 0.2, multi: 100 }
};

let inventario = ['chapeu_basico', 'roupa_basica', 'cajado_madeira'];
let equipamentosEquipados = {
    hat: 'chapeu_basico',
    robe: 'roupa_basica',
    staff: 'cajado_madeira'
};

// Caixas e Loots
const caixas = [
    { id: 'c1', nome: 'Caixa de Madeira', custo: 10, cor: '#8b4513' },
    { id: 'c2', nome: 'Caixa de Ferro', custo: 50, cor: '#aaa' },
    { id: 'c3', nome: 'Caixa Mágica', custo: 200, cor: '#dda0dd' }
];

// Partículas
let particulas = [];
let floatingTexts = [];

const upgrades = [
    { id: 'varinha', nome: 'Varinha Mágica', desc: 'Aumenta Mana/Clique', custoBase: 15, multiCusto: 1.2, nivel: 0, efeito: () => { manaPorClique += 1; } },
    { id: 'cristal', nome: 'Cristal de Mana', desc: 'Gera Mana Passiva', custoBase: 100, multiCusto: 1.25, nivel: 0, efeito: () => { manaPassiva += 2; } },
    { id: 'tomo', nome: 'Tomo Arcano', desc: 'Aumenta Mana/Clique', custoBase: 1000, multiCusto: 1.3, nivel: 0, efeito: () => { manaPorClique += 10; } },
    { id: 'familiar', nome: 'Familiar Elemental', desc: 'Gera Mana Passiva', custoBase: 5000, multiCusto: 1.35, nivel: 0, efeito: () => { manaPassiva += 50; } },
    { id: 'cajado', nome: 'Cajado Ancestral', desc: 'Aumenta Mana/Clique', custoBase: 50000, multiCusto: 1.4, nivel: 0, efeito: () => { manaPorClique += 100; } },
    { id: 'aura', nome: 'Aura Mágica', desc: 'Gera Mana Passiva', custoBase: 250000, multiCusto: 1.45, nivel: 0, efeito: () => { manaPassiva += 500; } },
    { id: 'dragao', nome: 'Dragão Elemental', desc: 'Gera MUITA Mana Passiva', custoBase: 1e6, multiCusto: 1.5, nivel: 0, efeito: () => { manaPassiva += 5000; } },
    { id: 'artefato', nome: 'Artefato Divino', desc: 'Poder Imensurável', custoBase: 1e9, multiCusto: 1.6, nivel: 0, efeito: () => { manaPorClique += 10000; manaPassiva += 50000; } }
];

// Audio Context Setup
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
        // High pitched short beep
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'upgrade') {
        // Happy ascending arpeggio
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1); // C#
        osc.frequency.setValueAtTime(659.25, now + 0.2); // E
        osc.frequency.setValueAtTime(880, now + 0.3);    // A
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'rebirth') {
        // Long majestic swell
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 1.5);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + 2);
        osc.start(now);
        osc.stop(now + 2);
    }
}

// Aventuras
let modoAventura = false;
let aventuraAtual = null;
let monstroAtual = null;
let xMagoAventura = -100;
let xMonstro = 300;
let animacaoMagoAtacando = 0;
let animacaoMagoMovendo = false;
let particulasDano = [];

const dungeons = [
    { id: 'floresta', nome: 'Floresta Sombria', nivelReq: 1, hpMonstro: 50, bg: '#002200', monstros: ['Goblin', 'Slime', 'Lobo'], recompensaMana: 100, recompensaXP: 50 },
    { id: 'caverna', nome: 'Caverna de Cristal', nivelReq: 3, hpMonstro: 250, bg: '#000033', monstros: ['Golem', 'Morcego', 'Esqueleto'], recompensaMana: 1000, recompensaXP: 200 },
    { id: 'castelo', nome: 'Castelo Abandonado', nivelReq: 5, hpMonstro: 1500, bg: '#220000', monstros: ['Vampiro', 'Fantasma', 'Gárgula'], recompensaMana: 5000, recompensaXP: 1000, dropCaixa: 'c1' }
];

// Inicialização
window.onload = () => {
    configurarEventosSelecao();
    configurarCliqueMago();
    configurarRebirth();
    configurarTabs();
    carregarJogo();

    // Auto-save a cada 10 segundos
    setInterval(salvarJogo, 10000);
};

function configurarTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover active de todos
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Adicionar active no clicado
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target') + '-tab';
            document.getElementById(targetId).classList.add('active');
        });
    });
}

function configurarRebirth() {
    rebirthBtn.addEventListener('click', renascer);
}

function renascer() {
    if (mana >= 1e12) {
        playSound('rebirth');
        multiplicadorPrestige *= 3;
        // Reset progresso (mas mantém level e diamantes)
        mana = 0;
        manaPorClique = 1;
        manaPassiva = 0;
        upgrades.forEach(up => up.nivel = 0);

        salvarJogo();
        renderizarLoja();

        // Efeito visual forte
        criarParticulas(200, canvas.width/2, canvas.height/2, true);

        // Efeito pulsar no container do canvas
        const container = document.querySelector('.canvas-container');
        if (container) {
            container.style.transition = 'box-shadow 0.5s ease';
            container.style.boxShadow = `0 0 50px 20px ${coresElemento[elementoSelecionado]}`;
            setTimeout(() => {
                container.style.boxShadow = 'none';
            }, 1000);
        }

        // Esconder botão novamente se necessário
        rebirthBtn.classList.add('hidden');
    }
}

function salvarJogo() {
    if (!elementoSelecionado) return; // Não salvar se estiver na tela de seleção
    const dados = {
        mana,
        manaPorClique,
        manaPassiva,
        multiplicadorPrestige,
        elementoSelecionado,
        level,
        xp,
        xpMax,
        diamantes,
        totalClicks,
        upgrades: upgrades.map(up => up.nivel),
        quests: quests.map(q => ({ completada: q.completada })),
        inventario,
        equipamentosEquipados
    };
    localStorage.setItem('magosSave', JSON.stringify(dados));
}

function hardReset() {
    if (confirm("Tem certeza que deseja APAGAR TUDO e começar do zero? (Sem nenhum bônus de prestígio)")) {
        localStorage.removeItem('magosSave');
        location.reload();
    }
}

function carregarJogo() {
    const save = localStorage.getItem('magosSave');
    if (save) {
        try {
            const dados = JSON.parse(save);
            mana = dados.mana || 0;
            manaPorClique = dados.manaPorClique || 1;
            manaPassiva = dados.manaPassiva || 0;
            multiplicadorPrestige = dados.multiplicadorPrestige || 1;
            level = dados.level || 1;
            xp = dados.xp || 0;
            xpMax = dados.xpMax || 100;
            diamantes = dados.diamantes || 0;
            totalClicks = dados.totalClicks || 0;

            if (dados.upgrades) {
                dados.upgrades.forEach((nivel, index) => {
                    if (upgrades[index]) upgrades[index].nivel = nivel;
                });
            }
            if (dados.quests) {
                dados.quests.forEach((qData, index) => {
                    if (quests[index]) quests[index].completada = qData.completada;
                });
            }
            if (dados.inventario) inventario = dados.inventario;
            if (dados.equipamentosEquipados) equipamentosEquipados = dados.equipamentosEquipados;

            if (dados.elementoSelecionado) {
                elementoSelecionado = dados.elementoSelecionado;
                iniciarJogo(true);
            }
        } catch (e) {
            console.error("Erro ao carregar o save", e);
        }
    }
}

function configurarCliqueMago() {
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        // Ajuste para lidar com canvas responsivo
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Verificar colisão simples (área central onde o mago está desenhado)
        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        const hitboxSize = 80; // tamanho aproximado do mago

        if (x > centroX - hitboxSize && x < centroX + hitboxSize &&
            y > centroY - hitboxSize && y < centroY + hitboxSize) {
            cliqueNoMago(x, y);
        }
    });
}

function calcularStatsEquipamentos() {
    let bonusClick = 0;
    let bonusPassiva = 0;

    Object.values(equipamentosEquipados).forEach(eqId => {
        const eq = equipamentosDB[eqId];
        if (eq && eq.stats) {
            const mult = raridades[eq.raridade] ? raridades[eq.raridade].multi : 1;
            if (eq.stats.click) bonusClick += (eq.stats.click * mult);
            if (eq.stats.passiva) bonusPassiva += (eq.stats.passiva * mult);
        }
    });

    return { bonusClick, bonusPassiva };
}

function cliqueNoMago(x, y) {
    if (modoAventura && monstroAtual) return;

    const statsEq = calcularStatsEquipamentos();
    const ganho = (manaPorClique + statsEq.bonusClick) * multiplicadorPrestige;
    mana += ganho;
    totalClicks++;
    ganharXP(1); // Ganha 1 de XP por clique

    playSound('click');
    animarMagoPulo();
    criarParticulas(15, x, y);
    criarFloatingText(`+${ganho}`, x, y);

    atualizarQuests();
}

// Configurar clique para atacar no modo aventura
canvas.addEventListener('click', (e) => {
    if (!modoAventura || !monstroAtual) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Hitbox do monstro (área direita do canvas)
    if (x > canvas.width / 2) {
        atacarMonstro(x, y);
    }
});

function atacarMonstro(x, y) {
    if (!monstroAtual || animacaoMagoMovendo) return;

    let dano = 1;
    Object.values(equipamentosEquipados).forEach(eqId => {
        const eq = equipamentosDB[eqId];
        if (eq && eq.stats && eq.stats.dano) {
            const mult = raridades[eq.raridade] ? raridades[eq.raridade].multi : 1;
            dano += (eq.stats.dano * mult);
        }
    });

    dano = Math.floor(dano * multiplicadorPrestige);

    monstroAtual.hp -= dano;
    animacaoMagoAtacando = 10;

    playSound('click');

    particulasDano.push({
        texto: `-${dano}`,
        x: xMonstro + Math.random() * 20 - 10,
        y: canvas.height / 2 - 20,
        vy: -2,
        vida: 30
    });

    if (monstroAtual.hp <= 0) {
        monstroDerrotado();
    }
}

function criarParticulas(qtd, x, y, burst = false) {
    for (let i = 0; i < qtd; i++) {
        const velMult = burst ? 3 : 1;
        particulas.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10 * velMult,
            vy: -Math.random() * 10 * velMult,
            vida: burst ? 120 : 60,
            maxVida: burst ? 120 : 60,
            cor: coresElemento[elementoSelecionado]
        });
    }
}

function atualizarParticulas() {
    particulas = particulas.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravidade
        p.vida--;

        ctx.globalAlpha = Math.max(0, p.vida / p.maxVida);
        ctx.fillStyle = p.cor;
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1.0; // Reset

        return p.vida > 0;
    });
}

function criarFloatingText(texto, x, y) {
    floatingTexts.push({
        texto: texto,
        x: x + (Math.random() - 0.5) * 40,
        y: y,
        vy: -2,
        vida: 40,
        maxVida: 40
    });
}

function atualizarFloatingTexts() {
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';

    floatingTexts = floatingTexts.filter(ft => {
        ft.y += ft.vy;
        ft.vida--;

        ctx.globalAlpha = Math.max(0, ft.vida / ft.maxVida);
        // Contorno
        ctx.fillStyle = '#000';
        ctx.fillText(ft.texto, ft.x + 2, ft.y + 2);
        // Texto
        ctx.fillStyle = coresElemento[elementoSelecionado];
        ctx.fillText(ft.texto, ft.x, ft.y);

        ctx.globalAlpha = 1.0;

        return ft.vida > 0;
    });
}

function configurarEventosSelecao() {
    const botoes = document.querySelectorAll('.element-btn');
    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            elementoSelecionado = btn.getAttribute('data-element');
            iniciarJogo(false);
        });
    });
}

function iniciarJogo(loaded = false) {
    initAudio();
    selectionScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    // Atualizar a variável CSS do scrollbar com a cor do elemento
    document.documentElement.style.setProperty('--element-color', coresElemento[elementoSelecionado]);

    // Animação de fade-in no jogo principal
    gameScreen.style.opacity = '0';
    setTimeout(() => {
        gameScreen.style.transition = 'opacity 1s ease';
        gameScreen.style.opacity = '1';
    }, 50);

    renderizarLoja();
    renderizarQuests();
    renderizarCaixas();
    renderizarInventario();
    renderizarAventuras();

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// Animação do mago
let magoScale = 1;
let pulsoMago = 0;

// Loop Principal
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (modoAventura) {
        desenharAventura(deltaTime);
    } else {
        desenharFundo();
        desenharMagoIdle(deltaTime);
    }

    atualizarParticulas();
    atualizarFloatingTexts();

    const statsEq = calcularStatsEquipamentos();
    mana += ((manaPassiva + statsEq.bonusPassiva) * multiplicadorPrestige) * (deltaTime / 1000);

    atualizarUI();
    atualizarLojaUI();
    atualizarQuests();

    requestAnimationFrame(gameLoop);
}

function desenharMagoIdle(deltaTime) {
    if (pulsoMago > 0) {
        pulsoMago -= deltaTime * 0.01;
        if (pulsoMago < 0) pulsoMago = 0;
    }
    magoScale = 1 + pulsoMago * 0.2;

    desenharMago(canvas.width / 2, canvas.height / 2);
}

function desenharFundo() {
    // Fundo animado mais rico
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Partículas flutuantes lentas no fundo (simulando estrelas/poeira mágica)
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<25; i++) {
        let x = (Math.sin(lastTime * 0.0001 + i * 10) * 0.5 + 0.5) * canvas.width;
        let y = (Math.cos(lastTime * 0.00015 + i * 10) * 0.5 + 0.5) * canvas.height;
        let size = Math.sin(lastTime * 0.002 + i) * 1.5 + 1.5;
        ctx.globalAlpha = (Math.sin(lastTime * 0.001 + i) * 0.5 + 0.5) * 0.5; // Mais suave
        ctx.fillRect(x, y, size, size);
    }

    // Aura central baseada no elemento selecionado
    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2;
    const auraPulse = Math.sin(lastTime * 0.003) * 20; // pulsa suavemente
    const grad = ctx.createRadialGradient(centroX, centroY, 10, centroX, centroY, 200 + auraPulse);
    grad.addColorStop(0, coresElemento[elementoSelecionado] + '33');
    grad.addColorStop(1, 'transparent');

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Função utilitária para ajustar brilho de uma cor hex (para o sombreamento dinâmico)
function ajustarCor(corHex, fator) {
    let r = parseInt(corHex.substring(1, 3), 16);
    let g = parseInt(corHex.substring(3, 5), 16);
    let b = parseInt(corHex.substring(5, 7), 16);

    r = Math.min(255, Math.max(0, Math.floor(r * fator)));
    g = Math.min(255, Math.max(0, Math.floor(g * fator)));
    b = Math.min(255, Math.max(0, Math.floor(b * fator)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function desenharMago(x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Animação de idle (flutuar)
    const floatY = Math.sin(lastTime * 0.002) * 5;
    ctx.translate(0, floatY);

    ctx.scale(magoScale, magoScale);

    // Desenhar o mago baseado na referência em 16x16 pixel art scale
    const ps = 6; // pixel size
    const offsetX = -8 * ps; // Centralizar
    const offsetY = -8 * ps;

    const C = coresElemento[elementoSelecionado]; // Cor principal do elemento
    const D = ajustarCor(C, 0.7); // Cor escura do elemento (sombra)
    const L = ajustarCor(C, 1.3); // Cor clara do elemento (brilho)

    const S = '#f4a460'; // Skin/Pele
    const S_D = '#cd853f'; // Skin Dark
    const W = '#ffffff'; // White/Beard
    const B = '#000000'; // Black/Eyes
    const X = null; // Vazio

    // Colors derived from equipments
    const hatEq = equipamentosDB[equipamentosEquipados.hat];
    const robeEq = equipamentosDB[equipamentosEquipados.robe];
    const staffEq = equipamentosDB[equipamentosEquipados.staff];

    const HC = hatEq ? hatEq.cor : C; // Hat color
    const RC = robeEq ? robeEq.cor : C; // Robe color
    const SC = staffEq ? staffEq.cor : C; // Staff color

    const HC_D = ajustarCor(HC, 0.7);
    const RC_D = ajustarCor(RC, 0.7);
    const SC_D = ajustarCor(SC, 0.7);

    // Layer 1: Body / Head (Base)
    const bodySprite = [
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, S, S, S, S, S, X, X, X, X, X],
        [X, X, X, X, X, S, B, S, B, S, W, X, X, X, X, X],
        [X, X, X, X, X, S, S, S, S, S, W, W, X, X, X, X],
        [X, X, X, X, X, W, W, W, W, W, W, X, X, X, X, X],
        [X, X, X, X, X, W, W, W, W, W, X, X, X, X, X, X],
        [X, S, S, X, X, W, W, W, W, X, X, X, X, X, X, X],
        [X, X, X, X, X, W, W, W, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, W, W, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, W, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, S, S, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X]
    ];

    // Layer 2: Robe
    let robeSprite = [];
    if (equipamentosEquipados.robe === 'shorts_hipster') {
        robeSprite = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, RC, RC, X, X, X, X, X, RC, RC, X, X, X],
            [X, X, X, X, RC, X, X, X, X, X, X, X, RC, X, X, X],
            [X, X, X, X, RC, X, X, X, X, X, X, X, RC, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, RC, RC, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, RC, RC, RC, X, X, X],
            [X, X, X, X, RC, X, X, X, X, RC_D, RC, RC, X, X, X, X],
            [X, X, X, RC, RC, X, X, X, RC_D, RC_D, RC, RC, RC, X, X, X],
            [X, X, X, RC, RC, RC, X, X, RC_D, RC, RC, X, RC, X, X, X],
            [X, X, X, RC_D, RC, RC, X, RC, RC_D, RC, RC, X, RC, X, X, X],
            [X, X, X, RC_D, RC_D, RC, RC, RC, RC_D, RC_D, RC, RC, X, X, X, X],
            [X, X, X, X, RC, RC, RC, RC, RC, RC, RC_D, X, X, X, X, X],
            [X, X, X, X, X, S, S, X, X, S, S, X, X, X, X, X],
            [X, X, X, X, X, S, S, X, X, S, S, X, X, X, X, X]
        ];
    } else {
        // Default Robe
        robeSprite = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, RC, RC, X, X, X, X, X, RC, RC, X, X, X],
            [X, X, X, X, RC, X, X, X, X, X, X, X, RC, X, X, X],
            [X, X, X, X, RC, X, X, X, X, X, X, X, RC, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, RC, RC, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, RC, RC, RC, X, X, X],
            [X, X, X, X, RC, X, X, X, X, RC_D, RC, RC, X, X, X, X],
            [X, X, X, RC, RC, X, X, X, RC_D, RC_D, RC, RC, RC, X, X, X],
            [X, X, X, RC, RC, RC, X, X, RC_D, RC, RC, X, RC, X, X, X],
            [X, X, X, RC_D, RC, RC, X, RC, RC_D, RC, RC, X, RC, X, X, X],
            [X, X, X, RC_D, RC_D, RC, RC, RC, RC_D, RC_D, RC, RC, X, X, X, X],
            [X, X, X, X, RC, RC, RC, RC, RC, RC, RC_D, X, X, X, X, X],
            [X, X, X, X, X, RC, RC, RC, RC, RC, RC_D, X, X, X, X, X],
            [X, X, X, X, X, RC, RC, RC, RC, RC, RC_D, X, X, X, X, X]
        ];
    }

    // Layer 3: Hat
    let hatSprite = [];
    if (equipamentosEquipados.hat === 'coroa_rei') {
        hatSprite = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, HC, X, HC, X, HC, X, X, X, X, X],
            [X, X, X, X, X, X, HC, HC, HC, HC, HC, X, X, X, X, X],
            [X, X, X, X, X, HC, HC, HC, HC, HC, HC, HC, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X]
        ];
    } else {
        // Default Hat
        hatSprite = [
            [X, X, X, X, X, X, X, HC, HC, HC, X, X, X, X, X, X],
            [X, X, X, X, X, HC, HC, HC, HC, HC, HC, HC, X, X, X, X],
            [X, X, X, X, HC, HC, HC, HC, HC, HC, HC, HC, HC, X, X, X],
            [X, X, X, X, HC, HC, X, X, X, X, X, HC, HC, HC, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X]
        ];
    }

    // Layer 4: Staff
    const staffSprite = [
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, SC_D, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, SC_D, SC_D, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, SC, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, SC, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, SC, SC, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, SC, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, SC, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, SC, SC, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, SC, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [SC, SC, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [SC, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X]
    ];

    // Draw all layers
    const drawSprite = (spriteLayer) => {
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const cor = spriteLayer[y][x];
                if (cor !== null) {
                    ctx.fillStyle = cor;
                    ctx.fillRect(offsetX + x * ps, offsetY + y * ps, ps, ps);
                }
            }
        }
    };

    drawSprite(bodySprite);
    drawSprite(robeSprite);
    drawSprite(hatSprite);
    drawSprite(staffSprite);

    ctx.restore();
}

// === Sistema de Aventuras ===

function renderizarAventuras() {
    const container = document.getElementById('aventuras-container');
    if (!container) return;

    container.innerHTML = '';

    dungeons.forEach(d => {
        const div = document.createElement('div');
        div.className = 'adventure-card';
        div.style.borderColor = d.nivelReq <= level ? '#555' : '#ff0000';

        div.innerHTML = `
            <h4 style="color: #ffd700;">${d.nome} (Nv ${d.nivelReq}+)</h4>
            <p style="color: #aaa; font-size: 0.6rem; margin-top: 5px;">Recompensas: ${d.recompensaMana} Mana, ${d.recompensaXP} XP</p>
        `;

        if (level >= d.nivelReq) {
            div.onclick = () => entrarAventura(d.id);
        } else {
            div.style.opacity = '0.5';
            div.style.cursor = 'not-allowed';
            div.innerHTML += `<p style="color: red; font-size: 0.6rem; margin-top: 5px;">Nível insuficiente.</p>`;
        }

        container.appendChild(div);
    });
}

function entrarAventura(id) {
    aventuraAtual = dungeons.find(d => d.id === id);
    modoAventura = true;
    xMagoAventura = 100;
    gerarMonstro();

    const container = document.getElementById('aventuras-container');
    const btnLeave = document.getElementById('btn-leave-adventure');
    if (container) container.style.display = 'none';
    if (btnLeave) {
        btnLeave.classList.remove('hidden');
        btnLeave.style.display = 'block';
    }

    playSound('rebirth'); // Tocar som épico ao entrar na dungeon
}

function sairAventura() {
    modoAventura = false;
    aventuraAtual = null;
    monstroAtual = null;

    const container = document.getElementById('aventuras-container');
    const btnLeave = document.getElementById('btn-leave-adventure');
    if (container) container.style.display = 'block';
    if (btnLeave) {
        btnLeave.classList.add('hidden');
        btnLeave.style.display = 'none';
    }
}

function gerarMonstro() {
    if (!aventuraAtual) return;

    animacaoMagoMovendo = false;
    monstroAtual = {
        nome: aventuraAtual.monstros[Math.floor(Math.random() * aventuraAtual.monstros.length)],
        hpMax: aventuraAtual.hpMonstro,
        hp: aventuraAtual.hpMonstro,
        cor: `hsl(${Math.random() * 360}, 70%, 50%)` // Cor aleatória pro monstro
    };
    xMonstro = canvas.width - 100;
}

function monstroDerrotado() {
    // Recompensas
    mana += aventuraAtual.recompensaMana * multiplicadorPrestige;
    ganharXP(aventuraAtual.recompensaXP);

    if (aventuraAtual.dropCaixa && Math.random() < 0.2) { // 20% de chance de dropar caixa
        const caixaIdx = caixas.findIndex(c => c.id === aventuraAtual.dropCaixa);
        if (caixaIdx >= 0) {
            abrirCaixa(caixaIdx); // Simula abrir a caixa grátis
        }
    }

    playSound('upgrade');
    criarFloatingText(`Vitória!`, canvas.width/2, canvas.height/2 - 50);

    // Iniciar animação do mago andando para a direita (próxima sala)
    monstroAtual = null;
    animacaoMagoMovendo = true;
}

function desenharAventura(deltaTime) {
    if (!aventuraAtual) return;

    // Fundo da dungeon
    ctx.fillStyle = aventuraAtual.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Chao simples
    ctx.fillStyle = '#111';
    ctx.fillRect(0, canvas.height / 2 + 50, canvas.width, canvas.height / 2);

    // Lógica do Mago
    if (animacaoMagoMovendo) {
        xMagoAventura += deltaTime * 0.2; // Move pra direita
        magoScale = 1;
        if (xMagoAventura > canvas.width + 50) {
            // Saiu da tela, reseta e gera outro
            xMagoAventura = -50;
            gerarMonstro();
        }
    } else {
        // Mago posicionado pra batalha
        xMagoAventura += (100 - xMagoAventura) * 0.1; // Smooth damp para a pos 100

        // Atacando animação
        if (animacaoMagoAtacando > 0) {
            xMagoAventura += 10; // Avança
            animacaoMagoAtacando--;
        }
    }

    desenharMago(xMagoAventura, canvas.height / 2);

    // Desenhar monstro
    if (monstroAtual) {
        // Forma simples do monstro (um quadrado/blob)
        ctx.fillStyle = monstroAtual.cor;
        const sSize = 40 + Math.sin(lastTime * 0.005) * 5; // respira
        ctx.fillRect(xMonstro - sSize/2, canvas.height / 2 - sSize/2 + 20, sSize, sSize);

        // Olhos
        ctx.fillStyle = '#000';
        ctx.fillRect(xMonstro - 10, canvas.height / 2 + 10, 5, 5);
        ctx.fillRect(xMonstro + 5, canvas.height / 2 + 10, 5, 5);

        // HP Bar
        const barW = 60;
        const barH = 8;
        const hpPct = Math.max(0, monstroAtual.hp / monstroAtual.hpMax);
        ctx.fillStyle = '#555';
        ctx.fillRect(xMonstro - barW/2, canvas.height / 2 - 40, barW, barH);
        ctx.fillStyle = '#f00';
        ctx.fillRect(xMonstro - barW/2, canvas.height / 2 - 40, barW * hpPct, barH);

        ctx.font = '10px "Press Start 2P"';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(monstroAtual.nome, xMonstro, canvas.height / 2 - 50);
    }

    // Partículas de dano
    particulasDano = particulasDano.filter(p => {
        p.y += p.vy;
        p.vida--;
        ctx.font = '16px "Press Start 2P"';
        ctx.fillStyle = '#f00';
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, p.vida / 30);
        ctx.fillText(p.texto, p.x, p.y);
        ctx.globalAlpha = 1;
        return p.vida > 0;
    });
}

function animarMagoPulo() {
    pulsoMago = 1;
}

function renderizarLoja() {
    upgradesContainer.innerHTML = '';
    upgrades.forEach((up, index) => {
        const btn = document.createElement('button');
        btn.className = 'upgrade-btn';
        btn.id = `upgrade-${index}`;
        btn.onclick = () => comprarUpgrade(index);

        btn.innerHTML = `
            <span class="name">${up.nome} (Nv ${up.nivel})</span>
            <span class="cost">Custo: ${Math.floor(up.custoBase * Math.pow(up.multiCusto, up.nivel))} Mana</span>
            <span class="desc">${up.desc}</span>
        `;
        upgradesContainer.appendChild(btn);
    });
}

function comprarUpgrade(index) {
    const up = upgrades[index];
    const custo = Math.floor(up.custoBase * Math.pow(up.multiCusto, up.nivel));

    if (mana >= custo) {
        playSound('upgrade');
        mana -= custo;
        up.nivel++;
        up.efeito();

        // Efeito visual no botão
        const btn = document.getElementById(`upgrade-${index}`);
        btn.style.borderColor = coresElemento[elementoSelecionado];
        setTimeout(() => {
            btn.style.borderColor = '#555';
        }, 200);

        renderizarLoja(); // Re-renderizar para atualizar texto
    }
}

function converterManaEmDiamantes() {
    const custo = 1000000;
    const recompensa = 10;
    if (mana >= custo) {
        mana -= custo;
        diamantes += recompensa;
        playSound('upgrade');
        criarFloatingText(`+${recompensa} Diamantes`, canvas.width/2, canvas.height/2);
        atualizarUI();
    } else {
        alert("Mana insuficiente! Você precisa de 1 Milhão de Mana.");
    }
}

function atualizarLojaUI() {
    upgrades.forEach((up, index) => {
        const btn = document.getElementById(`upgrade-${index}`);
        if (!btn) return;
        const custo = Math.floor(up.custoBase * Math.pow(up.multiCusto, up.nivel));
        if (mana >= custo) {
            btn.disabled = false;
            btn.style.opacity = '1';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        }
    });
}

function renderizarQuests() {
    questsContainer.innerHTML = '';
    quests.forEach((q, index) => {
        if (q.completada) return; // Não renderiza quests já resgatadas

        let progresso = q.tipo === 'clicks' ? totalClicks : mana;
        if (progresso > q.objetivo) progresso = q.objetivo;
        let pct = (progresso / q.objetivo) * 100;

        const isReady = progresso >= q.objetivo;

        const card = document.createElement('div');
        card.className = 'quest-card';
        card.innerHTML = `
            <h4>${q.nome}</h4>
            <p>${q.desc}</p>
            <p style="color: #00ffff;">+${q.recompensas.diamantes} Diamantes, +${q.recompensas.xp} XP</p>
            <div class="progress">
                <div class="progress-fill" style="width: ${pct}%"></div>
            </div>
            <p style="text-align: right; margin-bottom: 5px;">${Math.floor(progresso)} / ${q.objetivo}</p>
            <button class="quest-btn" id="quest-btn-${index}">
                ${isReady ? 'Resgatar' : 'Em Progresso'}
            </button>
        `;
        questsContainer.appendChild(card);

        const btn = document.getElementById(`quest-btn-${index}`);
        if (btn) {
            if (isReady) {
                btn.onclick = () => resgatarQuest(index);
            } else {
                btn.disabled = true;
            }
        }
    });

    if (questsContainer.innerHTML === '') {
        questsContainer.innerHTML = '<p style="text-align:center; color:#888; font-size:10px;">Sem mais quests no momento!</p>';
    }
}

let lastQuestRender = 0;
function atualizarQuests() {
    // Renderizar a cada 1 segundo para não pesar
    const now = performance.now();
    if (now - lastQuestRender > 1000) {
        lastQuestRender = now;
        renderizarQuests();
    }
}

function resgatarQuest(index) {
    const q = quests[index];
    if (q.completada) return;

    let progresso = q.tipo === 'clicks' ? totalClicks : mana;
    if (progresso >= q.objetivo) {
        playSound('upgrade'); // Som de recompensa
        diamantes += q.recompensas.diamantes;
        ganharXP(q.recompensas.xp);
        q.completada = true;
        renderizarQuests();
        atualizarUI();
    }
}

// === Sistema de Caixas e Skins ===

function renderizarCaixas() {
    caixasContainer.innerHTML = '';
    caixas.forEach((caixa, index) => {
        const btn = document.createElement('button');
        btn.className = 'upgrade-btn';
        btn.style.borderColor = caixa.cor;
        btn.style.width = '100%';
        btn.style.marginBottom = '10px';

        btn.innerHTML = `
            <span class="name" style="color: ${caixa.cor}">${caixa.nome}</span>
            <span class="cost" style="color: #00ffff;">Custo: ${caixa.custo} Diamantes</span>
            <span class="desc">Abre uma skin aleatória.</span>
        `;

        btn.onclick = () => abrirCaixa(index);
        caixasContainer.appendChild(btn);
    });
}

function abrirCaixa(index) {
    const caixa = caixas[index];
    if (diamantes >= caixa.custo) {
        diamantes -= caixa.custo;
        playSound('rebirth'); // Som de caixa abrindo

        // Sorteio de Raridade
        const rand = Math.random() * 100;
        let raridadeGanha = 'comum';

        // Modificador de sorte baseado na caixa (caixas mais caras aumentam as chances de raridades altas)
        // Reduzimos o custo da sorte bruta, mas multiplicamos a chance base pelas caixas
        let chanceM = raridades['mitico'].chance * (1 + index * 0.5);
        let chanceL = raridades['lendario'].chance * (1 + index * 0.5) + chanceM;
        let chanceE = raridades['epico'].chance * (1 + index * 0.5) + chanceL;
        let chanceR = raridades['raro'].chance * (1 + index * 0.5) + chanceE;
        let chanceI = raridades['incomum'].chance * (1 + index * 0.5) + chanceR;

        if (rand <= chanceM) raridadeGanha = 'mitico';
        else if (rand <= chanceL) raridadeGanha = 'lendario';
        else if (rand <= chanceE) raridadeGanha = 'epico';
        else if (rand <= chanceR) raridadeGanha = 'raro';
        else if (rand <= chanceI) raridadeGanha = 'incomum';

        // Filtrar equipamentos do BD com essa raridade
        const equipsPossiveis = Object.values(equipamentosDB).filter(eq => eq.raridade === raridadeGanha);
        if (equipsPossiveis.length === 0) {
            // Fallback se não houver da raridade
            raridadeGanha = 'comum';
        }

        const equipsFinais = Object.values(equipamentosDB).filter(eq => eq.raridade === raridadeGanha);
        const eqGanho = equipsFinais[Math.floor(Math.random() * equipsFinais.length)];

        // Efeito visual
        criarParticulas(50, canvas.width/2, canvas.height/2, true);

        inventario.push(eqGanho.id);

        atualizarUI();
        renderizarInventario();
        alert(`Você abriu a ${caixa.nome} e ganhou: ${eqGanho.nome} (${raridadeGanha})!`);
    } else {
        alert('Diamantes insuficientes!');
    }
}

function renderizarInventario() {
    const equipadosContainer = document.getElementById('equipados-container');
    const mochilaContainer = document.getElementById('mochila-container');
    const filterSelect = document.getElementById('inv-filter');

    if (!equipadosContainer || !mochilaContainer) return;

    equipadosContainer.innerHTML = '';
    mochilaContainer.innerHTML = '';

    const criarCardItem = (eqId, isEquipped) => {
        const eq = equipamentosDB[eqId];
        if (!eq) return null;

        const card = document.createElement('div');
        card.className = `inv-item rarity-${eq.raridade} ${isEquipped ? 'equipped' : ''}`;

        let statsStr = '';
        const mult = raridades[eq.raridade].multi;
        if (eq.stats.click) statsStr += `C:${eq.stats.click * mult} `;
        if (eq.stats.passiva) statsStr += `P:${eq.stats.passiva * mult} `;
        if (eq.stats.dano) statsStr += `D:${eq.stats.dano * mult} `;

        card.innerHTML = `
            <div class="item-name" style="color: ${raridades[eq.raridade].cor}">${eq.nome}</div>
            <div style="font-size: 0.4rem; color: #888;">Multi: ${mult}x<br>${statsStr}</div>
        `;

        card.onclick = () => {
            if (isEquipped) {
                // Desequipar
                delete equipamentosEquipados[eq.tipo];
            } else {
                // Equipar
                equipamentosEquipados[eq.tipo] = eq.id;
            }
            playSound('click');
            renderizarInventario();
            atualizarUI();
        };

        return card;
    };

    // Renderizar Equipados
    Object.values(equipamentosEquipados).forEach(eqId => {
        if (eqId) {
            const card = criarCardItem(eqId, true);
            if (card) equipadosContainer.appendChild(card);
        }
    });

    // Renderizar Mochila
    let itemsMochila = inventario.filter(id => !Object.values(equipamentosEquipados).includes(id));

    // Ordenação
    if (filterSelect && filterSelect.value === 'alpha') {
        itemsMochila.sort((a, b) => equipamentosDB[a].nome.localeCompare(equipamentosDB[b].nome));
    } else {
        // Por Raridade
        const raridadeRank = { 'mitico': 6, 'lendario': 5, 'epico': 4, 'raro': 3, 'incomum': 2, 'comum': 1 };
        itemsMochila.sort((a, b) => raridadeRank[equipamentosDB[b].raridade] - raridadeRank[equipamentosDB[a].raridade]);
    }

    itemsMochila.forEach(eqId => {
        const card = criarCardItem(eqId, false);
        if (card) mochilaContainer.appendChild(card);
    });
}

function ganharXP(amount) {
    xp += amount;
    while (xp >= xpMax) {
        xp -= xpMax;
        level++;
        xpMax = Math.floor(xpMax * 1.5);
        // Podia adicionar som de level up aqui
    }
}

function atualizarUI() {
    // Formatar números grandes
    const formatNumber = (num) => {
        if (num < 1000) return Math.floor(num);
        if (num < 1e6) return (num / 1000).toFixed(1) + 'k';
        if (num < 1e9) return (num / 1e6).toFixed(2) + 'M';
        if (num < 1e12) return (num / 1e9).toFixed(2) + 'B';
        return num.toExponential(2);
    };

    const statsEq = calcularStatsEquipamentos();

    manaDisplay.textContent = formatNumber(mana);
    manaPerSecDisplay.textContent = formatNumber((manaPassiva + statsEq.bonusPassiva) * multiplicadorPrestige);
    prestigeDisplay.textContent = multiplicadorPrestige;

    levelDisplay.textContent = level;
    xpDisplay.textContent = formatNumber(xp);
    xpMaxDisplay.textContent = formatNumber(xpMax);
    diamondsDisplay.textContent = formatNumber(diamantes);

    // Lógica do botão de Renascer e barra de progresso
    const rebirthCost = 1e12;
    let percentage = (mana / rebirthCost) * 100;
    if (percentage > 100) percentage = 100;

    rebirthProgressBar.style.width = percentage + '%';
    rebirthPercentage.textContent = percentage.toFixed(1) + '%';

    if (mana >= rebirthCost) {
        rebirthBtn.disabled = false;
    } else {
        rebirthBtn.disabled = true;
    }
}

// Variáveis globais
let mana = 0;
let manaPorClique = 1;
let manaPassiva = 0;
let multiplicadorPrestige = 1;
let elementoSelecionado = null;
let lastTime = 0;

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
const upgradesContainer = document.getElementById('upgrades-container');

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

// Inicialização
window.onload = () => {
    configurarEventosSelecao();
    configurarCliqueMago();
    configurarRebirth();
    carregarJogo();

    // Auto-save a cada 10 segundos
    setInterval(salvarJogo, 10000);
};

function configurarRebirth() {
    rebirthBtn.addEventListener('click', renascer);
}

function renascer() {
    if (mana >= 1e12) {
        playSound('rebirth');
        multiplicadorPrestige *= 3;
        // Reset progresso
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
        upgrades: upgrades.map(up => up.nivel)
    };
    localStorage.setItem('magosSave', JSON.stringify(dados));
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

            if (dados.upgrades) {
                dados.upgrades.forEach((nivel, index) => {
                    if (upgrades[index]) upgrades[index].nivel = nivel;
                });
            }

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

function cliqueNoMago(x, y) {
    const ganho = manaPorClique * multiplicadorPrestige;
    mana += ganho;

    playSound('click');
    animarMagoPulo();
    criarParticulas(15, x, y);
    criarFloatingText(`+${ganho}`, x, y);
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

    desenharFundo();
    desenharMago();
    atualizarParticulas();
    atualizarFloatingTexts();

    // Animação do pulso do mago
    if (pulsoMago > 0) {
        pulsoMago -= deltaTime * 0.01;
        if (pulsoMago < 0) pulsoMago = 0;
    }
    magoScale = 1 + pulsoMago * 0.2;

    // Passiva (calculada baseada no tempo real para ser independente de FPS)
    mana += (manaPassiva * multiplicadorPrestige) * (deltaTime / 1000);

    atualizarUI();
    atualizarLojaUI();

    requestAnimationFrame(gameLoop);
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

function desenharMago() {
    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2;

    ctx.save();
    ctx.translate(centroX, centroY);

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
    const W_D = '#d3d3d3'; // White Dark/Beard shadow
    const B = '#000000'; // Black/Eyes
    const T = C; // Staff color matching element color (as requested)
    const T_D = D; // Staff dark matching element shadow
    const X = null; // Vazio

    // Matriz 16x16 que desenha o mago
    const sprite = [
        [X, X, X, X, X, X, X, C, C, C, X, X, X, X, X, X],
        [X, X, X, X, X, C, C, C, C, L, C, C, X, X, X, X],
        [X, X, X, X, C, C, C, C, C, C, L, C, C, X, X, X],
        [X, X, X, X, C, C, S, S, S, S, S, C, C, C, X, X],
        [X, L, X, X, C, S, B, S, B, S, W, C, C, X, X, X],
        [X, L, L, X, C, S, S, S, S, S, W, W, C, C, X, X],
        [X, T, X, X, X, W, W, W, W, W, W, C, C, X, X, X],
        [X, T, X, X, X, W, W, W, W, W, C, C, C, X, X, X],
        [X, S, S, X, C, W, W, W, W, D, C, C, X, X, X, X],
        [X, T, T, C, C, W, W, W, D, D, C, C, C, X, X, X],
        [X, T, X, C, C, C, W, W, D, C, C, L, C, X, X, X],
        [X, T, X, D, C, C, W, C, D, C, C, L, C, X, X, X],
        [X, T, T, D, D, C, C, C, D, D, C, C, S, S, X, X],
        [X, T, X, X, C, C, C, C, C, C, D, X, X, X, X, X],
        [T, T, X, X, X, C, C, C, C, C, D, X, X, X, X, X],
        [T, X, X, X, X, C, C, C, C, C, D, X, X, X, X, X]
    ];

    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const cor = sprite[y][x];
            if (cor !== null) {
                ctx.fillStyle = cor;
                ctx.fillRect(offsetX + x * ps, offsetY + y * ps, ps, ps);
            }
        }
    }

    ctx.restore();
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

function atualizarUI() {
    // Formatar números grandes
    const formatNumber = (num) => {
        if (num < 1000) return Math.floor(num);
        if (num < 1e6) return (num / 1000).toFixed(1) + 'k';
        if (num < 1e9) return (num / 1e6).toFixed(2) + 'M';
        if (num < 1e12) return (num / 1e9).toFixed(2) + 'B';
        return num.toExponential(2);
    };

    manaDisplay.textContent = formatNumber(mana);
    manaPerSecDisplay.textContent = formatNumber(manaPassiva * multiplicadorPrestige);
    prestigeDisplay.textContent = multiplicadorPrestige;

    // Mostrar/Esconder botão de rebirth
    if (mana >= 1e12) {
        rebirthBtn.classList.remove('hidden');
    } else {
        rebirthBtn.classList.add('hidden');
    }
}

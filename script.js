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


// --- SISTEMA DE VOZ (Web Speech API) ---
let vozes = [];
let vozMago = null;
let audioHabilitado = false;

function initSpeech() {
    if ('speechSynthesis' in window) {
        // As vozes podem carregar de forma assíncrona
        vozes = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            vozes = window.speechSynthesis.getVoices();
            selecionarVozMago();
        };
        selecionarVozMago();
    }
}

function selecionarVozMago() {
    // Tenta pegar uma voz em português profundo ou inglês robótico/profundo
    vozMago = vozes.find(v => v.lang.includes('pt') && (v.name.includes('Google') || v.name.includes('Luciana'))) ||
              vozes.find(v => v.lang.includes('pt')) ||
              vozes[0];
}

function falar(texto, pitch = 0.5, rate = 0.8) {
    if (!audioHabilitado || !('speechSynthesis' in window)) return;

    // Cancela a fala anterior para não sobrepor longamente (opcional)
    // window.speechSynthesis.cancel();

    const utterThis = new SpeechSynthesisUtterance(texto);
    if (vozMago) {
        utterThis.voice = vozMago;
    }

    // Configurações para soar como um mago antigo
    utterThis.pitch = pitch; // Mais grave
    utterThis.rate = rate;   // Mais lento
    utterThis.volume = 1;

    window.speechSynthesis.speak(utterThis);
}

function iniciarIntroducao() {
    const introScreen = document.getElementById('intro-screen');
    introScreen.style.display = 'none';
    audioHabilitado = true;

    falar("Saudações, aprendiz... Bem-vindo ao Clicker de Magos Elementais.", 0.4, 0.7);
    setTimeout(() => {
        falar("Seu objetivo é canalizar o poder dos elementos. Acumule mana, evolua seus feitiços, e derrote os mestres das masmorras...", 0.4, 0.8);
    }, 4000);
}
// ---------------------------------------

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

// Poderes
const poderesDB = {
    'bola_fogo': { id: 'bola_fogo', nome: 'Bola de Fogo', tipo: 'poder', raridade: 'comum', elemento: 'fogo', stats: { dano: 5 } },
    'rajada_agua': { id: 'rajada_agua', nome: 'Rajada de Água', tipo: 'poder', raridade: 'comum', elemento: 'agua', stats: { dano: 5 } },
    'sopro_vento': { id: 'sopro_vento', nome: 'Sopro de Vento', tipo: 'poder', raridade: 'comum', elemento: 'ar', stats: { dano: 5 } },
    'choque': { id: 'choque', nome: 'Choque', tipo: 'poder', raridade: 'comum', elemento: 'eletricidade', stats: { dano: 5 } },
    'pedrada': { id: 'pedrada', nome: 'Pedrada', tipo: 'poder', raridade: 'comum', elemento: 'terra', stats: { dano: 5 } },
    'raio_luz': { id: 'raio_luz', nome: 'Raio de Luz', tipo: 'poder', raridade: 'comum', elemento: 'luz', stats: { dano: 5 } },

    // Nível 5+ poderes
    'explosao_solar': { id: 'explosao_solar', nome: 'Explosão Solar', tipo: 'poder', raridade: 'incomum', elemento: 'fogo', stats: { dano: 15 } },
    'tsunami': { id: 'tsunami', nome: 'Tsunami', tipo: 'poder', raridade: 'incomum', elemento: 'agua', stats: { dano: 15 } },

    // Poderes de lootbox
    'chuva_meteoros': { id: 'chuva_meteoros', nome: 'Chuva de Meteoros', tipo: 'poder', raridade: 'lendario', elemento: 'fogo', stats: { dano: 100 } },
    'julgamento_divino': { id: 'julgamento_divino', nome: 'Julgamento Divino', tipo: 'poder', raridade: 'mitico', elemento: 'luz', stats: { dano: 500 } }
};

let poderesInventario = []; // IDs de poderes que o jogador possui
let poderesEquipados = [null, null, null, null]; // IDs dos 4 poderes equipados

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

let estadoAnimacaoCaixa = {
    ativa: false,
    tempoAtual: 0,
    tempoMax: 2500, // 2.5s para tremer
    fase: 0, // 0 = tremendo, 1 = aberto
    material: '',
    itemSorteado: null,
    raridadeGanha: '',
    isPoder: false
};

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
let turnoJogador = true;
let hpMagoBatalha = 100;
let maxHpMagoBatalha = 100;
let salaAtual = 1;
let salaTipo = 'monstro'; // 'monstro' ou 'evento'
let opcoesEvento = [];
let buffsAventura = {
    tiroDuplo: false
};

const dungeons = [
    { id: 'floresta', nome: 'Floresta Sombria', nivelReq: 1, hpMonstro: 50, danoMonstro: 5, bg: '#002200', monstros: ['Goblin', 'Slime', 'Lobo'], recompensaMana: 100, recompensaXP: 50, boss: { nome: 'Rei Goblin', hp: 500, dano: 15, cor: '#004400' } },
    { id: 'caverna', nome: 'Caverna de Cristal', nivelReq: 3, hpMonstro: 250, danoMonstro: 15, bg: '#000033', monstros: ['Golem', 'Morcego', 'Esqueleto'], recompensaMana: 1000, recompensaXP: 200, boss: { nome: 'Golem Guardião', hp: 2500, dano: 45, cor: '#444444' } },
    { id: 'castelo', nome: 'Castelo Abandonado', nivelReq: 5, hpMonstro: 1500, danoMonstro: 50, bg: '#220000', monstros: ['Vampiro', 'Fantasma', 'Gárgula'], recompensaMana: 5000, recompensaXP: 1000, dropCaixa: 'c1', boss: { nome: 'Lorde Vampiro', hp: 15000, dano: 150, cor: '#880000' } },
    { id: 'vazio', nome: 'O Vazio Ancestral', nivelReq: 10, hpMonstro: 10000, danoMonstro: 300, bg: '#110022', monstros: ['Sombra', 'Anomalia', 'Eco'], recompensaMana: 50000, recompensaXP: 5000, dropCaixa: 'c2', boss: { nome: 'Deus do Vazio', hp: 100000, dano: 1000, cor: '#4b0082' } }
];

function logBatalha(msg) {
    const log = document.getElementById('batalha-log');
    if (log) {
        log.innerHTML = msg;
    }
}

// Inicialização
window.onload = () => {

    const introBtn = document.getElementById('start-intro-btn');
    if (introBtn) {
        introBtn.addEventListener('click', () => {
            // Se já tem save, oculta seleção. Se não, oculta só o intro.
            initSpeech();
            iniciarIntroducao();
            // A tela de seleção já é visível por baixo
        });
    }

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
        equipamentosEquipados,
        poderesInventario,
        poderesEquipados
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
            if (dados.poderesInventario) poderesInventario = dados.poderesInventario;
            if (dados.poderesEquipados) poderesEquipados = dados.poderesEquipados;

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

// Modo aventura agora é por turnos (batalha)
function renderizarBatalhaUI() {
    const container = document.getElementById('poderes-batalha-container');
    if (!container) return;

    container.innerHTML = '';

    if (salaTipo === 'evento') {
        container.style.gridTemplateColumns = '1fr';

        opcoesEvento.forEach((opcao, index) => {
            const btn = document.createElement('button');
            btn.className = 'upgrade-btn';
            btn.style.padding = '10px';
            btn.style.marginBottom = '5px';
            btn.style.borderColor = '#d4af37'; // Ouro

            btn.innerHTML = `
                <span style="font-size: 0.6rem; color: #d4af37">${opcao.nome}</span><br>
                <span style="font-size: 0.5rem; color: #aaa;">${opcao.desc}</span>
            `;

            btn.onclick = () => {
                escolherEvento(index);
            };

            container.appendChild(btn);
        });

    } else {
        container.style.gridTemplateColumns = '1fr 1fr';

        // Calcula dano base dos equipamentos
        let danoBaseEquip = 0;
        Object.values(equipamentosEquipados).forEach(eqId => {
            const eq = equipamentosDB[eqId];
            if (eq && eq.stats && eq.stats.dano) {
                const mult = raridades[eq.raridade] ? raridades[eq.raridade].multi : 1;
                danoBaseEquip += (eq.stats.dano * mult);
            }
        });

        poderesEquipados.forEach((pid) => {
            const btn = document.createElement('button');
            btn.className = 'upgrade-btn';
            btn.style.padding = '5px';

            if (pid) {
                const poder = poderesDB[pid];
                const mult = raridades[poder.raridade] ? raridades[poder.raridade].multi : 1;
                let danoTotal = Math.floor((poder.stats.dano * mult + danoBaseEquip) * multiplicadorPrestige);

                btn.style.borderColor = raridades[poder.raridade] ? raridades[poder.raridade].cor : '#fff';
                btn.innerHTML = `
                    <span style="font-size: 0.6rem; color: ${btn.style.borderColor}">${poder.nome}</span><br>
                    <span style="font-size: 0.5rem; color: #ff5555;">Dano: ${danoTotal}</span>
                `;
                btn.onclick = () => turnoAtaqueMago(danoTotal, poder.nome, poder.elemento);

                if (!turnoJogador) {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            } else {
                btn.innerHTML = `<span style="font-size: 0.5rem; color: #555;">Vazio</span>`;
                btn.disabled = true;
            }
            container.appendChild(btn);
        });

        // Adicionar um ataque básico caso não tenha poderes
        const temPoder = poderesEquipados.some(p => p !== null);
        if (!temPoder) {
            const btnBasico = document.createElement('button');
            btnBasico.className = 'upgrade-btn';
            let danoBasico = Math.floor((1 + danoBaseEquip) * multiplicadorPrestige);
            btnBasico.innerHTML = `<span style="font-size: 0.6rem;">Ataque Básico</span><br><span style="font-size: 0.5rem; color: #ff5555;">Dano: ${danoBasico}</span>`;
            btnBasico.onclick = () => turnoAtaqueMago(danoBasico, "Ataque Básico", 'fisico');
            if (!turnoJogador) btnBasico.disabled = true;
            container.appendChild(btnBasico);
        }
    }

    renderizarMapaAventura();
}

function renderizarMapaAventura() {
    let mapaContainer = document.getElementById('mapa-aventura');

    if (!mapaContainer) {
        // Cria a div do mapa se não existir
        const botoesAventura = document.getElementById('poderes-batalha-container').parentNode;
        mapaContainer = document.createElement('div');
        mapaContainer.id = 'mapa-aventura';
        mapaContainer.style.marginTop = '15px';
        mapaContainer.style.textAlign = 'center';
        mapaContainer.style.fontFamily = '"Press Start 2P", cursive';
        mapaContainer.style.fontSize = '0.5rem';
        mapaContainer.style.color = '#fff';
        mapaContainer.style.display = 'flex';
        mapaContainer.style.alignItems = 'center';
        mapaContainer.style.justifyContent = 'center';
        mapaContainer.style.gap = '5px';

        // Inserir antes do botão de fuga
        botoesAventura.insertBefore(mapaContainer, document.getElementById('btn-leave-adventure'));
    }

    mapaContainer.innerHTML = '';

    // Mostrar as próximas 5 salas
    const inicioBloco = Math.floor((salaAtual - 1) / 5) * 5 + 1;

    const titulo = document.createElement('div');
    titulo.innerText = 'Mapa: ';
    titulo.style.marginRight = '5px';
    mapaContainer.appendChild(titulo);

    for (let i = 0; i < 5; i++) {
        const numSala = inicioBloco + i;
        const icon = document.createElement('div');
        icon.style.width = '15px';
        icon.style.height = '15px';
        icon.style.display = 'inline-block';
        icon.style.border = '1px solid #555';

        if (numSala % 10 === 0) {
            // Boss
            icon.style.backgroundColor = '#aa00ff'; // Roxo/Magenta
            icon.style.borderRadius = '50%';
            icon.title = 'Chefe de Camada';
            icon.style.width = '20px'; // Boss icon slightly bigger
            icon.style.height = '20px';
        } else if (numSala % 5 === 0) {
            // Evento/Baú
            icon.style.backgroundColor = '#d4af37'; // Dourado
            icon.title = 'Área de Descanso';
        } else {
            // Monstro
            icon.style.backgroundColor = '#ff5555'; // Vermelho
            icon.title = 'Monstro';
        }

        if (numSala === salaAtual) {
            icon.style.border = '2px solid #fff';
            icon.style.boxShadow = '0 0 5px #fff';
            icon.style.transform = 'scale(1.2)';
        } else if (numSala < salaAtual) {
            icon.style.opacity = '0.3';
        }

        mapaContainer.appendChild(icon);

        if (i < 4) {
            const traco = document.createElement('div');
            traco.style.width = '10px';
            traco.style.height = '2px';
            traco.style.backgroundColor = '#555';
            mapaContainer.appendChild(traco);
        }
    }
}

let projeteisAtaque = []; // Array para guardar as animações de ataque

function turnoAtaqueMago(dano, nomePoder, elementoPoder) {
    if (!monstroAtual || !turnoJogador || animacaoMagoMovendo) return;

    turnoJogador = false;
    animacaoMagoAtacando = 10;
    playSound('click');

    // Web Speech API: Falar o nome do feitiço
    falar(nomePoder + "!", 0.6, 0.9);

    // Iniciar animação do projetil/ataque, que lidará com o dano e a vez do monstro depois.
    const startX = xMagoAventura + 16;
    const startY = canvas.height / 2;
    const endX = xMonstro;
    const endY = canvas.height / 2;

    let temTiroDuplo = buffsAventura.tiroDuplo;

    if (temTiroDuplo) {
        criarAnimacaoAtaque(elementoPoder, startX, startY - 10, endX, endY - 10, dano, nomePoder, false);
        setTimeout(() => {
            if (monstroAtual) {
                playSound('click');
                criarAnimacaoAtaque(elementoPoder, startX, startY + 10, endX, endY + 10, dano, nomePoder, true);
            }
        }, 200); // Lança o segundo tiro com delay
    } else {
        criarAnimacaoAtaque(elementoPoder, startX, startY, endX, endY, dano, nomePoder, true);
    }
}

let monstroMorrendo = false;

function aplicarDanoMonstro(dano, nomePoder, isUltimo) {
    if (!monstroAtual || monstroMorrendo) return;

    monstroAtual.hp -= dano;

    logBatalha(`Você usou <b>${nomePoder}</b> e causou <b>${dano}</b> de dano!`);

    particulasDano.push({
        texto: `-${dano}`,
        x: xMonstro + Math.random() * 20 - 10,
        y: canvas.height / 2 - 20,
        vy: -2,
        vida: 30
    });

    renderizarBatalhaUI();

    if (monstroAtual.hp <= 0) {
        monstroMorrendo = true;
        setTimeout(monstroDerrotado, 500);
    } else if (isUltimo) {
        // Turno do monstro só se for o ultimo hit do ataque
        setTimeout(turnoAtaqueMonstro, 500);
    }
}

function criarAnimacaoAtaque(elemento, xStart, yStart, xEnd, yEnd, dano, nomePoder, isUltimo = true) {
    let tipoAnimacao = 'projetil';
    let corPrincipal = '#fff';

    if (elemento === 'fogo') corPrincipal = '#ff5500';
    else if (elemento === 'agua') corPrincipal = '#00aaff';
    else if (elemento === 'ar') corPrincipal = '#aaffff';
    else if (elemento === 'eletricidade') corPrincipal = '#ffff00';
    else if (elemento === 'terra') corPrincipal = '#8b4513';
    else if (elemento === 'luz') corPrincipal = '#ffffff';
    else if (elemento === 'fisico') corPrincipal = '#aaaaaa';

    if (elemento === 'eletricidade') {
        tipoAnimacao = 'raio';
    } else if (elemento === 'ar') {
        tipoAnimacao = 'vento';
    }

    projeteisAtaque.push({
        x: xStart,
        y: yStart,
        targetX: xEnd,
        targetY: yEnd,
        elemento: elemento,
        cor: corPrincipal,
        tipo: tipoAnimacao,
        progresso: 0,
        dano: dano,
        nomePoder: nomePoder,
        isUltimo: isUltimo,
        rastro: [] // para guardar rastro de fogo/água
    });
}

function turnoAtaqueMonstro() {
    if (!monstroAtual || animacaoMagoMovendo) return;

    let danoM = monstroAtual.dano || aventuraAtual.danoMonstro || 5;

    // Um pouco de variação no dano
    danoM = Math.floor(danoM * (0.8 + Math.random() * 0.4));
    if (danoM < 1) danoM = 1;

    hpMagoBatalha -= danoM;

    playSound('click'); // idealmente som de hit no player
    logBatalha(`<b>${monstroAtual.nome}</b> atacou e causou <b>${danoM}</b> de dano!`);

    particulasDano.push({
        texto: `-${danoM}`,
        x: xMagoAventura + Math.random() * 20 - 10,
        y: canvas.height / 2 - 20,
        vy: -2,
        vida: 30,
        cor: '#ff0000'
    });

    // Simular pulo do monstro
    xMonstro -= 20;
    setTimeout(() => { xMonstro += 20; }, 100);

    if (hpMagoBatalha <= 0) {
        setTimeout(() => {
            logBatalha("Você foi derrotado e fugiu da batalha...");
            sairAventura();
        }, 1500);
    } else {
        turnoJogador = true;
        renderizarBatalhaUI();
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

    if (!loaded) {
        // Dar um poder inicial básico correspondente ao elemento selecionado
        const poderesIniciais = Object.values(poderesDB).filter(p => p.raridade === 'comum' && p.elemento === elementoSelecionado);
        if (poderesIniciais.length > 0 && poderesInventario.length === 0) {
            poderesInventario.push(poderesIniciais[0].id);
        }
    }

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

    // Sobrepor a animação da caixa se estiver ativa
    if (estadoAnimacaoCaixa.ativa) {
        desenharAnimacaoCaixa(deltaTime);
    }

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

    // Desenhar o mago baseado na referência em 32x32 pixel art scale
    const ps = 4; // pixel size
    const offsetX = -16 * ps; // Centralizar
    const offsetY = -16 * ps;

    const C = coresElemento[elementoSelecionado]; // Cor principal do elemento
    const D = ajustarCor(C, 0.7); // Cor escura do elemento (sombra)
    const L = ajustarCor(C, 1.3); // Cor clara do elemento (brilho)

    const Y = '#ffd700'; // Amarelo (faixa do chapéu)
    const S = '#f4a460'; // Skin/Pele
    const S_D = '#cd853f'; // Skin Dark
    const W = '#ffffff'; // White/Beard
    const B = '#000000'; // Black/Eyes
    const X = null; // Vazio

    // Colors derived from equipments
    const hatEq = equipamentosDB[equipamentosEquipados.hat];
    const robeEq = equipamentosDB[equipamentosEquipados.robe];
    const staffEq = equipamentosDB[equipamentosEquipados.staff];

    // Primary color should always be the element color
    const HC = C; // Hat color
    const RC = C; // Robe color

    const HC_D = D;
    const RC_D = D;

    // Highlight colors come from the equipment's rarity/definition
    const HH = hatEq ? raridades[hatEq.raridade].cor : L;
    const RH = robeEq ? raridades[robeEq.raridade].cor : L;
    const SH = staffEq ? raridades[staffEq.raridade].cor : L;
    const SC = '#3e2723'; // Base de madeira escura para o cajado
    const SC_D = '#1e110c';

    // A base marrom que o usuário quer para a roupa e chapéu básicos:
    const BR = '#8b4513'; // Brown (Marrom)
    const BR_D = '#5c2e0b'; // Brown Dark

    // As cores do chapéu e da roupa dependem se há um item equipado diferente ou não.
    // O chapéu e a roupa básicos agora forçam ser marrom.
    let HC_Final = (equipamentosEquipados.hat === 'chapeu_basico') ? BR : HC;
    let RC_Final = (equipamentosEquipados.robe === 'roupa_basica') ? BR : RC;
    let RC_Dark_Final = (equipamentosEquipados.robe === 'roupa_basica') ? BR_D : RC_D;

    const makeGrid = () => {
        let grid = [];
        for(let i=0; i<32; i++) grid.push(new Array(32).fill(X));
        return grid;
    };

    // Layer 1: Body / Head (Base, Face & Beard)
    const bodySprite = makeGrid();
    for(let x=13; x<=21; x++) bodySprite[13][x] = S;
    bodySprite[14][13]=S; bodySprite[14][14]=S; bodySprite[14][15]=B; bodySprite[14][16]=S; bodySprite[14][17]=S; bodySprite[14][18]=S; bodySprite[14][19]=B; bodySprite[14][20]=S; bodySprite[14][21]=S;
    for(let x=13; x<=21; x++) bodySprite[15][x] = S;
    for(let x=13; x<=21; x++) bodySprite[16][x] = W;
    for(let x=13; x<=21; x++) bodySprite[17][x] = W;
    bodySprite[18][14]=W; bodySprite[18][15]=W; bodySprite[18][16]=W; bodySprite[18][17]=W; bodySprite[18][18]=W; bodySprite[18][19]=W; bodySprite[18][20]=W;
    bodySprite[19][15]=W; bodySprite[19][16]=W; bodySprite[19][17]=W; bodySprite[19][18]=W; bodySprite[19][19]=W;
    bodySprite[20][16]=W; bodySprite[20][17]=W; bodySprite[20][18]=W;
    bodySprite[21][16]=W; bodySprite[21][17]=W; bodySprite[21][18]=W;

    // Layer 2: Robe
    let robeSprite = makeGrid();
    robeSprite[18][13]=RC_Final; robeSprite[18][21]=RC_Final;
    robeSprite[19][12]=RC_Final; robeSprite[19][13]=RC_Final; robeSprite[19][20]=RC_Final; robeSprite[19][21]=RC_Final;
    robeSprite[20][12]=RC_Final; robeSprite[20][13]=RC_Final; robeSprite[20][14]=RC_Final; robeSprite[20][19]=RC_Final; robeSprite[20][20]=RC_Final; robeSprite[20][21]=RC_Final;
    robeSprite[21][13]=RC_Final; robeSprite[21][14]=RC_Final; robeSprite[21][15]=RC_Final; robeSprite[21][19]=RC_Final; robeSprite[21][20]=RC_Final; robeSprite[21][21]=RC_Final;
    for(let y=22; y<=30; y++) {
      robeSprite[y][14]=RC_Final; robeSprite[y][15]=RC_Final; robeSprite[y][19]=RC_Final; robeSprite[y][20]=RC_Final;
      robeSprite[y][17] = RH; // faixa central recebe a cor de highlight/raridade da roupa
      robeSprite[y][16] = RC_Dark_Final; robeSprite[y][18] = RC_Dark_Final;
    }
    // Braço esquerdo segurando cajado
    robeSprite[21][11]=RC_Final; robeSprite[21][12]=RC_Final;
    robeSprite[22][11]=RC_Final; robeSprite[22][12]=RC_Final;
    // Mão
    bodySprite[21][9]=S; bodySprite[21][10]=S;
    bodySprite[22][9]=S; bodySprite[22][10]=S;
    // Pés
    robeSprite[31][13]=RC_Dark_Final; robeSprite[31][14]=RC_Dark_Final; robeSprite[31][15]=RC_Dark_Final;
    robeSprite[31][19]=RC_Dark_Final; robeSprite[31][20]=RC_Dark_Final; robeSprite[31][21]=RC_Dark_Final;


    // Layer 3: Hat
    let hatSprite = makeGrid();
    if (equipamentosEquipados.hat === 'coroa_rei') {
        hatSprite[11][14] = HH; hatSprite[11][16] = HH; hatSprite[11][18] = HH; hatSprite[11][20] = HH;
        for(let x=14; x<=20; x++) hatSprite[12][x] = HC_Final;
    } else {
        hatSprite[4][14] = HC_Final; hatSprite[4][15] = HC_Final; hatSprite[4][16] = HC_Final; hatSprite[4][17] = HC_Final; hatSprite[4][18] = HC_Final;
        hatSprite[5][12] = HC_Final; hatSprite[5][13] = HC_Final; hatSprite[5][14] = HC_Final; hatSprite[5][15] = HC_Final; hatSprite[5][16] = HC_Final; hatSprite[5][17] = HC_Final;
        hatSprite[6][15] = HC_Final; hatSprite[6][16] = HC_Final; hatSprite[6][17] = HC_Final; hatSprite[6][18] = HC_Final;
        hatSprite[7][15] = HC_Final; hatSprite[7][16] = HC_Final; hatSprite[7][17] = HC_Final; hatSprite[7][18] = HC_Final; hatSprite[7][19] = HC_Final;
        hatSprite[8][15] = HC_Final; hatSprite[8][16] = HC_Final; hatSprite[8][17] = HC_Final; hatSprite[8][18] = HC_Final; hatSprite[8][19] = HC_Final;
        hatSprite[9][14] = HC_Final; hatSprite[9][15] = HC_Final; hatSprite[9][16] = HC_Final; hatSprite[9][17] = HC_Final; hatSprite[9][18] = HC_Final; hatSprite[9][19] = HC_Final; hatSprite[9][20] = HC_Final;
        hatSprite[10][14] = B; hatSprite[10][15] = HH; hatSprite[10][16] = HH; hatSprite[10][17] = HH; hatSprite[10][18] = HH; hatSprite[10][19] = B; hatSprite[10][20] = B;
        hatSprite[11][14] = B; hatSprite[11][15] = HH; hatSprite[11][16] = HH; hatSprite[11][17] = HH; hatSprite[11][18] = HH; hatSprite[11][19] = B; hatSprite[11][20] = B;
        for(let x=10; x<=24; x++) hatSprite[12][x] = HC_Final;
    }

    // Layer 4: Staff
    const staffSprite = makeGrid();
    for(let y=10; y<=31; y++) {
      staffSprite[y][8] = SC; staffSprite[y][9] = SC;
    }
    // the staff zig-zag
    staffSprite[15][8] = X; staffSprite[15][10] = SC;
    staffSprite[16][8] = X; staffSprite[16][10] = SC;
    staffSprite[17][8] = X; staffSprite[17][10] = SC;

    // Staff top (Cristal/Orbe dependendo do cajado, mas seguindo a paleta de highlight)
    staffSprite[8][8]=HH; staffSprite[8][9]=HH;
    staffSprite[9][8]=HH; staffSprite[9][9]=HH;
    for(let x=7; x<=10; x++) { staffSprite[6][x]=SH; staffSprite[7][x]=SH; }

    // Magical particles based on element
    const P = C;
    staffSprite[2][8]=P; staffSprite[3][8]=P; staffSprite[2][9]=P; staffSprite[3][9]=P;
    staffSprite[4][5]=P; staffSprite[5][5]=P; staffSprite[4][6]=P; staffSprite[5][6]=P;
    staffSprite[2][12]=P; staffSprite[3][12]=P; staffSprite[2][13]=P; staffSprite[3][13]=P;
    staffSprite[6][12]=P; staffSprite[7][12]=P; staffSprite[6][13]=P; staffSprite[7][13]=P;

    // Draw all layers
    const drawSprite = (spriteLayer) => {
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
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

// Template para os inimigos/fantasmas (24x24 pixel art)
// 0: Transparente, 1: Olhos/Boca escuro, 2: Sombra Escura, 3: Sombra Clara, 4: Corpo (Cor dinâmica)
const monsterSprites = {
    'goblin': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 1, 1, 0, 0, 0],
        [1, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 1, 0, 0],
        [1, 4, 4, 4, 1, 4, 4, 4, '#ff0000', 4, 4, 1, 4, '#ff0000', 4, 4, 4, 1, 4, 4, 4, 1, 0, 0],
        [0, 1, 4, 4, 4, 1, 4, 4, '#ff0000', 4, 4, 1, 4, '#ff0000', 4, 4, 4, 1, 4, 4, 1, 0, 0, 0],
        [0, 0, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 4, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 1, 4, 4, 4, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 4, 4, 1, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 4, 4, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 4, 4, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 4, 1, 4, 4, 4, 4, 4, 1, 4, 4, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 0, 1, 4, 4, 4, 1, 0, 1, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    'slime': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 4, 4, 4, 4, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 4, 4, '#000000', '#000000', 4, 4, '#000000', '#000000', 4, 4, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 4, 4, 4, '#000000', '#000000', 4, 4, '#000000', '#000000', 4, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
        [0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0],
        [0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0],
        [0, 0, 1, 4, 4, 4, 1, 4, 4, 1, 4, 4, 4, 1, 4, 4, 1, 4, 4, 4, 4, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    'lobo': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 4, 4, 1, 0, 0, 0, 0, 1, 4, 4, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 0, 0, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 4, '#ff0000', 4, 4, 4, 4, 4, 4, 4, '#ff0000', 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 4, '#ff0000', 4, 4, 4, 4, 4, 4, 4, '#ff0000', 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, '#ffffff', 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, '#ffffff', '#000000', '#ffffff', 4, 4, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 4, 4, 4, '#ffffff', '#ffffff', '#ffffff', 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 1, 1, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 0, 0, 1, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 4, 1, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    'golem': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
        [0, 0, 1, 4, 4, 4, '#ffff00', '#ffff00', 4, 4, 4, 4, 4, 4, 4, 4, '#ffff00', '#ffff00', 4, 4, 1, 0, 0, 0],
        [0, 0, 1, 4, 4, 4, '#ffff00', '#ffff00', 4, 4, 4, 4, 4, 4, 4, 4, '#ffff00', '#ffff00', 4, 4, 1, 0, 0, 0],
        [0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
        [0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
        [0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 1, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 1, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 1, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 1, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 0, 1, 4, 4, 4, 1, 0, 1, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    'morcego': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 1, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 1, 0],
        [0, 1, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 1, 0],
        [0, 0, 1, 4, 4, 4, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 4, 4, 4, 1, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 0, 1, 4, 4, 4, 4, 1, 0, 1, 4, 4, 4, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 1, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, '#ff0000', 4, 4, 4, '#ff0000', 4, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 4, 1, 0, 0, 1, 4, 4, 4, '#ffffff', 4, 4, '#ffffff', 4, 1, 0, 0, 1, 4, 1, 0, 0],
        [0, 1, 4, 4, 4, 1, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 1, 4, 4, 4, 1, 0],
        [0, 1, 4, 4, 4, 4, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 4, 4, 4, 4, 1, 0],
        [0, 0, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    'esqueleto': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#000000', '#000000', '#ffffff', '#ffffff', '#000000', '#000000', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#000000', '#000000', '#ffffff', '#ffffff', '#000000', '#000000', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#000000', '#000000', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#000000', '#000000', '#000000', '#000000', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', 1, 1, '#ffffff', '#ffffff', 1, 1, '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', 1, 1, '#ffffff', '#ffffff', 1, 1, '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, '#ffffff', '#ffffff', 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', 1, 1, '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', 1, 0, 0, 1, '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    'vampiro': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#000000', '#ffffff', '#ffffff', '#000000', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, '#000000', '#000000', 1, '#000000', '#000000', '#000000', '#000000', 1, '#000000', '#000000', 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, '#000000', '#000000', '#000000', 1, 1, '#000000', '#000000', 1, 1, '#000000', '#000000', '#000000', 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, '#000000', '#000000', '#000000', 1, 1, '#000000', '#000000', 1, 1, '#000000', '#000000', '#000000', 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, '#000000', '#000000', '#000000', 1, 0, 0, 0, 0, 1, '#000000', '#000000', '#000000', 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, '#000000', '#000000', '#000000', 1, 0, 0, 0, 0, 1, '#000000', '#000000', '#000000', 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    'gargula': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 0, 0, 0],
        [0, 0, 1, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 1, 0, 0],
        [0, 0, 1, 4, 4, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 4, 4, 1, 0, 0],
        [0, 0, 1, 4, 4, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 4, 4, 4, 4, 1, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 4, 4, '#ff0000', 4, 4, 4, 4, '#ff0000', 4, 1, 4, 4, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 4, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 1, 4, 4, 4, '#ffffff', '#ffffff', '#ffffff', 4, 4, 1, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 4, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 4, 4, 1, 0, 0],
        [0, 0, 0, 1, 4, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 4, 4, 1, 0, 0],
        [0, 0, 1, 4, 4, 4, 4, 1, 0, 1, 4, 4, 4, 1, 1, 4, 4, 4, 1, 0, 1, 4, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 4, 4, 4, 1, 1, 4, 4, 4, 1, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 1, 1, 4, 4, 4, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 1, 0, 0, 1, 4, 4, 4, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    'deus_vazio': [
        [0, 0, 0, 0, '#800080', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '#800080', 0, 0, 0, 0],
        [0, 0, 0, '#800080', '#800080', '#800080', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '#800080', '#800080', '#800080', 0, 0, 0],
        [0, 0, '#800080', '#800080', '#800080', '#800080', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '#800080', '#800080', '#800080', '#800080', 0, 0],
        [0, 0, '#800080', '#800080', '#800080', '#800080', 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, '#800080', '#800080', '#800080', '#800080', 0, 0],
        [0, '#800080', '#800080', '#800080', '#800080', '#800080', 1, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 1, '#800080', '#800080', '#800080', '#800080', '#800080', 0],
        [0, '#800080', '#800080', '#800080', '#800080', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#800080', '#800080', '#800080', '#800080', 0],
        [0, '#800080', '#800080', '#800080', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#800080', '#800080', '#800080', 0],
        [0, '#800080', '#800080', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#800080', '#800080', 0],
        [0, '#800080', '#800080', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#000000', '#000000', '#000000', '#000000', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#800080', '#800080', 0],
        ['#800080', '#800080', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#000000', '#000000', '#000000', '#000000', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#800080', '#800080', '#800080', 0],
        ['#800080', '#800080', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#000000', '#000000', '#000000', '#000000', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#800080', '#800080', '#800080', 0],
        [0, '#800080', '#800080', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#000000', '#000000', '#000000', '#000000', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#800080', '#800080', 0],
        [0, '#800080', '#800080', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#800080', '#800080', 0],
        [0, '#800080', '#800080', '#800080', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#800080', '#800080', '#800080', 0],
        [0, '#800080', '#800080', '#800080', '#800080', 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, '#800080', '#800080', '#800080', '#800080', 0],
        [0, '#800080', '#800080', '#800080', '#800080', '#800080', 1, 1, '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', 1, 1, '#800080', '#800080', '#800080', '#800080', '#800080', 0],
        [0, 0, '#800080', '#800080', '#800080', '#800080', 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, '#800080', '#800080', '#800080', '#800080', 0, 0],
        [0, 0, '#800080', '#800080', '#800080', '#800080', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '#800080', '#800080', '#800080', '#800080', 0, 0],
        [0, 0, 0, '#800080', '#800080', '#800080', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '#800080', '#800080', '#800080', 0, 0, 0],
        [0, 0, 0, 0, '#800080', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '#800080', 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
};
const ghostSpriteTemplate = [
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,4,4,4,4,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0],
    [0,0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,1,1,4,4,1,1,4,4,4,1,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,1,1,4,4,1,1,4,4,4,1,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,3,1,1,4,4,1,1,3,4,4,1,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,3,4,4,4,4,4,4,3,4,4,1,0,0,0,0],
    [0,0,0,0,1,3,4,4,4,3,4,4,4,4,4,4,3,4,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,4,4,3,4,4,4,4,4,4,3,4,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,4,4,3,4,4,4,4,4,4,3,4,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,4,4,3,4,4,2,4,4,4,3,4,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,4,4,3,4,2,1,2,4,4,3,4,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,4,3,3,4,1,1,1,4,4,3,4,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,2,1,1,1,1,1,2,3,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,1,1,0,0,1,1,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

monsterSprites['fantasma'] = ghostSpriteTemplate;

function desenharMonstroSprite(centerX, centerY, size, baseColor, spriteKey) {
    const ps = size / 24; // Pixel size for the 24x24 matrix
    const startX = centerX - (size / 2);
    const startY = centerY - (size / 2);

    // Parse the HSL string (hsl(H, S%, L%)) into something we can manipulate
    // Or just use the baseColor for the body, and derived colors for shades.
    // For simplicity, we'll use baseColor for body.

    // Create dark and light variants of baseColor (rough approximation via globalAlpha/black)
    const spriteTemplate = monsterSprites[spriteKey] || monsterSprites['fantasma'];

    for (let y = 0; y < 24; y++) {
        for (let x = 0; x < 24; x++) {
            const val = spriteTemplate[y][x];
            if (val === 0) continue;

            let color = '';
            if (typeof val === 'string') {
                // If it's an explicit color hex string (e.g. '#ff0000')
                color = val;
            } else if (val === 1) {
                color = '#151525';
            } else if (val === 2) {
                color = '#1a1a2b';
                // Blend base color with dark shade
                ctx.fillStyle = baseColor;
                ctx.fillRect(startX + x * ps, startY + y * ps, ps, ps);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(startX + x * ps, startY + y * ps, ps, ps);
                continue;
            } else if (val === 3) {
                color = '#99a3bd';
                ctx.fillStyle = baseColor;
                ctx.fillRect(startX + x * ps, startY + y * ps, ps, ps);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fillRect(startX + x * ps, startY + y * ps, ps, ps);
                continue;
            } else if (val === 4) {
                color = baseColor;
            }

            ctx.fillStyle = color;
            ctx.fillRect(startX + x * ps, startY + y * ps, ps + 0.5, ps + 0.5); // +0.5 to prevent bleeding
        }
    }
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
    salaAtual = 1;
    salaTipo = 'monstro';
    buffsAventura = { tiroDuplo: false };

    // Reseta stats de batalha
    hpMagoBatalha = maxHpMagoBatalha;
    turnoJogador = true;

    avancarSala(true);

    const container = document.getElementById('aventuras-container');
    const batalhaUi = document.getElementById('batalha-ui');

    if (container) container.style.display = 'none';
    if (batalhaUi) {
        batalhaUi.classList.remove('hidden');
        batalhaUi.style.display = 'block';
        logBatalha(`Você entrou em ${aventuraAtual.nome}! Prepare-se...`);
        renderizarBatalhaUI();
    }

    playSound('rebirth'); // Tocar som épico ao entrar na dungeon
}

function sairAventura() {
    modoAventura = false;
    aventuraAtual = null;
    monstroAtual = null;

    const container = document.getElementById('aventuras-container');
    const batalhaUi = document.getElementById('batalha-ui');

    if (container) container.style.display = 'block';
    if (batalhaUi) {
        batalhaUi.classList.add('hidden');
        batalhaUi.style.display = 'none';
    }
}

function avancarSala(isPrimeira = false) {
    if (!isPrimeira) {
        salaAtual++;
    }

    if (salaAtual > 1 && salaAtual % 10 === 0) {
        gerarBoss();
    } else if (salaAtual > 1 && salaAtual % 5 === 0) {
        gerarEvento();
    } else {
        gerarMonstro();
    }
}

function gerarBoss() {
    if (!aventuraAtual) return;

    salaTipo = 'boss';
    animacaoMagoMovendo = false;

    const bossTemplate = aventuraAtual.boss;

    const nomeBoss = bossTemplate.nome;
    let spriteKey = nomeBoss.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    if (spriteKey === 'deus_do_vazio') spriteKey = 'deus_vazio'; // specific fix for Deus do Vazio
    if (!monsterSprites[spriteKey]) {
        spriteKey = spriteKey.split('_').pop(); // Fallback to last word if full name doesn't match
    }

    monstroAtual = {
        nome: nomeBoss,
        hpMax: bossTemplate.hp,
        hp: bossTemplate.hp,
        dano: bossTemplate.dano,
        cor: bossTemplate.cor,
        spriteKey: monsterSprites[spriteKey] ? spriteKey : 'fantasma' // Fallback
    };

    xMonstro = canvas.width - 150; // Um pouco mais longe porque é grande
    turnoJogador = true;
    monstroMorrendo = false;
    logBatalha(`⚠️ CUIDADO! <b>${monstroAtual.nome}</b> CHEGOU! Sala ${salaAtual}`);
    renderizarBatalhaUI();
}

function gerarMonstro() {
    if (!aventuraAtual) return;

    salaTipo = 'monstro';
    animacaoMagoMovendo = false;

    const nomeMonstro = aventuraAtual.monstros[Math.floor(Math.random() * aventuraAtual.monstros.length)];
    const spriteKey = nomeMonstro.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ').pop();

    let corBase = `hsl(${Math.random() * 360}, 70%, 50%)`;
    if (spriteKey === 'goblin') corBase = '#228B22'; // Verde
    else if (spriteKey === 'fantasma') corBase = '#FFFFFF'; // Branco
    else if (spriteKey === 'gargula') corBase = '#808080'; // Cinza/Pedra

    monstroAtual = {
        nome: nomeMonstro,
        hpMax: aventuraAtual.hpMonstro,
        hp: aventuraAtual.hpMonstro,
        cor: corBase,
        spriteKey: monsterSprites[spriteKey] ? spriteKey : 'fantasma' // Fallback
    };
    xMonstro = canvas.width - 100;
    turnoJogador = true;
    monstroMorrendo = false;
    logBatalha(`Um <b>${monstroAtual.nome}</b> selvagem apareceu! Sala ${salaAtual}`);
    renderizarBatalhaUI();
}

function gerarEvento() {
    if (!aventuraAtual) return;

    salaTipo = 'evento';
    animacaoMagoMovendo = false;
    monstroAtual = null;
    turnoJogador = false; // Não tem turno de ataque

    // Gerar 3 opções de evento
    opcoesEvento = [];

    // Possíveis opções
    const possiveis = [
        { tipo: 'pocao', nome: 'Poção de Vida', desc: 'Restaura todo o HP.' },
        { tipo: 'tiroDuplo', nome: 'Magia Dupla', desc: 'Ataques lançam 2x projéteis!' }
    ];

    // Pegar poderes do elemento atual
    const poderesElemento = Object.values(poderesDB).filter(p => p.elemento === elementoSelecionado);
    if (poderesElemento.length > 0) {
        const poderRandom = poderesElemento[Math.floor(Math.random() * poderesElemento.length)];
        possiveis.push({ tipo: 'poder', nome: poderRandom.nome, desc: `Receba: ${poderRandom.nome}`, id: poderRandom.id });
    }

    while(opcoesEvento.length < 3) {
        if (opcoesEvento.length === 0) opcoesEvento.push(possiveis[0]); // Sempre uma poção garantida
        else if (opcoesEvento.length === 1) opcoesEvento.push(possiveis[1]); // Sempre buff garantido
        else {
            if (possiveis[2]) opcoesEvento.push(possiveis[2]); // Poder garantido
            else opcoesEvento.push({ tipo: 'mana', nome: 'Cristal de Mana', desc: 'Ganha mana bônus.' });
        }
    }

    // Embaralhar
    opcoesEvento.sort(() => Math.random() - 0.5);

    logBatalha(`Você encontrou uma área de descanso! Escolha uma recompensa.`);
    renderizarBatalhaUI();
}

function escolherEvento(index) {
    const escolhido = opcoesEvento[index];

    if (escolhido.tipo === 'pocao') {
        hpMagoBatalha = maxHpMagoBatalha;
        logBatalha(`Você bebeu a poção e restaurou seu HP!`);
    } else if (escolhido.tipo === 'tiroDuplo') {
        buffsAventura.tiroDuplo = true;
        logBatalha(`Você sente a magia fluindo! Tiros duplos ativados.`);
    } else if (escolhido.tipo === 'poder') {
        poderesInventario.push(escolhido.id);
        logBatalha(`Você obteve o poder: ${escolhido.nome}!`);
    } else if (escolhido.tipo === 'mana') {
        mana += aventuraAtual.recompensaMana * 5;
        logBatalha(`Você encontrou um cristal e ganhou bastante mana!`);
    }

    playSound('upgrade');
    opcoesEvento = [];

    // Continua a aventura
    animacaoMagoMovendo = true;
    monstroMorrendo = false;
}

function monstroDerrotado() {
    let multBoss = salaTipo === 'boss' ? 10 : 1;

    // Recompensas
    mana += (aventuraAtual.recompensaMana * multBoss) * multiplicadorPrestige;
    ganharXP(aventuraAtual.recompensaXP * multBoss);

    logBatalha(`Você derrotou o <b>${monstroAtual.nome}</b>! Ganhou mana e XP.`);

    if (salaTipo === 'boss' && aventuraAtual.id === 'vazio') {
        logBatalha(`🎉 VOCÊ DERROTOU O DEUS DO VAZIO! VOCÊ É UM MESTRE MAGO! 🎉`);
    }

    let chanceDrop = salaTipo === 'boss' ? 1.0 : 0.2; // Boss dropa caixa garantido se tiver
    if (aventuraAtual.dropCaixa && Math.random() < chanceDrop) {
        const caixaIdx = caixas.findIndex(c => c.id === aventuraAtual.dropCaixa);
        if (caixaIdx >= 0) {
            // Força a ter diamantes temporariamente para a função abrir
            const custoReal = caixas[caixaIdx].custo;
            diamantes += custoReal;
            abrirCaixa(caixaIdx); // Simula abrir a caixa grátis
        }
    }

    playSound('upgrade');
    criarFloatingText(salaTipo === 'boss' ? `CHEFE DERROTADO!` : `Vitória!`, canvas.width/2, canvas.height/2 - 50);

    // Iniciar animação do mago andando para a direita (próxima sala)
    monstroAtual = null;
    animacaoMagoMovendo = true;

    // Esconder os botões durante a caminhada
    const container = document.getElementById('poderes-batalha-container');
    if(container) container.innerHTML = '';
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
            avancarSala();
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

    // Desenhar barras de HP no topo
    if (!animacaoMagoMovendo) {
        // Mago HP
        const barW = 100;
        const barH = 10;
        ctx.fillStyle = '#555';
        ctx.fillRect(10, 10, barW, barH);
        ctx.fillStyle = '#00ff00';
        const hpMagoPct = Math.max(0, hpMagoBatalha / maxHpMagoBatalha);
        ctx.fillRect(10, 10, barW * hpMagoPct, barH);
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText(`Mago: ${Math.floor(hpMagoBatalha)}`, 10, 30);
    }

    // Desenhar monstro, Boss ou Evento
    if ((salaTipo === 'monstro' || salaTipo === 'boss') && monstroAtual) {
        const isBoss = salaTipo === 'boss';

        const baseSize = isBoss ? 80 : 40;
        const breath = Math.sin(lastTime * (isBoss ? 0.003 : 0.005)) * (isBoss ? 10 : 5);
        const sSize = baseSize + breath;

        desenharMonstroSprite(xMonstro, canvas.height / 2 + 20 + breath / 2, sSize, monstroAtual.cor, monstroAtual.spriteKey);

        if (isBoss) {
            // Boss HP Bar (Grande, no topo central)
            const barW = 300;
            const barH = 15;
            const hpPct = Math.max(0, monstroAtual.hp / monstroAtual.hpMax);
            const barX = canvas.width / 2 - barW / 2;
            const barY = 10;

            ctx.fillStyle = '#555';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(barX, barY, barW * hpPct, barH);

            ctx.font = '12px "Press Start 2P"';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(`${monstroAtual.nome} (${Math.floor(monstroAtual.hp)}/${monstroAtual.hpMax})`, canvas.width / 2, barY + 30);

        } else {
            // HP Bar Monstro Normal
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
    } else if (salaTipo === 'evento') {
        // Desenha um baú / fogueira
        const evX = canvas.width - 150;
        const evY = canvas.height / 2 + 20;

        // Baú
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(evX, evY, 40, 30);
        ctx.fillStyle = '#d4af37'; // Ouro/Detalhe
        ctx.fillRect(evX - 2, evY + 10, 44, 4);
        ctx.fillRect(evX + 16, evY + 8, 8, 8); // Fechadura

        ctx.font = '10px "Press Start 2P"';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText('Recompensa!', evX + 20, evY - 20);
    }

    // Animações de Projéteis / Poderes
    projeteisAtaque = projeteisAtaque.filter(proj => {
        // Atualiza posição / progresso
        proj.progresso += deltaTime * 0.003; // Velocidade da animação (0 a 1)

        if (proj.progresso >= 1) {
            // Atingiu o alvo!
            aplicarDanoMonstro(proj.dano, proj.nomePoder, proj.isUltimo);
            // Efeito visual de impacto
            criarParticulas(20, proj.targetX, proj.targetY, true);
            return false; // Remove da lista
        }

        const atualX = proj.x + (proj.targetX - proj.x) * proj.progresso;
        const atualY = proj.y + (proj.targetY - proj.y) * proj.progresso;

        ctx.save();

        if (proj.tipo === 'projetil') {
            // Bola de Fogo / Água / Terra / etc
            ctx.fillStyle = proj.cor;
            ctx.beginPath();
            ctx.arc(atualX, atualY, 8, 0, Math.PI * 2);
            ctx.fill();

            // Brilho
            ctx.shadowBlur = 10;
            ctx.shadowColor = proj.cor;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(atualX, atualY, 4, 0, Math.PI * 2);
            ctx.fill();

            // Adiciona rastro
            if (Math.random() > 0.3) {
                proj.rastro.push({x: atualX, y: atualY, vida: 10});
            }

        } else if (proj.tipo === 'raio') {
            // Eletricidade - desenha raio do mago até o monstro (ou parcial)
            ctx.strokeStyle = proj.cor;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = proj.cor;
            ctx.beginPath();
            ctx.moveTo(proj.x, proj.y);

            let segments = 5;
            let pX = proj.x;
            let pY = proj.y;
            let destX = proj.x + (proj.targetX - proj.x) * proj.progresso;
            let destY = proj.y + (proj.targetY - proj.y) * proj.progresso;

            for(let i=1; i<=segments; i++) {
                let segX = proj.x + ((destX - proj.x) / segments) * i;
                let segY = proj.y + ((destY - proj.y) / segments) * i;

                // Random offset for zigzag
                if(i < segments) {
                    segX += (Math.random() - 0.5) * 20;
                    segY += (Math.random() - 0.5) * 20;
                }
                ctx.lineTo(segX, segY);
            }
            ctx.stroke();

        } else if (proj.tipo === 'vento') {
            // Vento - cortes/crescents
            ctx.strokeStyle = proj.cor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(atualX, atualY, 15, -Math.PI/2, Math.PI/2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(atualX - 5, atualY, 10, -Math.PI/2, Math.PI/2);
            ctx.stroke();
        }

        ctx.restore();

        // Desenha rastro
        if (proj.rastro) {
            proj.rastro = proj.rastro.filter(r => {
                r.vida--;
                ctx.fillStyle = proj.cor;
                ctx.globalAlpha = r.vida / 10;
                ctx.beginPath();
                ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
                return r.vida > 0;
            });
        }

        return true;
    });

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
    if (estadoAnimacaoCaixa.ativa) return; // UI Lock prevent spamming

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

        // Sorteio: 50% chance equipamento, 50% chance poder
        let isPoder = Math.random() > 0.5;
        let dbSorteada = isPoder ? poderesDB : equipamentosDB;
        let arrAlvo = isPoder ? poderesInventario : inventario;

        // Filtrar itens do BD com essa raridade
        let itensPossiveis = Object.values(dbSorteada).filter(item => item.raridade === raridadeGanha);
        if (itensPossiveis.length === 0) {
            // Se tentou poder e não tem dessa raridade, tenta equipamento. Se não tiver tbm, cai pra comum
            isPoder = false;
            dbSorteada = equipamentosDB;
            arrAlvo = inventario;
            itensPossiveis = Object.values(dbSorteada).filter(item => item.raridade === raridadeGanha);
            if (itensPossiveis.length === 0) {
                raridadeGanha = 'comum';
                itensPossiveis = Object.values(dbSorteada).filter(item => item.raridade === raridadeGanha);
            }
        }

        const itemGanho = itensPossiveis[Math.floor(Math.random() * itensPossiveis.length)];

        // Ativa a animação em vez de dar o item imediatamente
        estadoAnimacaoCaixa = {
            ativa: true,
            tempoAtual: 0,
            tempoMax: 2500,
            fase: 0,
            material: index === 0 ? 'madeira' : (index === 1 ? 'ferro' : 'magica'),
            itemSorteado: itemGanho,
            raridadeGanha: raridadeGanha,
            isPoder: isPoder
        };

        atualizarUI();
    } else {
        alert('Diamantes insuficientes!');
    }
}

function finalizarAnimacaoCaixa() {
    estadoAnimacaoCaixa.ativa = false;

    // Adicionar item ao inventário
    const isPoder = estadoAnimacaoCaixa.isPoder;
    let arrAlvo = isPoder ? poderesInventario : inventario;
    arrAlvo.push(estadoAnimacaoCaixa.itemSorteado.id);

    atualizarUI();
    renderizarInventario();
}

function desenharAnimacaoCaixa(deltaTime) {
    if (!estadoAnimacaoCaixa.ativa) return;

    estadoAnimacaoCaixa.tempoAtual += deltaTime;

    // Draw Overlay Escuro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const { fase, tempoAtual, tempoMax, material, itemSorteado, raridadeGanha } = estadoAnimacaoCaixa;

    if (fase === 0) {
        // Fase 0: Tremendo
        if (tempoAtual >= tempoMax) {
            estadoAnimacaoCaixa.fase = 1;
            estadoAnimacaoCaixa.tempoAtual = 0;
            playSound('upgrade'); // Som de revelação
            criarParticulas(100, cx, cy, true);
            return;
        }

        const progresso = tempoAtual / tempoMax; // 0 a 1
        const intensidadeTremor = progresso * 10;

        const offsetX = (Math.random() - 0.5) * intensidadeTremor;
        const offsetY = (Math.random() - 0.5) * intensidadeTremor;

        desenharCaixaSprite(cx + offsetX, cy + offsetY, material, false);

        // Efeito de brilho crescendo
        if (material === 'magica') {
            ctx.globalAlpha = progresso * 0.5;
            ctx.fillStyle = '#aa00ff';
            ctx.beginPath();
            ctx.arc(cx + offsetX, cy + offsetY, 50 + progresso * 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

    } else if (fase === 1) {
        // Fase 1: Revelação (Aberto)
        // Permanece por 3 segundos
        if (tempoAtual >= 3000) {
            finalizarAnimacaoCaixa();
            return;
        }

        desenharCaixaSprite(cx, cy + 30, material, true); // Caixa aberta embaixo

        // Fundo do Item (Brilho rotativo)
        ctx.save();
        ctx.translate(cx, cy - 30);
        ctx.rotate(tempoAtual * 0.002);
        const corRaridade = raridades[raridadeGanha] ? raridades[raridadeGanha].cor : '#fff';

        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = corRaridade;
            ctx.globalAlpha = 0.3;
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-10, -100);
            ctx.lineTo(10, -100);
            ctx.fill();
        }
        ctx.restore();

        // Desenhar ícone do item flutuando
        const floatY = Math.sin(tempoAtual * 0.005) * 5;

        ctx.fillStyle = corRaridade;
        ctx.textAlign = 'center';
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText(raridadeGanha.toUpperCase(), cx, cy - 80);

        ctx.font = '12px "Press Start 2P"';
        ctx.fillStyle = '#fff';
        ctx.fillText(itemSorteado.nome, cx, cy - 60);

        // Sprite placeholder do item
        desenharItemSprite(cx, cy - 30 + floatY, itemSorteado.tipo, corRaridade);
    }
}

function desenharCaixaSprite(x, y, material, aberta) {
    let corPrincipal, corDetalhe, corBorda;

    if (material === 'madeira') {
        corPrincipal = '#8b4513';
        corDetalhe = '#a0522d';
        corBorda = '#5c3317';
    } else if (material === 'ferro') {
        corPrincipal = '#888888';
        corDetalhe = '#aaaaaa';
        corBorda = '#555555';
    } else if (material === 'magica') {
        corPrincipal = '#4b0082'; // Indigo/Roxo
        corDetalhe = '#8a2be2';
        corBorda = '#2a0050';
    }

    const size = 60;

    ctx.save();
    ctx.translate(x - size/2, y - size/2);

    // Corpo
    ctx.fillStyle = corBorda;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = corPrincipal;
    ctx.fillRect(4, 4, size-8, size-8);

    // Detalhes
    ctx.fillStyle = corDetalhe;
    ctx.fillRect(10, 10, size-20, size-20);

    if (aberta) {
        // Tampa aberta (deslocada pra trás/cima)
        ctx.fillStyle = corBorda;
        ctx.fillRect(0, -30, size, 30);
        ctx.fillStyle = corPrincipal;
        ctx.fillRect(4, -26, size-8, 26);
        ctx.fillStyle = '#000'; // Interior escuro
        ctx.fillRect(4, 4, size-8, size-8);
    } else {
        // Fechadura/Faixa
        ctx.fillStyle = corBorda;
        ctx.fillRect(0, size/2 - 5, size, 10); // Faixa
        ctx.fillStyle = '#d4af37'; // Ouro
        ctx.fillRect(size/2 - 8, size/2 - 8, 16, 16); // Fechadura base
        ctx.fillStyle = '#000';
        ctx.fillRect(size/2 - 2, size/2 - 2, 4, 6); // Buraco
    }

    if (material === 'magica' && !aberta) {
        // Glow magico
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#aa00ff';
        ctx.strokeStyle = '#aa00ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(size/2 - 12, size/2 - 12, 24, 24);
    }

    ctx.restore();
}

function desenharItemSprite(x, y, tipo, cor) {
    const size = 32;
    ctx.save();
    ctx.translate(x - size/2, y - size/2);

    ctx.fillStyle = cor;
    ctx.shadowBlur = 10;
    ctx.shadowColor = cor;

    if (tipo === 'hat') {
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(32, 24);
        ctx.lineTo(0, 24);
        ctx.fill();
        ctx.fillRect(0, 24, 32, 8);
    } else if (tipo === 'robe') {
        ctx.fillRect(8, 0, 16, 8); // ombros
        ctx.fillRect(4, 8, 24, 24); // corpo
    } else if (tipo === 'staff') {
        ctx.fillStyle = '#8b4513'; // cabo sempre marrom
        ctx.fillRect(14, 8, 4, 24);
        ctx.fillStyle = cor; // topo com a cor da raridade
        ctx.beginPath();
        ctx.arc(16, 8, 8, 0, Math.PI * 2);
        ctx.fill();
    } else if (tipo === 'poder') {
        // Uma estrela / orbe
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(12, 12, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function renderizarInventario() {
    const equipadosContainer = document.getElementById('equipados-container');
    const mochilaContainer = document.getElementById('mochila-container');
    const poderesEquipadosContainer = document.getElementById('poderes-equipados-container');
    const filterSelect = document.getElementById('inv-filter');

    if (!equipadosContainer || !mochilaContainer) return;

    equipadosContainer.innerHTML = '';
    mochilaContainer.innerHTML = '';
    if (poderesEquipadosContainer) poderesEquipadosContainer.innerHTML = '';

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

    const criarCardPoder = (poderId, isEquipped, slotIndex = -1) => {
        const poder = poderesDB[poderId];
        if (!poder) return null;

        const card = document.createElement('div');
        card.className = `inv-item rarity-${poder.raridade} ${isEquipped ? 'equipped' : ''}`;

        let statsStr = '';
        const mult = raridades[poder.raridade] ? raridades[poder.raridade].multi : 1;
        if (poder.stats.dano) statsStr += `Dano:${poder.stats.dano * mult} `;

        card.innerHTML = `
            <div class="item-name" style="color: ${raridades[poder.raridade] ? raridades[poder.raridade].cor : '#fff'}">${poder.nome}</div>
            <div style="font-size: 0.4rem; color: #888;">Elm: ${poder.elemento}<br>${statsStr}</div>
        `;

        card.onclick = () => {
            if (isEquipped) {
                poderesEquipados[slotIndex] = null;
            } else {
                const emptySlot = poderesEquipados.findIndex(p => p === null);
                if (emptySlot !== -1) {
                    poderesEquipados[emptySlot] = poder.id;
                } else {
                    alert('Você já tem 4 poderes equipados. Desequipe um primeiro.');
                    return;
                }
            }
            playSound('click');
            renderizarInventario();
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

    // Renderizar Poderes Equipados
    for (let i = 0; i < 4; i++) {
        const pid = poderesEquipados[i];
        if (pid) {
            const card = criarCardPoder(pid, true, i);
            if (card && poderesEquipadosContainer) poderesEquipadosContainer.appendChild(card);
        } else {
            const empty = document.createElement('div');
            empty.className = 'inv-item';
            empty.style.borderStyle = 'dashed';
            empty.style.display = 'flex';
            empty.style.alignItems = 'center';
            empty.style.justifyContent = 'center';
            empty.innerHTML = `<span style="color:#555; font-size:0.5rem;">Vazio</span>`;
            if (poderesEquipadosContainer) poderesEquipadosContainer.appendChild(empty);
        }
    }

    // Renderizar Mochila (Equipamentos)
    let itemsMochila = inventario.filter(id => !Object.values(equipamentosEquipados).includes(id));
    // Renderizar Mochila (Poderes)
    // Para tratar duplicatas corretamente na mochila: precisamos contar quantos de cada tipo temos no inventário
    // e subtrair os que estão equipados, mas uma forma mais simples no momento é iterar e pular a primeira ocorrencia equipada.

    let poderesMochila = [];
    let tempEquipados = [...poderesEquipados].filter(p => p !== null);

    poderesInventario.forEach(pid => {
        const indexEquipado = tempEquipados.indexOf(pid);
        if (indexEquipado !== -1) {
            tempEquipados.splice(indexEquipado, 1);
        } else {
            poderesMochila.push(pid);
        }
    });

    // Ordenação combinada ou separada, vamos separar para ficar organizado
    const raridadeRank = { 'mitico': 6, 'lendario': 5, 'epico': 4, 'raro': 3, 'incomum': 2, 'comum': 1 };

    if (filterSelect && filterSelect.value === 'alpha') {
        itemsMochila.sort((a, b) => equipamentosDB[a].nome.localeCompare(equipamentosDB[b].nome));
        poderesMochila.sort((a, b) => poderesDB[a].nome.localeCompare(poderesDB[b].nome));
    } else {
        itemsMochila.sort((a, b) => raridadeRank[equipamentosDB[b].raridade] - raridadeRank[equipamentosDB[a].raridade]);
        poderesMochila.sort((a, b) => raridadeRank[poderesDB[b].raridade] - raridadeRank[poderesDB[a].raridade]);
    }

    // Adiciona equipamentos na mochila
    itemsMochila.forEach(eqId => {
        const card = criarCardItem(eqId, false);
        if (card) mochilaContainer.appendChild(card);
    });

    // Adiciona poderes na mochila visualmente separados
    if (poderesMochila.length > 0) {
        const sep = document.createElement('div');
        sep.style.width = '100%';
        sep.style.gridColumn = '1 / -1';
        sep.style.marginTop = '10px';
        sep.style.borderBottom = '1px dashed #555';
        sep.innerHTML = '<span style="font-size:0.6rem; color:#aaa;">Poderes:</span>';
        mochilaContainer.appendChild(sep);

        poderesMochila.forEach(pid => {
            const card = criarCardPoder(pid, false);
            if (card) mochilaContainer.appendChild(card);
        });
    }
}

function equiparMelhoresPoderes() {
    // Pegar todos os poderes disponíveis (inventário + equipados)
    let todosPoderesDisponiveis = [...poderesInventario];

    // Calcular o dano final de cada poder
    const calcularDano = (pid) => {
        const poder = poderesDB[pid];
        if (!poder) return 0;
        const mult = raridades[poder.raridade] ? raridades[poder.raridade].multi : 1;
        return poder.stats.dano * mult;
    };

    // Ordenar do maior pro menor dano
    todosPoderesDisponiveis.sort((a, b) => calcularDano(b) - calcularDano(a));

    // Pegar os 4 melhores e remover duplicatas se o ID for o mesmo
    // Mas assumindo que o jogador ganha IDs, como eles podem ter o mesmo id?
    // Atualmente as caixas dão IDs puros, então podemos ter duplicatas no inventário.
    // Vamos garantir que equipamos as 4 melhores instâncias

    poderesEquipados = [null, null, null, null];
    let equipadosCount = 0;

    // Para lidar com duplicatas no array, usamos um rastreador de quais já pegamos
    let usados = new Set();
    // Isso se as coisas tiverem ids únicos, no clicker os IDs na mochila eram os mesmos da DB.
    // Como os IDs são as chaves da DB e guardamos apenas a chave,
    // um jogador pode ter ['fogo', 'fogo', 'agua'].

    let disponiveisCopia = [...poderesInventario];
    disponiveisCopia.sort((a, b) => calcularDano(b) - calcularDano(a));

    for (let i = 0; i < disponiveisCopia.length && equipadosCount < 4; i++) {
        poderesEquipados[equipadosCount] = disponiveisCopia[i];
        equipadosCount++;
    }

    playSound('upgrade');
    renderizarInventario();
}

function ganharXP(amount) {
    xp += amount;
    while (xp >= xpMax) {
        xp -= xpMax;
        level++;
        xpMax = Math.floor(xpMax * 1.5);
        // Podia adicionar som de level up aqui

        // Milestone a cada 5 níveis: ganha um poder aleatório do nível
        if (level % 5 === 0) {
            const poderesMilestone = Object.values(poderesDB).filter(p => p.raridade === 'incomum');
            if (poderesMilestone.length > 0) {
                const pGanho = poderesMilestone[Math.floor(Math.random() * poderesMilestone.length)];
                poderesInventario.push(pGanho.id);
                alert(`Parabéns! Você alcançou o Nível ${level} e desbloqueou o poder: ${pGanho.nome}!`);
                renderizarInventario();
            }
        }
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
    rebirthPercentage.textContent = percentage.toFixed(1) + '% (Req: 1T Mana)';

    if (mana >= rebirthCost) {
        rebirthBtn.disabled = false;
    } else {
        rebirthBtn.disabled = true;
    }
}

// ============================================================
// GRIMÓRIO DO MESTRE — D&D
// ============================================================

// ===== SISTEMA DE ABAS =====
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
  });
});

// ===== BANCO LOCAL =====
const DB = {
  get: (key) => JSON.parse(localStorage.getItem(`dnd_${key}`)) || [],
  set: (key, data) => localStorage.setItem(`dnd_${key}`, JSON.stringify(data))
};

// ===== CATÁLOGO PADRÃO DE MAGIAS =====
const CATALOGO_MAGIAS = [
  { nome: 'Bola de Fogo', nivel: '3', escola: 'Evocação', dano: '8d6 fogo',
    descricao: 'Esfera de fogo explode em raio de 6m. Teste de DES para metade.' },
  { nome: 'Mísseis Mágicos', nivel: '1', escola: 'Evocação', dano: '3×(1d4+1)',
    descricao: 'Três dardos mágicos acertam automaticamente.' },
  { nome: 'Cura Ferimentos', nivel: '1', escola: 'Evocação', dano: 'Cura 1d8+mod',
    descricao: 'Toque restaura HP em uma criatura.' },
  { nome: 'Escudo Arcano', nivel: '1', escola: 'Abjuração', dano: '',
    descricao: 'Reação: +5 CA até o próximo turno.' },
  { nome: 'Raio Ardente', nivel: '2', escola: 'Evocação', dano: '3d6 fogo',
    descricao: 'Três raios de fogo, ataque à distância cada.' },
  { nome: 'Contra-Mágica', nivel: '3', escola: 'Abjuração', dano: '',
    descricao: 'Reação: interrompe uma magia sendo conjurada.' },
  { nome: 'Invisibilidade', nivel: '2', escola: 'Ilusão', dano: '',
    descricao: 'Alvo fica invisível por 1 hora ou até atacar.' },
  { nome: 'Sono', nivel: '1', escola: 'Encantamento', dano: '',
    descricao: 'Adormece criaturas com total de HP ≤ 5d8.' },
  { nome: 'Passo das Sombras', nivel: '2', escola: 'Ilusão', dano: '',
    descricao: 'Teleporta até 18m entre sombras.' },
  { nome: 'Desejo', nivel: '9', escola: 'Conjuração', dano: '',
    descricao: 'A magia mais poderosa. Altera a realidade.' },
  { nome: 'Prestidigitação', nivel: '0', escola: 'Transmutação', dano: '',
    descricao: 'Truque: efeitos mágicos inofensivos menores.' },
  { nome: 'Toque Gélido', nivel: '0', escola: 'Necromancia', dano: '1d8 necrótico',
    descricao: 'Truque: toque espectral, impede cura por 1 turno.' }
];

if (!localStorage.getItem('dnd_magias')) DB.set('magias', CATALOGO_MAGIAS);

// ===== LOG =====
function registrarLog(evento) {
  const log = DB.get('log');
  log.unshift({ evento, data: new Date().toLocaleString('pt-BR') });
  if (log.length > 200) log.length = 200;
  DB.set('log', log);
  renderLog();
}

function renderLog() {
  const container = document.getElementById('lista-log');
  if (!container) return;
  const log = DB.get('log');
  container.innerHTML = '';
  if (log.length === 0) {
    container.innerHTML = '<p style="opacity:0.6">Nenhum evento registrado.</p>';
    return;
  }
  log.forEach(item => {
    const div = document.createElement('div');
    div.className = 'log-item';
    div.innerHTML = `<span class="log-data">[${item.data}]</span> ${item.evento}`;
    container.appendChild(div);
  });
}

document.getElementById('form-log').addEventListener('submit', (e) => {
  e.preventDefault();
  registrarLog(e.target.evento.value);
  e.target.reset();
});

document.getElementById('btn-limpar-log').addEventListener('click', () => {
  if (confirm('Limpar todo o log?')) {
    DB.set('log', []);
    renderLog();
  }
});

// ===== ROLAGEM DE DADOS =====
document.querySelectorAll('.dice-btn[data-dice]').forEach(btn => {
  btn.addEventListener('click', () => {
    const sides = parseInt(btn.dataset.dice);
    const result = Math.floor(Math.random() * sides) + 1;
    const span = document.getElementById('dice-result');
    span.classList.add('roll-anim');
    span.textContent = `🎲 d${sides} → ${result}`;
    if (sides === 20) {
      if (result === 20) span.textContent += ' ⚔️ CRÍTICO!';
      else if (result === 1) span.textContent += ' 💀 FALHA CRÍTICA!';
    }
    setTimeout(() => span.classList.remove('roll-anim'), 400);
    registrarLog(`🎲 Rolou d${sides} → ${result}`);
  });
});

// ===== MODIFICADOR D&D =====
function mod(valor) {
  const m = Math.floor((parseInt(valor) - 10) / 2);
  return m >= 0 ? `+${m}` : m;
}

// ===== ÍCONE DE DRAGÃO =====
function iconeDragao(tipo) {
  const t = (tipo || '').toLowerCase();
  if (t.includes('vermelho') || t.includes('fogo')) return '🔥🐉';
  if (t.includes('azul') || t.includes('raio')) return '⚡🐉';
  if (t.includes('verde') || t.includes('veneno')) return '☠️🐉';
  if (t.includes('negro') || t.includes('ácido')) return '🖤🐉';
  if (t.includes('branco') || t.includes('gelo')) return '❄️🐉';
  if (t.includes('dourado') || t.includes('ouro')) return '✨🐉';
  return '🐲';
}

// ===== TEMPLATES =====
const templates = {
  dragoes: (d) => `
    <h4>${iconeDragao(d.tipo)} ${d.nome}</h4>
    <p><strong>Tipo:</strong> ${d.tipo}</p>
    <p><strong>Idade:</strong> ${d.idade} anos</p>
    <p><strong>HP:</strong> ${d.hp}</p>
    <p><strong>Sopro:</strong> ${d.sopro}</p>
  `,
  jogadores: (j) => {
    const atrs = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'];
    const nomes = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
    const botoes = atrs.map((a, i) => {
      const v = j[a] || 10;
      const m = Math.floor((parseInt(v) - 10) / 2);
      const mStr = m >= 0 ? `+${m}` : m;
      return `<button class="roll-attr" data-mod="${m}" data-nome="${j.nome}" data-attr="${nomes[i]}">
        ${nomes[i]}<br>${v}<br><small>${mStr}</small>
      </button>`;
    }).join('');
    return `
      <h4>🛡️ ${j.nome}</h4>
      <p><strong>${j.raca} · ${j.classe} · Nv ${j.nivel}</strong></p>
      <p><strong>HP:</strong> ${j.hp} | <strong>CA:</strong> ${j.ca || '—'}</p>
      <div class="atributos-clicaveis">${botoes}</div>
    `;
  },
  inimigos: (i) => `
    <h4>👹 ${i.nome}</h4>
    <p><strong>Tipo:</strong> ${i.tipo}</p>
    <p><strong>HP:</strong> ${i.hp}</p>
    <p><strong>CA:</strong> ${i.ca}</p>
    <p><strong>Ataque:</strong> ${i.ataque}</p>
    <button class="btn-ataque" data-ca="${i.ca}" data-nome="${i.nome}">⚔️ Rolar Ataque</button>
  `,
  magias: (m) => `
    <h4>✨ ${m.nome}</h4>
    <p><strong>Nível:</strong> ${m.nivel === '0' ? 'Truque' : m.nivel}</p>
    <p><strong>Escola:</strong> ${m.escola}</p>
    ${m.dano ? `<p><strong>Dano:</strong> ${m.dano}</p>` : ''}
    <p><strong>Descrição:</strong> ${m.descricao}</p>
  `
};

// ===== RENDER GENÉRICO (com delegação de eventos) =====
function renderList(key, containerId, template) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = DB.get(key);
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<p style="opacity:0.6">Nenhum registro ainda...</p>';
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = template(item) +
      `<button class="btn-delete" data-key="${key}" data-index="${index}">🗑 Excluir</button>`;
    container.appendChild(card);
  });

  // ⚠️ Delegação: o listener fica no container (não é perdido nunca)
  if (!container.dataset.delegado) {
    container.dataset.delegado = 'true';

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-delete');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const k = btn.dataset.key;
        const i = parseInt(btn.dataset.index);
        const list = DB.get(k);
        if (i >= 0 && i < list.length) {
          list.splice(i, 1);
          DB.set(k, list);
          if (typeof registrarLog === 'function') registrarLog(`🗑 Excluído de "${k}"`);
          refreshAll();
        }
        return;
      }

      const atkBtn = e.target.closest('.btn-ataque');
      if (atkBtn) {
        e.preventDefault();
        const bonus = prompt('Bônus de ataque do atacante (ex: 5):', '5');
        if (bonus !== null) rolarAtaque(bonus, atkBtn.dataset.ca, 'Jogador', atkBtn.dataset.nome);
        return;
      }

      const rollBtn = e.target.closest('.roll-attr');
      if (rollBtn) {
        e.preventDefault();
        const m = parseInt(rollBtn.dataset.mod);
        const d20 = Math.floor(Math.random() * 20) + 1;
        const total = d20 + m;
        const modStr = m >= 0 ? `+${m}` : m;
        const crit = d20 === 20 ? ' ⚔️ CRÍTICO!' : d20 === 1 ? ' 💀 FALHA!' : '';
        alert(`🎲 ${rollBtn.dataset.nome} rola ${rollBtn.dataset.attr}\n\nd20 (${d20}) ${modStr} = ${total}${crit}`);
        if (typeof registrarLog === 'function') registrarLog(`🎲 ${rollBtn.dataset.nome}: ${rollBtn.dataset.attr} = ${total}${crit}`);
      }
    });
  }
}

// ===== ROLAGEM DE ATAQUE =====
function rolarAtaque(bonus, caAlvo, atacante = 'Atacante', alvo = 'Alvo') {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const total = d20 + parseInt(bonus);
  const acertou = total >= parseInt(caAlvo);
  const critico = d20 === 20;
  const falha = d20 === 1;

  let resultado = `🎲 d20 (${d20}) + ${bonus} = ${total} vs CA ${caAlvo}\n`;
  if (critico) resultado += `⚔️ CRÍTICO! Acertou automaticamente!`;
  else if (falha) resultado += `💀 FALHA CRÍTICA! Errou automaticamente.`;
  else if (acertou) resultado += `✅ ACERTOU!`;
  else resultado += `❌ ERROU!`;

  alert(`⚔️ ${atacante} ataca ${alvo}!\n\n${resultado}`);
  registrarLog(`⚔️ ${atacante} rolou ${total} vs CA ${caAlvo} — ${acertou ? 'ACERTOU' : 'ERROU'}`);
  return { d20, total, acertou, critico, falha };
}

// ===== REFRESH GERAL =====
function refreshAll() {
  renderList('dragoes', 'lista-dragoes', templates.dragoes);
  renderList('jogadores', 'lista-jogadores', templates.jogadores);
  renderList('inimigos', 'lista-inimigos', templates.inimigos);
  renderList('magias', 'lista-magias', templates.magias);
  renderIniciativa();
  desenharGraficoHP();

  // Badges
  const badges = {
  'dragoes': DB.get('dragoes').length,
  'jogadores': DB.get('jogadores').length,
  'inimigos': DB.get('inimigos').length,
  'magias': DB.get('magias').length,
  'iniciativa': DB.get('iniciativa').length,
  'log': DB.get('log').length
};

  document.querySelectorAll('.tab-btn').forEach(btn => {
    const tab = btn.dataset.tab;
    if (badges[tab] !== undefined) {
      const textoLimpo = btn.textContent.replace(/\s*\d+$/, '').replace(/\s*\(\d+\)$/, '').trim();
      btn.innerHTML = `${textoLimpo} <span class="badge">${badges[tab]}</span>`;
    }
  });
}

// ===== FORMULÁRIOS =====
function setupForm(formId, storageKey) {
  document.getElementById(formId).addEventListener('submit', (e) => {
    e.preventDefault();
    const obj = Object.fromEntries(new FormData(e.target).entries());
    const list = DB.get(storageKey);
    list.push(obj);
    DB.set(storageKey, list);
    e.target.reset();
    refreshAll();
    registrarLog(`➕ Cadastrado em "${storageKey}": ${obj.nome}`);
  });
}

setupForm('form-dragao', 'dragoes');
setupForm('form-jogador', 'jogadores');
setupForm('form-inimigo', 'inimigos');
setupForm('form-magia', 'magias');

// ===== INICIATIVA =====
let turnoAtual = 0;

document.getElementById('form-iniciativa').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const lista = DB.get('iniciativa');
  lista.push(data);
  lista.sort((a, b) => parseInt(b.iniciativa) - parseInt(a.iniciativa));
  DB.set('iniciativa', lista);
  e.target.reset();
  renderIniciativa();
  refreshAll();
  registrarLog(`⚔️ ${data.nome} entrou na iniciativa (${data.iniciativa})`);
});

function renderIniciativa() {
  const container = document.getElementById('lista-iniciativa');
  if (!container) return;
  const lista = DB.get('iniciativa');
  container.innerHTML = '';

  if (lista.length === 0) {
    container.innerHTML = '<p style="opacity:0.6">Nenhum combatente na iniciativa...</p>';
    return;
  }

  lista.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'card' + (i === turnoAtual ? ' turno-atual' : '');
    const icone = (c.tipo || '').toLowerCase().includes('jog') ? '🛡️' : '👹';
    card.innerHTML = `
      <span class="ordem-num">${i + 1}</span>
      <h4>${icone} ${c.nome}</h4>
      <p><strong>Iniciativa:</strong> ${c.iniciativa}</p>
      <p><strong>Tipo:</strong> ${c.tipo}</p>
      <button class="btn-delete" data-index="${i}">🗑 Excluir</button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const lista = DB.get('iniciativa');
      lista.splice(parseInt(btn.dataset.index), 1);
      DB.set('iniciativa', lista);
      if (turnoAtual >= lista.length) turnoAtual = 0;
      renderIniciativa();
      refreshAll();
    });
  });
}

document.getElementById('btn-proximo-turno').addEventListener('click', () => {
  const lista = DB.get('iniciativa');
  if (lista.length === 0) return;
  turnoAtual = (turnoAtual + 1) % lista.length;
  renderIniciativa();
  registrarLog(`▶️ Turno de ${lista[turnoAtual].nome}`);
});

document.getElementById('btn-reset-iniciativa').addEventListener('click', () => {
  if (confirm('Reiniciar combate? Todos serão removidos.')) {
    DB.set('iniciativa', []);
    turnoAtual = 0;
    renderIniciativa();
    refreshAll();
    registrarLog('🔄 Combate reiniciado');
  }
});

// ===== GERADOR DE DRAGÕES =====
const TIPOS_DRAGAO = [
  { tipo: 'Vermelho', sopro: 'Cone de fogo (8d6)' },
  { tipo: 'Azul', sopro: 'Linha de raio (8d6)' },
  { tipo: 'Verde', sopro: 'Cone de veneno (8d6)' },
  { tipo: 'Negro', sopro: 'Linha de ácido (8d6)' },
  { tipo: 'Branco', sopro: 'Cone de gelo (8d6)' },
  { tipo: 'Dourado', sopro: 'Cone de fogo (10d6)' },
  { tipo: 'Prata', sopro: 'Cone de gelo paralisante (10d6)' },
  { tipo: 'Bronze', sopro: 'Linha de raio (10d6)' }
];

const FAIXAS_IDADE = [
  { nome: 'Filhote', anos: '0-5', hp: '16-40', nd: '1-3' },
  { nome: 'Jovem', anos: '6-50', hp: '70-130', nd: '4-8' },
  { nome: 'Adulto', anos: '51-300', hp: '180-260', nd: '9-15' },
  { nome: 'Ancião', anos: '301-800', hp: '350-500', nd: '16-20' },
  { nome: 'Lendário', anos: '800+', hp: '500-800', nd: '21+' }
];

const NOMES_DRAGAO = [
  'Ignis', 'Smaugh', 'Tiamat', 'Vermithrax', 'Saphira', 'Fafnir',
  'Drakon', 'Bahamut', 'Nidhogg', 'Ancalagon', 'Azhi', 'Wyrm'
];

function gerarDragaoAleatorio() {
  const tipo = TIPOS_DRAGAO[Math.floor(Math.random() * TIPOS_DRAGAO.length)];
  const faixa = FAIXAS_IDADE[Math.floor(Math.random() * FAIXAS_IDADE.length)];
  const nome = NOMES_DRAGAO[Math.floor(Math.random() * NOMES_DRAGAO.length)];
  const hpMin = parseInt(faixa.hp.split('-')[0]);
  const hpMax = parseInt(faixa.hp.split('-')[1]) || hpMin + 100;
  const hp = Math.floor(Math.random() * (hpMax - hpMin)) + hpMin;

  return {
    nome: `${nome} ${Math.floor(Math.random() * 99) + 1}`,
    tipo: tipo.tipo,
    idade: Math.floor(Math.random() * 500) + 5,
    hp: hp,
    sopro: `${tipo.sopro} · ND ${faixa.nd} · ${faixa.nome}`
  };
}

document.getElementById('btn-gerar-dragao').addEventListener('click', () => {
  const dragao = gerarDragaoAleatorio();
  const lista = DB.get('dragoes');
  lista.push(dragao);
  DB.set('dragoes', lista);
  refreshAll();
  registrarLog(`🐲 Dragão gerado: ${dragao.nome} (${dragao.tipo})`);
});

// ===== CATÁLOGO MAGIAS =====
document.getElementById('btn-restaurar-catalogo').addEventListener('click', () => {
  if (confirm('Adicionar todas as magias do catálogo padrão à sua lista?')) {
    const atual = DB.get('magias');
    const nomes = new Set(atual.map(m => m.nome));
    CATALOGO_MAGIAS.forEach(m => { if (!nomes.has(m.nome)) atual.push(m); });
    DB.set('magias', atual);
    refreshAll();
    registrarLog('📚 Catálogo de magias restaurado');
    alert('✅ Catálogo restaurado!');
  }
});

// ===== GRÁFICO HP =====
function desenharGraficoHP() {
  const canvas = document.getElementById('grafico-hp');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const jogadores = DB.get('jogadores');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (jogadores.length === 0) {
    ctx.fillStyle = '#b8860b';
    ctx.font = '16px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Sem jogadores cadastrados', canvas.width / 2, canvas.height / 2);
    return;
  }

  const maxHP = Math.max(...jogadores.map(j => parseInt(j.hp) || 0), 1);
  const padding = 40;
  const barWidth = Math.min(80, (canvas.width - padding * 2) / jogadores.length - 10);

  jogadores.forEach((j, i) => {
    const hp = parseInt(j.hp) || 0;
    const altura = (hp / maxHP) * (canvas.height - padding * 2);
    const x = padding + i * (barWidth + 15);
    const y = canvas.height - padding - altura;

    const grad = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
    grad.addColorStop(0, '#ffd700');
    grad.addColorStop(1, '#8b4513');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, altura);

    ctx.strokeStyle = '#b8860b';
    ctx.strokeRect(x, y, barWidth, altura);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(j.nome.slice(0, 10), x + barWidth / 2, canvas.height - padding + 15);

    ctx.fillStyle = '#e8d5b7';
    ctx.font = '11px Georgia';
    ctx.fillText(hp, x + barWidth / 2, y - 5);
  });
}

// ===== MAPA =====
const CELULAS = ['', '🛡️', '👹', '🧱'];
const CLASSES_CELULA = ['', 'jogador', 'inimigo', 'obstaculo'];

function gerarMapa(tamanho = 10) {
  const salvo = DB.get('mapa') || {};
  const container = document.getElementById('mapa-grid');
  if (!container) return;
  container.style.gridTemplateColumns = `repeat(${tamanho}, 45px)`;
  container.innerHTML = '';

  for (let i = 0; i < tamanho * tamanho; i++) {
    const cel = document.createElement('div');
    cel.className = 'mapa-celula';
    cel.dataset.idx = i;

    const estado = salvo[i] || 0;
    if (estado > 0) {
      cel.textContent = CELULAS[estado];
      cel.classList.add(CLASSES_CELULA[estado]);
    }

    cel.addEventListener('click', () => {
      let atual = parseInt(cel.dataset.estado || '0');
      atual = (atual + 1) % CELULAS.length;
      cel.dataset.estado = atual;
      cel.className = 'mapa-celula';
      cel.textContent = CELULAS[atual];
      if (atual > 0) cel.classList.add(CLASSES_CELULA[atual]);

      const mapa = DB.get('mapa') || {};
      if (atual === 0) delete mapa[i];
      else mapa[i] = atual;
      DB.set('mapa', mapa);
    });

    cel.dataset.estado = estado;
    container.appendChild(cel);
  }
}

document.getElementById('grid-size').addEventListener('change', (e) => {
  DB.set('mapa', {});
  gerarMapa(parseInt(e.target.value));
});

document.getElementById('btn-limpar-mapa').addEventListener('click', () => {
  if (confirm('Limpar todo o mapa?')) {
    DB.set('mapa', {});
    gerarMapa(parseInt(document.getElementById('grid-size').value));
  }
});

// ===== BACKUP =====
document.getElementById('btn-export').addEventListener('click', () => {
  const backup = {
    dragoes: DB.get('dragoes'),
    jogadores: DB.get('jogadores'),
    inimigos: DB.get('inimigos'),
    magias: DB.get('magias'),
    log: DB.get('log'),
    data: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dnd-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  registrarLog('💾 Backup exportado');
});

document.getElementById('file-import').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (confirm('⚠️ Isso substituirá os dados atuais. Continuar?')) {
        ['dragoes', 'jogadores', 'inimigos', 'magias', 'log'].forEach(k => {
          if (data[k]) DB.set(k, data[k]);
        });
        refreshAll();
        registrarLog('📂 Backup importado');
        alert('✅ Backup importado com sucesso!');
      }
    } catch { alert('❌ Arquivo inválido!'); }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ===== IMPRIMIR =====
document.getElementById('btn-print').addEventListener('click', () => window.print());

// ===== TEMA =====
const themeBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('dnd_tema') === 'light') {
  document.body.classList.add('light');
  themeBtn.textContent = '☀️';
}
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  themeBtn.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('dnd_tema', isLight ? 'light' : 'dark');
});

// ===== FUNDO =====
const FUNDOS = [
  'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=1920&q=80',
  'https://images.unsplash.com/photo-1503435980610-a51f3ddfee50?w=1920&q=80',
  'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=1920&q=80',
  'https://images.unsplash.com/photo-1445966275305-9806327ea2b5?w=1920&q=80'
];

let fundoAtual = parseInt(localStorage.getItem('dnd_fundo') || '0');

function aplicarFundo() {
  const url = FUNDOS[fundoAtual];
  const cor = document.body.classList.contains('light')
    ? 'rgba(244, 236, 216, 0.9), rgba(244, 236, 216, 0.95)'
    : 'rgba(26, 20, 16, 0.88), rgba(26, 20, 16, 0.94)';
  document.body.style.backgroundImage = `linear-gradient(${cor}), url('${url}')`;
}

document.getElementById('btn-bg').addEventListener('click', () => {
  fundoAtual = (fundoAtual + 1) % FUNDOS.length;
  localStorage.setItem('dnd_fundo', fundoAtual);
  aplicarFundo();
});

// ===== ÁUDIO =====
const AMBIENTES = {
  taverna: 'audio/taverna.mp3',
  masmorra: 'audio/masmorra.mp3',
  combate: 'audio/combate.mp3',
  floresta: 'audio/floresta.mp3'
};

const audioPlayer = document.getElementById('audio-player');
const audioStatus = document.getElementById('audio-status');

document.querySelectorAll('.amb-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const amb = btn.dataset.amb;
    document.querySelectorAll('.amb-btn').forEach(b => b.classList.remove('ativo'));
    if (amb === 'off') {
      audioPlayer.pause();
      audioStatus.textContent = '🔇 Silêncio';
      return;
    }
    btn.classList.add('ativo');
    audioPlayer.src = AMBIENTES[amb];
    audioPlayer.volume = 0.4;
    audioPlayer.play()
      .then(() => audioStatus.textContent = `🎵 ${btn.textContent.trim()}`)
      .catch(() => audioStatus.textContent = '⚠️ Adicione os MP3 em /audio/');
  });
});

const volumeSlider = document.createElement('input');
volumeSlider.type = 'range';
volumeSlider.min = 0;
volumeSlider.max = 100;
volumeSlider.value = 40;
volumeSlider.addEventListener('input', () => audioPlayer.volume = volumeSlider.value / 100);
document.getElementById('audio-controls').appendChild(volumeSlider);

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log('✅ PWA ativado'))
    .catch(err => console.log('PWA não suportado:', err));
}

// ===== INICIALIZAÇÃO =====
refreshAll();
renderLog();
aplicarFundo();
gerarMapa(parseInt(document.getElementById('grid-size').value));
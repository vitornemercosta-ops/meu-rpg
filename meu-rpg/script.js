// ============================================================
// GRIMÓRIO DO MESTRE — D&D (Front-end conectado à API Python)
// ============================================================

const API_URL = 'https://meu-rpg.onrender.com/api';
let usarBackend = false;

// ============================================================
// DETECÇÃO DO BACK-END
// ============================================================
async function detectarBackend() {
  const status = document.getElementById('api-status');
  try {
    const res = await fetch(`${API_URL}/health`, { method: 'GET' });
    usarBackend = res.ok;
  } catch {
    usarBackend = false;
  }
  if (status) {
    status.textContent = usarBackend ? '🐍 API conectada' : '📴 Offline (LocalStorage)';
    status.style.color = usarBackend ? '#7fff7f' : '#ff9999';
  }
  console.log(usarBackend ? '🐍 Backend conectado' : '📴 LocalStorage');
}

// ============================================================
// CAMADA DE DADOS (API + fallback LocalStorage)
// ============================================================
const DB = {
  _lsGet: (k) => JSON.parse(localStorage.getItem(`dnd_${k}`)) || [],
  _lsSet: (k, d) => localStorage.setItem(`dnd_${k}`, JSON.stringify(d)),

  async getAll(categoria) {
    if (usarBackend) {
      try {
        const res = await fetch(`${API_URL}/${categoria}`);
        if (!res.ok) throw new Error(res.status);
        return await res.json();
      } catch (e) {
        console.error('getAll:', e);
        return [];
      }
    }
    return this._lsGet(categoria);
  },

  async create(categoria, dados) {
    if (usarBackend) {
      try {
        const res = await fetch(`${API_URL}/${categoria}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
        if (!res.ok) {
          const erro = await res.json().catch(() => ({}));
          console.error('Validação:', erro);
          alert(`Erro: ${erro.erro || res.status}\n${JSON.stringify(erro.detalhes || '')}`);
          return null;
        }
        return await res.json();
      } catch (e) {
        console.error('create:', e);
        return null;
      }
    }
    const lista = this._lsGet(categoria);
    const novo = { id: Date.now(), ...dados };
    lista.push(novo);
    this._lsSet(categoria, lista);
    return novo;
  },

  async update(categoria, id, dados) {
    if (usarBackend) {
      const res = await fetch(`${API_URL}/${categoria}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      return res.ok ? await res.json() : null;
    }
    const lista = this._lsGet(categoria);
    const idx = lista.findIndex(x => x.id == id);
    if (idx >= 0) { lista[idx] = { ...lista[idx], ...dados }; this._lsSet(categoria, lista); }
    return lista[idx];
  },

  async delete(categoria, id) {
    if (usarBackend) {
      await fetch(`${API_URL}/${categoria}/${id}`, { method: 'DELETE' });
      return true;
    }
    this._lsSet(categoria, this._lsGet(categoria).filter(x => x.id != id));
    return true;
  },

  async backup() {
    const [dragoes, jogadores, inimigos, magias, log] = await Promise.all([
      this.getAll('dragoes'), this.getAll('jogadores'),
      this.getAll('inimigos'), this.getAll('magias'), this.getAll('log')
    ]);
    return { dragoes, jogadores, inimigos, magias, log, data: new Date().toISOString() };
  }
};

// ============================================================
// ABAS
// ============================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab)?.classList.add('active');
  });
});

// ============================================================
// CATÁLOGO DE MAGIAS
// ============================================================
const CATALOGO_MAGIAS = [
  { nome: 'Bola de Fogo', nivel: 3, escola: 'Evocação', dano: '8d6 fogo', descricao: 'Esfera de fogo em raio de 6m.' },
  { nome: 'Mísseis Mágicos', nivel: 1, escola: 'Evocação', dano: '3×(1d4+1)', descricao: 'Três dardos automáticos.' },
  { nome: 'Cura Ferimentos', nivel: 1, escola: 'Evocação', dano: 'Cura 1d8+mod', descricao: 'Toque restaura HP.' },
  { nome: 'Escudo Arcano', nivel: 1, escola: 'Abjuração', dano: '', descricao: 'Reação: +5 CA.' },
  { nome: 'Raio Ardente', nivel: 2, escola: 'Evocação', dano: '3d6 fogo', descricao: 'Três raios de fogo.' },
  { nome: 'Invisibilidade', nivel: 2, escola: 'Ilusão', dano: '', descricao: 'Fica invisível 1h.' },
  { nome: 'Desejo', nivel: 9, escola: 'Conjuração', dano: '', descricao: 'Altera a realidade.' },
  { nome: 'Prestidigitação', nivel: 0, escola: 'Transmutação', dano: '', descricao: 'Truque inofensivo.' }
];

// ============================================================
// LOG
// ============================================================
async function registrarLog(evento) {
  await DB.create('log', { evento, data: new Date().toLocaleString('pt-BR') });
  await renderLog();
}

async function renderLog() {
  const c = document.getElementById('lista-log');
  if (!c) return;
  const log = await DB.getAll('log');
  c.innerHTML = log.length === 0
    ? '<p style="opacity:0.6">Nenhum evento registrado.</p>'
    : '';
  log.forEach(item => {
    const d = document.createElement('div');
    d.className = 'log-item';
    d.innerHTML = `<span class="log-data">[${item.data || ''}]</span> ${item.evento}`;
    c.appendChild(d);
  });
}

// ============================================================
// TEMPLATES
// ============================================================
function mod(v) {
  const m = Math.floor((parseInt(v) - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

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

const templates = {
  dragoes: (d) => `
    <h4>${iconeDragao(d.tipo)} ${d.nome}</h4>
    <p><strong>Tipo:</strong> ${d.tipo}</p>
    <p><strong>Idade:</strong> ${d.idade || '—'} anos</p>
    <p><strong>HP:</strong> ${d.hp}</p>
    <p><strong>Sopro:</strong> ${d.sopro || '—'}</p>
  `,
  jogadores: (j) => {
    const atrs = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'];
    const nomes = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
    const botoes = atrs.map((a, i) => {
      const v = j[a] || 10;
      return `<button class="roll-attr" data-mod="${Math.floor((parseInt(v)-10)/2)}"
        data-nome="${j.nome}" data-attr="${nomes[i]}">
        ${nomes[i]}<br>${v}<br><small>${mod(v)}</small></button>`;
    }).join('');
    return `
      <h4>🛡️ ${j.nome}</h4>
      <p><strong>${j.raca || '—'} · ${j.classe || '—'} · Nv ${j.nivel || '—'}</strong></p>
      <p><strong>HP:</strong> ${j.hp || '—'} | <strong>CA:</strong> ${j.ca || '—'}</p>
      <div class="atributos-clicaveis">${botoes}</div>
    `;
  },
  inimigos: (i) => `
    <h4>👹 ${i.nome}</h4>
    <p><strong>Tipo:</strong> ${i.tipo || '—'}</p>
    <p><strong>HP:</strong> ${i.hp || '—'}</p>
    <p><strong>CA:</strong> ${i.ca || '—'}</p>
    <p><strong>Ataque:</strong> ${i.ataque || '—'}</p>
    <button class="btn-ataque" data-ca="${i.ca || 10}" data-nome="${i.nome}">⚔️ Rolar Ataque</button>
  `,
  magias: (m) => `
    <h4>✨ ${m.nome}</h4>
    <p><strong>Nível:</strong> ${m.nivel == 0 ? 'Truque' : (m.nivel || '—')}</p>
    <p><strong>Escola:</strong> ${m.escola || '—'}</p>
    ${m.dano ? `<p><strong>Dano:</strong> ${m.dano}</p>` : ''}
    <p><strong>Descrição:</strong> ${m.descricao || '—'}</p>
  `
};

// ============================================================
// RENDER GENÉRICO (async + delegação)
// ============================================================
async function renderList(key, containerId, template) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = await DB.getAll(key);
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<p style="opacity:0.6">Nenhum registro ainda...</p>';
  } else {
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = template(item) +
        `<button class="btn-delete" data-key="${key}" data-id="${item.id}">🗑 Excluir</button>`;
      container.appendChild(card);
    });
  }

  if (!container.dataset.delegado) {
    container.dataset.delegado = 'true';
    container.addEventListener('click', async (e) => {
      const del = e.target.closest('.btn-delete');
      if (del) {
        e.preventDefault();
        if (!confirm('Excluir este registro?')) return;
        await DB.delete(del.dataset.key, del.dataset.id);
        await registrarLog(`🗑 Excluído de "${del.dataset.key}"`);
        await refreshAll();
        return;
      }

      const atk = e.target.closest('.btn-ataque');
      if (atk) {
        e.preventDefault();
        const bonus = prompt('Bônus de ataque:', '5');
        if (bonus !== null) rolarAtaque(bonus, atk.dataset.ca, 'Jogador', atk.dataset.nome);
        return;
      }

      const roll = e.target.closest('.roll-attr');
      if (roll) {
        e.preventDefault();
        const m = parseInt(roll.dataset.mod);
        const d20 = Math.floor(Math.random() * 20) + 1;
        const total = d20 + m;
        const crit = d20 === 20 ? ' ⚔️ CRÍTICO!' : d20 === 1 ? ' 💀 FALHA!' : '';
        alert(`🎲 ${roll.dataset.nome} rola ${roll.dataset.attr}\n\n` +
              `d20 (${d20}) ${m >= 0 ? '+' + m : m} = ${total}${crit}`);
        await registrarLog(`🎲 ${roll.dataset.nome}: ${roll.dataset.attr} = ${total}`);
      }
    });
  }
}

// ============================================================
// ATAQUE
// ============================================================
async function rolarAtaque(bonus, caAlvo, atacante, alvo) {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const total = d20 + parseInt(bonus);
  const acertou = total >= parseInt(caAlvo);
  const crit = d20 === 20, falha = d20 === 1;
  let txt = `🎲 d20 (${d20}) + ${bonus} = ${total} vs CA ${caAlvo}\n`;
  if (crit) txt += '⚔️ CRÍTICO!';
  else if (falha) txt += '💀 FALHA CRÍTICA!';
  else txt += acertou ? '✅ ACERTOU!' : '❌ ERROU!';
  alert(`⚔️ ${atacante} ataca ${alvo}!\n\n${txt}`);
  await registrarLog(`⚔️ ${atacante} rolou ${total} vs CA ${caAlvo} — ${acertou ? 'ACERTOU' : 'ERROU'}`);
}

// ============================================================
// REFRESH GERAL
// ============================================================
async function refreshAll() {
  await Promise.all([
    renderList('dragoes', 'lista-dragoes', templates.dragoes),
    renderList('jogadores', 'lista-jogadores', templates.jogadores),
    renderList('inimigos', 'lista-inimigos', templates.inimigos),
    renderList('magias', 'lista-magias', templates.magias)
  ]);
  await renderIniciativa();
  desenharGraficoHP();

  const [d, j, i, m, ini, l] = await Promise.all([
    DB.getAll('dragoes'), DB.getAll('jogadores'),
    DB.getAll('inimigos'), DB.getAll('magias'),
    DB.getAll('iniciativa'), DB.getAll('log')
  ]);
  const badges = {
    dragoes: d.length, jogadores: j.length, inimigos: i.length,
    magias: m.length, iniciativa: ini.length, log: l.length
  };
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const tab = btn.dataset.tab;
    if (badges[tab] !== undefined) {
      const texto = btn.textContent.replace(/\s*\d+$/, '').replace(/\s*\(\d+\)$/, '').trim();
      btn.innerHTML = `${texto} <span class="badge">${badges[tab]}</span>`;
    }
  });
}

// ============================================================
// FORMULÁRIOS
// ============================================================
function setupForm(formId, storageKey) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const obj = Object.fromEntries(new FormData(form).entries());
    // Remove campos vazios para não conflitar com validação
    Object.keys(obj).forEach(k => { if (obj[k] === '') delete obj[k]; });
    const criado = await DB.create(storageKey, obj);
    if (criado) {
      form.reset();
      await refreshAll();
      await registrarLog(`➕ Cadastrado em "${storageKey}": ${obj.nome}`);
    }
  });
}

// ============================================================
// INICIATIVA
// ============================================================
let turnoAtual = 0;

async function renderIniciativa() {
  const c = document.getElementById('lista-iniciativa');
  if (!c) return;
  const lista = await DB.getAll('iniciativa');
  const ordenada = [...lista].sort((a, b) => parseInt(b.iniciativa) - parseInt(a.iniciativa));
  c.innerHTML = '';

  if (ordenada.length === 0) {
    c.innerHTML = '<p style="opacity:0.6">Nenhum combatente...</p>';
    return;
  }

  ordenada.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'card' + (i === turnoAtual ? ' turno-atual' : '');
    const ic = (item.tipo || '').toLowerCase().includes('jog') ? '🛡️' : '👹';
    card.innerHTML = `
      <span class="ordem-num">${i + 1}</span>
      <h4>${ic} ${item.nome}</h4>
      <p><strong>Iniciativa:</strong> ${item.iniciativa}</p>
      <p><strong>Tipo:</strong> ${item.tipo || '—'}</p>
      <button class="btn-delete" data-key="iniciativa" data-id="${item.id}">🗑 Excluir</button>
    `;
    c.appendChild(card);
  });

  if (!c.dataset.delegado) {
    c.dataset.delegado = 'true';
    c.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-delete');
      if (btn) {
        await DB.delete(btn.dataset.key, btn.dataset.id);
        const novaLista = await DB.getAll('iniciativa');
        if (turnoAtual >= novaLista.length) turnoAtual = 0;
        await renderIniciativa();
        await refreshAll();
      }
    });
  }
}

// ============================================================
// GRÁFICO HP
// ============================================================
function desenharGraficoHP() {
  const canvas = document.getElementById('grafico-hp');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  DB.getAll('jogadores').then(jogadores => {
    if (jogadores.length === 0) {
      ctx.fillStyle = '#b8860b';
      ctx.font = '16px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('Sem jogadores cadastrados', canvas.width / 2, canvas.height / 2);
      return;
    }
    const maxHP = Math.max(...jogadores.map(j => parseInt(j.hp) || 0), 1);
    const pad = 40;
    const bw = Math.min(80, (canvas.width - pad * 2) / jogadores.length - 10);
    jogadores.forEach((j, i) => {
      const hp = parseInt(j.hp) || 0;
      const h = (hp / maxHP) * (canvas.height - pad * 2);
      const x = pad + i * (bw + 15);
      const y = canvas.height - pad - h;
      const g = ctx.createLinearGradient(0, y, 0, canvas.height - pad);
      g.addColorStop(0, '#ffd700'); g.addColorStop(1, '#8b4513');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, bw, h);
      ctx.strokeStyle = '#b8860b';
      ctx.strokeRect(x, y, bw, h);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(j.nome.slice(0, 10), x + bw / 2, canvas.height - pad + 15);
      ctx.fillStyle = '#e8d5b7';
      ctx.font = '11px Georgia';
      ctx.fillText(hp, x + bw / 2, y - 5);
    });
  });
}

// ============================================================
// MAPA (local)
// ============================================================
const CELULAS = ['', '🛡️', '👹', '🧱'];
const CLASSES_CELULA = ['', 'jogador', 'inimigo', 'obstaculo'];
const MapaLocal = {
  get: () => JSON.parse(localStorage.getItem('dnd_mapa')) || {},
  set: (d) => localStorage.setItem('dnd_mapa', JSON.stringify(d))
};

function gerarMapa(tamanho = 10) {
  const salvo = MapaLocal.get();
  const container = document.getElementById('mapa-grid');
  if (!container) return;
  container.style.gridTemplateColumns = `repeat(${tamanho}, 45px)`;
  container.innerHTML = '';
  for (let i = 0; i < tamanho * tamanho; i++) {
    const cel = document.createElement('div');
    cel.className = 'mapa-celula';
    const estado = salvo[i] || 0;
    if (estado > 0) { cel.textContent = CELULAS[estado]; cel.classList.add(CLASSES_CELULA[estado]); }
    cel.dataset.estado = estado;
    cel.addEventListener('click', () => {
      let at = parseInt(cel.dataset.estado || '0');
      at = (at + 1) % CELULAS.length;
      cel.dataset.estado = at;
      cel.className = 'mapa-celula';
      cel.textContent = CELULAS[at];
      if (at > 0) cel.classList.add(CLASSES_CELULA[at]);
      const mapa = MapaLocal.get();
      if (at === 0) delete mapa[i]; else mapa[i] = at;
      MapaLocal.set(mapa);
    });
    container.appendChild(cel);
  }
}

// ============================================================
// BOOTSTRAP
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {

  await detectarBackend();

  // Dados
  document.querySelectorAll('.dice-btn[data-dice]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sides = parseInt(btn.dataset.dice);
      const result = Math.floor(Math.random() * sides) + 1;
      const span = document.getElementById('dice-result');
      span.classList.add('roll-anim');
      span.textContent = `🎲 d${sides} → ${result}`;
      if (sides === 20) {
        if (result === 20) span.textContent += ' ⚔️ CRÍTICO!';
        else if (result === 1) span.textContent += ' 💀 FALHA!';
      }
      setTimeout(() => span.classList.remove('roll-anim'), 400);
      await registrarLog(`🎲 Rolou d${sides} → ${result}`);
    });
  });

  // Forms
  setupForm('form-dragao', 'dragoes');
  setupForm('form-jogador', 'jogadores');
  setupForm('form-inimigo', 'inimigos');
  setupForm('form-magia', 'magias');

  // Iniciativa
  const formIni = document.getElementById('form-iniciativa');
  if (formIni) formIni.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(formIni).entries());
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });
    await DB.create('iniciativa', data);
    formIni.reset();
    await renderIniciativa();
    await refreshAll();
    await registrarLog(`⚔️ ${data.nome} entrou na iniciativa (${data.iniciativa})`);
  });

  // Log form
  const formLog = document.getElementById('form-log');
  if (formLog) formLog.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ev = formLog.evento.value;
    formLog.reset();
    await registrarLog(ev);
  });

  // Turnos
  document.getElementById('btn-proximo-turno')?.addEventListener('click', async () => {
    const lista = await DB.getAll('iniciativa');
    if (lista.length === 0) return;
    turnoAtual = (turnoAtual + 1) % lista.length;
    await renderIniciativa();
    await registrarLog(`▶️ Turno de ${lista[turnoAtual].nome}`);
  });

  document.getElementById('btn-reset-iniciativa')?.addEventListener('click', async () => {
    if (!confirm('Reiniciar combate?')) return;
    const lista = await DB.getAll('iniciativa');
    for (const c of lista) await DB.delete('iniciativa', c.id);
    turnoAtual = 0;
    await renderIniciativa();
    await refreshAll();
    await registrarLog('🔄 Combate reiniciado');
  });

  // Gerar dragão
  document.getElementById('btn-gerar-dragao')?.addEventListener('click', async () => {
    const tipos = [
      { tipo: 'Vermelho', sopro: 'Cone de fogo (8d6)' },
      { tipo: 'Azul', sopro: 'Linha de raio (8d6)' },
      { tipo: 'Verde', sopro: 'Cone de veneno (8d6)' },
      { tipo: 'Negro', sopro: 'Linha de ácido (8d6)' },
      { tipo: 'Branco', sopro: 'Cone de gelo (8d6)' }
    ];
    const nomes = ['Ignis', 'Smaug', 'Tiamat', 'Fafnir', 'Bahamut', 'Nidhogg'];
    const faixas = [
      { nome: 'Filhote', hp: 30, nd: '1-3' },
      { nome: 'Jovem', hp: 100, nd: '4-8' },
      { nome: 'Adulto', hp: 220, nd: '9-15' },
      { nome: 'Ancião', hp: 450, nd: '16-20' }
    ];
    const t = tipos[Math.floor(Math.random() * tipos.length)];
    const n = nomes[Math.floor(Math.random() * nomes.length)];
    const f = faixas[Math.floor(Math.random() * faixas.length)];
    const dragao = {
      nome: `${n} ${Math.floor(Math.random() * 99) + 1}`,
      tipo: t.tipo,
      idade: Math.floor(Math.random() * 500) + 5,
      hp: f.hp + Math.floor(Math.random() * 50),
      sopro: `${t.sopro} · ND ${f.nd} · ${f.nome}`
    };
    await DB.create('dragoes', dragao);
    await refreshAll();
    await registrarLog(`🐲 Dragão gerado: ${dragao.nome}`);
  });

  // Catálogo
  document.getElementById('btn-restaurar-catalogo')?.addEventListener('click', async () => {
    if (!confirm('Adicionar catálogo padrão?')) return;
    const atuais = await DB.getAll('magias');
    const nomes = new Set(atuais.map(m => m.nome));
    for (const m of CATALOGO_MAGIAS) {
      if (!nomes.has(m.nome)) await DB.create('magias', m);
    }
    await refreshAll();
    await registrarLog('📚 Catálogo restaurado');
    alert('✅ Catálogo restaurado!');
  });

  // Mapa
  document.getElementById('grid-size')?.addEventListener('change', (e) => {
    MapaLocal.set({});
    gerarMapa(parseInt(e.target.value));
  });
  document.getElementById('btn-limpar-mapa')?.addEventListener('click', () => {
    if (!confirm('Limpar mapa?')) return;
    MapaLocal.set({});
    gerarMapa(parseInt(document.getElementById('grid-size').value));
  });

  // Backup
  document.getElementById('btn-export')?.addEventListener('click', async () => {
    const backup = await DB.backup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnd-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    await registrarLog('💾 Backup exportado');
  });

  document.getElementById('file-import')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!confirm('Importar backup? (os dados serão adicionados)')) return;
        for (const cat of ['dragoes', 'jogadores', 'inimigos', 'magias']) {
          for (const item of (data[cat] || [])) {
            const copia = { ...item };
            delete copia.id;
            await DB.create(cat, copia);
          }
        }
        await refreshAll();
        alert('✅ Backup importado!');
      } catch { alert('❌ Arquivo inválido'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Imprimir
  document.getElementById('btn-print')?.addEventListener('click', () => window.print());

  // Tema
  const themeBtn = document.getElementById('theme-toggle');
  if (localStorage.getItem('dnd_tema') === 'light') {
    document.body.classList.add('light');
    themeBtn.textContent = '☀️';
  }
  themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const light = document.body.classList.contains('light');
    themeBtn.textContent = light ? '☀️' : '🌙';
    localStorage.setItem('dnd_tema', light ? 'light' : 'dark');
    aplicarFundo();
  });

  // Fundo
  const FUNDOS = [
    'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=1920&q=80',
    'https://images.unsplash.com/photo-1503435980610-a51f3ddfee50?w=1920&q=80',
    'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=1920&q=80'
  ];
  let fundoAtual = parseInt(localStorage.getItem('dnd_fundo') || '0');
  function aplicarFundo() {
    const cor = document.body.classList.contains('light')
      ? 'rgba(244,236,216,0.9), rgba(244,236,216,0.95)'
      : 'rgba(26,20,16,0.88), rgba(26,20,16,0.94)';
    document.body.style.backgroundImage = `linear-gradient(${cor}), url('${FUNDOS[fundoAtual]}')`;
  }
  document.getElementById('btn-bg')?.addEventListener('click', () => {
    fundoAtual = (fundoAtual + 1) % FUNDOS.length;
    localStorage.setItem('dnd_fundo', fundoAtual);
    aplicarFundo();
  });
  aplicarFundo();

  // Áudio
  const AMBIENTES = {
    taverna: 'audio/taverna.mp3', masmorra: 'audio/masmorra.mp3',
    combate: 'audio/combate.mp3', floresta: 'audio/floresta.mp3'
  };
  const ap = document.getElementById('audio-player');
  const st = document.getElementById('audio-status');
  document.querySelectorAll('.amb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const amb = btn.dataset.amb;
      document.querySelectorAll('.amb-btn').forEach(b => b.classList.remove('ativo'));
      if (amb === 'off') { ap.pause(); st.textContent = '🔇 Silêncio'; return; }
      btn.classList.add('ativo');
      ap.src = AMBIENTES[amb];
      ap.volume = 0.4;
      ap.play()
        .then(() => st.textContent = `🎵 ${btn.textContent.trim()}`)
        .catch(() => st.textContent = '⚠️ Adicione MP3 em /audio/');
    });
  });

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }

  // Carga inicial
  await refreshAll();
  await renderLog();
  gerarMapa(parseInt(document.getElementById('grid-size').value));
});
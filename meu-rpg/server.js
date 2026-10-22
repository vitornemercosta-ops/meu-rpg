import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const db = new Database('dnd.db');

app.use(cors());
app.use(express.json());

// Cria tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL,
    dados TEXT NOT NULL
  )
`);

// Listar registros de uma categoria
app.get('/api/:categoria', (req, res) => {
  const rows = db.prepare('SELECT * FROM registros WHERE categoria = ?')
                 .all(req.params.categoria);
  res.json(rows.map(r => ({ id: r.id, ...JSON.parse(r.dados) })));
});

// Adicionar registro
app.post('/api/:categoria', (req, res) => {
  const stmt = db.prepare('INSERT INTO registros (categoria, dados) VALUES (?, ?)');
  const info = stmt.run(req.params.categoria, JSON.stringify(req.body));
  res.json({ id: info.lastInsertRowid, ...req.body });
});

// Excluir registro
app.delete('/api/:categoria/:id', (req, res) => {
  db.prepare('DELETE FROM registros WHERE id = ? AND categoria = ?')
    .run(req.params.id, req.params.categoria);
  res.json({ ok: true });
});

app.listen(3001, () => console.log('🐉 Backend rodando em http://localhost:3001'));
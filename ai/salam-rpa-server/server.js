const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Init database
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    week TEXT DEFAULT '',
    period TEXT DEFAULT '',
    preparedBy TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS processes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept TEXT DEFAULT '',
    contact TEXT DEFAULT '',
    name TEXT DEFAULT '',
    session TEXT DEFAULT '',
    systems TEXT DEFAULT '',
    desc TEXT DEFAULT '',
    assess TEXT DEFAULT '',
    assessReason TEXT DEFAULT '',
    reviewStatus TEXT DEFAULT 'Under Review',
    status TEXT DEFAULT 'Analysis',
    blockers TEXT DEFAULT '',
    nextSteps TEXT DEFAULT '',
    meeting TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week TEXT DEFAULT '',
    period TEXT DEFAULT '',
    kpi TEXT DEFAULT '{}',
    processes TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Ensure config row exists
const row = db.prepare('SELECT COUNT(*) as c FROM config').get();
if (row.c === 0) {
  db.prepare('INSERT INTO config (id, week, period, preparedBy) VALUES (1, ?, ?, ?)').run('13', '', '');
}

// ============ CONFIG ============

app.get('/api/config', (req, res) => {
  const config = db.prepare('SELECT week, period, preparedBy FROM config WHERE id = 1').get();
  res.json(config);
});

app.post('/api/config', (req, res) => {
  const { week, period, preparedBy } = req.body;
  db.prepare('UPDATE config SET week = ?, period = ?, preparedBy = ? WHERE id = 1')
    .run(week || '', period || '', preparedBy || '');
  res.json({ ok: true });
});

// ============ PROCESSES ============

app.get('/api/processes', (req, res) => {
  const processes = db.prepare('SELECT * FROM processes ORDER BY sort_order, id').all();
  res.json(processes);
});

app.post('/api/processes', (req, res) => {
  const { processes } = req.body;
  if (!Array.isArray(processes)) return res.status(400).json({ error: 'processes must be an array' });

  const del = db.prepare('DELETE FROM processes');
  const ins = db.prepare(`
    INSERT INTO processes (dept, contact, name, session, systems, desc, assess, assessReason, reviewStatus, status, blockers, nextSteps, meeting, notes, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((list) => {
    del.run();
    list.forEach((p, i) => {
      ins.run(
        p.dept || '', p.contact || '', p.name || '', p.session || '',
        p.systems || '', p.desc || '', p.assess || '', p.assessReason || '',
        p.reviewStatus || 'Under Review', p.status || 'Analysis',
        p.blockers || '', p.nextSteps || '', p.meeting || '', p.notes || '',
        i
      );
    });
  });

  transaction(processes);
  res.json({ ok: true, count: processes.length });
});

// ============ SNAPSHOTS ============

app.get('/api/snapshots', (req, res) => {
  const snapshots = db.prepare('SELECT * FROM snapshots ORDER BY id').all();
  const parsed = snapshots.map(s => {
    try {
      s.kpi = JSON.parse(s.kpi);
    } catch(e) { s.kpi = {}; }
    try {
      s.processes = JSON.parse(s.processes);
    } catch(e) { s.processes = []; }
    delete s.id;
    delete s.created_at;
    return s;
  });
  res.json(parsed);
});

app.post('/api/snapshots', (req, res) => {
  const { snapshots } = req.body;
  if (!Array.isArray(snapshots)) return res.status(400).json({ error: 'snapshots must be an array' });

  const del = db.prepare('DELETE FROM snapshots');
  const ins = db.prepare('INSERT INTO snapshots (week, period, kpi, processes) VALUES (?, ?, ?, ?)');

  const transaction = db.transaction((list) => {
    del.run();
    list.forEach(s => {
      ins.run(
        s.week || '',
        s.period || '',
        JSON.stringify(s.kpi || {}),
        JSON.stringify(s.processes || [])
      );
    });
  });

  transaction(snapshots);
  res.json({ ok: true, count: snapshots.length });
});

// ============ SINGLE SNAPSHOT (for takeSnapshot) ============

app.post('/api/snapshot', (req, res) => {
  const { week, period, processes, kpi } = req.body;
  // Check if snapshot for this week exists, replace or insert
  const existing = db.prepare('SELECT id FROM snapshots WHERE week = ? ORDER BY id DESC LIMIT 1').get(week);
  if (existing) {
    db.prepare('UPDATE snapshots SET period = ?, kpi = ?, processes = ? WHERE id = ?')
      .run(period || '', JSON.stringify(kpi || {}), JSON.stringify(processes || []), existing.id);
  } else {
    db.prepare('INSERT INTO snapshots (week, period, kpi, processes) VALUES (?, ?, ?, ?)')
      .run(week || '', period || '', JSON.stringify(kpi || {}), JSON.stringify(processes || []));
  }
  res.json({ ok: true });
});

// ============ SERVE HTML ============
// Copy the HTML file to the server directory for easy serving
const publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath);
app.use(express.static(publicPath));

// Serve the original HTML at root
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ============ START ============

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Salam RPA Server running on http://0.0.0.0:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

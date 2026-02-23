import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('garden_horizons.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  
  CREATE TABLE IF NOT EXISTS mutations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    imageUrl TEXT,
    overlayText TEXT,
    displayOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    imageUrl TEXT,
    overlayText TEXT,
    displayOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS hall_of_fame (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    imageUrl TEXT,
    youtubeUrl TEXT,
    createdAt TEXT,
    displayOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT,
    description TEXT,
    displayOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    answer TEXT
  );
`);

// Migrations: Add displayOrder column if it doesn't exist (for existing databases)
const tablesToCheck = ['mutations', 'plants', 'hall_of_fame'];
tablesToCheck.forEach(table => {
  try {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN displayOrder INTEGER DEFAULT 0`).run();
  } catch (e) {
    // Column likely exists, ignore
  }
});

// Seed initial settings if not exists
const seedSettings = [
  { key: 'admin_password_hash', value: bcrypt.hashSync('admin123', 10) }, // Default password
  { key: 'discord_invite_url', value: 'https://discord.gg/example' },
  { key: 'game_url', value: 'https://www.roblox.com/games/example' },
  { key: 'discord_webhook_url', value: '' },
  { key: 'app_icon_url', value: 'https://picsum.photos/seed/icon/200/200' },
  { key: 'bg_home', value: 'https://picsum.photos/seed/forest/1920/1080' },
  { key: 'bg_mutations', value: 'https://picsum.photos/seed/mystic/1920/1080' },
  { key: 'bg_plants', value: 'https://picsum.photos/seed/jungle/1920/1080' },
  { key: 'bg_codes', value: 'https://picsum.photos/seed/nebula/1920/1080' },
];

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
seedSettings.forEach(s => insertSetting.run(s.key, s.value));

// Seed initial FAQs if empty
const faqCount = db.prepare('SELECT count(*) as count FROM faqs').get() as { count: number };
if (faqCount.count === 0) {
  const insertFaq = db.prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)');
  insertFaq.run('How do I join?', 'Click the Discord button in the footer!');
  insertFaq.run('What are mutations?', 'Special evolutions with unique traits.');
  insertFaq.run('Is it free?', 'Yes, Garden Horizons is free to play.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Public Data
  app.get('/api/settings/public', (req, res) => {
    const keys = ['discord_invite_url', 'game_url', 'app_icon_url', 'bg_home', 'bg_mutations', 'bg_plants', 'bg_codes'];
    const stmt = db.prepare(`SELECT key, value FROM settings WHERE key IN (${keys.map(() => '?').join(',')})`);
    const rows = stmt.all(...keys) as { key: string, value: string }[];
    const settings: Record<string, string> = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json(settings);
  });

  app.get('/api/content/:type', (req, res) => {
    const { type } = req.params;
    if (!['mutations', 'plants', 'hall_of_fame', 'faqs', 'codes'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    let query = `SELECT * FROM ${type}`;
    // Add sorting if the table has displayOrder
    if (['mutations', 'plants', 'hall_of_fame', 'codes'].includes(type)) {
      query += ` ORDER BY displayOrder ASC, id DESC`;
    }
    
    const rows = db.prepare(query).all();
    res.json(rows);
  });

  // Support
  app.post('/api/support', async (req, res) => {
    const { discordUsername, message } = req.body;
    if (!discordUsername || !message) return res.status(400).json({ error: 'Missing fields' });

    const webhookUrl = (db.prepare('SELECT value FROM settings WHERE key = ?').get('discord_webhook_url') as { value: string })?.value;

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'Garden Horizons Support',
            embeds: [{
              title: 'New Support Request',
              color: 3066993, // Greenish
              fields: [
                { name: 'Discord User', value: discordUsername, inline: true },
                { name: 'Time', value: new Date().toLocaleString(), inline: true },
                { name: 'Message', value: message }
              ]
            }]
          })
        });
      } catch (e) {
        console.error('Webhook failed', e);
      }
    }
    res.json({ success: true });
  });

  // Admin Auth
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const hash = (db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password_hash') as { value: string }).value;
    if (bcrypt.compareSync(password, hash)) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  });

  // Admin Routes
  const verifyAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No password provided' });
    
    const hash = (db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password_hash') as { value: string }).value;
    if (bcrypt.compareSync(authHeader, hash)) {
      next();
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  };

  app.post('/api/content/:type', verifyAdmin, (req, res) => {
    const { type } = req.params;
    const data = req.body;
    
    if (type === 'mutations' || type === 'plants') {
      const stmt = db.prepare('INSERT INTO ' + type + ' (title, description, imageUrl, overlayText, displayOrder) VALUES (?, ?, ?, ?, ?)');
      stmt.run(data.title, data.description, data.imageUrl, data.overlayText, data.displayOrder || 0);
    } else if (type === 'hall_of_fame') {
      const stmt = db.prepare('INSERT INTO hall_of_fame (name, description, imageUrl, youtubeUrl, createdAt, displayOrder) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(data.name, data.description, data.imageUrl, data.youtubeUrl, new Date().toISOString(), data.displayOrder || 0);
    } else if (type === 'codes') {
      const stmt = db.prepare('INSERT INTO codes (code, description, displayOrder) VALUES (?, ?, ?)');
      stmt.run(data.code, data.description, data.displayOrder || 0);
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }
    res.json({ success: true });
  });

  app.put('/api/content/:type/:id', verifyAdmin, (req, res) => {
    const { type, id } = req.params;
    const data = req.body;

    if (type === 'mutations' || type === 'plants') {
      const stmt = db.prepare('UPDATE ' + type + ' SET title=?, description=?, imageUrl=?, overlayText=?, displayOrder=? WHERE id=?');
      stmt.run(data.title, data.description, data.imageUrl, data.overlayText, data.displayOrder || 0, id);
    } else if (type === 'hall_of_fame') {
      const stmt = db.prepare('UPDATE hall_of_fame SET name=?, description=?, imageUrl=?, youtubeUrl=?, displayOrder=? WHERE id=?');
      stmt.run(data.name, data.description, data.imageUrl, data.youtubeUrl, data.displayOrder || 0, id);
    } else if (type === 'codes') {
      const stmt = db.prepare('UPDATE codes SET code=?, description=?, displayOrder=? WHERE id=?');
      stmt.run(data.code, data.description, data.displayOrder || 0, id);
    } else if (type === 'faqs') {
      const stmt = db.prepare('UPDATE faqs SET question=?, answer=? WHERE id=?');
      stmt.run(data.question, data.answer, id);
    }
    res.json({ success: true });
  });
  
  // Settings Management
  app.get('/api/admin/settings', verifyAdmin, (req, res) => {
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string, value: string }[];
    const settings: Record<string, string> = {};
    rows.forEach(r => settings[r.key] = r.value);
    // Don't send hash back
    delete settings['admin_password_hash'];
    res.json(settings);
  });

  app.put('/api/admin/settings', verifyAdmin, (req, res) => {
    const { settings, newPassword } = req.body;
    
    const update = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    Object.entries(settings).forEach(([key, value]) => {
      if (key !== 'admin_password_hash') {
        update.run(key, value);
      }
    });

    if (newPassword) {
      update.run('admin_password_hash', bcrypt.hashSync(newPassword, 10));
    }

    res.json({ success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

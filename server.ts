import express from "express";
import { createServer as createViteServer } from "vite";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'src/data/db.json');

// Helper to read DB
function readDb() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading DB:", error);
    return { settings: {}, mutations: [], plants: [], hall_of_fame: [], codes: [], faqs: [] };
  }
}

// Helper to write DB
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing DB:", error);
  }
}

// Initialize DB if empty (basic check)
if (!fs.existsSync(DB_PATH)) {
  const initialData = {
    settings: {
      admin_password_hash: bcrypt.hashSync('admin123', 10),
      discord_invite_url: 'https://discord.gg/example',
      game_url: 'https://www.roblox.com/games/example',
      discord_webhook_url: '',
      app_icon_url: 'https://picsum.photos/seed/icon/200/200',
      bg_home: 'https://picsum.photos/seed/forest/1920/1080',
      bg_mutations: 'https://picsum.photos/seed/mystic/1920/1080',
      bg_plants: 'https://picsum.photos/seed/jungle/1920/1080',
      bg_codes: 'https://picsum.photos/seed/nebula/1920/1080'
    },
    mutations: [],
    plants: [],
    hall_of_fame: [],
    codes: [],
    faqs: [
      { id: 1, question: 'How do I join?', answer: 'Click the Discord button in the footer!' },
      { id: 2, question: 'What are mutations?', answer: 'Special evolutions with unique traits.' },
      { id: 3, question: 'Is it free?', answer: 'Yes, Garden Horizons is free to play.' }
    ]
  };
  // Ensure directory exists
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  writeDb(initialData);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Public Data
  app.get('/api/settings/public', (req, res) => {
    const db = readDb();
    const { settings } = db;
    // Filter sensitive keys if any (currently hash is the only sensitive one)
    const publicSettings = { ...settings };
    delete publicSettings.admin_password_hash;
    delete publicSettings.discord_webhook_url;
    res.json(publicSettings);
  });

  app.get('/api/content/:type', (req, res) => {
    const { type } = req.params;
    const db = readDb();
    
    if (!db[type]) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    let items = db[type];
    // Sort by displayOrder
    if (['mutations', 'plants', 'hall_of_fame', 'codes'].includes(type)) {
      items.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0) || b.id - a.id);
    }
    
    res.json(items);
  });

  // Support
  app.post('/api/support', async (req, res) => {
    const { discordUsername, message } = req.body;
    if (!discordUsername || !message) return res.status(400).json({ error: 'Missing fields' });

    const db = readDb();
    const webhookUrl = db.settings.discord_webhook_url;

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
    const db = readDb();
    const hash = db.settings.admin_password_hash;
    
    // If no hash exists (migration), hash the default
    if (!hash) {
       const defaultHash = bcrypt.hashSync('admin123', 10);
       db.settings.admin_password_hash = defaultHash;
       writeDb(db);
       if (bcrypt.compareSync(password, defaultHash)) return res.json({ success: true });
    }

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
    
    const db = readDb();
    const hash = db.settings.admin_password_hash;
    if (bcrypt.compareSync(authHeader, hash)) {
      next();
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  };

  app.get('/api/admin/settings', verifyAdmin, (req, res) => {
    const db = readDb();
    res.json(db.settings);
  });

  app.put('/api/admin/settings', verifyAdmin, (req, res) => {
    const { settings: newSettings, newPassword } = req.body;
    const db = readDb();
    
    // Merge settings
    db.settings = { ...db.settings, ...newSettings };
    
    // Handle password change
    if (newPassword) {
      db.settings.admin_password_hash = bcrypt.hashSync(newPassword, 10);
    }
    
    writeDb(db);
    res.json({ success: true });
  });

  app.post('/api/content/:type', verifyAdmin, (req, res) => {
    const { type } = req.params;
    const data = req.body;
    const db = readDb();
    
    if (!db[type]) return res.status(400).json({ error: 'Invalid type' });

    // Generate ID
    const newId = (db[type].length > 0 ? Math.max(...db[type].map((i: any) => i.id)) : 0) + 1;
    
    const newItem = { id: newId, ...data };
    if (type === 'hall_of_fame') newItem.createdAt = new Date().toISOString();
    
    db[type].push(newItem);
    writeDb(db);
    
    res.json({ success: true });
  });

  app.put('/api/content/:type/:id', verifyAdmin, (req, res) => {
    const { type, id } = req.params;
    const data = req.body;
    const db = readDb();
    
    if (!db[type]) return res.status(400).json({ error: 'Invalid type' });

    const index = db[type].findIndex((i: any) => i.id === parseInt(id));
    if (index === -1) return res.status(404).json({ error: 'Item not found' });

    db[type][index] = { ...db[type][index], ...data };
    writeDb(db);
    
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from "express";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import multer from "multer";
import Parser from "rss-parser";

// --- Configuration & Constants ---
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage() });
const parser = new Parser({
  customFields: {
    item: [
      ['itunes:duration', 'duration'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- Database Initialization & Schema Management ---
async function ensureColumn(connection: mysql.Connection, table: string, column: string, definition: string) {
  try {
    const [columns] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
    if ((columns as any[]).length === 0) {
      await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`Added column ${column} to table ${table}`);
    }
  } catch (err) {
    console.error(`Error ensuring column ${column} in ${table}:`, err);
  }
}

async function initDB() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Database connection established");

    // 1. Podcast Info Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS podcast_info (
        id INT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        cover_image VARCHAR(255),
        logo_image VARCHAR(255),
        about_text TEXT,
        about_image VARCHAR(255),
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords TEXT
      )
    `);

    // 2. Hosts Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hosts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        bio TEXT,
        image_url VARCHAR(255),
        twitter_url VARCHAR(255),
        instagram_url VARCHAR(255),
        email VARCHAR(255)
      )
    `);

    // 3. Episodes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS episodes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255),
        description TEXT,
        audio_url VARCHAR(255),
        published_at DATE,
        is_hero BOOLEAN DEFAULT 0,
        guid VARCHAR(255) UNIQUE,
        duration VARCHAR(50),
        image_url VARCHAR(255)
      )
    `);

    // 4. Platforms Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS platforms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        url VARCHAR(255),
        icon_name VARCHAR(50),
        icon_url LONGTEXT,
        display_order INT DEFAULT 0
      )
    `);

    // Ensure columns for existing tables (Migrations)
    await ensureColumn(connection, 'podcast_info', 'logo_image', 'VARCHAR(255)');
    await ensureColumn(connection, 'podcast_info', 'about_text', 'TEXT');
    await ensureColumn(connection, 'podcast_info', 'about_image', 'VARCHAR(255)');
    await ensureColumn(connection, 'podcast_info', 'seo_title', 'VARCHAR(255)');
    await ensureColumn(connection, 'podcast_info', 'seo_description', 'TEXT');
    await ensureColumn(connection, 'podcast_info', 'seo_keywords', 'TEXT');
    await ensureColumn(connection, 'hosts', 'email', 'VARCHAR(255)');
    await ensureColumn(connection, 'episodes', 'guid', 'VARCHAR(255) UNIQUE');
    await ensureColumn(connection, 'episodes', 'duration', 'VARCHAR(50)');
    await ensureColumn(connection, 'episodes', 'image_url', 'VARCHAR(255)');
    await ensureColumn(connection, 'platforms', 'icon_url', 'LONGTEXT');
    await ensureColumn(connection, 'platforms', 'display_order', 'INT DEFAULT 0');

    console.log("Database schema verified");

    // Seed initial data if empty
    const [rows] = await connection.query("SELECT COUNT(*) as count FROM podcast_info");
    if ((rows as any[])[0].count === 0) {
      console.log("Seeding initial data...");
      
      await connection.query(`
        INSERT INTO podcast_info (id, title, description, cover_image, logo_image, about_text, about_image)
        VALUES (1, 'Starting Grid - Der Formel-1-Podcast', 'Der wöchentliche Formel-1-Podcast mit Kevin Scheuren und Dennis Lewandowski. Wir besprechen alles rund um die Königsklasse des Motorsports.', 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/0b4d4559-4592-4217-91a0-5e36746f3d9b/startinggrid_logo.png', '', 'Wir sind Starting Grid, der Formel-1-Podcast. Hier gibt es jede Woche die neuesten Infos, Analysen und Meinungen zur Königsklasse des Motorsports.', '')
      `);

      await connection.query(`
        INSERT INTO hosts (name, bio, image_url, twitter_url, instagram_url)
        VALUES 
        ('Kevin Scheuren', 'Motorsport-Enthusiast und Podcaster aus Leidenschaft. Verfolgt die Formel 1 seit den 90ern.', 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/0b4d4559-4592-4217-91a0-5e36746f3d9b/sg_boldpredictions_2024.png', 'https://twitter.com', 'https://instagram.com'),
        ('Dennis Lewandowski', 'Experte für Technik und Strategie in der Formel 1. Analysiert jedes Rennen bis ins kleinste Detail.', 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/0b4d4559-4592-4217-91a0-5e36746f3d9b/sg_fahrerranking_2025.png', 'https://twitter.com', 'https://instagram.com')
      `);

      const platforms = [
        { name: 'Spotify', url: 'https://open.spotify.com/show/248DTJayGh73lX1bXAhBRa?si=JpNmmoDvQva6lram6n0cqw&dl_branch=1', icon_name: 'spotify', order: 1 },
        { name: 'Apple Podcasts', url: 'https://itunes.apple.com/de/podcast/starting-grid/id1058868792?mt=2', icon_name: 'apple', order: 2 },
        { name: 'YouTube', url: 'https://www.youtube.com/@startinggrid_f1', icon_name: 'youtube', order: 3 },
        { name: 'RTL+', url: 'https://plus.rtl.de/podcast/starting-grid-l0j19z3kz1247', icon_name: 'rtl', order: 4 },
        { name: 'Deezer', url: 'https://deezer.com/show/1006282', icon_name: 'deezer', order: 5 },
        { name: 'meinsportpodcast.de', url: 'https://meinsportpodcast.de/motorsport/starting-grid/', icon_name: 'rss', order: 6 }
      ];

      for (const p of platforms) {
        await connection.query("INSERT INTO platforms (name, url, icon_name, display_order) VALUES (?, ?, ?, ?)", [p.name, p.url, p.icon_name, p.order]);
      }

      console.log("Initial data seeded");
    }
  } catch (err) {
    console.error("DB Init Error:", err);
  } finally {
    if (connection) connection.release();
  }
}

// --- Server Start ---
async function startServer() {
  await initDB();
  const app = express();

  app.use(express.json());

  // --- API ROUTES: Podcast Info ---
  app.get("/api/podcast", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM podcast_info WHERE id = 1");
      res.json((rows as any[])[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch podcast info" });
    }
  });

  app.put("/api/podcast", async (req, res) => {
    try {
      const { title, description, cover_image, logo_image, about_text, about_image, seo_title, seo_description, seo_keywords } = req.body;
      await pool.query(
        "UPDATE podcast_info SET title = ?, description = ?, cover_image = ?, logo_image = ?, about_text = ?, about_image = ?, seo_title = ?, seo_description = ?, seo_keywords = ? WHERE id = 1",
        [title, description, cover_image, logo_image || '', about_text || '', about_image || '', seo_title || '', seo_description || '', seo_keywords || '']
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update podcast info" });
    }
  });

  // --- API ROUTES: Hosts ---
  app.get("/api/hosts", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM hosts");
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch hosts" });
    }
  });

  app.put("/api/hosts/:id", async (req, res) => {
    try {
      const { name, bio, image_url, twitter_url, instagram_url, email } = req.body;
      await pool.query(
        "UPDATE hosts SET name = ?, bio = ?, image_url = ?, twitter_url = ?, instagram_url = ?, email = ? WHERE id = ?",
        [name, bio, image_url, twitter_url, instagram_url, email, req.params.id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update host" });
    }
  });

  // --- API ROUTES: Episodes ---
  app.get("/api/episodes", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, title, description, audio_url, DATE_FORMAT(published_at, '%Y-%m-%d') as published_at, is_hero, duration, image_url FROM episodes ORDER BY published_at DESC");
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch episodes" });
    }
  });

  app.post("/api/episodes", async (req, res) => {
    try {
      const { title, description, audio_url, published_at, is_hero, image_url, duration } = req.body;
      const dateStr = published_at ? published_at.split('T')[0] : null;
      if (is_hero) {
        await pool.query("UPDATE episodes SET is_hero = 0");
      }
      const [result] = await pool.query(
        "INSERT INTO episodes (title, description, audio_url, published_at, is_hero, image_url, duration) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, description, audio_url, dateStr, is_hero ? 1 : 0, image_url, duration || ""]
      );
      res.json({ id: (result as any).insertId });
    } catch (err) {
      res.status(500).json({ error: "Failed to create episode" });
    }
  });

  app.put("/api/episodes/:id", async (req, res) => {
    try {
      const { title, description, audio_url, published_at, is_hero, image_url, duration } = req.body;
      const dateStr = published_at ? published_at.split('T')[0] : null;
      if (is_hero) {
        await pool.query("UPDATE episodes SET is_hero = 0");
      }
      await pool.query(
        "UPDATE episodes SET title = ?, description = ?, audio_url = ?, published_at = ?, is_hero = ?, image_url = ?, duration = ? WHERE id = ?",
        [title, description, audio_url, dateStr, is_hero ? 1 : 0, image_url, duration, req.params.id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update episode" });
    }
  });

  app.delete("/api/episodes/:id", async (req, res) => {
    try {
      await pool.query("DELETE FROM episodes WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete episode" });
    }
  });

  app.delete("/api/admin/episodes/clear", async (req, res) => {
    try {
      await pool.query("DELETE FROM episodes");
      await pool.query("ALTER TABLE episodes AUTO_INCREMENT = 1");
      res.json({ success: true });
    } catch (err) {
      console.error("Error clearing episodes:", err);
      res.status(500).json({ success: false, error: "Failed to clear episodes" });
    }
  });

  app.post("/api/admin/rss-import", async (req, res) => {
    try {
      const feed = await parser.parseURL("https://meinsportpodcast.de/motorsport/starting-grid/feed/");
      let importedCount = 0;

      for (const item of feed.items) {
        if (!item.title || !item.guid) continue;

        const [existing] = await pool.query<any[]>("SELECT id, duration FROM episodes WHERE guid = ?", [item.guid]);
        
        let duration = "";
        if (item.duration) {
          duration = item.duration;
        } else if ((item as any).itunes && (item as any).itunes.duration) {
          duration = (item as any).itunes.duration;
        }

        let description = (item as any).contentEncoded || item.content || item.contentSnippet || "";
        if (description) description = description.trim();

        let audioUrl = "#";
        if (item.enclosure && item.enclosure.url) {
          audioUrl = item.enclosure.url;
        } else if (item.link) {
          audioUrl = item.link;
        }

        if (existing.length === 0) {
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          const dateStr = pubDate.toISOString().split('T')[0];
          
          await pool.query(
            "INSERT INTO episodes (title, description, audio_url, published_at, is_hero, guid, duration) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [item.title, description, audioUrl, dateStr, 0, item.guid, duration]
          );
          importedCount++;
        } else {
          await pool.query(
            "UPDATE episodes SET duration = ?, description = ? WHERE id = ?",
            [duration || existing[0].duration, description, existing[0].id]
          );
        }
      }
      res.json({ success: true, imported: importedCount });
    } catch (error) {
      console.error("RSS Import Error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch RSS feed" });
    }
  });

  // --- API ROUTES: Platforms ---
  app.get("/api/platforms", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM platforms ORDER BY display_order ASC");
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch platforms" });
    }
  });

  app.post("/api/platforms", async (req, res) => {
    try {
      const { name, url, display_order } = req.body;
      const [result] = await pool.query<any>(
        "INSERT INTO platforms (name, url, icon_name, display_order) VALUES (?, ?, 'rss', ?)",
        [name, url, display_order || 0]
      );
      res.json({ success: true, id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: "Failed to create platform" });
    }
  });

  app.put("/api/platforms/:id", async (req, res) => {
    try {
      const { name, url, icon_url, display_order } = req.body;
      await pool.query(
        "UPDATE platforms SET name = ?, url = ?, icon_url = ?, display_order = ? WHERE id = ?",
        [name, url, icon_url, display_order, req.params.id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update platform" });
    }
  });

  app.delete("/api/platforms/:id", async (req, res) => {
    try {
      await pool.query("DELETE FROM platforms WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete platform" });
    }
  });

  app.post("/api/platforms/:id/icon", upload.single("icon"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      await pool.query("UPDATE platforms SET icon_url = ? WHERE id = ?", [base64, req.params.id]);
      res.json({ success: true, icon_url: base64 });
    } catch (err) {
      res.status(500).json({ error: "Failed to upload platform icon" });
    }
  });

  // --- API ROUTES: Utilities ---
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Keine Datei gesendet." });
    }

    try {
      const formData = new FormData();
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append("image", blob, req.file.originalname);
      formData.append("secret", process.env.UPLOAD_API_SECRET || "");

      const uploadUrl = process.env.UPLOAD_API_URL || "https://letthemrace.net/sg_api/upload.php";
      const response = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("Upload proxy error:", err);
      res.status(500).json({ success: false, error: "Upload-Weiterleitung fehlgeschlagen." });
    }
  });

  // --- Frontend Integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();



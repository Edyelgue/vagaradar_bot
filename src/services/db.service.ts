import sqlite3 from "sqlite3";

const DB_FILE = process.env.SQLITE_FILE || "vagaradar.db";
let db: sqlite3.Database | null = null;

export async function initDb(): Promise<void> {
  if (db) return;

  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_FILE, (err) => {
      if (err) {
        return reject(err);
      }

      db!.run(
        `CREATE TABLE IF NOT EXISTS jobs (
          id TEXT PRIMARY KEY,
          title TEXT,
          company TEXT,
          location TEXT,
          url TEXT,
          published_date TEXT
        )`,
        (runErr) => {
          if (runErr) {
            return reject(runErr);
          }
          resolve();
        }
      );
    });
  });
}

export async function isJobSeen(jobId: string): Promise<boolean> {
  if (!db) throw new Error("Database não inicializada");

  return new Promise((resolve, reject) => {
    db!.get("SELECT 1 FROM jobs WHERE id = ?", [jobId], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
}

export async function markJobSeen(job: { id: string; title: string; company: string; location: string; url: string; publishedDate?: string }): Promise<void> {
  if (!db) throw new Error("Database não inicializada");

  return new Promise((resolve, reject) => {
    db!.run(
      "INSERT OR IGNORE INTO jobs (id, title, company, location, url, published_date) VALUES (?, ?, ?, ?, ?, ?)",
      [job.id, job.title, job.company, job.location, job.url, job.publishedDate || new Date().toISOString()],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

export async function closeDb(): Promise<void> {
  if (!db) return;
  return new Promise((resolve, reject) => {
    db!.close((err) => {
      if (err) return reject(err);
      db = null;
      resolve();
    });
  });
}

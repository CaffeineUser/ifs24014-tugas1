import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const configuredPath = process.env.DATABASE_PATH || './database/suarakita.sqlite';
const dbPath = path.isAbsolute(configuredPath) ? configuredPath : path.resolve(root, configuredPath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

export default db;

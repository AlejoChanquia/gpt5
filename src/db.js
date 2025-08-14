const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    preferences TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    difficulty TEXT,
    estimated_time TEXT,
    author_id INTEGER NOT NULL,
    FOREIGN KEY(author_id) REFERENCES users(id)
  )`);

  // For existing databases, add new columns if they don't exist
  db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student'", () => {});
  db.run('ALTER TABLE courses ADD COLUMN difficulty TEXT', () => {});
  db.run('ALTER TABLE courses ADD COLUMN estimated_time TEXT', () => {});
});

module.exports = db;

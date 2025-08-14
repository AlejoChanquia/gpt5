const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('teacher','student')),
    preferences TEXT
  )`);

  // Ensure preferences column exists for older databases
  db.run('ALTER TABLE users ADD COLUMN preferences TEXT', () => {});

  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    teacher_id INTEGER NOT NULL,
    FOREIGN KEY(teacher_id) REFERENCES users(id)
  )`);
});

module.exports = db;

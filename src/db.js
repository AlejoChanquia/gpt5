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

  // Seed initial data for demonstration if tables are empty
  const seedPassword = '$2b$10$7WUkoVvzuiIHn1vCqGs8Ou3g7L63M.VGB3VF8jllbu0qflfPm5asm';

  db.run(
    `INSERT OR IGNORE INTO users (id, name, email, password, role)
     VALUES (1, 'Alice Smith', 'alice@example.com', ?, 'teacher')`,
    seedPassword
  );
  db.run(
    `INSERT OR IGNORE INTO users (id, name, email, password, role)
     VALUES (2, 'Bob Student', 'bob@example.com', ?, 'student')`,
    seedPassword
  );

  db.run(
    `INSERT OR IGNORE INTO courses
      (id, title, description, content, difficulty, estimated_time, author_id)
     VALUES (1, 'Introducción a Node.js', 'Curso básico de Node.js', 'Contenido del curso', 'Fácil', '3h', 1)`
  );
  db.run(
    `INSERT OR IGNORE INTO courses
      (id, title, description, content, difficulty, estimated_time, author_id)
     VALUES (2, 'Avanzado en Express', 'Profundización en Express', 'Contenido avanzado', 'Intermedio', '5h', 1)`
  );
  db.run(
    `INSERT OR IGNORE INTO courses
      (id, title, description, content, difficulty, estimated_time, author_id)
     VALUES (3, 'Fundamentos de Bases de Datos', 'Curso básico de bases de datos', 'Contenido introductorio', 'Fácil', '4h', 2)`
  );
});

module.exports = db;

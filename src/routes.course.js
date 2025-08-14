const express = require('express');
const sanitizeHtml = require('sanitize-html');
const db = require('./db');
const { authenticate } = require('./middleware.auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT courses.*, users.name as author_name FROM courses JOIN users ON courses.author_id = users.id';
  const params = [];
  if (search) {
    sql += ' WHERE courses.title LIKE ? OR courses.description LIKE ?';
    const like = `%${search}%`;
    params.push(like, like);
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    return res.json(rows);
  });
});

router.post('/', authenticate, (req, res) => {
  const { title, description, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const safeTitle = sanitizeHtml(title);
  const safeDesc = sanitizeHtml(description || '');
  const safeContent = sanitizeHtml(content || '');
  const stmt = db.prepare('INSERT INTO courses (title, description, content, author_id) VALUES (?, ?, ?, ?)');
  stmt.run(safeTitle, safeDesc, safeContent, req.user.id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    return res.json({ id: this.lastID, title: safeTitle, description: safeDesc, content: safeContent });
  });
});

module.exports = router;

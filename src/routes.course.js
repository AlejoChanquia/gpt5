const express = require('express');
const db = require('./db');
const { authenticate } = require('./middleware.auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT courses.*, users.name as teacher_name FROM courses JOIN users ON courses.teacher_id = users.id';
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
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can create courses' });
  const { title, description, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const stmt = db.prepare('INSERT INTO courses (title, description, content, teacher_id) VALUES (?, ?, ?, ?)');
  stmt.run(title, description || '', content || '', req.user.id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    return res.json({ id: this.lastID, title, description, content });
  });
});

module.exports = router;

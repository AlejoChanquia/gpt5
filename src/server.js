const express = require('express');
const authRoutes = require('./routes.auth');
const courseRoutes = require('./routes.course');
require('./db');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.use('/api', authRoutes);
app.use('/api/courses', courseRoutes);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}

module.exports = app;

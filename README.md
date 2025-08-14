# Plataforma de Cursos

Esta aplicación Express utiliza JWT para autenticar a los usuarios y una base de datos SQLite para almacenar la información.

## Requisitos
- Node.js
- npm

## Instalación
```bash
npm install
```

## Ejecución
```bash
npm start
```
El servidor se ejecuta en `http://localhost:3000` por defecto.

## Seguridad
- Registro con contraseña robusta (mínimo 8 caracteres, mayúsculas, minúsculas y números).
- Validación de correo electrónico.
- Los datos enviados por los usuarios se sanitan con `sanitize-html` para evitar inyecciones XSS.
- Autenticación mediante tokens JWT.

## Base de datos
Se utiliza **SQLite** y el archivo `database.db` se crea automáticamente. Las tablas principales son:

- **users**: id, name, email, password, role, preferences.
- **courses**: id, title, description, content, author_id.

Para inspeccionar la base de datos manualmente puedes usar la CLI de SQLite:
```bash
sqlite3 database.db
```
Dentro de la consola puedes ejecutar consultas SQL, por ejemplo:
```sql
.tables
SELECT * FROM users;
```

## Pruebas
Ejecuta las pruebas con:
```bash
npm test
```

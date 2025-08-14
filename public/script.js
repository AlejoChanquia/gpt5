// Shared client-side utilities
let token = localStorage.getItem('token') || '';
let user = JSON.parse(localStorage.getItem('user') || '{}');

async function register() {
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-pass').value;
  const role = document.getElementById('reg-role').value;
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  const data = await res.json();
  const result = document.getElementById('reg-result');
  if (result) result.innerText = data.error ? data.error : 'Registrado correctamente';
  if (!data.error) window.location.href = 'login.html';
}

async function login() {
  const email = document.getElementById('log-email').value;
  const password = document.getElementById('log-pass').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  const result = document.getElementById('log-result');
  if (data.token) {
    token = data.token;
    user = { name: data.name, email: data.email, role: data.role };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.location.href = 'home.html';
  } else if (result) {
    result.innerText = data.error || 'Error de login';
  }
}

function requireAuth() {
  if (!token) {
    window.location.href = 'login.html';
  }
}

function loadProfile() {
  requireAuth();
  const nameEl = document.getElementById('prof-name');
  const emailEl = document.getElementById('prof-email');
  const roleEl = document.getElementById('prof-role');
  if (nameEl) nameEl.innerText = user.name || '';
  if (emailEl) emailEl.innerText = user.email || '';
  if (roleEl) roleEl.innerText = user.role || '';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

async function createCourse() {
  requireAuth();
  const title = document.getElementById('course-title').value;
  const description = document.getElementById('course-description').value;
  const content = document.getElementById('course-content').value;
  const res = await fetch('/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ title, description, content })
  });
  const data = await res.json();
  const result = document.getElementById('course-result');
  if (result) result.innerText = data.error ? data.error : 'Curso creado';
}

async function loadCourses() {
  const res = await fetch('/api/courses');
  const data = await res.json();
  const list = document.getElementById('courses');
  if (list) {
    list.innerHTML = '';
    data.forEach(c => {
      const li = document.createElement('li');
      li.innerText = `${c.title} - ${c.teacher_name}`;
      list.appendChild(li);
    });
  }
}

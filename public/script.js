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
    user = { id: data.id, name: data.name, email: data.email, role: data.role, preferences: data.preferences };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (!user.preferences) {
      window.location.href = 'setup.html';
    } else {
      window.location.href = 'home.html';
    }
  } else if (result) {
    result.innerText = data.error || 'Error de login';
  }
}

function requireAuth() {
  if (!token) {
    window.location.href = 'login.html';
  }
}

async function loadProfile() {
  requireAuth();
  if (!user || !user.id) return;

  const res = await fetch(`/api/users/${user.id}`);
  const data = await res.json();

  if (data.error) {
    console.error(data.error);
    return;
  }

  document.getElementById('prof-name').innerText = data.user.name;
  document.getElementById('prof-email').innerText = data.user.email;
  document.getElementById('prof-role').innerText = data.user.role;

  const coursesList = document.getElementById('prof-courses');
  coursesList.innerHTML = '';
  if (data.courses && data.courses.length > 0) {
    data.courses.forEach(course => {
      const li = document.createElement('li');
      li.innerText = `${course.title}`;
      coursesList.appendChild(li);
    });
  } else {
    coursesList.innerHTML = '<li>No courses created yet.</li>';
  }
}

function logout() {
  if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }
}

function redirectIfLoggedIn() {
    if (token) {
        window.location.href = 'home.html';
    }
}

async function createCourse() {
  requireAuth();
  const title = document.getElementById('course-title').value;
  const description = document.getElementById('course-description').value;
  const content = document.getElementById('course-content').value;
  const difficulty = document.getElementById('course-difficulty').value;
  const estimated_time = document.getElementById('course-time').value;

  const res = await fetch('/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ title, description, content, difficulty, estimated_time })
  });
  const data = await res.json();
  const result = document.getElementById('course-result');
  if (result) result.innerText = data.error ? data.error : 'Course created successfully!';
  if (!data.error) {
    document.getElementById('course-title').value = '';
    document.getElementById('course-description').value = '';
    document.getElementById('course-content').value = '';
    document.getElementById('course-difficulty').value = '';
    document.getElementById('course-time').value = '';
  }
}

async function loadCourses(search = '') {
  const url = search ? '/api/courses?search=' + encodeURIComponent(search) : '/api/courses';
  const res = await fetch(url);
  const data = await res.json();
  const list = document.getElementById('courses');
  if (list) {
    list.innerHTML = '';
    data.forEach(c => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${c.title}</strong> by <a href="/user.html?id=${c.author_id}">${c.author_name}</a>
        <p>${c.description}</p>
        <small>Difficulty: ${c.difficulty || 'N/A'} | Estimated Time: ${c.estimated_time || 'N/A'}</small>
      `;
      list.appendChild(li);
    });
  }
}

function searchCourses() {
  const q = document.getElementById('course-search');
  loadCourses(q ? q.value : '');
}

async function loadPublicProfile() {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('id');
  if (!userId) return;

  const res = await fetch(`/api/users/${userId}`);
  const data = await res.json();

  if (data.error) {
    document.body.innerHTML = `<div class="container"><h1>User not found</h1></div>`;
    return;
  }

  document.getElementById('user-name').innerText = data.user.name;
  document.getElementById('user-role').innerText = data.user.role;

  const coursesList = document.getElementById('user-courses');
  coursesList.innerHTML = '';
  if (data.courses && data.courses.length > 0) {
    data.courses.forEach(course => {
      const li = document.createElement('li');
      li.innerText = course.title;
      coursesList.appendChild(li);
    });
  } else {
    coursesList.innerHTML = '<li>This user has not created any courses yet.</li>';
  }
}

async function savePreferences() {
  requireAuth();
  const prefs = document.getElementById('pref-input').value;
  const res = await fetch('/api/preferences', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ preferences: prefs })
  });
  const data = await res.json();
  const result = document.getElementById('pref-result');
  if (result) result.innerText = data.error ? data.error : 'Preferencias guardadas';
  if (!data.error) {
    user.preferences = prefs;
    localStorage.setItem('user', JSON.stringify(user));
    window.location.href = 'home.html';
  }
}

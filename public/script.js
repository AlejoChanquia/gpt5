let token = '';

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
  document.getElementById('reg-result').innerText = JSON.stringify(data);
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
  if (data.token) token = data.token;
  document.getElementById('log-result').innerText = JSON.stringify(data);
}

async function createCourse() {
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
  document.getElementById('course-result').innerText = JSON.stringify(data);
}

async function loadCourses() {
  const res = await fetch('/api/courses');
  const data = await res.json();
  const list = document.getElementById('courses');
  list.innerHTML = '';
  data.forEach(c => {
    const li = document.createElement('li');
    li.innerText = `${c.title} - ${c.teacher_name}`;
    list.appendChild(li);
  });
}

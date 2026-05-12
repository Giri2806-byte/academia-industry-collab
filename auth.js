// Simple client-side auth demo using localStorage

function showMessage(msg, isError) {
  const el = document.getElementById('authMessage');
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? '#ef4444' : 'var(--primary-color)';
}

function registerAccount() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  if (!u || !p) { showMessage('Enter username and password', true); return; }
  // Try server register first
  fetch('/api/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: u, password: p }) })
    .then(r => r.json())
    .then(data => {
      if (data && data.ok) {
        showMessage('Account created (server). Redirecting...');
        localStorage.setItem('demo_session', u);
        setTimeout(()=>{ window.location.href = 'index.html'; }, 600);
      } else if (data && data.error) {
        showMessage('Server error: ' + data.error, true);
      } else {
        // fallback to client-side
        const users = JSON.parse(localStorage.getItem('demo_users') || '{}');
        if (users[u]) { showMessage('Account already exists. Try signing in.', true); return; }
        users[u] = { password: p, created: Date.now() };
        localStorage.setItem('demo_users', JSON.stringify(users));
        showMessage('Account created (local). You are signed in.');
        localStorage.setItem('demo_session', u);
        setTimeout(()=>{ window.location.href = 'index.html'; }, 800);
      }
    }).catch(() => {
      // fallback to local
      const users = JSON.parse(localStorage.getItem('demo_users') || '{}');
      if (users[u]) { showMessage('Account already exists. Try signing in.', true); return; }
      users[u] = { password: p, created: Date.now() };
      localStorage.setItem('demo_users', JSON.stringify(users));
      showMessage('Account created (local). You are signed in.');
      localStorage.setItem('demo_session', u);
      setTimeout(()=>{ window.location.href = 'index.html'; }, 800);
    });
}

function signIn() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  if (!u || !p) { showMessage('Enter username and password', true); return; }
  // Try server-side login first
  fetch('/api/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: u, password: p }) })
    .then(r => r.json())
    .then(data => {
      if (data && data.ok) {
        localStorage.setItem('demo_session', u);
        showMessage('Signed in (server). Redirecting...');
        setTimeout(()=>{ window.location.href = 'index.html'; }, 600);
      } else if (data && data.error) {
        // fallback to local client-side
        const users = JSON.parse(localStorage.getItem('demo_users') || '{}');
        const account = users[u];
        if (!account) { showMessage('No account found. Please register first.', true); return; }
        if (account.password !== p) { showMessage('Incorrect password', true); return; }
        localStorage.setItem('demo_session', u);
        showMessage('Signed in (local). Redirecting...');
        setTimeout(()=>{ window.location.href = 'index.html'; }, 600);
      } else {
        // fallback to client
        const users = JSON.parse(localStorage.getItem('demo_users') || '{}');
        const account = users[u];
        if (!account) { showMessage('No account found. Please register first.', true); return; }
        if (account.password !== p) { showMessage('Incorrect password', true); return; }
        localStorage.setItem('demo_session', u);
        showMessage('Signed in (local). Redirecting...');
        setTimeout(()=>{ window.location.href = 'index.html'; }, 600);
      }
    }).catch(() => {
      // fallback to local
      const users = JSON.parse(localStorage.getItem('demo_users') || '{}');
      const account = users[u];
      if (!account) { showMessage('No account found. Please register first.', true); return; }
      if (account.password !== p) { showMessage('Incorrect password', true); return; }
      localStorage.setItem('demo_session', u);
      showMessage('Signed in (local). Redirecting...');
      setTimeout(()=>{ window.location.href = 'index.html'; }, 600);
    });
}

// Optional: auto-fill if session exists
(function(){
  const session = localStorage.getItem('demo_session');
  if (session) {
    // show quick sign-out link
    const el = document.getElementById('authMessage');
    if (el) el.innerHTML = 'Signed in as <strong>' + session + '</strong>. <a href="#" onclick="signOut()">Sign out</a>';
  }
})();

function signOut() {
  localStorage.removeItem('demo_session');
  showMessage('Signed out');
}

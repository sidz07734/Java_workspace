async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    document.getElementById('message').innerText = 'Please enter both username and password.';
    return;
  }

  try {
    console.log('Attempting login with:', username);
    const res = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    const data = await res.json();
    console.log('Login response:', data);
    
    if (res.ok) {
      // Redirect based on username
      if (username === 'Teacher') {
        window.location.href = 'teacher-dashboard.html';
      } else {
        window.location.href = 'codespace.html';
      }
    } else {
      document.getElementById('message').innerText = data.message || 'Login failed.';
    }
  } catch (error) {
    console.error('Login error:', error);
    document.getElementById('message').innerText = 'Connection error. Make sure the server is running.';
  }
}
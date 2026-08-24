/* ═══════════════════════════════════════════════
   Student Grievance Portal — Login / Register JS
   Author: Anshumaan Sharma
   ═══════════════════════════════════════════════ */

const API = 'https://student-grievance-portal-1.onrender.com/api';

// ── Toast Notification System ──
class Toast {
  static container = document.getElementById('toastContainer');

  static show(message, type = 'info', duration = 4000) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span>${message}</span>
    `;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// ── Tab Switching ──
function switchTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authTitle.textContent = 'Welcome back';
    authSubtitle.textContent = 'Sign in to your account to continue';
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    authTitle.textContent = 'Create account';
    authSubtitle.textContent = 'Join the portal to submit grievances';
  }
}

// ── Password Visibility Toggle ──
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

// ── Password Strength Checker ──
function checkPasswordStrength(password) {
  const strengthEl = document.getElementById('passwordStrength');
  const fillEl = document.getElementById('strengthFill');
  const textEl = document.getElementById('strengthText');

  if (!password) {
    strengthEl.classList.remove('visible');
    return;
  }

  strengthEl.classList.add('visible');

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  fillEl.className = 'strength-fill';
  textEl.className = 'strength-text';

  if (score <= 2) {
    fillEl.classList.add('weak');
    textEl.classList.add('weak');
    textEl.textContent = 'Weak password';
  } else if (score <= 3) {
    fillEl.classList.add('medium');
    textEl.classList.add('medium');
    textEl.textContent = 'Medium strength';
  } else {
    fillEl.classList.add('strong');
    textEl.classList.add('strong');
    textEl.textContent = 'Strong password';
  }
}

// ── Admin Code Toggle ──
function toggleAdminCode() {
  const role = document.getElementById('regRole').value;
  const codeGroup = document.getElementById('adminCodeGroup');
  if (role === 'admin') {
    codeGroup.classList.add('visible');
  } else {
    codeGroup.classList.remove('visible');
  }
}

// ── Loading State Helpers ──
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

function shakeForm(formId) {
  const form = document.getElementById(formId);
  form.classList.add('shake');
  setTimeout(() => form.classList.remove('shake'), 400);
}

// ── Login ──
async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    Toast.show('Please fill in all fields', 'error');
    shakeForm('loginForm');
    return;
  }

  setLoading('loginBtn', true);

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      Toast.show(`Welcome back, ${data.user.name}!`, 'success');
      setTimeout(() => {
        window.location.href = data.user.role === 'admin' ? 'admin.html' : 'student.html';
      }, 1200);
    } else {
      Toast.show(data.message || 'Login failed', 'error');
      shakeForm('loginForm');
      setLoading('loginBtn', false);
    }
  } catch (err) {
    Toast.show('Cannot connect to server. Please try again later.', 'error');
    setLoading('loginBtn', false);
  }
}

// ── Register ──
async function register() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;

  if (!name || !email || !password) {
    Toast.show('Please fill in all fields', 'error');
    shakeForm('registerForm');
    return;
  }

  if (password.length < 6) {
    Toast.show('Password must be at least 6 characters', 'warning');
    shakeForm('registerForm');
    return;
  }

  // Admin secret code validation
  if (role === 'admin') {
    const adminCode = document.getElementById('adminCode').value.trim();
    if (adminCode !== 'ADMIN2024') {
      Toast.show('Invalid admin access code', 'error');
      shakeForm('registerForm');
      return;
    }
  }

  setLoading('registerBtn', true);

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();

    if (res.ok) {
      Toast.show('Account created successfully! Please login.', 'success');
      // Clear form
      document.getElementById('regName').value = '';
      document.getElementById('regEmail').value = '';
      document.getElementById('regPassword').value = '';
      document.getElementById('regRole').value = 'student';
      document.getElementById('passwordStrength').classList.remove('visible');
      toggleAdminCode();
      // Switch to login tab after delay
      setTimeout(() => {
        switchTab('login', document.getElementById('tabLogin'));
      }, 1500);
    } else {
      Toast.show(data.message || 'Registration failed', 'error');
      shakeForm('registerForm');
    }
  } catch (err) {
    Toast.show('Cannot connect to server. Please try again later.', 'error');
  }

  setLoading('registerBtn', false);
}

// ── Enter Key Support ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm.classList.contains('hidden')) {
      login();
    } else {
      register();
    }
  }
});
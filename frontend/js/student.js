/* ═══════════════════════════════════════════════
   Student Grievance Portal — Student Dashboard JS
   Author: Anshumaan Sharma
   ═══════════════════════════════════════════════ */

const API = window.location.hostname === 'localhost' || window.location.protocol === 'file:'
  ? 'http://localhost:5000/api'
  : 'https://student-grievance-portal-74ri.onrender.com/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) window.location.href = 'index.html';

let allGrievances = [];
let selectedPriority = 'Medium';

// ── Init ──
document.getElementById('userName').textContent = user.name || 'Student';
document.getElementById('userAvatar').textContent = (user.name || 'S')[0].toUpperCase();

loadGrievances();

// ── Toast System ──
class Toast {
  static container = document.getElementById('toastContainer');
  static show(message, type = 'info', duration = 4000) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// ── Section Switching ──
function switchSection(section, navEl) {
  // Update sidebar nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');

  // Update content
  document.querySelectorAll('.content-section').forEach(s => {
    s.classList.remove('active');
  });

  const pageTitle = document.getElementById('pageTitle');

  if (section === 'submit') {
    document.getElementById('submitSection').classList.add('active');
    pageTitle.textContent = 'Submit Grievance';
  } else {
    document.getElementById('myGrievancesSection').classList.add('active');
    pageTitle.textContent = 'My Grievances';
    loadGrievances();
  }

  // Close mobile sidebar
  closeSidebar();
}

// ── Sidebar Toggle (Mobile) ──
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

// ── Priority Selector ──
function selectPriority(priority, el) {
  selectedPriority = priority;
  document.querySelectorAll('.priority-option').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
}

// ── Character Counter ──
function updateCharCount() {
  const desc = document.getElementById('description');
  document.getElementById('charCount').textContent = desc.value.length;
}

// ── Theme Toggle ──
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const btn = document.querySelector('.theme-toggle');
  btn.textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
  localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// Load saved theme
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-theme');
  document.querySelector('.theme-toggle').textContent = '☀️';
}

// ── Animated Counter ──
function animateCounter(element, target) {
  const duration = 800;
  const start = parseInt(element.textContent) || 0;
  const diff = target - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    element.textContent = Math.round(start + diff * eased);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ── Skeleton Loader ──
function showSkeleton() {
  const list = document.getElementById('grievanceList');
  list.innerHTML = Array(3).fill('').map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-line medium"></div>
      <div class="skeleton skeleton-line short"></div>
      <div class="skeleton skeleton-line long"></div>
      <div class="skeleton skeleton-line medium"></div>
    </div>
  `).join('');
}

// ── Confetti System ──
function launchConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#6c5ce7', '#a29bfe', '#00b894', '#feca57', '#ff6b6b', '#54a0ff', '#fd79a8'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 1 + 's';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (6 + Math.random() * 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 4000);
}

// ── Submit Grievance ──
async function submitGrievance() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value;
  const priority = selectedPriority;

  if (!title || !description || !category) {
    Toast.show('Please fill in all required fields', 'error');
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/grievance/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ title, description, category, priority })
    });
    const data = await res.json();

    if (res.ok) {
      Toast.show('🎉 Grievance submitted successfully!', 'success');
      launchConfetti();

      // Clear form
      document.getElementById('title').value = '';
      document.getElementById('description').value = '';
      document.getElementById('category').value = '';
      document.getElementById('charCount').textContent = '0';
      selectedPriority = 'Medium';
      document.querySelectorAll('.priority-option').forEach(p => p.classList.remove('selected'));
      document.querySelector('.priority-option.medium').classList.add('selected');

      loadGrievances();
    } else {
      Toast.show(data.message || 'Failed to submit grievance', 'error');
    }
  } catch (err) {
    Toast.show('Server error. Please try again later.', 'error');
  }

  btn.classList.remove('loading');
  btn.disabled = false;
}

// ── Load Grievances ──
async function loadGrievances() {
  showSkeleton();

  try {
    const res = await fetch(`${API}/grievance/my`, {
      headers: { 'Authorization': token }
    });
    allGrievances = await res.json();

    // Animate stats
    animateCounter(document.getElementById('totalCount'), allGrievances.length);
    animateCounter(document.getElementById('pendingCount'), allGrievances.filter(g => g.status === 'Pending').length);
    animateCounter(document.getElementById('progressCount'), allGrievances.filter(g => g.status === 'In Progress').length);
    animateCounter(document.getElementById('resolvedCount'), allGrievances.filter(g => g.status === 'Resolved').length);

    filterGrievances();
  } catch (err) {
    console.error('Error loading grievances:', err);
    Toast.show('Failed to load grievances', 'error');
    document.getElementById('grievanceList').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Connection Error</h3>
        <p>Could not reach the server. Please try again.</p>
      </div>`;
  }
}

// ── Filter & Sort ──
function filterGrievances() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const sort = document.getElementById('sortSelect')?.value || 'newest';

  let filtered = allGrievances.filter(g => {
    return g.title.toLowerCase().includes(search) ||
           g.description.toLowerCase().includes(search) ||
           g.category.toLowerCase().includes(search);
  });

  // Sort
  const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
  const statusOrder = { 'Pending': 1, 'In Progress': 2, 'Resolved': 3, 'Rejected': 4 };

  switch (sort) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'priority':
      filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      break;
    case 'status':
      filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      break;
  }

  renderGrievances(filtered);
}

// ── Build Timeline ──
function buildTimeline(status) {
  const steps = ['Submitted', 'In Progress', 'Resolved'];
  const statusMap = { 'Pending': 0, 'In Progress': 1, 'Resolved': 2, 'Rejected': -1 };
  const current = statusMap[status];
  const isRejected = status === 'Rejected';

  let html = '';
  steps.forEach((step, i) => {
    let stepClass = '';
    if (isRejected && i === 0) stepClass = 'completed';
    else if (isRejected && i === 1) stepClass = 'rejected';
    else if (i < current) stepClass = 'completed';
    else if (i === current) stepClass = 'active';

    const icon = stepClass === 'completed' ? '✓' :
                 stepClass === 'rejected' ? '✕' :
                 stepClass === 'active' ? '●' : (i + 1);

    html += `<div class="timeline-step ${stepClass}">
      <div class="timeline-dot">${icon}</div>
      <div class="timeline-label">${isRejected && i === 1 ? 'Rejected' : step}</div>
    </div>`;

    if (i < steps.length - 1) {
      let lineClass = '';
      if (isRejected && i === 0) lineClass = 'active';
      else if (i < current) lineClass = 'completed';
      else if (i === current) lineClass = 'active';
      html += `<div class="timeline-line ${lineClass}"></div>`;
    }
  });

  return html;
}

// ── Render Grievances ──
function renderGrievances(grievances) {
  const list = document.getElementById('grievanceList');

  if (!grievances || grievances.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No grievances found</h3>
        <p>Submit your first grievance to get started.</p>
      </div>`;
    return;
  }

  list.innerHTML = grievances.map((g, i) => {
    const status = g.status || 'Pending';
    const statusClass = status.replace(/\s+/g, '-');
    const title = g.title || 'Untitled Grievance';
    const category = g.category || 'Other';
    const priority = g.priority || 'Medium';
    const assignedTo = g.assignedTo || 'Not Assigned';
    const description = g.description || '';
    const adminRemarks = g.adminRemarks || '';

    return `
      <div class="grievance-card ${statusClass}" style="animation-delay: ${i * 0.06}s" onclick="this.classList.toggle('expanded')">
        <div class="grievance-header">
          <div class="grievance-title">${escapeHtml(title)}</div>
          <span class="badge ${statusClass}">${status}</span>
        </div>
        <div class="grievance-meta">
          <span class="meta-item">📁 ${category}</span>
          <span class="meta-item">🔥 ${priority}</span>
          <span class="meta-item">🏢 ${assignedTo}</span>
        </div>
        <div class="grievance-desc">${escapeHtml(description)}</div>
        <div class="grievance-timeline">
          ${buildTimeline(status)}
        </div>
        ${adminRemarks ? `
          <div class="admin-remarks">
            <span class="remark-icon">💬</span>
            <span><strong>Admin Remarks:</strong> ${escapeHtml(adminRemarks)}</span>
          </div>` : ''}
        <div class="grievance-footer">
          <span>📅 Submitted: ${new Date(g.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          ${g.updatedAt && g.updatedAt !== g.createdAt ? `<span>🔄 Updated: ${new Date(g.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ── XSS Prevention ──
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

// ── Logout ──
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}
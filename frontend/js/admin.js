/* ═══════════════════════════════════════════════
   Student Grievance Portal — Admin Dashboard JS
   Author: Anshumaan Sharma
   ═══════════════════════════════════════════════ */

const API = 'https://student-grievance-portal-1.onrender.com/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) window.location.href = 'index.html';

let allGrievances = [];
let filteredGrievances = [];
let currentPage = 1;
const perPage = 10;
let deleteTargetId = null;

// ── Init ──
document.getElementById('userName').textContent = user.name || 'Admin';
document.getElementById('userAvatar').textContent = (user.name || 'A')[0].toUpperCase();

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
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

  const pageTitle = document.getElementById('pageTitle');
  if (section === 'analytics') {
    document.getElementById('analyticsSection').classList.add('active');
    pageTitle.textContent = 'Analytics Dashboard';
  } else {
    document.getElementById('grievancesSection').classList.add('active');
    pageTitle.textContent = 'All Grievances';
  }

  closeSidebar();
}

// ── Sidebar Toggle ──
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

// ── Animated Counter ──
function animateCounter(element, target, suffix = '') {
  const duration = 800;
  const start = parseInt(element.textContent) || 0;
  const diff = target - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(start + diff * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ── Skeleton ──
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

// ── Load Grievances ──
async function loadGrievances() {
  showSkeleton();

  try {
    const res = await fetch(`${API}/grievance/all`, {
      headers: { 'Authorization': token }
    });
    allGrievances = await res.json();
    updateStats();
    renderAnalytics();
    applyFilters();
  } catch (err) {
    console.error('Error loading grievances:', err);
    Toast.show('Failed to load grievances', 'error');
  }
}

// ── Update Stats ──
function updateStats() {
  const total = allGrievances.length;
  const pending = allGrievances.filter(g => g.status === 'Pending').length;
  const inProgress = allGrievances.filter(g => g.status === 'In Progress').length;
  const resolved = allGrievances.filter(g => g.status === 'Resolved').length;
  const rejected = allGrievances.filter(g => g.status === 'Rejected').length;
  const highPriority = allGrievances.filter(g => g.priority === 'High').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  animateCounter(document.getElementById('totalCount'), total);
  animateCounter(document.getElementById('pendingCount'), pending);
  animateCounter(document.getElementById('progressCount'), inProgress);
  animateCounter(document.getElementById('resolvedCount'), resolved);
  animateCounter(document.getElementById('rejectedCount'), rejected);
  animateCounter(document.getElementById('highPriorityCount'), highPriority);
  animateCounter(document.getElementById('resolutionRate'), resolutionRate, '%');
}

// ── Analytics ──
function renderAnalytics() {
  renderDonutChart();
  renderBarChart();
}

// ── Donut Chart (SVG) ──
function renderDonutChart() {
  const svg = document.querySelector('#donutChart svg');
  const legend = document.getElementById('donutLegend');
  const total = allGrievances.length || 1;

  const data = [
    { label: 'Pending', count: allGrievances.filter(g => g.status === 'Pending').length, color: '#feca57' },
    { label: 'In Progress', count: allGrievances.filter(g => g.status === 'In Progress').length, color: '#54a0ff' },
    { label: 'Resolved', count: allGrievances.filter(g => g.status === 'Resolved').length, color: '#00b894' },
    { label: 'Rejected', count: allGrievances.filter(g => g.status === 'Rejected').length, color: '#ff6b6b' },
  ];

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  svg.innerHTML = '';

  // Background circle
  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bgCircle.setAttribute('cx', '80');
  bgCircle.setAttribute('cy', '80');
  bgCircle.setAttribute('r', radius);
  bgCircle.setAttribute('fill', 'none');
  bgCircle.setAttribute('stroke', 'rgba(255,255,255,0.05)');
  bgCircle.setAttribute('stroke-width', '20');
  svg.appendChild(bgCircle);

  data.forEach(item => {
    if (item.count === 0) return;

    const percentage = item.count / total;
    const dashLength = percentage * circumference;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '80');
    circle.setAttribute('cy', '80');
    circle.setAttribute('r', radius);
    circle.setAttribute('stroke', item.color);
    circle.setAttribute('stroke-width', '20');
    circle.setAttribute('stroke-dasharray', `0 ${circumference}`);
    circle.setAttribute('stroke-dashoffset', -offset);
    circle.setAttribute('stroke-linecap', 'round');
    svg.appendChild(circle);

    // Animate
    setTimeout(() => {
      circle.setAttribute('stroke-dasharray', `${dashLength} ${circumference - dashLength}`);
    }, 100);

    offset += dashLength;
  });

  // Center text
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '80');
  text.setAttribute('y', '76');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', '#f0f0f5');
  text.setAttribute('font-size', '24');
  text.setAttribute('font-weight', '700');
  text.setAttribute('font-family', 'JetBrains Mono, monospace');
  text.setAttribute('transform', 'rotate(90, 80, 80)');
  text.textContent = allGrievances.length;
  svg.appendChild(text);

  const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  subText.setAttribute('x', '80');
  subText.setAttribute('y', '94');
  subText.setAttribute('text-anchor', 'middle');
  subText.setAttribute('fill', '#8a8a9a');
  subText.setAttribute('font-size', '10');
  subText.setAttribute('font-family', 'Inter, sans-serif');
  subText.setAttribute('transform', 'rotate(90, 80, 80)');
  subText.textContent = 'Total';
  svg.appendChild(subText);

  // Legend
  legend.innerHTML = data.map(item => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${item.color}"></div>
      <span>${item.label}</span>
      <span class="legend-value">${item.count}</span>
    </div>
  `).join('');
}

// ── Bar Chart ──
function renderBarChart() {
  const chart = document.getElementById('barChart');
  const categories = ['Academic', 'Hostel', 'Infrastructure', 'Financial', 'Other'];
  const colors = ['#6c5ce7', '#54a0ff', '#00b894', '#feca57', '#fd79a8'];

  const counts = categories.map(cat => allGrievances.filter(g => g.category === cat).length);
  const max = Math.max(...counts, 1);

  chart.innerHTML = categories.map((cat, i) => {
    const height = (counts[i] / max) * 100;
    return `
      <div class="bar-item">
        <div class="bar-value">${counts[i]}</div>
        <div class="bar" style="height: 0%; background: ${colors[i]};" data-height="${height}"></div>
        <div class="bar-label">${cat}</div>
      </div>
    `;
  }).join('');

  // Animate bars
  setTimeout(() => {
    chart.querySelectorAll('.bar').forEach(bar => {
      bar.style.height = bar.dataset.height + '%';
    });
  }, 200);
}

// ── Filters ──
function applyFilters() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const status = document.getElementById('filterStatus')?.value || '';
  const category = document.getElementById('filterCategory')?.value || '';
  const priority = document.getElementById('filterPriority')?.value || '';

  filteredGrievances = allGrievances.filter(g => {
    const matchSearch = !search ||
      g.title.toLowerCase().includes(search) ||
      (g.studentName || '').toLowerCase().includes(search) ||
      (g.studentEmail || '').toLowerCase().includes(search);
    const matchStatus = !status || g.status === status;
    const matchCategory = !category || g.category === category;
    const matchPriority = !priority || g.priority === priority;
    return matchSearch && matchStatus && matchCategory && matchPriority;
  });

  currentPage = 1;
  renderGrievances();
  renderPagination();
}

// ── Render Grievances (Paginated) ──
function renderGrievances() {
  const list = document.getElementById('grievanceList');
  const start = (currentPage - 1) * perPage;
  const page = filteredGrievances.slice(start, start + perPage);

  if (filteredGrievances.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No grievances found</h3>
        <p>Try adjusting your filters or search query.</p>
      </div>`;
    return;
  }

  list.innerHTML = page.map((g, i) => `
    <div class="grievance-card ${g.status.replace(' ', '-')}" style="animation-delay: ${i * 0.05}s">
      <div class="grievance-header">
        <div class="grievance-title">${escapeHtml(g.title)}</div>
        <span class="badge ${g.status.replace(' ', '-')}">${g.status}</span>
      </div>
      <div class="grievance-meta">
        <span class="meta-item">👤 ${escapeHtml(g.studentName)} (${escapeHtml(g.studentEmail)})</span>
        <span class="meta-item">📁 ${g.category}</span>
        <span class="meta-item">🔥 ${g.priority}</span>
        <span class="meta-item">🏢 ${g.assignedTo}</span>
      </div>
      <div class="grievance-desc">${escapeHtml(g.description)}</div>
      ${g.adminRemarks ? `<div class="existing-remarks">💬 Current Remarks: ${escapeHtml(g.adminRemarks)}</div>` : ''}
      <div class="update-form">
        <div>
          <label>Status</label>
          <select id="status-${g._id}">
            <option ${g.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${g.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option ${g.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            <option ${g.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>
        <div>
          <label>Assign To</label>
          <select id="assign-${g._id}">
            <option ${g.assignedTo === 'Not Assigned' ? 'selected' : ''}>Not Assigned</option>
            <option ${g.assignedTo === 'Academic Dept' ? 'selected' : ''}>Academic Dept</option>
            <option ${g.assignedTo === 'Hostel Dept' ? 'selected' : ''}>Hostel Dept</option>
            <option ${g.assignedTo === 'Infrastructure Dept' ? 'selected' : ''}>Infrastructure Dept</option>
            <option ${g.assignedTo === 'Finance Dept' ? 'selected' : ''}>Finance Dept</option>
          </select>
        </div>
        <div>
          <label>Remarks</label>
          <input type="text" id="remarks-${g._id}" placeholder="Add admin remarks..." value="${escapeHtml(g.adminRemarks || '')}" />
        </div>
        <div class="action-buttons">
          <button class="btn-update" onclick="updateGrievance('${g._id}')">Update</button>
          <button class="btn-delete" onclick="showDeleteModal('${g._id}')">Delete</button>
        </div>
      </div>
      <div class="grievance-footer">
        <span>📅 Submitted: ${formatDate(g.createdAt)}</span>
        <span>🔄 Updated: ${formatDate(g.updatedAt)}</span>
      </div>
    </div>
  `).join('');
}

// ── Pagination ──
function renderPagination() {
  const pag = document.getElementById('pagination');
  const totalPages = Math.ceil(filteredGrievances.length / perPage);

  if (totalPages <= 1) {
    pag.innerHTML = '';
    return;
  }

  let html = `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
      if (i === 3 || i === totalPages - 2) html += '<span class="page-info">...</span>';
      continue;
    }
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;

  pag.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredGrievances.length / perPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderGrievances();
  renderPagination();
  document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Update Grievance ──
async function updateGrievance(id) {
  const status = document.getElementById(`status-${id}`).value;
  const assignedTo = document.getElementById(`assign-${id}`).value;
  const adminRemarks = document.getElementById(`remarks-${id}`).value;

  try {
    const res = await fetch(`${API}/grievance/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ status, assignedTo, adminRemarks })
    });

    if (res.ok) {
      Toast.show('Grievance updated successfully!', 'success');
      loadGrievances();
    } else {
      Toast.show('Failed to update grievance', 'error');
    }
  } catch (err) {
    Toast.show('Server error. Try again.', 'error');
  }
}

// ── Delete Modal ──
function showDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById('deleteModal').classList.add('active');
}

function closeModal() {
  document.getElementById('deleteModal').classList.remove('active');
  deleteTargetId = null;
}

async function confirmDelete() {
  if (!deleteTargetId) return;

  try {
    const res = await fetch(`${API}/grievance/delete/${deleteTargetId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });

    if (res.ok) {
      Toast.show('Grievance deleted successfully!', 'success');
      closeModal();
      loadGrievances();
    } else {
      Toast.show('Failed to delete grievance', 'error');
    }
  } catch (err) {
    Toast.show('Server error. Try again.', 'error');
  }
}

// Close modal on overlay click
document.getElementById('deleteModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ── CSV Export ──
function exportCSV() {
  if (allGrievances.length === 0) {
    Toast.show('No grievances to export', 'warning');
    return;
  }

  const headers = ['Title', 'Category', 'Priority', 'Status', 'Student Name', 'Student Email', 'Assigned To', 'Admin Remarks', 'Submitted', 'Updated'];

  const rows = allGrievances.map(g => [
    `"${(g.title || '').replace(/"/g, '""')}"`,
    g.category,
    g.priority,
    g.status,
    `"${(g.studentName || '').replace(/"/g, '""')}"`,
    g.studentEmail,
    g.assignedTo,
    `"${(g.adminRemarks || '').replace(/"/g, '""')}"`,
    new Date(g.createdAt).toLocaleDateString(),
    new Date(g.updatedAt).toLocaleDateString(),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `grievances_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  Toast.show('CSV exported successfully!', 'success');
}

// ── Helpers ──
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// ── Logout ──
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}
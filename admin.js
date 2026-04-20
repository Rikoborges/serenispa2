const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://serenispa2.onrender.com/api';

const token = localStorage.getItem('token');
const userName = localStorage.getItem('userName') || 'Admin';

document.getElementById('admin-greeting').textContent = `Connecté en tant que ${userName}`;

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

async function loadStats() {
  if (!token) {
    showError();
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401 || res.status === 403) {
      showError();
      return;
    }

    const data = await res.json();
    renderStats(data);
  } catch {
    showError();
  }
}

function showError() {
  document.getElementById('admin-error').style.display = 'block';
}

function renderStats({ total, byMassage, recent }) {
  document.getElementById('admin-content').style.display = 'block';

  document.getElementById('stat-total').textContent = total;

  const totalRevenue = byMassage.reduce((sum, m) => sum + m.revenue, 0);
  document.getElementById('stat-revenue').textContent = `${totalRevenue} €`;

  document.getElementById('stat-types').textContent = byMassage.length;

  document.getElementById('table-by-massage').innerHTML = byMassage.map(m => `
    <tr>
      <td data-label="Massage">${m.nom}</td>
      <td data-label="Réservations">${m.count}</td>
      <td data-label="CA estimé">${m.revenue} €</td>
    </tr>
  `).join('');

  document.getElementById('table-recent').innerHTML = recent.map(r => {
    const date = new Date(r.date).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const statut = r.statut || 'confirmé';
    const badgeClass = statut === 'annulé' ? 'badge badge--annulé' : 'badge';
    return `
      <tr>
        <td data-label="Client">${r.userId?.nom || '—'}</td>
        <td data-label="Email">${r.userId?.email || '—'}</td>
        <td data-label="Massage">${r.massageId?.nom || '—'}</td>
        <td data-label="Date">${date}</td>
        <td data-label="Statut"><span class="${badgeClass}">${statut}</span></td>
      </tr>
    `;
  }).join('');
}

loadStats();

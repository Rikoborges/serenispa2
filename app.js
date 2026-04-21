/* ============================================
   SereniSpa — app.js (Version Optimisée RNCP)
   ============================================ */

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://serenispa2.onrender.com/api';

// --- AUXILIARES ---
const getToken = () => localStorage.getItem('token');
const isConnected = () => getToken() !== null;

// Sistema de Notificação Simples (Toast)
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// --- Données de secours (affichées si l'API est indisponible) ---
const MASSAGES_FALLBACK = [
    { _id: '1', nom: 'Massage Suédois',     description: 'Détente profonde du corps et de l\'esprit, idéal pour évacuer le stress du quotidien.',          prix: 80,  duree: 60, image: 'src/assets/massage-sueca.webp' },
    { _id: '2', nom: 'Massage Thaïlandais', description: 'Technique dynamique qui libère les tensions, stimule la circulation et redonne de l\'énergie.',   prix: 90,  duree: 60, image: 'src/assets/massage-tailandesa.webp' },
    { _id: '3', nom: 'Pierres Chaudes',     description: 'Chaleur thérapeutique des pierres volcaniques pour libérer les tensions les plus profondes.',     prix: 100, duree: 90, image: 'src/assets/massagem-hotstone.webp' },
    { _id: '4', nom: 'Massage Relaxant',   description: 'Massage thérapeutique doux pour favoriser une détente profonde et apaiser le corps.',                prix: 75,  duree: 60, image: 'src/assets/massage-relaxante.webp' },
];

function renderMassages(massages) {
    const grid   = document.getElementById('massages-grid');
    const select = document.getElementById('res-massage');

    grid.innerHTML = massages.map(m => `
        <article class="card fade-in is-visible" role="listitem">
            <div class="card__img-wrap"><img src="${m.image || 'src/assets/oil.webp'}" alt="${m.nom}" loading="lazy"></div>
            <div class="card__body">
                <h3 class="card__title">${m.nom}</h3>
                <p class="card__desc">${m.description}</p>
                ${m.therapistId ? `<p style="font-size: 0.85rem; color: var(--texte-gris); margin: 0.5rem 0;">👤 ${m.therapistId.nom}</p>` : ''}
                <div class="card__meta">
                    <span class="card__price">${m.prix} €</span>
                    ${m.duree ? `<span class="card__duration">${m.duree} min</span>` : ''}
                </div>
            </div>
        </article>
    `).join('');

    // Stocker les données des massages globalement
    window.massagesData = massages;

    select.innerHTML = '<option value="">— Choisir un massage —</option>' +
        massages.map(m => {
            const therapist = m.therapistId ? ` (${m.therapistId.nom})` : '';
            return `<option value="${m._id}" data-therapist-id="${m.therapistId?._id || ''}">${m.nom}${therapist} (${m.prix} €)</option>`;
        }).join('');
}

// --- 1. CARREGAR MASSAGENS (GET) ---
async function chargerMassages() {
    try {
        const res = await fetch(`${API_URL}/massages`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderMassages(data.length > 0 ? data : MASSAGES_FALLBACK);
    } catch {
        renderMassages(MASSAGES_FALLBACK); // API indispo → données locales
    }
}

// --- 2. GESTÃO DE INTERFACE (UI) ---
function updateUI() {
    const isAuth = isConnected();
    const userName = localStorage.getItem('userName') || 'Utilisateur';

    // Toggle Seções
    document.getElementById('reservation-locked').hidden = isAuth;
    document.getElementById('reservation-form').hidden = !isAuth;
    document.getElementById('account-panel').hidden = !isAuth;
    document.getElementById('login-form').hidden = isAuth;
    document.getElementById('signup-form').hidden = true; // Sempre esconde signup ao resetar

    // Atualiza botão utilizador
    const loginBtn = document.getElementById('nav-login-btn');
    loginBtn.setAttribute('aria-label', isAuth ? `Mon compte (${userName})` : 'Connexion');
    loginBtn.classList.toggle('is-connected', isAuth);
    document.getElementById('account-greeting').textContent = `Bienvenue, ${userName} !`;
}

// --- 3. AUTH (LOGIN & SIGNUP) ---
// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Identifiants incorrects');

        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user?.nom || 'Client');
        updateUI();
        showToast('Connexion réussie !', 'success');
    } catch (err) {
        document.getElementById('login-msg').textContent = err.message;
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear();
    updateUI();
    showToast('Déconnexion réussie', 'info');
});

// Alternar entre Login/Signup
document.getElementById('show-signup').onclick = () => {
    document.getElementById('login-form').hidden = true;
    document.getElementById('signup-form').hidden = false;
    document.getElementById('auth-title').textContent = "Inscription";
};
document.getElementById('show-login').onclick = () => {
    document.getElementById('login-form').hidden = false;
    document.getElementById('signup-form').hidden = true;
    document.getElementById('auth-title').textContent = "Connexion";
};

// --- 4. RÉSERVATION: Charger slots disponibles ---
let selectedSlot = null; // Stocker le slot sélectionné
let selectedTherapistId = null; // Stocker le therapist sélectionné

document.getElementById('res-massage').addEventListener('change', async (e) => {
    const massageId = e.target.value;
    if (!massageId) {
        document.getElementById('available-slots').innerHTML = '';
        selectedTherapistId = null;
        return;
    }

    // Récupérer le therapistId depuis l'option sélectionnée
    const option = e.target.options[e.target.selectedIndex];
    selectedTherapistId = option.getAttribute('data-therapist-id');

    if (!selectedTherapistId) {
        document.getElementById('available-slots').innerHTML = '<p class="error">Therapist non assigné à ce massage</p>';
        return;
    }

    try {
        const resSlots = await fetch(`${API_URL}/reservations/available-slots/${massageId}/${selectedTherapistId}`);

        if (!resSlots.ok) {
            const error = await resSlots.json();
            document.getElementById('available-slots').innerHTML = `<p class="error">Erreur: ${error.message}</p>`;
            return;
        }

        const data = await resSlots.json();
        renderSlots(data.slots);
    } catch (err) {
        console.error('Erreur slots:', err);
        document.getElementById('available-slots').innerHTML = '<p class="error">Erreur chargement horaires</p>';
    }
});

function renderSlots(slots) {
    const container = document.getElementById('available-slots');
    if (!slots || slots.length === 0) {
        container.innerHTML = '<p>Aucun créneau disponible</p>';
        return;
    }

    // Grouper par date
    const byDate = {};
    slots.forEach(slot => {
        if (!byDate[slot.date]) byDate[slot.date] = [];
        byDate[slot.date].push(slot);
    });

    let html = '';
    for (const [date, daySlots] of Object.entries(byDate)) {
        html += `<div class="slots-group"><h4>${date}</h4>`;
        daySlots.forEach(slot => {
            const disabled = !slot.available ? 'disabled' : '';
            const classes = !slot.available ? 'slot-btn disabled' : 'slot-btn';
            html += `
                <button
                    type="button"
                    class="${classes}"
                    ${disabled}
                    data-time="${slot.time}"
                    onclick="selectSlot(event, '${slot.time}')">
                    ${slot.hour} ${!slot.available ? '(Occupé)' : ''}
                </button>
            `;
        });
        html += '</div>';
    }
    container.innerHTML = html;
}

function selectSlot(e, time) {
    e.preventDefault();
    selectedSlot = time;
    document.querySelectorAll('.slot-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
}

// --- 5. RÉSERVATION: Créer ---
document.getElementById('reservation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const massageId = document.getElementById('res-massage').value;

    if (!selectedSlot) {
        showToast('Choisissez un créneau horaire', 'error');
        return;
    }

    if (!selectedTherapistId) {
        showToast('Erreur: Therapist non défini', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                massageId,
                therapistId: selectedTherapistId,
                date: selectedSlot
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur réservation');

        showToast('✅ Réservation confirmée !', 'success');
        setTimeout(() => {
            e.target.reset();
            selectedSlot = null;
            selectedTherapistId = null;
            document.getElementById('available-slots').innerHTML = '';
        }, 1500);
    } catch (err) {
        showToast(`❌ ${err.message}`, 'error');
    }
});

// --- 5. RGPD: SUPPRESSION COMPTE ---
const modal = document.getElementById('delete-modal');
document.getElementById('delete-account-btn').onclick = () => modal.showModal();
document.getElementById('cancel-delete').onclick = () => modal.close();

document.getElementById('confirm-delete').onclick = async () => {
    try {
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
            localStorage.clear();
            location.reload();
        }
    } catch (err) {
        showToast('Erreur de suppression', 'error');
    }
};

// --- 6. SIGNUP (INSCRIPTION) ---
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom = document.getElementById('signup-nom').value;
    const email = document.getElementById('signup-email').value;
    const telephone = document.getElementById('signup-tel').value;
    const password = document.getElementById('signup-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, email, telephone, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'inscription');

        showToast('Compte créé ! Connectez-vous.', 'success');
        // Volta para o login após criar conta
        document.getElementById('signup-form').hidden = true;
        document.getElementById('login-form').hidden = false;
        document.getElementById('auth-title').textContent = "Connexion";
    } catch (err) {
        document.getElementById('signup-msg').textContent = err.message;
    }
});

// --- 7. CONTACT FORM ---
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message envoyé ! Nous vous répondrons bientôt.', 'success');
    e.target.reset();
    document.getElementById('contact-counter').textContent = '300 caractères restants';
});

// Contador de caracteres do textarea
document.getElementById('contact-message').addEventListener('input', function () {
    const restants = 300 - this.value.length;
    document.getElementById('contact-counter').textContent = `${restants} caractères restants`;
});

// --- INICIALIZAÇÃO ---
chargerMassages();
updateUI();

// Burger Menu Mobile
const burger = document.getElementById('burger-btn');
const menu = document.getElementById('nav-menu');

const overlay = document.createElement('div');
overlay.className = 'nav-overlay';
document.body.appendChild(overlay);

function openMenu() {
    burger.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    burger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
}

burger.onclick = () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
};

overlay.onclick = closeMenu;

menu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeMenu);
});

// Cookie Banner RGPD
const cookieBanner = document.getElementById('cookie-banner');
if (!localStorage.getItem('cookieConsent')) {
    cookieBanner.removeAttribute('hidden');
}
document.getElementById('cookie-accept').onclick = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    cookieBanner.setAttribute('hidden', '');
};
document.getElementById('cookie-decline').onclick = () => {
    localStorage.setItem('cookieConsent', 'declined');
    cookieBanner.setAttribute('hidden', '');
};

// --- FOOTER: Modais Politique & Cookies ---
const rgpdModal = document.getElementById('rgpd-modal');
const cookiesModal = document.getElementById('cookies-modal');

document.getElementById('open-rgpd-modal').addEventListener('click', (e) => {
    e.preventDefault();
    rgpdModal.showModal();
});
document.getElementById('close-rgpd-modal').addEventListener('click', () => rgpdModal.close());

document.getElementById('open-cookies-modal').addEventListener('click', (e) => {
    e.preventDefault();
    cookiesModal.showModal();
});
document.getElementById('close-cookies-modal').addEventListener('click', () => cookiesModal.close());

// Fechar modais ao clicar fora
[rgpdModal, cookiesModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.close();
    });
});




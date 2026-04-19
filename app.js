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
    { _id: '1', nom: 'Massage Relaxant',        description: 'Détente profonde du corps et de l\'esprit, idéal pour évacuer le stress du quotidien.',   prix: 60, duree: 60, image: 'assets/oil.webp' },
    { _id: '2', nom: 'Récupération Sportive',   description: 'Ciblé sur les muscles fatigués pour une récupération rapide après l\'effort physique.',    prix: 70, duree: 45, image: 'assets/oil.webp' },
    { _id: '3', nom: 'Massage Ayurvédique',     description: 'Technique ancestrale indienne qui rééquilibre le corps, l\'esprit et l\'énergie vitale.',  prix: 80, duree: 75, image: 'assets/oil.webp' },
    { _id: '4', nom: 'Pierres Chaudes',         description: 'Chaleur thérapeutique des pierres volcaniques pour libérer les tensions les plus profondes.', prix: 85, duree: 90, image: 'assets/oil.webp' },
    { _id: '5', nom: 'Aromathérapie',           description: 'Huiles essentielles biologiques sélectionnées pour éveiller vos sens et régénérer la peau.', prix: 65, duree: 60, image: 'assets/oil.webp' },
    { _id: '6', nom: 'Éclat du Visage',         description: 'Massage facial drainant qui illumine le teint, détend les traits et efface la fatigue.',    prix: 55, duree: 45, image: 'assets/oil.webp' },
];

function renderMassages(massages) {
    const grid   = document.getElementById('massages-grid');
    const select = document.getElementById('res-massage');

    grid.innerHTML = massages.map(m => `
        <article class="card fade-in is-visible" role="listitem">
            <div class="card__img-wrap"><img src="${m.image || 'assets/oil.webp'}" alt="${m.nom}" loading="lazy"></div>
            <div class="card__body">
                <h3 class="card__title">${m.nom}</h3>
                <p class="card__desc">${m.description}</p>
                <div class="card__meta">
                    <span class="card__price">${m.prix} €</span>
                    ${m.duree ? `<span class="card__duration">${m.duree} min</span>` : ''}
                </div>
            </div>
        </article>
    `).join('');

    select.innerHTML = '<option value="">— Choisir un massage —</option>' +
        massages.map(m => `<option value="${m._id}">${m.nom} (${m.prix} €)</option>`).join('');
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

    // Atualiza Textos
    document.getElementById('nav-login-btn').textContent = isAuth ? 'Mon Compte' : 'Connexion';
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

// --- 4. RESERVA (POST) ---
document.getElementById('reservation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const massageId = document.getElementById('res-massage').value;
    const date = document.getElementById('res-date').value;

    try {
        const res = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}` 
            },
            body: JSON.stringify({ massageId, date })
        });
        if (!res.ok) throw new Error();
        showToast('Réservation confirmée !', 'success');
        e.target.reset();
    } catch (err) {
        showToast('Erreur lors de la réservation', 'error');
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
document.addEventListener('DOMContentLoaded', () => {
    chargerMassages();
    updateUI();

    // Burger Menu Mobile
    const burger = document.getElementById('burger-btn');
    const menu = document.getElementById('nav-menu');

    // Cria o overlay dinamicamente
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
        burger.setAttribute('aria-expanded', 'true');
        menu.classList.add('is-open');
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden'; // impede scroll da página
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

    // Fecha ao clicar no overlay
    overlay.onclick = closeMenu;

    // Fecha ao clicar em qualquer link do menu
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
});




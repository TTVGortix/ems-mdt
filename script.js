// --- CONFIGURATION ---
const CLIENT_ID = '1472988748487590144';
const REDIRECT_URI = 'https://ttvgortix.github.io/ems/'; 

/**
 * Gère le changement d'onglets (Navigation)
 * @param {string} tabId - L'ID de la section à afficher
 * @param {HTMLElement} element - Le lien cliqué pour ajouter la classe active
 */
function showTab(tabId, element) {
    // 1. Masquer tous les contenus d'onglets
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // 2. Désactiver tous les liens de navigation
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => link.classList.remove('active'));

    // 3. Afficher l'onglet demandé et activer le lien
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
        element.classList.add('active');
    }
}

/**
 * Gère le système de Prise de Service / Fin de Service
 */
let enService = false;
function toggleService() {
    const btn = document.getElementById('service-btn');
    const statusText = document.getElementById('service-status');
    
    enService = !enService;

    if (enService) {
        // État : En service
        btn.innerText = "Fin de service";
        btn.classList.add('on-duty');
        statusText.style.color = "var(--accent-green)";
        statusText.innerHTML = "● En service";
        console.log("Système : Prise de service enregistrée.");
    } else {
        // État : Hors service
        btn.innerText = "Prendre son service";
        btn.classList.remove('on-duty');
        statusText.style.color = "var(--text-dim)";
        statusText.innerHTML = "● Hors service";
        console.log("Système : Fin de service enregistrée.");
    }
}

/**
 * Redirection vers l'authentification Discord
 */
function login() {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;
    window.location.href = authUrl;
}

/**
 * Déconnexion de l'utilisateur
 */
function logout() {
    localStorage.removeItem('discord_token');
    window.location.href = REDIRECT_URI;
}

/**
 * Au chargement de la page : Vérifie si l'utilisateur est connecté
 */
window.onload = () => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    let token = fragment.get('access_token') || localStorage.getItem('discord_token');

    if (token) {
        // Sauvegarde le token pour rester connecté
        localStorage.setItem('discord_token', token);
        
        // Récupère les infos de l'utilisateur via l'API Discord
        fetch('https://discord.com/api/users/@me', {
            headers: { authorization: `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Token expiré ou invalide");
            return res.json();
        })
        .then(user => {
            // 1. Masquer l'écran de login et afficher l'interface principale
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-ui').style.display = 'flex';
            
            // 2. Mettre à jour le pseudo de l'agent
            const usernameElements = document.querySelectorAll('#username');
            usernameElements.forEach(el => el.innerText = user.username);
            
            // 3. Mettre à jour l'avatar de l'agent
            const avatarImg = document.getElementById('avatar');
            if(user.avatar) {
                avatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
            } else {
                // Image par défaut si l'utilisateur n'a pas d'avatar Discord
                avatarImg.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
            }

            // 4. Nettoyer l'URL (enlever le token de la barre d'adresse pour la sécurité)
            window.history.replaceState({}, document.title, REDIRECT_URI);
        })
        .catch(err => {
            console.error("Erreur d'authentification :", err);
            logout(); // Déconnecte si le token ne marche plus
        });
    }
};
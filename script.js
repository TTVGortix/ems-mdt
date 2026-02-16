const CLIENT_ID = '1472988748487590144';
// URL mise à jour pour correspondre à ton dépôt "ems"
const REDIRECT_URI = 'https://ttvgortix.github.io/ems/'; 

function updateValue(id) {
    const newValue = prompt("Entrez la nouvelle valeur :");
    if (newValue !== null && newValue.trim() !== "") {
        document.getElementById('stat-' + id).innerText = newValue;
        localStorage.setItem('sams_' + id, newValue);
    }
}

function loadData() {
    const keys = ['units', 'beds', 'emergencies', 'staff'];
    keys.forEach(key => {
        const savedValue = localStorage.getItem('sams_' + key);
        if (savedValue) {
            document.getElementById('stat-' + key).innerText = savedValue;
        }
    });
}

function showTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

function login() {
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;
}

function logout() {
    localStorage.removeItem('discord_token');
    window.location.href = REDIRECT_URI;
}

window.onload = () => {
    loadData();
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    let token = fragment.get('access_token') || localStorage.getItem('discord_token');

    if (token) {
        localStorage.setItem('discord_token', token);
        fetch('https://discord.com/api/users/@me', { headers: { authorization: `Bearer ${token}` } })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(user => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-ui').style.display = 'flex';
            document.getElementById('username').innerText = user.username;
            document.getElementById('user-greeting').innerText = user.username;
            if(user.avatar) {
                document.getElementById('avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
            }
            window.history.replaceState({}, document.title, REDIRECT_URI);
        }).catch(() => logout());
    }
};
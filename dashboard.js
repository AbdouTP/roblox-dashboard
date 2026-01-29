// Configuration
const API_BASE = 'https://economy.roblox.com';
const USERS_API = 'https://users.roblox.com';
const GAMES_API = 'https://games.roblox.com';

// État global
let cookie = '';
let userId = null;
let transactions = [];
let revenueChart = null;
let typeChart = null;
let currentFilter = 'all';

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

// Gestion de l'authentification
function checkAuth() {
    cookie = localStorage.getItem('robloxCookie');
    if (cookie) {
        showDashboard();
        loadDashboardData();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const cookieInput = document.getElementById('cookieInput').value.trim();
    
    if (!cookieInput) {
        alert('Veuillez entrer votre cookie');
        return;
    }
    
    cookie = cookieInput;
    
    // Tester le cookie
    try {
        const response = await fetch(`${USERS_API}/v1/users/authenticated`, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${cookie}`
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            userId = data.id;
            localStorage.setItem('robloxCookie', cookie);
            showDashboard();
            loadDashboardData();
        } else {
            alert('Cookie invalide. Veuillez réessayer.');
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        alert('Erreur de connexion. Le cookie est peut-être invalide.');
    }
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
}

function logout() {
    localStorage.removeItem('robloxCookie');
    cookie = '';
    userId = null;
    transactions = [];
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').classList.remove('active');
}

// Chargement des données
async function loadDashboardData() {
    try {
        await Promise.all([
            loadUserInfo(),
            loadTransactions(),
            loadRevenueStats()
        ]);
        
        renderCharts();
    } catch (error) {
        console.error('Erreur de chargement:', error);
        showError('Erreur lors du chargement des données');
    }
}

async function loadUserInfo() {
    // Cette fonction simule la récupération d'infos utilisateur
    // Dans une vraie implémentation, vous feriez un appel API authentifié
    console.log('Chargement des infos utilisateur...');
}

async function loadTransactions() {
    // Simulation de transactions
    // En production, vous utiliseriez l'API Roblox avec votre cookie
    // https://economy.roblox.com/v2/users/{userId}/transactions
    
    const mockTransactions = generateMockTransactions(50);
    transactions = mockTransactions;
    
    updateStats();
    renderTransactions();
}

function generateMockTransactions(count) {
    const types = [
        { type: 'Game Pass', icon: '🎫', typeKey: 'pass' },
        { type: 'Dev Product', icon: '🛍️', typeKey: 'devproduct' },
        { type: 'Premium Payouts', icon: '👑', typeKey: 'premium' }
    ];
    
    const names = [
        'VIP Pass', 'Speed Boost', '1000 Coins', 'Double XP', 'Starter Pack',
        'Premium Currency', 'Exclusive Skin', 'Power-Up', 'Special Weapon'
    ];
    
    const users = [
        'PlayerPro123', 'GamerXD', 'CoolDude99', 'NoobMaster69', 'EliteGamer',
        'RobloxKing', 'BuilderBob', 'SpeedRunner', 'ProPlayer', 'MegaFan'
    ];
    
    const trans = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
        const typeData = types[Math.floor(Math.random() * types.length)];
        const amount = Math.floor(Math.random() * 500) + 10;
        const hoursAgo = Math.floor(Math.random() * 720); // 30 jours
        const date = new Date(now - hoursAgo * 60 * 60 * 1000);
        
        trans.push({
            id: i,
            type: typeData.type,
            typeKey: typeData.typeKey,
            icon: typeData.icon,
            name: names[Math.floor(Math.random() * names.length)],
            user: users[Math.floor(Math.random() * users.length)],
            amount: amount,
            date: date,
            timestamp: date.getTime()
        });
    }
    
    return trans.sort((a, b) => b.timestamp - a.timestamp);
}

async function loadRevenueStats() {
    // Dans une vraie implémentation, vous récupéreriez les stats réelles
    console.log('Chargement des statistiques...');
}

function updateStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    // Calcul des totaux
    const totalRobux = transactions.reduce((sum, t) => sum + t.amount, 0);
    const todayRobux = transactions
        .filter(t => t.date >= today)
        .reduce((sum, t) => sum + t.amount, 0);
    const weekRobux = transactions
        .filter(t => t.date >= weekAgo)
        .reduce((sum, t) => sum + t.amount, 0);
    const monthRobux = transactions
        .filter(t => t.date >= monthAgo)
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Calcul des variations
    const yesterdayStart = new Date(today - 24 * 60 * 60 * 1000);
    const yesterdayRobux = transactions
        .filter(t => t.date >= yesterdayStart && t.date < today)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const todayChange = yesterdayRobux > 0 
        ? ((todayRobux - yesterdayRobux) / yesterdayRobux * 100).toFixed(1)
        : 0;
    
    // Mise à jour de l'interface
    document.getElementById('totalRobux').textContent = totalRobux.toLocaleString('fr-FR') + ' R$';
    document.getElementById('todayRobux').textContent = todayRobux.toLocaleString('fr-FR') + ' R$';
    document.getElementById('weekRobux').textContent = weekRobux.toLocaleString('fr-FR') + ' R$';
    document.getElementById('monthRobux').textContent = monthRobux.toLocaleString('fr-FR') + ' R$';
    
    const todayChangeEl = document.getElementById('todayChange');
    todayChangeEl.textContent = `${todayChange > 0 ? '+' : ''}${todayChange}% vs hier`;
    todayChangeEl.className = `stat-change ${todayChange < 0 ? 'negative' : ''}`;
    
    document.getElementById('totalChange').textContent = `${transactions.length} transactions`;
    document.getElementById('weekChange').textContent = `+${weekRobux.toLocaleString('fr-FR')} R$ cette semaine`;
    document.getElementById('monthChange').textContent = `+${monthRobux.toLocaleString('fr-FR')} R$ ce mois`;
}

function renderTransactions() {
    const list = document.getElementById('transactionsList');
    
    const filtered = currentFilter === 'all' 
        ? transactions 
        : transactions.filter(t => t.typeKey === currentFilter);
    
    if (filtered.length === 0) {
        list.innerHTML = '<div class="loading">Aucune transaction trouvée</div>';
        return;
    }
    
    list.innerHTML = filtered.slice(0, 50).map(t => {
        const timeAgo = getTimeAgo(t.date);
        return `
            <div class="transaction-item">
                <div class="transaction-icon">${t.icon}</div>
                <div class="transaction-info">
                    <div class="transaction-type">${t.type}: ${t.name}</div>
                    <div class="transaction-user">👤 ${t.user}</div>
                    <div class="transaction-time">🕐 ${timeAgo}</div>
                </div>
                <div class="transaction-amount">+${t.amount} R$</div>
            </div>
        `;
    }).join('');
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 30) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
}

function filterTransactions(type) {
    currentFilter = type;
    
    // Mise à jour des boutons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTransactions();
}

function renderCharts() {
    renderRevenueChart();
    renderTypeChart();
}

function renderRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Préparer les données par jour (30 derniers jours)
    const days = [];
    const amounts = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayTransactions = transactions.filter(t => 
            t.date >= date && t.date < nextDay
        );
        
        const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        days.push(date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
        amounts.push(total);
    }
    
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Robux gagnés',
                data: amounts,
                borderColor: '#00ff9d',
                backgroundColor: 'rgba(0, 255, 157, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#00ff9d',
                pointBorderColor: '#0d1117',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#161b22',
                    titleColor: '#f0f6fc',
                    bodyColor: '#8b949e',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toLocaleString('fr-FR') + ' R$';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#30363d',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#8b949e',
                        callback: function(value) {
                            return value.toLocaleString('fr-FR') + ' R$';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#8b949e',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

function renderTypeChart() {
    const ctx = document.getElementById('typeChart').getContext('2d');
    
    // Calculer les totaux par type
    const typeTotals = {
        'pass': 0,
        'devproduct': 0,
        'premium': 0
    };
    
    transactions.forEach(t => {
        typeTotals[t.typeKey] += t.amount;
    });
    
    if (typeChart) {
        typeChart.destroy();
    }
    
    typeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Game Pass', 'Dev Products', 'Premium Payouts'],
            datasets: [{
                data: [typeTotals.pass, typeTotals.devproduct, typeTotals.premium],
                backgroundColor: [
                    '#00ff9d',
                    '#00d4ff',
                    '#ff3366'
                ],
                borderColor: '#161b22',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f0f6fc',
                        padding: 15,
                        font: {
                            size: 12,
                            family: 'JetBrains Mono'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#161b22',
                    titleColor: '#f0f6fc',
                    bodyColor: '#8b949e',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return context.label + ': ' + value.toLocaleString('fr-FR') + ' R$ (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

function refreshData() {
    const btn = event.target;
    btn.textContent = '🔄 Actualisation...';
    btn.disabled = true;
    
    loadDashboardData().then(() => {
        btn.textContent = '🔄 Actualiser';
        btn.disabled = false;
    });
}

function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
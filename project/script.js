// Data Storage
let users = JSON.parse(localStorage.getItem('users')) || {
    clients: ['client1', 'client2'],
    repeaters: ['repeater1', 'repeater2'],
    hosts: ['host1', 'host2', 'host3'],
    admin: ['admin']
};

let problems = JSON.parse(localStorage.getItem('problems')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let hostList = JSON.parse(localStorage.getItem('hostList')) || [
    { id: "host1", name: "Tech Solutions Inc.", points: 100, category: "Technology" },
    { id: "host2", name: "Legal Associates", points: 100, category: "Legal" },
    { id: "host3", name: "Business Consultants", points: 100, category: "Business" }
];

let userPoints = JSON.parse(localStorage.getItem('userPoints')) || {
    repeater1: 0,
    repeater2: 0,
    host1: 100,
    host2: 100,
    host3: 100
};

// Current User
let currentUser = null;
let currentRole = null;

// DOM Elements
const loginSection = document.getElementById('login-section');
const clientSection = document.getElementById('client-section');
const repeaterSection = document.getElementById('repeater-section');
const hostSection = document.getElementById('host-section');
const adminSection = document.getElementById('admin-section');
const currentRoleDisplay = document.getElementById('current-role');
const pointsBalance = document.getElementById('points-balance');
const logoutBtn = document.getElementById('logout-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateHostList();
    logoutBtn.addEventListener('click', logout);
});

// Login Functions
function showLoginForm(role) {
    document.getElementById('login-title').textContent = `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    document.getElementById('role-name').textContent = role;
    document.getElementById('login-form').classList.remove('hidden');
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple validation for demo
    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    // Check if user exists in any role
    let role = null;
    if (users.clients.includes(username)) role = 'client';
    else if (users.repeaters.includes(username)) role = 'repeater';
    else if (users.hosts.includes(username)) role = 'host';
    else if (users.admin.includes(username)) role = 'admin';
    else {
        // Auto-create user for demo
        if (username.startsWith('client')) {
            users.clients.push(username);
            role = 'client';
        } else if (username.startsWith('repeater')) {
            users.repeaters.push(username);
            userPoints[username] = 0;
            role = 'repeater';
        } else if (username.startsWith('host')) {
            // Add new host if not exists
            if (!hostList.some(h => h.id === username)) {
                hostList.push({
                    id: username,
                    name: `${username.charAt(0).toUpperCase() + username.slice(1)} Services`,
                    points: 100,
                    category: "General"
                });
            }
            userPoints[username] = 100;
            users.hosts.push(username);
            role = 'host';
        } else if (username === 'admin') {
            role = 'admin';
        } else {
            alert("Invalid credentials for demo. Try client1, repeater1, host1, or admin");
            return;
        }
        
        saveData();
    }

    // Login successful
    currentUser = username;
    currentRole = role;
    document.getElementById('login-form').classList.add('hidden');
    loginSection.classList.add('hidden');
    
    // Update UI
    currentRoleDisplay.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)}: ${username}`;
    
    if (role === 'repeater' || role === 'host') {
        pointsBalance.textContent = `${userPoints[username] || 0} points`;
        pointsBalance.classList.remove('hidden');
    }
    
    logoutBtn.classList.remove('hidden');
    
    // Show appropriate section
    document.getElementById(`${role}-section`).classList.remove('hidden');
    
    // Load data for the role
    switch(role) {
        case 'client':
            loadClientProblems();
            break;
        case 'repeater':
            loadRepeaterData();
            break;
        case 'host':
            loadHostData();
            break;
        case 'admin':
            loadAdminData();
            break;
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    loginSection.classList.remove('hidden');
    clientSection.classList.add('hidden');
    repeaterSection.classList.add('hidden');
    hostSection.classList.add('hidden');
    adminSection.classList.add('hidden');
    pointsBalance.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    currentRoleDisplay.textContent = "Not logged in";
}

// Client Functions
function postProblem() {
    const problemText = document.getElementById('client-problem').value;
    if (!problemText) {
        showMessage('client-message', 'Please enter a problem description', 'error');
        return;
    }

    const newProblem = {
        id: Date.now(),
        text: problemText,
        client: currentUser,
        status: 'open',
        suggestedHost: null,
        repeater: null,
        timestamp: new Date().toISOString()
    };

    problems.push(newProblem);
    saveData();
    
    document.getElementById('client-problem').value = '';
    showMessage('client-message', 'Problem posted successfully!', 'success');
    loadClientProblems();
}

function loadClientProblems() {
    const clientProblems = problems.filter(p => p.client === currentUser);
    const listElement = document.getElementById('client-problems-list');
    listElement.innerHTML = '';

    if (clientProblems.length === 0) {
        listElement.innerHTML = '<div class="card"><p>You haven\'t posted any problems yet.</p></div>';
        return;
    }

    clientProblems.forEach(problem => {
        const statusClass = problem.status === 'open' ? 'open' : 
                          problem.status === 'pending' ? 'pending' : 'completed';
        
        let hostInfo = '';
        if (problem.suggestedHost) {
            const host = hostList.find(h => h.id === problem.suggestedHost);
            hostInfo = `<p><strong>Suggested Host:</strong> ${host ? host.name : problem.suggestedHost}</p>`;
        }
        
        listElement.innerHTML += `
            <div class="problem-card">
                <h4>Problem #${problem.id}</h4>
                <p>${problem.text}</p>
                ${hostInfo}
                <div class="status ${statusClass}">${problem.status}</div>
            </div>
        `;
    });
}

function refreshProblems() {
    loadClientProblems();
    showMessage('client-message', 'Problems refreshed', 'success');
}

// Repeater Functions
function loadRepeaterData() {
    loadOpenProblems();
    loadRepeaterSuccess();
    updateRepeaterPoints();
}

function loadOpenProblems() {
    const openProblems = problems.filter(p => p.status === 'open');
    const listElement = document.getElementById('problems-list');
    listElement.innerHTML = '';

    if (openProblems.length === 0) {
        listElement.innerHTML = '<div class="card"><p>No open problems available.</p></div>';
        return;
    }

    openProblems.forEach(problem => {
        listElement.innerHTML += `
            <div class="problem-card">
                <h4>Problem #${problem.id}</h4>
                <p>${problem.text}</p>
                <p><small>Posted by: ${problem.client}</small></p>
                <button onclick="showSuggestionForm(${problem.id})" class="primary">
                    <i class="fas fa-lightbulb"></i> Suggest Host
                </button>
            </div>
        `;
    });
}

function showSuggestionForm(problemId) {
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;

    document.getElementById('current-problem-id').textContent = problemId;
    document.getElementById('current-problem-text').textContent = problem.text;
    
    // Populate host select
    const hostSelect = document.getElementById('host-select');
    hostSelect.innerHTML = '<option value="">Select Host</option>';
    
    hostList.forEach(host => {
        hostSelect.innerHTML += `<option value="${host.id}">${host.name} (${host.category})</option>`;
    });

    document.getElementById('problems-list').classList.add('hidden');
    document.getElementById('suggestion-form').classList.remove('hidden');
}

function cancelSuggestion() {
    document.getElementById('problems-list').classList.remove('hidden');
    document.getElementById('suggestion-form').classList.add('hidden');
}

function suggestHost() {
    const hostId = document.getElementById('host-select').value;
    const problemId = parseInt(document.getElementById('current-problem-id').textContent);
    
    if (!hostId) {
        showMessage('repeater-message', 'Please select a host', 'error');
        return;
    }

    const problem = problems.find(p => p.id === problemId);
    if (!problem || problem.status !== 'open') {
        showMessage('repeater-message', 'Problem is no longer available', 'error');
        return;
    }

    problem.suggestedHost = hostId;
    problem.status = 'pending';
    problem.repeater = currentUser;
    saveData();

    showMessage('repeater-message', 'Host suggested successfully!', 'success');
    cancelSuggestion();
    loadRepeaterData();
}

function loadRepeaterSuccess() {
    const successfulProblems = problems.filter(p => p.repeater === currentUser && p.status === 'completed');
    const listElement = document.getElementById('repeater-success-list');
    listElement.innerHTML = '';

    if (successfulProblems.length === 0) {
        listElement.innerHTML = '<div class="card"><p>No successful suggestions yet.</p></div>';
        return;
    }

    successfulProblems.forEach(problem => {
        const host = hostList.find(h => h.id === problem.suggestedHost);
        listElement.innerHTML += `
            <div class="problem-card">
                <h4>Problem #${problem.id}</h4>
                <p>${problem.text}</p>
                <p><strong>Host:</strong> ${host ? host.name : problem.suggestedHost}</p>
                <p><strong>Earned:</strong> 10 points</p>
            </div>
        `;
    });
}

function updateRepeaterPoints() {
    document.getElementById('repeater-points').textContent = userPoints[currentUser] || 0;
}

// Host Functions
function loadHostData() {
    loadHostRequests();
    loadHostCompleted();
    updateHostPoints();
}

function loadHostRequests() {
    const pendingProblems = problems.filter(p => p.suggestedHost === currentUser && p.status === 'pending');
    const listElement = document.getElementById('host-requests');
    listElement.innerHTML = '';

    if (pendingProblems.length === 0) {
        listElement.innerHTML = '<div class="card"><p>No pending requests.</p></div>';
        return;
    }

    pendingProblems.forEach(problem => {
        listElement.innerHTML += `
            <div class="problem-card">
                <h4>Problem #${problem.id}</h4>
                <p>${problem.text}</p>
                <p><small>Suggested by: ${problem.repeater}</small></p>
                <div class="form-row">
                    <button onclick="acceptClient(${problem.id})" class="primary">
                        <i class="fas fa-check"></i> Accept & Reward (10 points)
                    </button>
                    <button onclick="rejectClient(${problem.id})" class="danger">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `;
    });
}

function acceptClient(problemId) {
    const problem = problems.find(p => p.id === problemId);
    if (!problem || problem.status !== 'pending' || problem.suggestedHost !== currentUser) {
        showMessage('host-message', 'Invalid request', 'error');
        return;
    }

    // Check if host has enough points
    if (userPoints[currentUser] < 10) {
        showMessage('host-message', 'Not enough points to reward repeater', 'error');
        return;
    }

    problem.status = 'completed';
    
    // Create transaction
    const transaction = {
        id: Date.now(),
        problemId: problemId,
        hostId: currentUser,
        repeaterId: problem.repeater,
        points: 10,
        timestamp: new Date().toISOString()
    };
    transactions.push(transaction);
    
    // Update points
    userPoints[currentUser] -= 10;
    userPoints[problem.repeater] = (userPoints[problem.repeater] || 0) + 10;
    
    saveData();
    showMessage('host-message', 'Client accepted! Repeater rewarded with 10 points.', 'success');
    loadHostData();
}

function rejectClient(problemId) {
    const problem = problems.find(p => p.id === problemId);
    if (!problem || problem.status !== 'pending' || problem.suggestedHost !== currentUser) {
        showMessage('host-message', 'Invalid request', 'error');
        return;
    }

    problem.status = 'open';
    problem.suggestedHost = null;
    problem.repeater = null;
    saveData();
    
    showMessage('host-message', 'Request rejected. Problem is now open for other suggestions.', 'success');
    loadHostData();
}

function loadHostCompleted() {
    const completedProblems = problems.filter(p => p.suggestedHost === currentUser && p.status === 'completed');
    const listElement = document.getElementById('host-completed-list');
    listElement.innerHTML = '';

    if (completedProblems.length === 0) {
        listElement.innerHTML = '<div class="card"><p>No completed services yet.</p></div>';
        return;
    }

    completedProblems.forEach(problem => {
        listElement.innerHTML += `
            <div class="problem-card">
                <h4>Problem #${problem.id}</h4>
                <p>${problem.text}</p>
                <p><small>Repeater: ${problem.repeater}</small></p>
                <p><strong>Points spent:</strong> 10</p>
            </div>
        `;
    });
}

function updateHostPoints() {
    document.getElementById('host-points').textContent = userPoints[currentUser] || 0;
}

// Admin Functions
function loadAdminData() {
    updateStats();
    loadAllTransactions();
    loadHostsList();
}

function updateStats() {
    document.getElementById('client-count').textContent = users.clients.length;
    document.getElementById('repeater-count').textContent = users.repeaters.length;
    document.getElementById('host-count').textContent = users.hosts.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayTx = transactions.filter(tx => tx.timestamp.split('T')[0] === today).length;
    document.getElementById('today-tx').textContent = todayTx;
    document.getElementById('total-tx').textContent = transactions.length;
    
    const totalPoints = transactions.reduce((sum, tx) => sum + tx.points, 0);
    document.getElementById('total-points').textContent = totalPoints;
}

function loadAllTransactions() {
    const listElement = document.getElementById('transactions-list');
    listElement.innerHTML = '';

    if (transactions.length === 0) {
        listElement.innerHTML = '<div class="card"><p>No transactions yet.</p></div>';
        return;
    }

    transactions.slice().reverse().forEach(tx => {
        const date = new Date(tx.timestamp).toLocaleString();
        listElement.innerHTML += `
            <div class="transaction-card">
                <h4>Transaction #${tx.id}</h4>
                <p><strong>Problem:</strong> #${tx.problemId}</p>
                <p><strong>Host:</strong> ${tx.hostId}</p>
                <p><strong>Repeater:</strong> ${tx.repeaterId}</p>
                <p><strong>Points:</strong> ${tx.points}</p>
                <p><small>${date}</small></p>
            </div>
        `;
    });
}

function loadHostsList() {
    const listElement = document.getElementById('hosts-list');
    listElement.innerHTML = '';

    hostList.forEach(host => {
        listElement.innerHTML += `
            <div class="host-card">
                <h4>${host.name}</h4>
                <p><strong>ID:</strong> ${host.id}</p>
                <p><strong>Category:</strong> ${host.category}</p>
                <p><strong>Points:</strong> ${userPoints[host.id] || 0}</p>
                <button onclick="deleteHost('${host.id}')" class="danger">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
    });
}

function addHost() {
    const name = document.getElementById('new-host-name').value;
    const points = parseInt(document.getElementById('new-host-points').value) || 100;
    
    if (!name) {
        alert("Please enter host name");
        return;
    }

    const hostId = `host${Date.now()}`;
    hostList.push({
        id: hostId,
        name: name,
        points: points,
        category: "General"
    });
    
    users.hosts.push(hostId);
    userPoints[hostId] = points;
    
    saveData();
    document.getElementById('new-host-name').value = '';
    loadHostsList();
    updateStats();
}

function deleteHost(hostId) {
    if (!confirm(`Are you sure you want to delete host ${hostId}?`)) return;
    
    hostList = hostList.filter(h => h.id !== hostId);
    users.hosts = users.hosts.filter(h => h !== hostId);
    delete userPoints[hostId];
    
    // Remove any problems associated with this host
    problems = problems.filter(p => p.suggestedHost !== hostId);
    
    saveData();
    loadHostsList();
    updateStats();
}

// Helper Functions
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => element.innerHTML = '', 3000);
}

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('problems', JSON.stringify(problems));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('hostList', JSON.stringify(hostList));
    localStorage.setItem('userPoints', JSON.stringify(userPoints));
}

function updateHostList() {
    // Initialize if empty
    if (hostList.length === 0) {
        hostList = [
            { id: "host1", name: "Tech Solutions Inc.", points: 100, category: "Technology" },
            { id: "host2", name: "Legal Associates", points: 100, category: "Legal" },
            { id: "host3", name: "Business Consultants", points: 100, category: "Business" }
        ];
        saveData();
    }
}

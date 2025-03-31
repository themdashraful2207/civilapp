// Data Storage (using localStorage)
let problems = JSON.parse(localStorage.getItem('problems')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let hosts = [
    { id: "host1", name: "Host 1 (Tech Expert)", points: 100 },
    { id: "host2", name: "Host 2 (Legal Advisor)", points: 100 },
    { id: "host3", name: "Host 3 (Business Consultant)", points: 100 }
];

// Role Selection
function setRole(role) {
    document.getElementById('client-section').classList.add('hidden');
    document.getElementById('repeater-section').classList.add('hidden');
    document.getElementById('host-section').classList.add('hidden');
    document.getElementById('admin-section').classList.add('hidden');

    if (role === 'client') {
        document.getElementById('client-section').classList.remove('hidden');
    } else if (role === 'repeater') {
        document.getElementById('repeater-section').classList.remove('hidden');
        loadProblems();
    } else if (role === 'host') {
        document.getElementById('host-section').classList.remove('hidden');
        loadHostRequests();
    } else if (role === 'admin') {
        document.getElementById('admin-section').classList.remove('hidden');
        loadTransactions();
    }
}

// Client Posts Problem
function postProblem() {
    const problemText = document.getElementById('client-problem').value;
    if (!problemText) return;

    const newProblem = {
        id: Date.now(),
        text: problemText,
        status: 'open',
        suggestedHost: null
    };

    problems.push(newProblem);
    localStorage.setItem('problems', JSON.stringify(problems));

    document.getElementById('client-message').innerHTML = `
        <p style="color: green;">Problem posted successfully!</p>
    `;
    document.getElementById('client-problem').value = '';
}

// Repeater Loads Problems & Suggests Host
function loadProblems() {
    const problemsList = document.getElementById('problems-list');
    problemsList.innerHTML = '';

    const openProblems = problems.filter(p => p.status === 'open');
    if (openProblems.length === 0) {
        problemsList.innerHTML = '<p>No open problems.</p>';
        return;
    }

    openProblems.forEach(problem => {
        problemsList.innerHTML += `
            <div class="problem">
                <p><strong>Problem #${problem.id}:</strong> ${problem.text}</p>
            </div>
        `;
    });
}

function suggestHost() {
    const hostId = document.getElementById('host-select').value;
    if (!hostId) return;

    const openProblems = problems.filter(p => p.status === 'open');
    if (openProblems.length === 0) {
        document.getElementById('repeater-message').innerHTML = `
            <p style="color: red;">No open problems.</p>
        `;
        return;
    }

    const selectedProblem = openProblems[0];
    selectedProblem.suggestedHost = hostId;
    selectedProblem.status = 'pending';

    localStorage.setItem('problems', JSON.stringify(problems));

    document.getElementById('repeater-message').innerHTML = `
        <p style="color: green;">Host suggested successfully!</p>
    `;
    loadProblems();
}

// Host Accepts Client & Rewards Repeater
function loadHostRequests() {
    const hostRequests = document.getElementById('host-requests');
    hostRequests.innerHTML = '';

    const pendingProblems = problems.filter(p => p.status === 'pending' && p.suggestedHost === 'host1'); // Assuming current host is host1
    if (pendingProblems.length === 0) {
        hostRequests.innerHTML = '<p>No pending requests.</p>';
        return;
    }

    pendingProblems.forEach(problem => {
        hostRequests.innerHTML += `
            <div class="request">
                <p><strong>Problem #${problem.id}:</strong> ${problem.text}</p>
                <button onclick="acceptClient(${problem.id})">Accept & Reward Repeater (10 Points)</button>
            </div>
        `;
    });
}

function acceptClient(problemId) {
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;

    problem.status = 'solved';

    // Record transaction (Host rewards Repeater)
    transactions.push({
        id: Date.now(),
        problemId: problemId,
        hostId: problem.suggestedHost,
        points: 10,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem('problems', JSON.stringify(problems));
    localStorage.setItem('transactions', JSON.stringify(transactions));

    document.getElementById('host-message').innerHTML = `
        <p style="color: green;">Client accepted! Repeater rewarded with 10 points.</p>
    `;
    loadHostRequests();
}

// Admin Views Transactions
function loadTransactions() {
    const transactionsList = document.getElementById('transactions-list');
    transactionsList.innerHTML = '';

    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p>No transactions yet.</p>';
        return;
    }

    transactions.forEach(tx => {
        transactionsList.innerHTML += `
            <div class="transaction">
                <p><strong>TX #${tx.id}:</strong> Host ${tx.hostId} rewarded Repeater for Problem #${tx.problemId} (${tx.points} points)</p>
            </div>
        `;
    });
}

// Initialize
setRole('client'); // Default role

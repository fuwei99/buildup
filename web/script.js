let apiKey = null;

// ==================================================================
// Login and Initialization
// ==================================================================

async function login() {
    const keyInput = document.getElementById('api-key-input');
    const errorEl = document.getElementById('login-error');
    const key = keyInput.value.trim();

    if (!key) {
        errorEl.textContent = 'API Key cannot be empty.';
        return;
    }

    // Try to fetch status with the new key to validate it
    try {
        const res = await fetchWithAuth('/api/status', { headers: { 'x-api-key': key } });
        if (!res.ok) {
            throw new Error('Invalid API Key');
        }
        
        // Key is valid, proceed
        apiKey = key;
        errorEl.textContent = '';
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('app-view').style.display = 'block';
        
        // Initial load
        const data = await res.json();
        updateDashboard(data);
        updateLogs(data.logs);
        renderAuthList(data.status.accountDetails);
        
        // Start periodic refresh
        setInterval(refreshStatus, 5000);

    } catch (err) {
        console.error('Login failed:', err);
        errorEl.textContent = 'Login failed. Please check your API Key.';
        apiKey = null;
    }
}

// ==================================================================
// Core Functions (using fetchWithAuth)
// ==================================================================

async function fetchWithAuth(url, options = {}) {
    const headers = { ...options.headers };
    if (apiKey) {
        headers['x-api-key'] = apiKey;
    }
    
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
        // If we get a 401, it means the key is invalid or expired.
        // Force a re-login.
        apiKey = null;
        document.getElementById('app-view').style.display = 'none';
        document.getElementById('login-view').style.display = 'block';
        document.getElementById('login-error').textContent = 'Session expired. Please log in again.';
        throw new Error('Unauthorized');
    }
    
    return res;
}


async function refreshStatus() {
    try {
        const res = await fetchWithAuth('/api/status');
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        
        const data = await res.json();
        updateDashboard(data);
        updateLogs(data.logs);
        renderAuthList(data.status.accountDetails);

        const statusBadge = document.getElementById('server-status');
        statusBadge.className = 'status-badge online';
        statusBadge.querySelector('.text').textContent = 'Online';
    } catch (err) {
        if (err.message !== 'Unauthorized') {
            console.error('Failed to fetch status:', err);
            const statusBadge = document.getElementById('server-status');
            statusBadge.className = 'status-badge offline';
            statusBadge.querySelector('.text').textContent = 'Offline';
        }
    }
}

// ==================================================================
// UI Update Functions
// ==================================================================

function updateDashboard(data) {
    document.getElementById('current-account').textContent = `#${data.status.currentAuthIndex}`;
    document.getElementById('usage-count').textContent = `${data.status.usageCount} / ${data.status.switchOnUses || '∞'}`;
    document.getElementById('failure-count').textContent = `${data.status.failureCount} / ${data.status.failureThreshold || '∞'}`;
    document.getElementById('browser-status').textContent = data.status.browserConnected ? 'Connected' : 'Disconnected';
    document.getElementById('current-mode').textContent = data.status.streamingMode.includes('real') ? 'Real Stream' : 'Fake Stream';

    const select = document.getElementById('account-select');
    const currentVal = select.value;
    select.innerHTML = '';

    data.status.accountDetails.forEach(acc => {
        const option = document.createElement('option');
        option.value = acc.index;
        option.textContent = `Account #${acc.index} - ${acc.name}`;
        if (acc.index == data.status.currentAuthIndex) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
        select.value = currentVal;
    }
}

function updateLogs(logs) {
    const container = document.getElementById('logs-container');
    const wasScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 10;
    container.textContent = logs;
    if (wasScrolledToBottom) {
        container.scrollTop = container.scrollHeight;
    }
}

function renderAuthList(auths) {
    const list = document.getElementById('auth-list');
    list.innerHTML = '';

    if (!auths || auths.length === 0) {
        list.innerHTML = '<div class="empty-state">No auth files found. Add one to get started.</div>';
        return;
    }

    auths.sort((a, b) => a.index - b.index).forEach(auth => {
        const item = document.createElement('div');
        item.className = 'auth-item';
        item.innerHTML = `
            <div class="auth-info">
                <h4>Auth #${auth.index}</h4>
                <p><small>${auth.name || 'Unknown Account'}</small></p>
            </div>
            <div class="auth-actions">
                <button class="btn btn-secondary btn-sm" onclick="editAuth(${auth.index})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteAuth(${auth.index})">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// ==================================================================
// User Actions
// ==================================================================

async function switchAccount() {
    const index = document.getElementById('account-select').value;
    if (!index) return;

    if (!confirm(`Switch to Account #${index}? This will restart the browser session.`)) return;

    try {
        const res = await fetchWithAuth('/api/switch-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetIndex: parseInt(index) })
        });
        const msg = await res.text();
        alert(msg);
        refreshStatus();
    } catch (err) {
        if (err.message !== 'Unauthorized') alert('Failed to switch account: ' + err.message);
    }
}

async function toggleMode() {
    const currentText = document.getElementById('current-mode').textContent;
    const newMode = currentText.includes('Real') ? 'fake' : 'real';

    try {
        const res = await fetchWithAuth('/api/set-mode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: newMode })
        });
        const msg = await res.text();
        alert(msg);
        refreshStatus();
    } catch (err) {
        if (err.message !== 'Unauthorized') alert('Failed to toggle mode: ' + err.message);
    }
}

function clearLogs() {
    document.getElementById('logs-container').textContent = '';
}

// ==================================================================
// Auth Management Modal
// ==================================================================

let currentAuthId = null;

function openAddAuthModal() {
    currentAuthId = null;
    document.getElementById('modal-title').textContent = 'Add New Auth';
    document.getElementById('auth-index').value = '';
    document.getElementById('auth-index').disabled = false;
    document.getElementById('auth-content').value = '';
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

async function editAuth(index) {
    try {
        const res = await fetchWithAuth(`/api/auth/${index}`);
        const data = await res.json();

        currentAuthId = index;
        document.getElementById('modal-title').textContent = `Edit Auth #${index}`;
        document.getElementById('auth-index').value = index;
        document.getElementById('auth-index').disabled = true;
        document.getElementById('auth-content').value = JSON.stringify(data, null, 2);
        document.getElementById('auth-modal').classList.add('active');
    } catch (err) {
        if (err.message !== 'Unauthorized') alert('Failed to load auth data: ' + err.message);
    }
}

async function saveAuth() {
    const index = document.getElementById('auth-index').value;
    const content = document.getElementById('auth-content').value;

    if (!index || !content) {
        alert('Please fill in all fields');
        return;
    }

    try {
        JSON.parse(content); // Validate JSON

        const res = await fetchWithAuth('/api/auth/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                index: parseInt(index),
                content: content
            })
        });

        if (!res.ok) throw new Error(await res.text());

        alert('Auth saved successfully!');
        closeAuthModal();
        refreshStatus();
    } catch (err) {
        if (err.message !== 'Unauthorized') alert('Error saving auth: ' + err.message);
    }
}

async function deleteAuth(index) {
    if (!confirm(`Are you sure you want to delete Auth #${index}? This cannot be undone.`)) return;

    try {
        const res = await fetchWithAuth(`/api/auth/${index}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error(await res.text());

        alert('Auth deleted successfully');
        refreshStatus();
    } catch (err) {
        if (err.message !== 'Unauthorized') alert('Error deleting auth: ' + err.message);
    }
}

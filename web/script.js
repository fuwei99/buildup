let currentAuthId = null;

document.addEventListener('DOMContentLoaded', () => {
    refreshStatus();
    setInterval(refreshStatus, 5000);
});

async function refreshStatus() {
    try {
        const res = await fetch('/api/status');
        if (res.redirected) {
            window.location.href = '/login';
            return;
        }
        if (!res.ok) {
            throw new Error(`Server responded with status: ${res.status}`);
        }
        const data = await res.json();
        updateDashboard(data);
        updateLogs(data.logs);
        renderAuthList(data.status.accountDetails);

        // Update connection status
        const statusBadge = document.getElementById('server-status');
        statusBadge.className = 'status-badge online';
        statusBadge.querySelector('.text').textContent = 'Online';
    } catch (err) {
        console.error('Failed to fetch status:', err);
        const statusBadge = document.getElementById('server-status');
        statusBadge.className = 'status-badge offline';
        statusBadge.querySelector('.text').textContent = 'Offline';
        renderAuthList([]);
    }
}

function updateDashboard(data) {
    document.getElementById('current-account').textContent = `#${data.status.currentAuthIndex}`;
    document.getElementById('usage-count').textContent = `${data.status.usageCount} / ${data.status.switchOnUses || '∞'}`;
    document.getElementById('failure-count').textContent = `${data.status.failureCount} / ${data.status.failureThreshold || '∞'}`;
    document.getElementById('browser-status').textContent = data.status.browserConnected ? 'Connected' : 'Disconnected';
    document.getElementById('current-mode').textContent = data.status.streamingMode === 'real' ? 'Real Stream' : 'Fake Stream';

    // Update account select
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

async function switchAccount() {
    const index = document.getElementById('account-select').value;
    if (!index) return;

    if (!confirm(`Switch to Account #${index}? This will restart the browser session.`)) return;

    try {
        const res = await fetch('/api/switch-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetIndex: parseInt(index) })
        });
        const msg = await res.text();
        alert(msg);
        refreshStatus();
    } catch (err) {
        alert('Failed to switch account: ' + err.message);
    }
}

async function toggleMode() {
    const currentText = document.getElementById('current-mode').textContent;
    const newMode = currentText.includes('Real') ? 'fake' : 'real';

    try {
        const res = await fetch('/api/set-mode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: newMode })
        });
        const msg = await res.text();
        alert(msg);
        refreshStatus();
    } catch (err) {
        alert('Failed to toggle mode: ' + err.message);
    }
}

function clearLogs() {
    document.getElementById('logs-container').textContent = '';
}

// Auth Management
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
        const res = await fetch(`/api/auth/${index}`);
        const data = await res.json();

        currentAuthId = index;
        document.getElementById('modal-title').textContent = `Edit Auth #${index}`;
        document.getElementById('auth-index').value = index;
        document.getElementById('auth-index').disabled = true;
        document.getElementById('auth-content').value = JSON.stringify(data, null, 2);
        document.getElementById('auth-modal').classList.add('active');
    } catch (err) {
        alert('Failed to load auth data: ' + err.message);
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
        // Validate JSON
        JSON.parse(content);

        const res = await fetch('/api/auth/save', {
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
        loadAuthList();
        refreshStatus(); // Refresh to update account list
    } catch (err) {
        alert('Error saving auth: ' + err.message);
    }
}

async function deleteAuth(index) {
    if (!confirm(`Are you sure you want to delete Auth #${index}? This cannot be undone.`)) return;

    try {
        const res = await fetch(`/api/auth/${index}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error(await res.text());

        alert('Auth deleted successfully');
        loadAuthList();
        refreshStatus();
    } catch (err) {
        alert('Error deleting auth: ' + err.message);
    }
}

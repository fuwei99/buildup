document.addEventListener('DOMContentLoaded', () => {
    const configList = document.getElementById('config-list');
    const configForm = document.getElementById('config-form');
    const jsonInput = document.getElementById('json-input');
    const editIndexInput = document.getElementById('edit-index');
    const batchLimitButton = document.getElementById('batch-limit-button');
    const batchLimitInput = document.getElementById('batch-limit-input');
    const refreshLogsButton = document.getElementById('refresh-logs-button');
    const logsContent = document.getElementById('logs-content');

    const fetchLogs = async () => {
        try {
            logsContent.textContent = 'Loading logs...';
            const response = await fetch('/api/logs');
            if (!response.ok) throw new Error('Failed to fetch logs');
            const logs = await response.json();
            logsContent.textContent = logs.length > 0 ? logs.join('\n') : 'No logs found.';
        } catch (error) {
            console.error('Error fetching logs:', error);
            logsContent.textContent = 'Error loading logs.';
        }
    };

    batchLimitButton.addEventListener('click', async () => {
        const limit = parseInt(batchLimitInput.value, 10);
        if (isNaN(limit) || limit < 0) {
            alert('Please enter a valid non-negative number for the limit.');
            return;
        }

        if (confirm(`Are you sure you want to set the usage limit to ${limit} for all configs?`)) {
            try {
                const response = await fetch('/api/auth/configs/batch-limit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usageLimit: limit }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Batch set limit operation failed');
                }

                await renderConfigs();
                alert('Batch limit set successfully!');

            } catch (error) {
                alert(`Error setting batch limit: ${error.message}`);
            }
        }
    });

    refreshLogsButton.addEventListener('click', fetchLogs);

    const renderConfigs = async () => {
        try {
            const response = await fetch('/api/auth/configs');
            if (!response.ok) throw new Error('Failed to fetch configs');
            const configs = await response.json();

            configList.innerHTML = ''; // Clear the list

            configs.forEach((config, index) => {
                const item = document.createElement('div');
                item.className = 'config-item';
                item.innerHTML = `
                    <p><strong>Index:</strong> ${index}</p>
                    <p><strong>Usage:</strong> ${config.currentUsage} / ${config.usageLimit}</p>
                    <div class="actions">
                        <div>
                            <input type="number" id="limit-input-${index}" placeholder="New Limit" value="${config.usageLimit}">
                            <button class="set-limit" data-index="${index}">Set Limit</button>
                        </div>
                        <button class="reset-usage" data-index="${index}">Reset Usage</button>
                        <button class="edit-config" data-index="${index}">Edit</button>
                        <button class="delete-config" data-index="${index}">Delete</button>
                    </div>
                `;
                configList.appendChild(item);
            });
        } catch (error) {
            console.error('Error rendering configs:', error);
            configList.innerHTML = '<p>Error loading configurations.</p>';
        }
    };

    configForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const jsonString = jsonInput.value;
        const editIndex = editIndexInput.value;

        try {
            const configData = JSON.parse(jsonString);
            let response;

            if (editIndex) {
                // Edit mode
                response = await fetch(`/api/auth/configs/${editIndex}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(configData),
                });
            } else {
                // Add mode
                response = await fetch('/api/auth/configs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(configData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Save operation failed');
            }

            // Clear form and refresh list
            jsonInput.value = '';
            editIndexInput.value = '';
            await renderConfigs();

        } catch (error) {
            alert(`Error saving config: ${error.message}`);
        }
    });

    configList.addEventListener('click', async (e) => {
        const target = e.target;
        const index = target.dataset.index;

        if (!index) return;

        // Delete
        if (target.classList.contains('delete-config')) {
            if (confirm(`Are you sure you want to delete config #${index}?`)) {
                try {
                    const response = await fetch(`/api/auth/configs/${index}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Delete failed');
                    await renderConfigs();
                } catch (error) {
                    alert(`Error deleting config: ${error.message}`);
                }
            }
        }

        // Edit
        if (target.classList.contains('edit-config')) {
            try {
                const response = await fetch('/api/auth/configs');
                const configs = await response.json();
                const configToEdit = configs[index];
                if (configToEdit) {
                    jsonInput.value = JSON.stringify(configToEdit, null, 2);
                    editIndexInput.value = index;
                    jsonInput.focus();
                }
            } catch (error) {
                alert(`Error fetching config for editing: ${error.message}`);
            }
        }

        // Set Limit
        if (target.classList.contains('set-limit')) {
            const limitInput = document.getElementById(`limit-input-${index}`);
            const newLimit = parseInt(limitInput.value, 10);

            if (!isNaN(newLimit) && newLimit >= 0) {
                try {
                    const response = await fetch(`/api/auth/configs/${index}/limit`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usageLimit: newLimit }),
                    });
                    if (!response.ok) throw new Error('Set limit failed');
                    await renderConfigs();
                } catch (error) {
                    alert(`Error setting limit: ${error.message}`);
                }
            } else {
                alert('Please enter a valid non-negative number for the limit.');
            }
        }

        // Reset Usage
        if (target.classList.contains('reset-usage')) {
            try {
                const response = await fetch(`/api/auth/configs/${index}/reset`, { method: 'POST' });
                if (!response.ok) throw new Error('Reset failed');
                await renderConfigs();
            } catch (error) {
                alert(`Error resetting usage: ${error.message}`);
            }
        }
    });

    // Initial render
    renderConfigs();
    fetchLogs();
});
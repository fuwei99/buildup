document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const configList = document.getElementById('config-list');
    const configForm = document.getElementById('config-form');
    const jsonInput = document.getElementById('json-input');
    const editIndexInput = document.getElementById('edit-index');
    const searchInput = document.getElementById('search-input');

    // Status Monitoring Elements
    const currentAccountEl = document.getElementById('current-account');
    const currentAccountNameEl = document.getElementById('current-account-name');
    const usageCountEl = document.getElementById('usage-count');
    const switchThresholdEl = document.getElementById('switch-threshold');
    const usageProgressEl = document.getElementById('usage-progress');
    const failureCountEl = document.getElementById('failure-count');
    const failureThresholdEl = document.getElementById('failure-threshold');
    const failureProgressEl = document.getElementById('failure-progress');
    const browserStatusEl = document.getElementById('browser-status');
    const browserStatusDescEl = document.getElementById('browser-status-desc');
    const systemHealthEl = document.getElementById('system-health');
    const systemHealthDescEl = document.getElementById('system-health-desc');

    // Quick Actions Elements
    const quickAccountSelect = document.getElementById('quick-account-select');
    const quickSwitchBtn = document.getElementById('quick-switch-btn');
    const toggleRefreshBtn = document.getElementById('toggle-refresh-btn');
    const refreshIndicatorEl = document.getElementById('refresh-indicator');
    const refreshTextEl = document.getElementById('refresh-text');

    // Auto Refresh Elements
    const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
    const refreshIntervalSelect = document.getElementById('refresh-interval');
    const manualRefreshBtn = document.getElementById('manual-refresh-btn');

    // Modal Elements
    const configModal = document.getElementById('config-modal');
    const batchLimitModal = document.getElementById('batch-limit-modal');
    const logsModal = document.getElementById('logs-modal');
    const systemConfigModal = document.getElementById('system-config-modal');
    const confirmDialog = document.getElementById('confirm-dialog');

    // Modal Buttons
    const newConfigBtn = document.getElementById('new-config-btn');
    const batchLimitBtn = document.getElementById('batch-limit-btn');
    const viewLogsBtn = document.getElementById('view-logs-btn');
    const refreshDataBtn = document.getElementById('refresh-data-btn');
    const refreshLogsBtn = document.getElementById('refresh-logs-button');
    const uploadZipBtn = document.getElementById('upload-zip-btn');
    const zipUploadInput = document.getElementById('zip-upload-input');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const settingsBtn = document.getElementById('settings-btn');

    // Modal Close Buttons
    const modalClose = document.getElementById('modal-close');
    const batchLimitModalClose = document.getElementById('batch-limit-modal-close');
    const logsModalClose = document.getElementById('logs-modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const batchLimitCancelBtn = document.getElementById('batch-limit-cancel-btn');
    const confirmCancel = document.getElementById('confirm-cancel');
    const systemConfigModalClose = document.getElementById('system-config-modal-close');
    const systemConfigCancelBtn = document.getElementById('system-config-cancel-btn');

    // Form Elements
    const batchLimitForm = document.getElementById('batch-limit-form');
    const batchLimitInput = document.getElementById('batch-limit-input');
    const logsContent = document.getElementById('logs-content');
    const systemConfigForm = document.getElementById('system-config-form');

    // Stats Elements
    const totalConfigsEl = document.getElementById('total-configs');
    const totalUsageEl = document.getElementById('total-usage');
    const systemStatusEl = document.getElementById('system-status');

    // Confirm Dialog Elements
    const confirmMessage = document.getElementById('confirm-message');
    const confirmOk = document.getElementById('confirm-ok');

    // State
    let currentConfigs = [];
    let confirmCallback = null;
    let autoRefreshEnabled = true;
    let refreshInterval = 10000; // 默认10秒
    let refreshTimer = null;
    let currentStatusData = null;

    // Toast Notification System
    const showToast = (message, type = 'info', title = null) => {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        const titles = {
            success: title || '成功',
            error: title || '错误',
            warning: title || '警告',
            info: title || '信息'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        const timeout = setTimeout(() => {
            removeToast(toast);
        }, 5000);

        // Manual close
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeout);
            removeToast(toast);
        });

        // Animation
        requestAnimationFrame(() => {
            toast.style.animation = 'slideIn 0.3s ease-out';
        });
    };

    const removeToast = (toast) => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    };

    // Modal Functions
    const showModal = (modal) => {
        if (modal) {
            modal.showModal();
            document.body.style.overflow = 'hidden';
        }
    };

    const hideModal = (modal) => {
        if (modal) {
            modal.close();
            document.body.style.overflow = '';
        }
    };

    // Confirm Dialog
    const showConfirm = (message, callback) => {
        confirmMessage.textContent = message;
        confirmCallback = callback;
        showModal(confirmDialog);
    };

    // Status Monitoring Functions
    const updateStatusDisplay = async () => {
        try {
            const response = await fetch('/api/status');
            if (!response.ok) throw new Error('获取状态失败');

            const data = await response.json();
            currentStatusData = data.status;

            // 更新当前账号信息
            currentAccountEl.textContent = `#${currentStatusData.currentAuthIndex}`;
            const accountDetail = currentStatusData.accountDetails?.find(acc => acc.index === currentStatusData.currentAuthIndex);
            currentAccountNameEl.textContent = accountDetail ? accountDetail.name : '未知账号';

            // 更新使用次数信息
            const usageMatch = currentStatusData.usageCount.match(/(\d+)\s*\/\s*(\d+)/);
            if (usageMatch) {
                const current = parseInt(usageMatch[1]);
                const max = parseInt(usageMatch[2]);
                usageCountEl.textContent = `${current} / ${max}`;
                switchThresholdEl.textContent = max;
                const percentage = max > 0 ? (current / max) * 100 : 0;
                usageProgressEl.style.width = `${Math.min(percentage, 100)}%`;

                // 根据使用率设置进度条颜色
                usageProgressEl.className = 'progress-fill';
                if (percentage >= 80) {
                    usageProgressEl.classList.add('progress-high');
                } else if (percentage >= 50) {
                    usageProgressEl.classList.add('progress-medium');
                } else {
                    usageProgressEl.classList.add('progress-low');
                }
            }

            // 更新失败次数信息
            const failureMatch = currentStatusData.failureCount.match(/(\d+)\s*\/\s*(\d+)/);
            if (failureMatch) {
                const current = parseInt(failureMatch[1]);
                const max = parseInt(failureMatch[2]);
                failureCountEl.textContent = `${current} / ${max}`;
                failureThresholdEl.textContent = max;
                const percentage = max > 0 ? (current / max) * 100 : 0;
                failureProgressEl.style.width = `${Math.min(percentage, 100)}%`;

                // 根据失败率设置进度条颜色
                failureProgressEl.className = 'progress-fill';
                if (percentage >= 80) {
                    failureProgressEl.classList.add('progress-high');
                } else if (percentage >= 50) {
                    failureProgressEl.classList.add('progress-medium');
                } else {
                    failureProgressEl.classList.add('progress-low');
                }
            }

            // 更新浏览器连接状态
            const browserConnected = currentStatusData.browserConnected;
            browserStatusEl.textContent = browserConnected ? '已连接' : '未连接';
            browserStatusEl.style.color = browserConnected ? 'var(--success)' : 'var(--danger)';
            browserStatusDescEl.textContent = browserConnected ? '浏览器正常运行' : '浏览器连接异常';

            // 更新系统健康状态
            systemHealthEl.textContent = '运行中';
            systemHealthEl.style.color = 'var(--success)';
            systemHealthDescEl.textContent = '服务正常运行';

        } catch (error) {
            console.error('更新状态显示失败:', error);
            showToast('更新状态显示失败', 'error');
        }
    };

    const updateAccountOptions = async () => {
        try {
            const response = await fetch('/api/auth/configs');
            if (!response.ok) throw new Error('获取账号列表失败');

            const configs = await response.json();
            quickAccountSelect.innerHTML = '<option value="">选择账号...</option>';

            configs.forEach(config => {
                const option = document.createElement('option');
                option.value = config.index;
                option.textContent = `账号 #${config.index}`;
                quickAccountSelect.appendChild(option);
            });

        } catch (error) {
            console.error('更新账号选项失败:', error);
            showToast('更新账号选项失败', 'error');
        }
    };

    const startAutoRefresh = () => {
        if (refreshTimer) {
            clearInterval(refreshTimer);
        }

        if (autoRefreshEnabled) {
            refreshTimer = setInterval(async () => {
                await updateStatusDisplay();
                await renderConfigs(searchInput.value);
            }, refreshInterval);

            refreshIndicatorEl.classList.remove('disabled');
            refreshTextEl.textContent = '已启用';
        } else {
            refreshIndicatorEl.classList.add('disabled');
            refreshTextEl.textContent = '已禁用';
        }
    };

    const stopAutoRefresh = () => {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    };

    // Quick Actions Functions
    const quickSwitchAccount = async () => {
        const targetIndex = quickAccountSelect.value;
        if (!targetIndex) {
            showToast('请先选择要切换的账号', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/switch-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetIndex: parseInt(targetIndex, 10) })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const result = await response.text();
            showToast(result, 'success');
            await updateStatusDisplay();

        } catch (error) {
            console.error('快速切换账号失败:', error);
            showToast(`快速切换账号失败: ${error.message}`, 'error');
        }
    };

    const toggleAutoRefresh = () => {
        autoRefreshEnabled = !autoRefreshEnabled;
        autoRefreshToggle.checked = autoRefreshEnabled;
        startAutoRefresh();
    };

    // Update Stats
    const updateStats = () => {
        if (currentConfigs.length === 0) {
            totalConfigsEl.textContent = '0';
            totalUsageEl.textContent = '0';
            systemStatusEl.textContent = '无配置';
            return;
        }

        const totalUsage = currentConfigs.reduce((sum, config) => sum + config.currentUsage, 0);
        const highUsageConfigs = currentConfigs.filter(config =>
            config.usageLimit > 0 && (config.currentUsage / config.usageLimit) > 0.8
        ).length;

        totalConfigsEl.textContent = currentConfigs.length;
        totalUsageEl.textContent = totalUsage;

        if (highUsageConfigs > 0) {
            systemStatusEl.textContent = `${highUsageConfigs} 个配置使用率高`;
            systemStatusEl.style.color = 'var(--warning)';
        } else {
            systemStatusEl.textContent = '正常';
            systemStatusEl.style.color = 'var(--success)';
        }
    };

    // Get Usage Status
    const getUsageStatus = (current, limit) => {
        if (limit === 0) return { status: 'low', percentage: 0, text: '无限制' };

        const percentage = (current / limit) * 100;
        if (percentage < 50) return { status: 'low', percentage, text: `${current} / ${limit}` };
        if (percentage < 80) return { status: 'medium', percentage, text: `${current} / ${limit}` };
        return { status: 'high', percentage, text: `${current} / ${limit}` };
    };

    // Render Configs
    const renderConfigs = async (searchTerm = '') => {
        try {
            const response = await fetch('/api/auth/configs');
            if (!response.ok) throw new Error('获取配置失败');

            const configs = await response.json();
            currentConfigs = configs;

            // Update stats
            updateStats();

            // Filter configs if search term provided
            const filteredConfigs = searchTerm
                ? configs.filter((config, index) =>
                    index.toString().includes(searchTerm) ||
                    JSON.stringify(config).toLowerCase().includes(searchTerm.toLowerCase())
                )
                : configs;

            configList.innerHTML = '';

            if (filteredConfigs.length === 0) {
                configList.innerHTML = '<div class="no-configs">未找到配置</div>';
                return;
            }

            filteredConfigs.forEach((config, index) => {
                const originalIndex = configs.indexOf(config);
                const usageStatus = getUsageStatus(config.currentUsage, config.usageLimit);

                const card = document.createElement('div');
                card.className = 'config-card';
                card.innerHTML = `
                    <div class="config-header">
                        <div class="config-id">#${String(originalIndex).padStart(3, '0')}</div>
                        <div class="config-status status-${usageStatus.status}">
                            ${usageStatus.status === 'low' ? '低' : usageStatus.status === 'medium' ? '中' : '高'}使用率
                        </div>
                    </div>
                    
                    <div class="usage-section">
                        <div class="usage-label">
                            <span class="usage-current">当前使用量: ${config.currentUsage}</span>
                            <span class="usage-limit">限制: ${config.usageLimit || '无'}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill progress-${usageStatus.status}" 
                                 style="width: ${usageStatus.percentage}%"></div>
                        </div>
                    </div>
                    
                    <div class="config-actions">
                        <div class="action-group">
                            <input type="number" 
                                   class="limit-input" 
                                   id="limit-input-${originalIndex}" 
                                   placeholder="新限制" 
                                   value="${config.usageLimit}" 
                                   min="0">
                            <button class="btn btn-sm btn-secondary set-limit-btn" data-config-index="${config.index}">
                                设置限制
                            </button>
                        </div>
                        <div class="action-group">
                            <button class="btn btn-sm btn-secondary reset-usage-btn" data-config-index="${config.index}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                                </svg>
                                重置
                            </button>
                            <button class="btn btn-sm btn-warning edit-config-btn" data-config-index="${config.index}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                编辑
                            </button>
                            <button class="btn btn-sm btn-danger delete-config-btn" data-config-index="${config.index}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3,6 5,6 21,6"/>
                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                </svg>
                                删除
                            </button>
                        </div>
                    </div>
                `;

                configList.appendChild(card);
            });

        } catch (error) {
            console.error('渲染配置时出错:', error);
            configList.innerHTML = '<div class="error">加载配置时出错</div>';
            showToast('加载配置失败', 'error');
        }
    };

    // Fetch Logs
    const fetchLogs = async () => {
        try {
            logsContent.textContent = '加载日志中...';
            const response = await fetch('/api/logs');
            if (!response.ok) throw new Error('获取日志失败');
            const logs = await response.json();
            logsContent.textContent = logs.length > 0 ? logs.join('\n') : '未找到日志。';
        } catch (error) {
            console.error('获取日志时出错:', error);
            logsContent.textContent = '加载日志时出错。';
            showToast('加载日志失败', 'error');
        }
    };

    // System Config Functions
    const loadSystemConfig = async () => {
        try {
            const response = await fetch('/api/config');
            if (!response.ok) throw new Error('获取系统配置失败');
            const config = await response.json();

            // Populate form fields
            document.getElementById('config-httpPort').value = config.httpPort;
            document.getElementById('config-wsPort').value = config.wsPort;
            document.getElementById('config-host').value = config.host;
            document.getElementById('config-streamingMode').value = config.streamingMode;
            document.getElementById('config-maxRetries').value = config.maxRetries;
            document.getElementById('config-retryDelay').value = config.retryDelay;
            document.getElementById('config-failureThreshold').value = config.failureThreshold;
            document.getElementById('config-switchOnUses').value = config.switchOnUses;

            if (Array.isArray(config.immediateSwitchStatusCodes)) {
                document.getElementById('config-immediateSwitchStatusCodes').value = config.immediateSwitchStatusCodes.join(', ');
            }

            if (Array.isArray(config.apiKeys)) {
                document.getElementById('config-apiKeys').value = config.apiKeys.join(', ');
            }

            showModal(systemConfigModal);
        } catch (error) {
            showToast(`加载配置失败: ${error.message}`, 'error');
        }
    };

    const saveSystemConfig = async (e) => {
        e.preventDefault();
        const formData = new FormData(systemConfigForm);
        const configData = Object.fromEntries(formData.entries());

        // Convert types
        configData.httpPort = parseInt(configData.httpPort, 10);
        configData.wsPort = parseInt(configData.wsPort, 10);
        configData.maxRetries = parseInt(configData.maxRetries, 10);
        configData.retryDelay = parseInt(configData.retryDelay, 10);
        configData.failureThreshold = parseInt(configData.failureThreshold, 10);
        configData.switchOnUses = parseInt(configData.switchOnUses, 10);

        try {
            const response = await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '保存失败');
            }

            const result = await response.json();
            showToast(result.message, 'success');

            if (result.message.includes('重启')) {
                showToast('部分设置需要重启服务器才能生效', 'warning', '注意');
            }

            hideModal(systemConfigModal);

        } catch (error) {
            showToast(`保存配置失败: ${error.message}`, 'error');
        }
    };

    // Event Listeners

    // Auto Refresh Controls
    autoRefreshToggle.addEventListener('change', () => {
        autoRefreshEnabled = autoRefreshToggle.checked;
        startAutoRefresh();
    });

    refreshIntervalSelect.addEventListener('change', (e) => {
        refreshInterval = parseInt(e.target.value, 10);
        if (autoRefreshEnabled) {
            startAutoRefresh();
        }
    });

    manualRefreshBtn.addEventListener('click', async () => {
        await updateStatusDisplay();
        await renderConfigs(searchInput.value);
        await updateAccountOptions();
        showToast('手动刷新完成', 'success');
    });

    // Quick Actions Event Listeners
    quickSwitchBtn.addEventListener('click', quickSwitchAccount);

    toggleRefreshBtn.addEventListener('click', toggleAutoRefresh);

    // New Config Button
    newConfigBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = '新建配置';
        jsonInput.value = '';
        editIndexInput.value = '';
        showModal(configModal);
    });

    // Batch Limit Button
    batchLimitBtn.addEventListener('click', () => {
        batchLimitInput.value = '';
        showModal(batchLimitModal);
    });

    // View Logs Button
    viewLogsBtn.addEventListener('click', () => {
        showModal(logsModal);
        fetchLogs();
    });

    // Refresh Data Button
    refreshDataBtn.addEventListener('click', () => {
        renderConfigs(searchInput.value);
        showToast('数据已刷新', 'success');
    });

    // Refresh Logs Button
    refreshLogsBtn.addEventListener('click', fetchLogs);

    // Download All Button
    downloadAllBtn.addEventListener('click', async () => {
        showToast('正在准备下载...', 'info');
        try {
            const response = await fetch('/api/auth/download-all');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '下载失败');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const disposition = response.headers.get('Content-Disposition');
            let filename = 'auth_configs.zip';
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showToast('下载成功！', 'success');
        } catch (error) {
            showToast(`下载失败: ${error.message}`, 'error');
        }
    });

    // Upload Zip Button
    uploadZipBtn.addEventListener('click', () => {
        zipUploadInput.click();
    });

    zipUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('zipfile', file);

        showToast('正在上传并处理ZIP文件...', 'info');

        try {
            const response = await fetch('/api/auth/upload-zip', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || '上传失败');
            }

            showToast(result.message, 'success');
            await renderConfigs();
            await updateAccountOptions();

        } catch (error) {
            showToast(`上传失败: ${error.message}`, 'error');
        } finally {
            e.target.value = '';
        }
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
        renderConfigs(e.target.value);
    });

    // Modal Close Buttons
    modalClose.addEventListener('click', () => hideModal(configModal));
    batchLimitModalClose.addEventListener('click', () => hideModal(batchLimitModal));
    logsModalClose.addEventListener('click', () => hideModal(logsModal));
    cancelBtn.addEventListener('click', () => hideModal(configModal));
    batchLimitCancelBtn.addEventListener('click', () => hideModal(batchLimitModal));
    confirmCancel.addEventListener('click', () => hideModal(confirmDialog));
    systemConfigModalClose.addEventListener('click', () => hideModal(systemConfigModal));
    systemConfigCancelBtn.addEventListener('click', () => hideModal(systemConfigModal));

    // Close modals when clicking outside
    [configModal, batchLimitModal, logsModal, confirmDialog, systemConfigModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });

    // Config Form Submit
    configForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const jsonString = jsonInput.value;
        const editIndex = editIndexInput.value;

        try {
            const configData = JSON.parse(jsonString);
            let response;

            if (editIndex) {
                response = await fetch(`/api/auth/configs/${editIndex}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(configData),
                });
            } else {
                response = await fetch('/api/auth/configs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(configData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '保存操作失败');
            }

            hideModal(configModal);
            await renderConfigs(searchInput.value);
            showToast(editIndex ? '配置更新成功' : '配置创建成功', 'success');

        } catch (error) {
            showToast(`保存配置时出错: ${error.message}`, 'error');
        }
    });

    // Batch Limit Form Submit
    batchLimitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const limit = parseInt(batchLimitInput.value, 10);

        if (isNaN(limit) || limit < 0) {
            showToast('请输入有效的非负数作为限制', 'warning');
            return;
        }

        showConfirm(`确定要将所有配置的使用限制设置为 ${limit} 吗？`, async () => {
            try {
                const response = await fetch('/api/auth/configs/batch-limit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usageLimit: limit }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '批量设置限制操作失败');
                }

                hideModal(batchLimitModal);
                await renderConfigs(searchInput.value);
                showToast('批量限制设置成功', 'success');

            } catch (error) {
                showToast(`设置批量限制时出错: ${error.message}`, 'error');
            }
        });
    });

    // System Config Event Listeners
    if (settingsBtn) {
        settingsBtn.addEventListener('click', loadSystemConfig);
    }
    systemConfigForm.addEventListener('submit', saveSystemConfig);

    // Config List Event Delegation
    configList.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const configIndex = target.dataset.configIndex;
        if (!configIndex) return;

        // Delete Config
        if (target.classList.contains('delete-config-btn')) {
            showConfirm(`确定要删除配置 #${configIndex} (auth-${configIndex}.json) 吗？`, async () => {
                try {
                    const response = await fetch(`/api/auth/configs/${configIndex}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('删除失败');
                    await renderConfigs(searchInput.value);
                    showToast('配置删除成功', 'success');
                } catch (error) {
                    showToast(`删除配置时出错: ${error.message}`, 'error');
                }
            });
        }

        // Edit Config
        if (target.classList.contains('edit-config-btn')) {
            try {
                const response = await fetch('/api/auth/configs');
                const configs = await response.json();
                const configToEdit = configs.find(c => c.index == configIndex);
                if (configToEdit) {
                    document.getElementById('modal-title').textContent = '编辑配置';
                    jsonInput.value = JSON.stringify(configToEdit, null, 2);
                    editIndexInput.value = configIndex;
                    showModal(configModal);
                }
            } catch (error) {
                showToast(`获取配置进行编辑时出错: ${error.message}`, 'error');
            }
        }

        // Set Limit
        if (target.classList.contains('set-limit-btn')) {
            const limitInput = document.getElementById(`limit-input-${configIndex}`);
            const newLimit = parseInt(limitInput.value, 10);

            if (isNaN(newLimit) || newLimit < 0) {
                showToast('请输入有效的非负数作为限制', 'warning');
                return;
            }

            try {
                const response = await fetch(`/api/auth/configs/${configIndex}/limit`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usageLimit: newLimit }),
                });
                if (!response.ok) throw new Error('设置限制失败');
                await renderConfigs(searchInput.value);
                showToast('限制设置成功', 'success');
            } catch (error) {
                showToast(`设置限制时出错: ${error.message}`, 'error');
            }
        }

        // Reset Usage
        if (target.classList.contains('reset-usage-btn')) {
            showConfirm(`确定要重置配置 #${configIndex} 的使用量吗？`, async () => {
                try {
                    const response = await fetch(`/api/auth/configs/${configIndex}/reset`, { method: 'POST' });
                    if (!response.ok) throw new Error('重置失败');
                    await renderConfigs(searchInput.value);
                    showToast('使用量重置成功', 'success');
                } catch (error) {
                    showToast(`重置使用量时出错: ${error.message}`, 'error');
                }
            });
        }
    });

    // Confirm Dialog OK Button
    confirmOk.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
            confirmCallback = null;
        }
        hideModal(confirmDialog);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('modal[open]');
            if (openModal) hideModal(openModal);
        }

        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }

        // Ctrl/Cmd + N for new config
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            newConfigBtn.click();
        }
    });

    // Initial load
    const initializeApp = async () => {
        try {
            await updateStatusDisplay();
            await updateAccountOptions();
            startAutoRefresh();
            await renderConfigs();
            showToast('管理面板加载完成', 'success');
        } catch (error) {
            console.error('初始化应用失败:', error);
            showToast('初始化应用失败', 'error');
        }
    };

    // 启动应用
    initializeApp();
});
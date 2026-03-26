// audit_logs.js
document.addEventListener('DOMContentLoaded', () => {
    fetchAuditLogs();
});

async function fetchAuditLogs() {
    try {
        const response = await fetch('api/get_audit_logs.php');
        const result = await response.json();

        if (result.success) {
            renderLogs(result.data);
        } else {
            showNotification('Error', result.error || 'Failed to fetch audit logs', 'error');
        }
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        showNotification('Error', 'An unexpected error occurred', 'error');
    }
}

function renderLogs(logs) {
    const tableBody = document.getElementById('audit-logs-body');
    if (!logs || logs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No logs found.</td></tr>';
        return;
    }

    tableBody.innerHTML = logs.map(log => {
        const actionClass = getActionClass(log.action);
        const details = formatDetails(log.details);
        const timestamp = new Date(log.created_at).toLocaleString();

        return `
            <tr>
                <td style="white-space: nowrap;">${timestamp}</td>
                <td style="font-weight: 600;">${log.username || 'System'}</td>
                <td><span class="action-pill ${actionClass}">${log.action}</span></td>
                <td style="font-family: monospace; font-size: 0.8rem;">${log.affected_id || '-'}</td>
                <td class="details-json" title="${log.details || ''}">${details}</td>
                <td style="color: #8892b0; font-size: 0.85rem;">${log.ip_address}</td>
            </tr>
        `;
    }).join('');
}

function getActionClass(action) {
    action = action.toLowerCase();
    if (action.includes('created')) return 'action-create';
    if (action.includes('updated')) return 'action-update';
    if (action.includes('deleted')) return 'action-delete';
    if (action.includes('login') || action.includes('logout')) return 'action-login';
    if (action.includes('changed') || action.includes('settings')) return 'action-settings';
    return 'action-other';
}

function formatDetails(details) {
    if (!details) return '-';
    try {
        // If it's pure JSON, make it a bit more readable
        const obj = JSON.parse(details);
        return Object.entries(obj).map(([key, val]) => `${key}: ${val}`).join(', ');
    } catch (e) {
        return details;
    }
}

// Simple notification mock if notifications.js isn't perfectly compatible
function showNotification(title, message, type = 'info') {
    if (window.Notifications) {
        window.Notifications.show(message, type);
    } else {
        alert(`${title}: ${message}`);
    }
}

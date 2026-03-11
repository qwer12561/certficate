/**
 * Premium Toast Notification System
 * Handles elegant success and error feedback across the application.
 */

const showToast = (message, type = 'success', duration = 5000) => {
    // Create container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Choose icon based on type
    const icon = type === 'success' ? '✅' : '❌';

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    // Add to container
    container.appendChild(toast);

    // Auto-remove after duration
    const timeout = setTimeout(() => {
        removeToast(toast);
    }, duration);

    // Manual close logic
    toast.querySelector('.toast-close').onclick = () => {
        clearTimeout(timeout);
        removeToast(toast);
    };
};

const removeToast = (toast) => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => {
        toast.remove();
        // Clean up container if empty
        const container = document.querySelector('.toast-container');
        if (container && container.childNodes.length === 0) {
            container.remove();
        }
    });
};

// Globalize the function
window.showToast = showToast;

/**
 * Show a toast that persists across a single page redirect.
 * Useful for "Saved successfully" messages followed by window.location change.
 */
window.showToastPersistent = (message, type = 'success') => {
    sessionStorage.setItem('pending_toast', JSON.stringify({ message, type }));
};

// Check for pending toasts on load
document.addEventListener('DOMContentLoaded', () => {
    const pending = sessionStorage.getItem('pending_toast');
    if (pending) {
        const { message, type } = JSON.parse(pending);
        showToast(message, type);
        sessionStorage.removeItem('pending_toast');
    }
});

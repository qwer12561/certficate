(function () {
    // Check authentication status immediately
    fetch('api/auth_check.php')
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = 'login.html';
                }
                throw new Error('Not authenticated');
            }
            return response.json();
        })
        .then(data => {
            if (!data.authenticated) {
                window.location.href = 'login.html';
            } else {
                // User is authenticated, we can expose user info if needed
                window.currentUser = data.user;
                document.dispatchEvent(new CustomEvent('auth:ready', { detail: data.user }));

                // Run immediately for static elements
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => window.applyRoleRestrictions(data.user.role));
                } else {
                    window.applyRoleRestrictions(data.user.role);
                }
            }
        })
        .catch(error => {
            console.error('Auth Check Error:', error);
            if (!window.location.pathname.endsWith('login.html')) {
                window.location.href = 'login.html';
            }
        });

    window.applyRoleRestrictions = function (role) {
        const roleHierarchy = { 'viewer': 1, 'editor': 2, 'admin': 3 };
        const userLevel = roleHierarchy[role] || 1;

        // Elements that require a specific role (exact match)
        document.querySelectorAll('[data-role]').forEach(el => {
            const requiredRole = el.getAttribute('data-role');
            if (requiredRole !== role) {
                el.style.display = 'none';
            }
        });

        // Elements that require a minimum level (hierarchy)
        document.querySelectorAll('[data-role-min]').forEach(el => {
            const minRole = el.getAttribute('data-role-min');
            const minLevel = roleHierarchy[minRole] || 1;
            if (userLevel < minLevel) {
                el.style.display = 'none';
            }
        });
    };

    // Add logout functionality using event delegation
    document.addEventListener('click', async (e) => {
        const logoutBtn = e.target.closest('[data-logout]');
        if (logoutBtn) {
            e.preventDefault();
            try {
                const res = await fetch('api/logout.php');
                const data = await res.json();
                if (data.success) {
                    window.location.href = 'login.html';
                }
            } catch (err) {
                console.error('Logout failed:', err);
            }
        }
    });
})();

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
            }
        })
        .catch(error => {
            console.error('Auth Check Error:', error);
            if (!window.location.pathname.endsWith('login.html')) {
                window.location.href = 'login.html';
            }
        });

    // Add logout functionality to any element with data-logout attribute
    document.addEventListener('DOMContentLoaded', () => {
        const logoutButtons = document.querySelectorAll('[data-logout]');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
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
            });
        });
    });
})();

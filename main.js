document.addEventListener('DOMContentLoaded', () => {
    console.log('Certificate Management System initialized.');

    const cards = document.querySelectorAll('.menu-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Subtle sound or additional effect could go here
        });

        card.addEventListener('click', (e) => {
            // We could add a transition effect before navigating
            // e.preventDefault();
            // const target = card.getAttribute('href');
            // ... animation ...
            // window.location.href = target;
        });
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker registered successfully');

                    // Check for updates
                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New content is available, force refresh
                                console.log('New content available, refreshing...');
                                window.location.reload();
                            }
                        };
                    };
                })
                .catch(err => console.error('Service Worker registration failed: ', err));
        });

        // Listen for the controlling service worker changing
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });
    }
});

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
});

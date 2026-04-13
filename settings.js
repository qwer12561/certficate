document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('account-form');
    const saveBanner = document.getElementById('save-banner');
    const currentUsernameDisplay = document.getElementById('current-username');
    const currentEmailDisplay = document.getElementById('current-email');
    const newPassword = document.getElementById('new-password');
    const confirmPassword = document.getElementById('confirm-password');
    const passwordError = document.getElementById('password-error');

    // Fetch current username and email
    fetch('api/account_settings.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                currentUsernameDisplay.value = data.username;
                if (currentEmailDisplay) currentEmailDisplay.value = data.email || '';
            }
        });

    // Simple Password Matching Validation
    const validatePasswords = () => {
        if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
            passwordError.style.display = 'block';
            return false;
        } else {
            passwordError.style.display = 'none';
            return true;
        }
    };

    newPassword.addEventListener('input', validatePasswords);
    confirmPassword.addEventListener('input', validatePasswords);

    // Save Settings
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validatePasswords()) return;

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            if (value.trim()) data[key] = value.trim();
        });

        if (!data.new_username && !data.new_password && !data.new_email) {
            alert('Please provide a new username, email, or password to update.');
            return;
        }

        try {
            const response = await fetch('api/account_settings.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (result.success) {
                saveBanner.classList.add('active');
                setTimeout(() => {
                    saveBanner.classList.remove('active');
                    location.reload(); // Refresh to show new username
                }, 3000);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (err) {
            alert('Failed to update account settings.');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Load saved personal info if available
    const savedInfo = getFromLocalStorage('personalInfo');
    if (savedInfo) {
        document.getElementById('fullName').value = savedInfo.fullName || '';
        document.getElementById('email').value = savedInfo.email || '';
        document.getElementById('age').value = savedInfo.age || '';
    }

    // Handle form submission
    document.getElementById('personalInfoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const personalInfo = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            age: document.getElementById('age').value,
            lastUpdated: new Date().toISOString()
        };

        // Validate inputs
        if (!personalInfo.fullName || !personalInfo.email || !personalInfo.age) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (personalInfo.age < 18 || personalInfo.age > 100) {
            showMessage('Age must be between 18 and 100', 'error');
            return;
        }

        // Save to localStorage
        saveToLocalStorage('personalInfo', personalInfo);
        showMessage('Information saved successfully!', 'success');

        // Redirect to networth page after a short delay
        setTimeout(() => {
            window.location.href = './networth.html';
        }, 1000);
    });
});

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.textContent = message;
    messageDiv.className = 'form-message ' + type;
    
    // Clear message after 3 seconds
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'form-message';
    }, 3000);
} 
document.addEventListener('DOMContentLoaded', function() {
    // Load saved personal info if available
    const savedInfo = getFromLocalStorage('personalInfo');
    if (savedInfo) {
        document.getElementById('fullName').value = savedInfo.fullName || '';
        document.getElementById('email').value = savedInfo.email || '';
        document.getElementById('birthdate').value = savedInfo.birthdate || '';
    }

    // Set max date to today minus 18 years
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    
    const birthdateInput = document.getElementById('birthdate');
    birthdateInput.max = maxDate.toISOString().split('T')[0];
    birthdateInput.min = minDate.toISOString().split('T')[0];

    // Handle form submission
    document.getElementById('personalInfoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const birthdate = document.getElementById('birthdate').value;

        // Validate inputs
        if (!fullName || !email || !birthdate) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        // Validate age (18-100 years)
        const birthdateObj = new Date(birthdate);
        const age = calculateAge(birthdateObj);
        
        if (age < 18) {
            showMessage('You must be at least 18 years old', 'error');
            return;
        }
        
        if (age > 100) {
            showMessage('Please check your birthdate', 'error');
            return;
        }

        const personalInfo = {
            fullName,
            email,
            birthdate,
            age,
            lastUpdated: new Date().toISOString()
        };

        // Save to localStorage
        saveToLocalStorage('personalInfo', personalInfo);
        showMessage('Information saved successfully!', 'success');

        // Redirect to networth page after a short delay
        setTimeout(() => {
            window.location.href = './networth.html';
        }, 1000);
    });
});

function calculateAge(birthdate) {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    
    return age;
}

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
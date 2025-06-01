// Common utility functions
function formatCurrency(amount) {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });
    return formatter.format(amount);
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Auto-save functionality
function setupAutoSave(formId, storageKey) {
    const form = document.getElementById(formId);
    if (!form) {
        console.warn(`Form with id ${formId} not found`);
        return;
    }

    // Load saved data
    const savedData = getFromLocalStorage(storageKey) || {};
    
    // Find all input elements within the form
    const inputs = form.querySelectorAll('input[type="number"], input[type="text"], input[type="email"]');
    
    // Restore saved values
    inputs.forEach(input => {
        if (savedData[input.id]) {
            input.value = savedData[input.id];
            // Trigger input event to update calculations
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    // Setup auto-save on input
    form.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            const formData = getFromLocalStorage(storageKey) || {};
            formData[e.target.id] = e.target.value;
            saveToLocalStorage(storageKey, formData);
            
            // Trigger calculations update if the function exists
            if (typeof updateCalculations === 'function') {
                updateCalculations();
            }
        }
    });

    // Prevent form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    });
}

// Navigation flow
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Update navigation visibility based on page
    updateNavigation(currentPage);
    
    // Add event listeners for navigation buttons
    const startJourneyBtn = document.querySelector('.cta-btn');
    if (startJourneyBtn) {
        startJourneyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = './personal-info.html';
        });
    }

    // Add completion buttons to each page
    if (currentPage === 'personal-info.html') {
        setupAutoSave('personalInfoForm', 'personalInfo');
        addCompletionButton('Continue to Net Worth', '/networth.html');
    } else if (currentPage === 'networth.html') {
        addCompletionButton('Continue to Income', '/income.html');
        setupAutoSave('networthForm', 'networthValues');
    } else if (currentPage === 'income.html') {
        addCompletionButton('Continue to Expenses', '/expenses.html');
        setupAutoSave('incomeForm', 'incomeValues');
    } else if (currentPage === 'expenses.html') {
        addCompletionButton('View Dashboard', '/dashboard.html');
        setupAutoSave('expensesForm', 'expenseValues');
    } else if (currentPage === 'dashboard.html') {
        addCompletionButton('Calculate FF Score', '/freedom.html');
    }

    // Add input event listeners for number-to-words conversion
    setupNumberToWords();
});

function updateNavigation(currentPage) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Show only Home on index page
    if (currentPage === 'index.html') {
        const links = navLinks.querySelectorAll('.nav-link:not([href="/index.html"])');
        links.forEach(link => link.style.display = 'none');
    }

    // Update active state
    const activeLink = navLinks.querySelector(`[href="/${currentPage}"]`);
    if (activeLink) {
        navLinks.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }
}

function addCompletionButton(text, nextPage) {
    const container = document.querySelector('.container');
    if (!container) return;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'completion-button-container';
    buttonContainer.style.textAlign = 'center';
    buttonContainer.style.marginTop = '30px';

    const button = document.createElement('button');
    button.className = 'cta-btn';
    button.innerHTML = `<i class="fas fa-arrow-right"></i> ${text}`;
    button.addEventListener('click', () => window.location.href = nextPage);

    buttonContainer.appendChild(button);
    container.appendChild(buttonContainer);
}

function setupNumberToWords() {
    const numericInputs = document.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        // Remove spinner buttons
        input.style.appearance = 'textfield';
        
        // Create or get words display element
        let wordsDisplay = input.nextElementSibling;
        if (!wordsDisplay || !wordsDisplay.classList.contains('number-words')) {
            wordsDisplay = document.createElement('div');
            wordsDisplay.className = 'number-words';
            input.parentNode.insertBefore(wordsDisplay, input.nextSibling);
        }
        
        // Update words on input
        input.addEventListener('input', function() {
            const value = parseFloat(this.value) || 0;
            wordsDisplay.textContent = numberToWords(value);
            
            // Trigger calculation update if function exists
            if (typeof updateCalculations === 'function') {
                updateCalculations();
            }
        });

        // Initial update if value exists
        if (input.value) {
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        }
    });
}

// Number to words conversion for Indian currency
function numberToWords(num) {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    function convertLessThanThousand(n) {
        if (n === 0) return '';
        
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    }
    
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remaining = num % 1000;
    
    let result = '';
    
    if (crore > 0) {
        result += convertLessThanThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
        result += convertLessThanThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
        result += convertLessThanThousand(thousand) + ' Thousand ';
    }
    if (remaining > 0) {
        result += convertLessThanThousand(remaining);
    }
    
    return result.trim();
}

// Calculate depreciation for assets
function depreciation(cost, resale, life) {
    if (cost === 0) return 0;
    if (life <= 0) return 0;
    return (cost - resale) / (life * 12);
}
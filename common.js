// ===== UTILITY FUNCTIONS =====

// Show status messages
function showStatus(message, type = 'success') {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
}

// Number to words conversion (Indian format)
function numberToWords(num) {
    if (num === 0) return "Zero";
    
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    function convertHundreds(n) {
        let result = "";
        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n >= 10) {
            result += teens[n - 10] + " ";
        } else if (n > 0) {
            result += ones[n] + " ";
        }
        return result;
    }
    
    if (num >= 10000000) { // Crores
        return convertHundreds(Math.floor(num / 10000000)) + "Crore " + numberToWords(num % 10000000);
    } else if (num >= 100000) { // Lakhs
        return convertHundreds(Math.floor(num / 100000)) + "Lakh " + numberToWords(num % 100000);
    } else if (num >= 1000) { // Thousands
        return convertHundreds(Math.floor(num / 1000)) + "Thousand " + numberToWords(num % 1000);
    } else {
        return convertHundreds(num);
    }
}

// Format currency (Indian format)
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format number with commas (Indian format)
function formatNumber(num) {
    return num.toLocaleString('en-IN');
}

// Parse currency string to number
function parseCurrency(str) {
    return parseFloat(str.replace(/[₹,]/g, '')) || 0;
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Calculate age from date of birth
function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Debounce function for auto-save
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local storage helpers
const Storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },
    
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
    
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// ===== AUTHENTICATION HELPERS =====

// Check if user is authenticated
function checkAuth() {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                resolve(user);
            } else {
                window.location.href = 'index.html';
            }
        });
    });
}

// Initialize user info display
function initUserInfo() {
    firebase.auth().onAuthStateChanged((user) => {
        const userEmailElement = document.getElementById('userEmail');
        if (user && userEmailElement) {
            userEmailElement.textContent = user.email;
        }
    });
}

// ===== FORM HELPERS =====

// Create form group HTML
function createFormGroup(label, inputType, name, placeholder = '', required = false, value = '') {
    return `
        <div class="form-group">
            <label for="${name}">${label}${required ? ' *' : ''}</label>
            <input type="${inputType}" 
                   id="${name}" 
                   name="${name}" 
                   placeholder="${placeholder}" 
                   value="${value}"
                   ${required ? 'required' : ''}>
            <div class="amount-display"></div>
        </div>
    `;
}

// Create select form group HTML
function createSelectGroup(label, name, options, required = false, selectedValue = '') {
    let optionsHtml = '<option value="">Select ' + label + '</option>';
    options.forEach(option => {
        const selected = option.value === selectedValue ? 'selected' : '';
        optionsHtml += `<option value="${option.value}" ${selected}>${option.text}</option>`;
    });
    
    return `
        <div class="form-group">
            <label for="${name}">${label}${required ? ' *' : ''}</label>
            <select id="${name}" name="${name}" ${required ? 'required' : ''}>
                ${optionsHtml}
            </select>
        </div>
    `;
}

// Update amount display with words
function updateAmountDisplay(input) {
    const value = parseFloat(input.value) || 0;
    const displayElement = input.parentElement.querySelector('.amount-display');
    if (displayElement && value > 0) {
        displayElement.textContent = numberToWords(value);
    } else if (displayElement) {
        displayElement.textContent = '';
    }
}

// ===== NAVIGATION HELPERS =====

// Navigate to page with data saving
function navigateToPage(targetPage, saveFunction = null) {
    if (saveFunction) {
        saveFunction();
    }
    showStatus('Data saved successfully!');
    setTimeout(() => {
        window.location.href = targetPage;
    }, 1500);
}

// ===== CALCULATION HELPERS =====

// Calculate total from array of objects
function calculateTotal(items, property) {
    return items.reduce((sum, item) => sum + (item[property] || 0), 0);
}

// Calculate percentage
function calculatePercentage(part, whole) {
    return whole === 0 ? 0 : (part / whole) * 100;
}

// ===== DATA VALIDATION =====

// Validate required fields
function validateRequiredFields(formId) {
    const form = document.getElementById(formId);
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            field.style.borderColor = 'var(--border-color)';
        }
    });
    
    return isValid;
}

// ===== FINANCIAL CALCULATIONS =====

// Calculate compound growth
function calculateCompoundGrowth(principal, rate, years) {
    return principal * Math.pow(1 + rate / 100, years);
}

// Calculate Financial Freedom Score
function calculateFFScore(netWorth, annualExpenses, assetGrowthRate, inflationRate) {
    let currentNetWorth = netWorth;
    let currentExpenses = annualExpenses;
    let years = 0;
    
    while (currentNetWorth > 0 && years < 100) {
        currentNetWorth -= currentExpenses;
        if (currentNetWorth <= 0) break;
        
        currentNetWorth *= (1 + assetGrowthRate / 100);
        currentExpenses *= (1 + inflationRate / 100);
        years++;
    }
    
    return years;
}

// Get FF Score meaning
function getFFScoreMeaning(score) {
    if (score >= 100) return { level: "Ultimate Financial Freedom", emoji: "🏝️", color: "#10b981" };
    if (score >= 70) return { level: "Achieved FF", emoji: "✅", color: "#22c55e" };
    if (score >= 50) return { level: "Very Close", emoji: "🔓", color: "#3b82f6" };
    if (score >= 25) return { level: "Getting There — Keep Going", emoji: "🚶", color: "#f59e0b" };
    if (score >= 10) return { level: "Still Dependent — Work & Build", emoji: "⚙️", color: "#ef4444" };
    return { level: "Financially Insecure — Focus Now", emoji: "🔴", color: "#dc2626" };
}

// ===== CHART HELPERS =====

// Create pie chart data
function createPieChartData(data, labels, colors) {
    return {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
}

// Chart color palette
const chartColors = {
    primary: '#2563eb',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#0ea5e9',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6',
    orange: '#f97316'
};

// ===== INITIALIZATION =====

// Initialize common page elements
function initCommonElements() {
    initUserInfo();
    
    // Add event listeners for amount inputs
    document.addEventListener('input', (e) => {
        if (e.target.type === 'number' && e.target.closest('.form-group')) {
            updateAmountDisplay(e.target);
        }
    });
    
    // Initialize modals
    initModals();
}

// Initialize modal functionality
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeButtons = document.querySelectorAll('.close');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            modals.forEach(modal => modal.style.display = 'none');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.style.display = 'block';
            }
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// ===== EXPORT FOR NODE.JS (if needed) =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        numberToWords,
        formatCurrency,
        formatNumber,
        parseCurrency,
        validateEmail,
        calculateAge,
        calculateFFScore,
        getFFScoreMeaning,
        Storage
    };
} 
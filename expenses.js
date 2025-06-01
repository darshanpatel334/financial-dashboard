document.addEventListener('DOMContentLoaded', function() {
    // Load saved values
    const savedValues = getFromLocalStorage('expenseValues') || {};
    
    // Set input values from saved data
    const monthlyInputs = {
        groceries: savedValues.groceries || '',
        utilities: savedValues.utilities || '',
        subscriptions: savedValues.subscriptions || '',
        shopping: savedValues.shopping || '',
        dining: savedValues.dining || '',
        carEMI: savedValues.carEMI || '',
        homeEMI: savedValues.homeEMI || ''
    };
    
    const bigInputs = {
        electronics: savedValues.electronics || '',
        vacations: savedValues.vacations || '',
        medical: savedValues.medical || '',
        education: savedValues.education || '',
        vehicle: savedValues.vehicle || ''
    };
    
    // Initialize custom expenses
    initCustomFields('customMonthlyList', 'monthly', savedValues.monthly || []);
    initCustomFields('customBigList', 'big', savedValues.big || []);
    
    // Set values to input fields and update words
    Object.keys(monthlyInputs).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = monthlyInputs[id];
            updateNumberInWords(id);
        }
    });
    
    Object.keys(bigInputs).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = bigInputs[id];
            updateNumberInWords(id);
        }
    });
    
    // Add event listeners to all input fields for auto-update
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            updateNumberInWords(input.id);
            calculateExpenses();
        });
    });
    
    // Add event listeners for buttons
    document.getElementById('addMonthly').addEventListener('click', () => {
        addCustomField('customMonthlyList', 'monthly');
    });
    
    document.getElementById('addBig').addEventListener('click', () => {
        addCustomField('customBigList', 'big');
    });
    
    // Initial calculation
    calculateExpenses();
});

function initCustomFields(containerId, type, savedItems = []) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (savedItems && savedItems.length > 0) {
        savedItems.forEach(item => {
            addCustomField(containerId, type, item);
        });
    }
}

function addCustomField(containerId, type, item = { name: '', value: '' }) {
    const container = document.getElementById(containerId);
    const fieldId = `custom-${type}-${Date.now()}`;
    
    const fieldHTML = `
        <div class="custom-item" id="${fieldId}">
            <input type="text" placeholder="${type === 'monthly' ? 'Monthly Expense Name' : 'Big Expense Name'}" 
                   value="${item.name || ''}" class="custom-name">
            <input type="number" placeholder="Amount (₹)" 
                   value="${item.value || ''}" class="custom-value">
            <button class="remove-btn" onclick="document.getElementById('${fieldId}').remove(); calculateExpenses();">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', fieldHTML);
}

function calculateExpenses() {
    // Calculate monthly recurring expenses
    let totalMonthlyRecurring = 0;
    ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining', 'carEMI', 'homeEMI'].forEach(id => {
        totalMonthlyRecurring += parseFloat(document.getElementById(id).value) || 0;
    });
    
    // Add custom monthly expenses
    document.querySelectorAll('#customMonthlyList .custom-value').forEach(input => {
        totalMonthlyRecurring += parseFloat(input.value) || 0;
    });
    
    // Calculate big expenses
    let totalBigExpenses = 0;
    ['electronics', 'vacations', 'medical', 'education', 'vehicle'].forEach(id => {
        totalBigExpenses += parseFloat(document.getElementById(id).value) || 0;
    });
    
    // Add custom big expenses
    document.querySelectorAll('#customBigList .custom-value').forEach(input => {
        totalBigExpenses += parseFloat(input.value) || 0;
    });
    
    // Calculate monthly equivalent of big expenses
    const monthlyBigExpenses = totalBigExpenses / 12;
    
    // Calculate total monthly expenses
    const totalMonthlyExpenses = totalMonthlyRecurring + monthlyBigExpenses;
    
    // Update display
    document.getElementById('totalMonthlyRecurring').textContent = formatCurrency(totalMonthlyRecurring);
    document.getElementById('totalBigExpenses').textContent = formatCurrency(totalBigExpenses);
    document.getElementById('monthlyBigExpenses').textContent = formatCurrency(monthlyBigExpenses);
    document.getElementById('totalMonthlyExpenses').textContent = formatCurrency(totalMonthlyExpenses);
    
    // Update words display
    document.getElementById('totalMonthlyRecurringWords').textContent = `₹${numberToWords(totalMonthlyRecurring)}`;
    document.getElementById('totalBigExpensesWords').textContent = `₹${numberToWords(totalBigExpenses)}`;
    document.getElementById('monthlyBigExpensesWords').textContent = `₹${numberToWords(monthlyBigExpenses)}`;
    document.getElementById('totalMonthlyExpensesWords').textContent = `₹${numberToWords(totalMonthlyExpenses)}`;
    
    // Calculate and display annual values
    const annualRecurring = totalMonthlyRecurring * 12;
    const annualTotal = totalMonthlyExpenses * 12;
    
    document.getElementById('annualRecurring').textContent = formatCurrency(annualRecurring);
    document.getElementById('annualTotal').textContent = formatCurrency(annualTotal);
    
    document.getElementById('annualRecurringWords').textContent = `₹${numberToWords(annualRecurring)}`;
    document.getElementById('annualTotalWords').textContent = `₹${numberToWords(annualTotal)}`;
    
    // Save expense data
    const expenseData = {
        // Monthly recurring expenses
        groceries: document.getElementById('groceries').value,
        utilities: document.getElementById('utilities').value,
        subscriptions: document.getElementById('subscriptions').value,
        shopping: document.getElementById('shopping').value,
        dining: document.getElementById('dining').value,
        carEMI: document.getElementById('carEMI').value,
        homeEMI: document.getElementById('homeEMI').value,
        
        // Big expenses
        electronics: document.getElementById('electronics').value,
        vacations: document.getElementById('vacations').value,
        medical: document.getElementById('medical').value,
        education: document.getElementById('education').value,
        vehicle: document.getElementById('vehicle').value,
        
        // Custom expenses
        monthly: Array.from(document.querySelectorAll('#customMonthlyList .custom-item')).map(item => ({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        })),
        big: Array.from(document.querySelectorAll('#customBigList .custom-item')).map(item => ({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        })),
        
        // Totals
        totalMonthlyRecurring,
        totalBigExpenses,
        monthlyBigExpenses,
        totalMonthlyExpenses,
        annualRecurring,
        annualTotal,
        lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    saveToLocalStorage('expenseValues', expenseData);
    
    // Dispatch events to notify other pages
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('localStorageUpdated'));
    
    // Log the values for debugging
    console.log('Expense Calculation:', {
        totalMonthlyRecurring,
        totalBigExpenses,
        monthlyBigExpenses,
        totalMonthlyExpenses,
        annualRecurring,
        annualTotal
    });
}

function updateNumberInWords(inputId) {
    const input = document.getElementById(inputId);
    const wordsSpan = document.getElementById(inputId + 'Words');
    if (input && wordsSpan) {
        const value = parseFloat(input.value) || 0;
        wordsSpan.textContent = `₹${numberToWords(value)}`;
    }
}

function numberToWords(num) {
    if (num === 0) return 'Zero';
    
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
    const teens = ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));
    if (num < 11) return units[num];
    if (num < 20) return teens[num - 11];
    if (num < 100) {
        const ten = Math.floor(num / 10);
        const one = num % 10;
        return tens[ten] + (one ? ' ' + units[one] : '');
    }
    if (num < 1000) return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
}
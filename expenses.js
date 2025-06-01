document.addEventListener('DOMContentLoaded', function() {
    console.log('Expenses page initialization started');
    
    // Reset all input fields to empty
    resetAllFields();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load any saved data
    loadSavedData();
});

function setupEventListeners() {
    // Add input event listeners
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', () => {
            if (input.value === '') {
                input.placeholder = '₹0';
            }
            updateNumberInWords(input.id);
            calculateExpenses();
        });
        
        // Prevent negative values
        input.addEventListener('change', function() {
            if (parseFloat(this.value) < 0) {
                this.value = '';
                this.placeholder = '₹0';
                updateNumberInWords(this.id);
                calculateExpenses();
            }
        });
    });
    
    // Add custom expense buttons
    document.getElementById('addMonthly').addEventListener('click', () => {
        addCustomField('customMonthlyList', 'monthly');
    });
    
    document.getElementById('addBig').addEventListener('click', () => {
        addCustomField('customBigList', 'big');
    });
}

function resetAllFields() {
    // Reset monthly expense fields
    const monthlyFields = ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining', 'carEMI', 'homeEMI'];
    monthlyFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.value = '';
            field.placeholder = '₹0';
            updateNumberInWords(id);
        }
    });
    
    // Reset big expense fields
    const bigFields = ['electronics', 'vacations', 'medical', 'education', 'vehicle'];
    bigFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.value = '';
            field.placeholder = '₹0';
            updateNumberInWords(id);
        }
    });
    
    // Clear custom expense lists
    document.getElementById('customMonthlyList').innerHTML = '';
    document.getElementById('customBigList').innerHTML = '';
    
    // Reset summary values
    updateDisplayValues({
        totalMonthlyRecurring: 0,
        totalBigExpenses: 0,
        monthlyBigExpenses: 0,
        totalMonthlyExpenses: 0
    });
}

function loadSavedData() {
    const savedValues = getFromLocalStorage('expenseValues') || {};
    
    // Set monthly expense values
    ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining', 'carEMI', 'homeEMI'].forEach(id => {
        setFieldValueIfValid(id, savedValues[id]);
    });
    
    // Set big expense values
    ['electronics', 'vacations', 'medical', 'education', 'vehicle'].forEach(id => {
        setFieldValueIfValid(id, savedValues[id]);
    });
    
    // Load custom monthly expenses
    if (savedValues.monthly && savedValues.monthly.length > 0) {
        savedValues.monthly.forEach(item => {
            if (item.value && parseFloat(item.value) > 0) {
                addCustomField('customMonthlyList', 'monthly', item);
            }
        });
    }
    
    // Load custom big expenses
    if (savedValues.big && savedValues.big.length > 0) {
        savedValues.big.forEach(item => {
            if (item.value && parseFloat(item.value) > 0) {
                addCustomField('customBigList', 'big', item);
            }
        });
    }
    
    // Calculate totals
    calculateExpenses();
}

function setFieldValueIfValid(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value && parseFloat(value) > 0) {
        field.value = value;
        updateNumberInWords(fieldId);
    } else if (field) {
        field.value = '';
        field.placeholder = '₹0';
        updateNumberInWords(fieldId);
    }
}

function calculateExpenses() {
    console.log('Calculating expenses');
    
    // Calculate monthly recurring expenses
    let totalMonthlyRecurring = 0;
    let hasMonthlyValues = false;
    
    ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining', 'carEMI', 'homeEMI'].forEach(id => {
        const value = getNumericValue(id);
        if (value > 0) hasMonthlyValues = true;
        totalMonthlyRecurring += value;
    });
    
    // Add custom monthly expenses
    document.querySelectorAll('#customMonthlyList .custom-value').forEach(input => {
        const value = getNumericValue(input);
        if (value > 0) hasMonthlyValues = true;
        totalMonthlyRecurring += value;
    });
    
    // Calculate big expenses
    let totalBigExpenses = 0;
    let hasBigValues = false;
    
    ['electronics', 'vacations', 'medical', 'education', 'vehicle'].forEach(id => {
        const value = getNumericValue(id);
        if (value > 0) hasBigValues = true;
        totalBigExpenses += value;
    });
    
    // Add custom big expenses
    document.querySelectorAll('#customBigList .custom-value').forEach(input => {
        const value = getNumericValue(input);
        if (value > 0) hasBigValues = true;
        totalBigExpenses += value;
    });
    
    // Calculate monthly equivalent of big expenses
    const monthlyBigExpenses = totalBigExpenses / 12;
    
    // Calculate total monthly expenses
    const totalMonthlyExpenses = totalMonthlyRecurring + monthlyBigExpenses;
    
    // Update display and save data if we have actual values
    if (hasMonthlyValues || hasBigValues) {
        updateDisplayValues({
            totalMonthlyRecurring,
            totalBigExpenses,
            monthlyBigExpenses,
            totalMonthlyExpenses
        });
        saveExpenseData();
    } else {
        updateDisplayValues({
            totalMonthlyRecurring: 0,
            totalBigExpenses: 0,
            monthlyBigExpenses: 0,
            totalMonthlyExpenses: 0
        });
        localStorage.removeItem('expenseValues');
    }
    
    // Notify other pages
    notifyUpdate();
}

function getNumericValue(inputOrId) {
    const input = typeof inputOrId === 'string' ? 
        document.getElementById(inputOrId) : inputOrId;
    return input && input.value ? parseFloat(input.value) || 0 : 0;
}

function updateDisplayValues(values) {
    // Update currency displays
    updateDisplay('totalMonthlyRecurring', values.totalMonthlyRecurring);
    updateDisplay('totalBigExpenses', values.totalBigExpenses);
    updateDisplay('monthlyBigExpenses', values.monthlyBigExpenses);
    updateDisplay('totalMonthlyExpenses', values.totalMonthlyExpenses);
    
    // Update annual values
    const annualRecurring = values.totalMonthlyRecurring * 12;
    const annualTotal = values.totalMonthlyExpenses * 12;
    
    updateDisplay('annualRecurring', annualRecurring);
    updateDisplay('annualTotal', annualTotal);
    
    // Update words displays
    updateWordsDisplay('totalMonthlyRecurringWords', values.totalMonthlyRecurring);
    updateWordsDisplay('totalBigExpensesWords', values.totalBigExpenses);
    updateWordsDisplay('monthlyBigExpensesWords', values.monthlyBigExpenses);
    updateWordsDisplay('totalMonthlyExpensesWords', values.totalMonthlyExpenses);
    updateWordsDisplay('annualRecurringWords', annualRecurring);
    updateWordsDisplay('annualTotalWords', annualTotal);
}

function updateDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value > 0 ? formatCurrency(value) : '₹0';
    }
}

function updateWordsDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value > 0 ? `₹${numberToWords(value)}` : '₹Zero';
    }
}

function addCustomField(containerId, type, item = { name: '', value: '' }) {
    const container = document.getElementById(containerId);
    const fieldId = `custom-${type}-${Date.now()}`;
    
    const fieldHTML = `
        <div class="custom-item" id="${fieldId}">
            <input type="text" placeholder="${type === 'monthly' ? 'Monthly Expense Name' : 'Big Expense Name'}" 
                   value="${item.name || ''}" class="custom-name">
            <input type="number" placeholder="₹0" 
                   value="${item.value || ''}" class="custom-value">
            <button class="remove-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', fieldHTML);
    
    // Add event listeners
    const newField = document.getElementById(fieldId);
    newField.querySelector('.remove-btn').addEventListener('click', () => {
        newField.remove();
        calculateExpenses();
    });
    
    newField.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateExpenses);
        if (input.type === 'number') {
            input.addEventListener('change', function() {
                if (parseFloat(this.value) < 0) {
                    this.value = '';
                    this.placeholder = '₹0';
                    calculateExpenses();
                }
            });
        }
    });
}

function saveExpenseData() {
    const expenseData = {
        // Monthly recurring expenses
        groceries: document.getElementById('groceries').value || '',
        utilities: document.getElementById('utilities').value || '',
        subscriptions: document.getElementById('subscriptions').value || '',
        shopping: document.getElementById('shopping').value || '',
        dining: document.getElementById('dining').value || '',
        carEMI: document.getElementById('carEMI').value || '',
        homeEMI: document.getElementById('homeEMI').value || '',
        
        // Big expenses
        electronics: document.getElementById('electronics').value || '',
        vacations: document.getElementById('vacations').value || '',
        medical: document.getElementById('medical').value || '',
        education: document.getElementById('education').value || '',
        vehicle: document.getElementById('vehicle').value || '',
        
        // Custom expenses
        monthly: Array.from(document.querySelectorAll('#customMonthlyList .custom-item'))
            .map(item => ({
                name: item.querySelector('.custom-name').value,
                value: item.querySelector('.custom-value').value || ''
            }))
            .filter(item => item.value && parseFloat(item.value) > 0),
            
        big: Array.from(document.querySelectorAll('#customBigList .custom-item'))
            .map(item => ({
                name: item.querySelector('.custom-name').value,
                value: item.querySelector('.custom-value').value || ''
            }))
            .filter(item => item.value && parseFloat(item.value) > 0),
            
        lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    saveToLocalStorage('expenseValues', expenseData);
}

function notifyUpdate() {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('localStorageUpdated'));
}

function updateNumberInWords(inputId) {
    const input = document.getElementById(inputId);
    const wordsSpan = document.getElementById(inputId + 'Words');
    if (input && wordsSpan) {
        const value = parseFloat(input.value) || 0;
        wordsSpan.textContent = value > 0 ? `₹${numberToWords(value)}` : '₹Zero';
    }
}

function numberToWords(num) {
    if (num === 0) return 'Zero';
    
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
                  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num < 20) return units[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + units[num % 10] : '');
    if (num < 1000) return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
}
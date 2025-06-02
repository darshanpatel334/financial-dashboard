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
    // Monthly recurring expenses
    ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining', 'carEMI', 'homeEMI'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                if (parseFloat(input.value) < 0) {
                    input.value = '0';
                }
                calculateExpenses();
            });
        }
    });

    // Annual big expenses
    ['electronics', 'vacations', 'medical', 'education', 'vehicle'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                if (parseFloat(input.value) < 0) {
                    input.value = '0';
                }
                calculateExpenses();
            });
        }
    });

    // Custom expense handlers
    setupCustomExpenseHandlers();
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
    console.log('Calculating expenses...');
    
    // Calculate Monthly Recurring Total
    let monthlyRecurringTotal = calculateMonthlyRecurring();
    console.log('Monthly Recurring Total:', monthlyRecurringTotal);
    
    // Calculate Annual Big Expenses
    let annualBigTotal = calculateAnnualBig();
    let monthlyEquivalentOfAnnual = annualBigTotal / 12;
    console.log('Annual Big Total:', annualBigTotal);
    console.log('Monthly Equivalent of Annual:', monthlyEquivalentOfAnnual);
    
    // Calculate Total Monthly Expenses
    let totalMonthlyExpenses = monthlyRecurringTotal + monthlyEquivalentOfAnnual;
    console.log('Total Monthly Expenses:', totalMonthlyExpenses);
    
    // Calculate Total Annual Expenses
    let totalAnnualExpenses = totalMonthlyExpenses * 12;
    console.log('Total Annual Expenses:', totalAnnualExpenses);
    
    // Update Summary Display
    updateSummaryDisplay(monthlyRecurringTotal, annualBigTotal, monthlyEquivalentOfAnnual, totalMonthlyExpenses, totalAnnualExpenses);
    
    // Save to localStorage
    saveExpenseData();
    
    // Dispatch event for other pages
    notifyUpdate();
}

function calculateMonthlyRecurring() {
    let total = 0;
    
    // Regular monthly expenses
    ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining', 'carEMI', 'homeEMI'].forEach(id => {
        total += parseFloat(document.getElementById(id)?.value || 0);
    });
    
    // Custom monthly expenses
    const customMonthly = document.querySelectorAll('.custom-monthly-expense');
    customMonthly.forEach(row => {
        const valueInput = row.querySelector('input[type="number"]');
        if (valueInput) {
            total += parseFloat(valueInput.value || 0);
        }
    });
    
    return total;
}

function calculateAnnualBig() {
    let total = 0;
    
    // Regular annual expenses
    ['electronics', 'vacations', 'medical', 'education', 'vehicle'].forEach(id => {
        total += parseFloat(document.getElementById(id)?.value || 0);
    });
    
    // Custom annual expenses
    const customAnnual = document.querySelectorAll('.custom-big-expense');
    customAnnual.forEach(row => {
        const valueInput = row.querySelector('input[type="number"]');
        if (valueInput) {
            total += parseFloat(valueInput.value || 0);
        }
    });
    
    return total;
}

function updateSummaryDisplay(monthlyRecurringTotal, annualBigTotal, monthlyEquivalentOfAnnual, totalMonthlyExpenses, totalAnnualExpenses) {
    // Update Monthly Recurring Total
    document.getElementById('monthlyRecurringTotal').textContent = formatCurrency(monthlyRecurringTotal);
    document.getElementById('monthlyRecurringTotalWords').textContent = convertToWords(monthlyRecurringTotal);
    
    // Update Annual Big Expenses
    document.getElementById('annualBigTotal').textContent = formatCurrency(annualBigTotal);
    document.getElementById('annualBigTotalWords').textContent = convertToWords(annualBigTotal);
    document.getElementById('monthlyEquivalentOfAnnual').textContent = formatCurrency(monthlyEquivalentOfAnnual);
    
    // Update Total Monthly Expenses
    document.getElementById('totalMonthlyExpenses').textContent = formatCurrency(totalMonthlyExpenses);
    document.getElementById('totalMonthlyExpensesWords').textContent = convertToWords(totalMonthlyExpenses);
    
    // Update Total Annual Expenses
    document.getElementById('totalAnnualExpenses').textContent = formatCurrency(totalAnnualExpenses);
    document.getElementById('totalAnnualExpensesWords').textContent = convertToWords(totalAnnualExpenses);
}

function getNumericValue(inputOrId) {
    const input = typeof inputOrId === 'string' ? 
        document.getElementById(inputOrId) : inputOrId;
    return input && input.value ? parseFloat(input.value) || 0 : 0;
}

function updateDisplayValues(values) {
    // Update currency displays
    updateDisplay('totalMonthlyRecurring', values.totalMonthlyRecurring);
    updateDisplay('monthlyBigExpenses', values.monthlyBigExpenses);
    updateDisplay('totalMonthlyExpenses', values.totalMonthlyExpenses);
    updateDisplay('annualTotal', values.annualTotal);
    
    // Update words displays
    updateWordsDisplay('totalMonthlyRecurringWords', values.totalMonthlyRecurring);
    updateWordsDisplay('monthlyBigExpensesWords', values.monthlyBigExpenses);
    updateWordsDisplay('totalMonthlyExpensesWords', values.totalMonthlyExpenses);
    updateWordsDisplay('annualTotalWords', values.annualTotal);
}

function updateDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = formatCurrency(value);
    }
}

function updateWordsDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `₹${numberToWords(value)}`;
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
    
    // Notify other pages
    notifyUpdate();
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
        wordsSpan.textContent = `₹${numberToWords(value)}`;
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
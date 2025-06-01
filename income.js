document.addEventListener('DOMContentLoaded', function() {
    console.log('Income page initialization');
    
    // Reset all input fields to empty
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.value = '';
        input.placeholder = '₹0';
    });

    // Set up event listeners
    setupEventListeners();
    
    // Load any existing data
    loadSavedData();
});

function setupEventListeners() {
    // Input change listeners
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            if (this.value === '') {
                this.placeholder = '₹0';
            }
            updateCalculations();
        });
        
        // Prevent negative values
        input.addEventListener('change', function() {
            if (parseFloat(this.value) < 0) {
                this.value = '';
                this.placeholder = '₹0';
            }
        });
    });

    // Add income source button
    document.getElementById('addIncomeSource').addEventListener('click', () => {
        addCustomIncomeSource();
    });

    // Save button
    document.getElementById('saveDataBtn').addEventListener('click', saveData);

    // Storage events for cross-page updates
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdated', loadSavedData);
}

function handleStorageChange(e) {
    if (e.key === 'incomeData' || e.key === 'networthValues') {
        loadSavedData();
    }
}

function loadSavedData() {
    console.log('Loading saved income data');
    
    // Reset all fields first
    resetAllFields();
    
    // Get saved data
    const incomeData = getFromLocalStorage('incomeData') || {};
    const savedValues = getFromLocalStorage('incomeValues') || {};
    
    // Only set values if they exist and are greater than 0
    setFieldValueIfValid('salary', savedValues.salary);
    setFieldValueIfValid('rental', incomeData.monthly?.rental);
    setFieldValueIfValid('dividend', incomeData.monthly?.dividend);
    setFieldValueIfValid('interest', incomeData.monthly?.interest);
    setFieldValueIfValid('fixed', savedValues.fixed);
    
    // Load custom sources
    loadCustomSources(savedValues.customSources);
    
    // Update calculations
    updateCalculations();
}

function setFieldValueIfValid(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value && parseFloat(value) > 0) {
        field.value = value;
    } else if (field) {
        field.value = '';
        field.placeholder = '₹0';
    }
}

function resetAllFields() {
    // Reset main income fields
    ['salary', 'rental', 'dividend', 'interest', 'fixed'].forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.value = '';
            field.placeholder = '₹0';
        }
    });
    
    // Clear custom income sources
    const customIncomeDiv = document.getElementById('custom-income');
    if (customIncomeDiv) {
        customIncomeDiv.innerHTML = '';
    }
    
    // Reset summary values
    ['regularIncome', 'additionalIncome', 'totalIncome'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '₹0';
        }
    });
}

function loadCustomSources(sources = []) {
    const validSources = sources.filter(source => 
        source && source.amount && parseFloat(source.amount) > 0);
        
    validSources.forEach(source => {
        addCustomIncomeSource(source.name, source.amount);
    });
}

function updateCalculations() {
    console.log('Updating income calculations');
    
    // Calculate regular income
    const salary = getNumericValue('salary');
    const rental = getNumericValue('rental');
    const dividend = getNumericValue('dividend');
    const interest = getNumericValue('interest');
    const fixed = getNumericValue('fixed');
    
    // Calculate custom income
    const customSources = [];
    let customTotal = 0;
    
    document.querySelectorAll('.custom-income-row').forEach(row => {
        const amount = getNumericValue(row.querySelector('.custom-amount'));
        if (amount > 0) {
            const name = row.querySelector('.custom-source').value.trim();
            customSources.push({ name: name || 'Custom Income', amount });
            customTotal += amount;
        }
    });
    
    // Calculate totals
    const regularIncome = salary + rental + dividend + interest;
    const additionalIncome = fixed + customTotal;
    const totalIncome = regularIncome + additionalIncome;
    
    // Update display
    updateDisplay('regularIncome', regularIncome);
    updateDisplay('additionalIncome', additionalIncome);
    updateDisplay('totalIncome', totalIncome);
    
    // Save if we have any non-zero values
    if (totalIncome > 0) {
        saveToLocalStorage('incomeValues', {
            salary: salary || '',
            rental: rental || '',
            dividend: dividend || '',
            interest: interest || '',
            fixed: fixed || '',
            customSources,
            regularIncome,
            additionalIncome,
            totalIncome,
            lastUpdated: new Date().toISOString()
        });
    } else {
        localStorage.removeItem('incomeValues');
    }
    
    // Notify other pages
    notifyUpdate();
}

function getNumericValue(inputOrId) {
    const input = typeof inputOrId === 'string' ? 
        document.getElementById(inputOrId) : inputOrId;
    return input && input.value ? parseFloat(input.value) || 0 : 0;
}

function updateDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value > 0 ? formatCurrency(value) : '₹0';
    }
}

function addCustomIncomeSource(name = '', amount = '') {
    const customIncomeDiv = document.getElementById('custom-income');
    const newRow = document.createElement('div');
    newRow.className = 'form-group custom-income-row';
    
    newRow.innerHTML = `
        <div class="custom-income-inputs">
            <input type="text" placeholder="Income Source" value="${name}" class="custom-source">
            <input type="number" placeholder="₹0" value="${amount}" class="custom-amount no-spinner">
        </div>
        <button type="button" class="remove-income">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Add event listeners
    newRow.querySelector('.remove-income').addEventListener('click', () => {
        newRow.remove();
        updateCalculations();
    });
    
    newRow.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateCalculations);
        if (input.type === 'number') {
            input.addEventListener('change', function() {
                if (parseFloat(this.value) < 0) {
                    this.value = '';
                    this.placeholder = '₹0';
                    updateCalculations();
                }
            });
        }
    });
    
    customIncomeDiv.appendChild(newRow);
    updateCalculations();
}

function saveData() {
    updateCalculations();
    notifyUpdate();
}

function notifyUpdate() {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('localStorageUpdated'));
} 
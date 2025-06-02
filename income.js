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
    
    // Get saved data from both sources
    const incomeData = getFromLocalStorage('incomeData') || {};
    const savedValues = getFromLocalStorage('incomeValues') || {};
    const networthValues = getFromLocalStorage('networthValues') || {};
    
    // Calculate monthly income from networth assets
    const monthlyIncome = calculateMonthlyIncomeFromNetworth(networthValues);
    
    // Set values from networth calculations first
    setFieldValueIfValid('rental', monthlyIncome.rental);
    setFieldValueIfValid('dividend', monthlyIncome.dividend);
    setFieldValueIfValid('interest', monthlyIncome.interest);
    
    // Set other values from saved income data
    setFieldValueIfValid('salary', savedValues.salary);
    setFieldValueIfValid('fixed', savedValues.fixed);
    
    // Load custom sources
    loadCustomSources(savedValues.customSources);
    
    // Update calculations
    updateCalculations();
}

function calculateMonthlyIncomeFromNetworth(values) {
    // Calculate rental income (annual)
    const rentalIncome = 
        (parseFloat(values.buildings || 0) * parseFloat(values.buildingsYield || 0) / 100) +
        (parseFloat(values.plots || 0) * parseFloat(values.plotsYield || 0) / 100) +
        (parseFloat(values.land || 0) * parseFloat(values.landYield || 0) / 100);
    
    // Calculate dividend income (annual)
    const dividendIncome = 
        (parseFloat(values.directEquity || 0) * parseFloat(values.directEquityYield || 0) / 100) +
        (parseFloat(values.equityMF || 0) * parseFloat(values.equityMFYield || 0) / 100);
    
    // Calculate interest income (annual)
    const interestIncome = 
        (parseFloat(values.debtMF || 0) * parseFloat(values.debtMFYield || 0) / 100) +
        (parseFloat(values.fixedDeposits || 0) * parseFloat(values.fixedDepositsYield || 0) / 100) +
        (parseFloat(values.otherFixedIncome || 0) * parseFloat(values.otherFixedIncomeYield || 0) / 100);
    
    // Convert to monthly
    return {
        rental: Math.round(rentalIncome / 12),
        dividend: Math.round(dividendIncome / 12),
        interest: Math.round(interestIncome / 12)
    };
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
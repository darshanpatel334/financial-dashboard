document.addEventListener('DOMContentLoaded', function() {
    // Load saved values
    const savedValues = getFromLocalStorage('expenseValues');
    
    // Initialize custom expenses
    initCustomFields('custom-monthly', 'monthly', savedValues.monthly);
    initCustomFields('custom-big', 'big', savedValues.big);
    
    // Set input values and update words
    const inputs = ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining', 'carEMI', 'homeEMI', 'electronics', 'vacations'];
    inputs.forEach(id => {
        if (savedValues[id]) document.getElementById(id).value = savedValues[id];
        updateNumberInWords(id);
    });
    
    // Add event listeners to all input fields for auto-update
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            if (input.type === 'number') {
                updateNumberInWords(input.id);
            }
            calculateTotalExpenses();
        });
    });
    
    // Calculate expenses on load
    calculateTotalExpenses();
    
    // Event listeners
    document.getElementById('addMonthlyExpenseBtn').addEventListener('click', () => {
        addCustomField('custom-monthly', 'monthly');
    });
    
    document.getElementById('addBigExpenseBtn').addEventListener('click', () => {
        addCustomField('custom-big', 'big');
    });
    
    // Remove the updateFFBtn since we're using automatic updates
    const updateFFExpensesBtn = document.getElementById('updateFFExpensesBtn');
    if (updateFFExpensesBtn) {
        updateFFExpensesBtn.style.display = 'none';
    }
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
            <input type="text" placeholder="Expense Name" 
                   value="${item.name || ''}" class="custom-name">
            <input type="number" placeholder="Amount (₹)" 
                   value="${item.value || ''}" class="custom-value">
            <button class="remove-btn" onclick="document.getElementById('${fieldId}').remove(); calculateTotalExpenses();">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', fieldHTML);
}

function calculateTotalExpenses() {
    // Calculate monthly expenses
    let monthlyExpenses = calculateMonthlyExpenses();
    document.getElementById('monthlyExpensesResult').textContent = formatCurrency(monthlyExpenses);
    
    // Calculate big expenses
    let bigExpenses = calculateBigExpenses();
    document.getElementById('bigExpensesResult').textContent = formatCurrency(bigExpenses);
    
    // Calculate total monthly (including big expenses spread over 12 months)
    let totalMonthlyExpenses = monthlyExpenses + (bigExpenses / 12);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalMonthlyExpenses);
    
    // Save expense data
    const expenseValues = {
        // Monthly expenses
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
        
        // Custom expenses
        monthly: [],
        big: [],
        
        // Totals
        totalMonthly: monthlyExpenses,
        totalBig: bigExpenses,
        totalMonthlyWithBig: totalMonthlyExpenses,
        lastUpdated: new Date().toISOString()
    };
    
    // Save custom monthly expenses
    document.querySelectorAll('#custom-monthly .custom-item').forEach(item => {
        expenseValues.monthly.push({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        });
    });
    
    // Save custom big expenses
    document.querySelectorAll('#custom-big .custom-item').forEach(item => {
        expenseValues.big.push({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        });
    });
    
    // Save to localStorage
    saveToLocalStorage('expenseValues', expenseValues);
}

function calculateMonthlyExpenses() {
    let total = 0;
    
    // Predefined monthly expenses
    const monthlyInputs = document.querySelectorAll('#groceries, #utilities, #subscriptions, #shopping, #dining');
    monthlyInputs.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    // Custom monthly expenses
    const customMonthly = document.querySelectorAll('#custom-monthly input');
    customMonthly.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    return total;
}

function calculateBigExpenses() {
    let total = 0;
    
    // Predefined big expenses
    const bigInputs = document.querySelectorAll('#carEMI, #homeEMI, #electronics, #vacations');
    bigInputs.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    // Custom big expenses
    const customBig = document.querySelectorAll('#custom-big input');
    customBig.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    return total;
}

function saveExpenseValues() {
    const expenseValues = {
        groceries: document.getElementById('groceries').value,
        utilities: document.getElementById('utilities').value,
        subscriptions: document.getElementById('subscriptions').value,
        shopping: document.getElementById('shopping').value,
        dining: document.getElementById('dining').value,
        carEMI: document.getElementById('carEMI').value,
        homeEMI: document.getElementById('homeEMI').value,
        electronics: document.getElementById('electronics').value,
        vacations: document.getElementById('vacations').value,
        monthly: [],
        big: []
    };
    
    // Save custom monthly expenses
    document.querySelectorAll('#custom-monthly .custom-item').forEach(item => {
        expenseValues.monthly.push({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        });
    });
    
    // Save custom big expenses
    document.querySelectorAll('#custom-big .custom-item').forEach(item => {
        expenseValues.big.push({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        });
    });
    
    saveToLocalStorage('expenseValues', expenseValues);
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
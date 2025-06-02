// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateExpensesSummary();
    renderMonthlyExpenses();
    renderAnnualExpenses();
    renderBigExpenses();
    initializeExpensesChart();
});

// Update summary values
function updateExpensesSummary() {
    const { summary } = AppState.expenses;
    
    document.getElementById('monthly-expenses').textContent = utils.formatCurrency(summary.totalMonthlyExpenses);
    document.getElementById('monthly-expenses-words').textContent = utils.numberToWords(summary.totalMonthlyExpenses);
    
    document.getElementById('annual-expenses').textContent = utils.formatCurrency(summary.totalAnnualExpenses);
    document.getElementById('annual-expenses-words').textContent = utils.numberToWords(summary.totalAnnualExpenses);
    
    document.getElementById('big-expenses').textContent = utils.formatCurrency(summary.totalBigExpenses);
    document.getElementById('big-expenses-words').textContent = utils.numberToWords(summary.totalBigExpenses);
    
    document.getElementById('expected-inflation').textContent = `${summary.expectedInflation}%`;
}

// Initialize Expenses Chart
function initializeExpensesChart() {
    const ctx = document.getElementById('expenses-composition-chart').getContext('2d');
    const { monthlyRecurring, annualRecurring, bigExpenses } = AppState.expenses;
    
    // Calculate total monthly expenses by category
    const monthlyExpenses = Object.entries(monthlyRecurring)
        .filter(([key]) => key !== 'custom')
        .map(([key, value]) => ({
            label: key.replace(/([A-Z])/g, ' $1').trim(),
            value
        }));
    
    // Add custom monthly expenses
    if (monthlyRecurring.custom) {
        monthlyRecurring.custom.forEach(item => {
            monthlyExpenses.push({
                label: item.name,
                value: item.amount
            });
        });
    }
    
    // Sort expenses by value
    monthlyExpenses.sort((a, b) => b.value - a.value);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: monthlyExpenses.map(item => item.label),
            datasets: [{
                data: monthlyExpenses.map(item => item.value),
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(230, 126, 34, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(52, 73, 94, 0.8)',
                    'rgba(26, 188, 156, 0.8)',
                    'rgba(46, 204, 113, 0.6)',
                    'rgba(52, 152, 219, 0.6)',
                    'rgba(155, 89, 182, 0.6)',
                    'rgba(241, 196, 15, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Expenses Composition'
                }
            }
        }
    });
}

// Monthly Expenses Functions
function renderMonthlyExpenses() {
    const container = document.getElementById('monthly-expenses-list');
    const { monthlyRecurring } = AppState.expenses;
    
    let html = '<div class="grid-list">';
    
    // Render predefined monthly expenses
    Object.entries(monthlyRecurring).forEach(([key, amount]) => {
        if (key !== 'custom' && amount > 0) {
            html += createExpenseCard('monthly', key, amount);
        }
    });
    
    // Render custom monthly expenses
    if (monthlyRecurring.custom && monthlyRecurring.custom.length > 0) {
        monthlyRecurring.custom.forEach((expense, index) => {
            html += createExpenseCard('monthly', `custom-${index}`, expense.amount, expense.name, true);
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Annual Expenses Functions
function renderAnnualExpenses() {
    const container = document.getElementById('annual-expenses-list');
    const { annualRecurring } = AppState.expenses;
    
    let html = '<div class="grid-list">';
    
    // Render predefined annual expenses
    Object.entries(annualRecurring).forEach(([key, amount]) => {
        if (key !== 'custom' && amount > 0) {
            html += createExpenseCard('annual', key, amount);
        }
    });
    
    // Render custom annual expenses
    if (annualRecurring.custom && annualRecurring.custom.length > 0) {
        annualRecurring.custom.forEach((expense, index) => {
            html += createExpenseCard('annual', `custom-${index}`, expense.amount, expense.name, true);
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Big Expenses Functions
function renderBigExpenses() {
    const container = document.getElementById('big-expenses-list');
    const { bigExpenses } = AppState.expenses;
    
    let html = '<div class="grid-list">';
    
    // Render appliances
    if (bigExpenses.appliances && bigExpenses.appliances.length > 0) {
        bigExpenses.appliances.forEach((expense, index) => {
            html += createExpenseCard('big', `appliances-${index}`, expense.value, expense.name);
        });
    }
    
    // Render house
    if (bigExpenses.house.value > 0) {
        html += createExpenseCard('big', 'house', bigExpenses.house.value, 'House', false, bigExpenses.house.rentalYield);
    }
    
    // Render custom big expenses
    if (bigExpenses.custom && bigExpenses.custom.length > 0) {
        bigExpenses.custom.forEach((expense, index) => {
            html += createExpenseCard('big', `custom-${index}`, expense.value, expense.name, true);
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Create Expense Card HTML
function createExpenseCard(type, key, amount, name = null, isCustom = false, yield = null) {
    const displayName = name || key.replace(/([A-Z])/g, ' $1').trim();
    const monthlyEquivalent = type === 'annual' ? amount / 12 : amount;
    
    return `
        <div class="card">
            <h4>${displayName}</h4>
            <p>${type === 'annual' ? 'Annual' : 'Monthly'} Amount: ${utils.formatCurrency(amount)}</p>
            ${type === 'annual' ? `<p>Monthly Equivalent: ${utils.formatCurrency(monthlyEquivalent)}</p>` : ''}
            ${yield !== null ? `<p>Expected Rental Yield: ${yield}%</p>` : ''}
            <button class="btn btn-danger" onclick="deleteExpense('${type}', '${key}', ${isCustom})">Delete</button>
        </div>
    `;
}

// Modal Functions
function showMonthlyExpenseModal() {
    document.getElementById('monthly-expense-modal').style.display = 'block';
}

function closeMonthlyExpenseModal() {
    document.getElementById('monthly-expense-modal').style.display = 'none';
    document.getElementById('monthly-expense-form').reset();
}

function showAnnualExpenseModal() {
    document.getElementById('annual-expense-modal').style.display = 'block';
}

function closeAnnualExpenseModal() {
    document.getElementById('annual-expense-modal').style.display = 'none';
    document.getElementById('annual-expense-form').reset();
}

function showBigExpenseModal() {
    document.getElementById('big-expense-modal').style.display = 'block';
}

function closeBigExpenseModal() {
    document.getElementById('big-expense-modal').style.display = 'none';
    document.getElementById('big-expense-form').reset();
}

function showInflationModal() {
    const modal = document.getElementById('inflation-modal');
    document.getElementById('inflation-rate').value = AppState.expenses.summary.expectedInflation;
    modal.style.display = 'block';
}

function closeInflationModal() {
    document.getElementById('inflation-modal').style.display = 'none';
    document.getElementById('inflation-form').reset();
}

// Save Functions
function saveMonthlyExpense(event) {
    event.preventDefault();
    
    const type = document.getElementById('monthly-expense-type').value;
    const amount = parseFloat(document.getElementById('monthly-expense-amount').value);
    
    if (type === 'custom') {
        const name = document.getElementById('monthly-expense-name').value.trim();
        if (!AppState.expenses.monthlyRecurring.custom) {
            AppState.expenses.monthlyRecurring.custom = [];
        }
        AppState.expenses.monthlyRecurring.custom.push({ name, amount });
    } else {
        AppState.expenses.monthlyRecurring[type] = amount;
    }
    
    calculateExpensesSummary();
    
    closeMonthlyExpenseModal();
    renderMonthlyExpenses();
    updateExpensesSummary();
    initializeExpensesChart();
    
    return false;
}

function saveAnnualExpense(event) {
    event.preventDefault();
    
    const type = document.getElementById('annual-expense-type').value;
    const amount = parseFloat(document.getElementById('annual-expense-amount').value);
    
    if (type === 'custom') {
        const name = document.getElementById('annual-expense-name').value.trim();
        if (!AppState.expenses.annualRecurring.custom) {
            AppState.expenses.annualRecurring.custom = [];
        }
        AppState.expenses.annualRecurring.custom.push({ name, amount });
    } else {
        AppState.expenses.annualRecurring[type] = amount;
    }
    
    calculateExpensesSummary();
    
    closeAnnualExpenseModal();
    renderAnnualExpenses();
    updateExpensesSummary();
    initializeExpensesChart();
    
    return false;
}

function saveBigExpense(event) {
    event.preventDefault();
    
    const type = document.getElementById('big-expense-type').value;
    const amount = parseFloat(document.getElementById('big-expense-amount').value);
    
    if (type === 'house') {
        const yield = parseFloat(document.getElementById('rental-yield').value) || 0;
        AppState.expenses.bigExpenses.house = {
            value: amount,
            rentalYield: yield
        };
    } else if (type === 'appliances') {
        const name = document.getElementById('big-expense-name').value.trim();
        if (!AppState.expenses.bigExpenses.appliances) {
            AppState.expenses.bigExpenses.appliances = [];
        }
        AppState.expenses.bigExpenses.appliances.push({ name, value: amount });
    } else {
        const name = document.getElementById('big-expense-name').value.trim();
        if (!AppState.expenses.bigExpenses.custom) {
            AppState.expenses.bigExpenses.custom = [];
        }
        AppState.expenses.bigExpenses.custom.push({ name, value: amount });
    }
    
    calculateExpensesSummary();
    
    closeBigExpenseModal();
    renderBigExpenses();
    updateExpensesSummary();
    initializeExpensesChart();
    
    return false;
}

function saveInflation(event) {
    event.preventDefault();
    
    const inflationRate = parseFloat(document.getElementById('inflation-rate').value);
    AppState.expenses.summary.expectedInflation = inflationRate;
    AppState.save();
    
    closeInflationModal();
    updateExpensesSummary();
    
    return false;
}

// Delete Functions
function deleteExpense(type, key, isCustom) {
    switch (type) {
        case 'monthly':
            if (isCustom) {
                const monthlyIndex = parseInt(key.split('-')[1]);
                AppState.expenses.monthlyRecurring.custom.splice(monthlyIndex, 1);
            } else {
                AppState.expenses.monthlyRecurring[key] = 0;
            }
            break;
            
        case 'annual':
            if (isCustom) {
                const annualIndex = parseInt(key.split('-')[1]);
                AppState.expenses.annualRecurring.custom.splice(annualIndex, 1);
            } else {
                AppState.expenses.annualRecurring[key] = 0;
            }
            break;
            
        case 'big':
            if (key === 'house') {
                AppState.expenses.bigExpenses.house = { value: 0, rentalYield: 0 };
            } else if (key.startsWith('appliances-')) {
                const applianceIndex = parseInt(key.split('-')[1]);
                AppState.expenses.bigExpenses.appliances.splice(applianceIndex, 1);
            } else if (key.startsWith('custom-')) {
                const customIndex = parseInt(key.split('-')[1]);
                AppState.expenses.bigExpenses.custom.splice(customIndex, 1);
            }
            break;
    }
    
    calculateExpensesSummary();
    
    switch (type) {
        case 'monthly':
            renderMonthlyExpenses();
            break;
        case 'annual':
            renderAnnualExpenses();
            break;
        case 'big':
            renderBigExpenses();
            break;
    }
    
    updateExpensesSummary();
    initializeExpensesChart();
}

// Calculate Summary
function calculateExpensesSummary() {
    const { monthlyRecurring, annualRecurring, bigExpenses } = AppState.expenses;
    
    // Calculate total monthly recurring expenses
    let totalMonthlyRecurring = Object.entries(monthlyRecurring)
        .filter(([key]) => key !== 'custom')
        .reduce((sum, [_, amount]) => sum + amount, 0);
    
    if (monthlyRecurring.custom) {
        totalMonthlyRecurring += monthlyRecurring.custom.reduce((sum, item) => sum + item.amount, 0);
    }
    
    // Calculate total annual recurring expenses
    let totalAnnualRecurring = Object.entries(annualRecurring)
        .filter(([key]) => key !== 'custom')
        .reduce((sum, [_, amount]) => sum + amount, 0);
    
    if (annualRecurring.custom) {
        totalAnnualRecurring += annualRecurring.custom.reduce((sum, item) => sum + item.amount, 0);
    }
    
    // Calculate total big expenses
    let totalBigExpenses = bigExpenses.house.value;
    
    if (bigExpenses.appliances) {
        totalBigExpenses += bigExpenses.appliances.reduce((sum, item) => sum + item.value, 0);
    }
    
    if (bigExpenses.custom) {
        totalBigExpenses += bigExpenses.custom.reduce((sum, item) => sum + item.value, 0);
    }
    
    // Update summary in state
    AppState.expenses.summary = {
        totalMonthlyRecurring,
        totalAnnualRecurring,
        totalBigExpenses,
        totalMonthlyExpenses: totalMonthlyRecurring + (totalAnnualRecurring / 12),
        totalAnnualExpenses: (totalMonthlyRecurring * 12) + totalAnnualRecurring,
        expectedInflation: AppState.expenses.summary.expectedInflation || 0
    };
    
    AppState.save();
}

// Add event listeners for expense type changes
document.getElementById('monthly-expense-type')?.addEventListener('change', function(e) {
    const nameGroup = document.getElementById('monthly-expense-name-group');
    nameGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
});

document.getElementById('annual-expense-type')?.addEventListener('change', function(e) {
    const nameGroup = document.getElementById('annual-expense-name-group');
    nameGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
});

document.getElementById('big-expense-type')?.addEventListener('change', function(e) {
    const nameGroup = document.getElementById('big-expense-name-group');
    const yieldGroup = document.getElementById('rental-yield-group');
    
    nameGroup.style.display = e.target.value !== 'house' ? 'block' : 'none';
    yieldGroup.style.display = e.target.value === 'house' ? 'block' : 'none';
}); 
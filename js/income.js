// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateIncomeSummary();
    renderRegularIncome();
    renderPassiveIncome();
    renderAdditionalIncome();
    initializeIncomeChart();
});

// Update summary values
function updateIncomeSummary() {
    const { summary } = AppState.income;
    
    document.getElementById('monthly-income').textContent = utils.formatCurrency(summary.monthlyIncome);
    document.getElementById('monthly-income-words').textContent = utils.numberToWords(summary.monthlyIncome);
    
    document.getElementById('annual-income').textContent = utils.formatCurrency(summary.annualIncome);
    document.getElementById('annual-income-words').textContent = utils.numberToWords(summary.annualIncome);
    
    const passiveIncome = calculateTotalPassiveIncome();
    document.getElementById('passive-income').textContent = utils.formatCurrency(passiveIncome);
    
    const passiveRatio = summary.monthlyIncome > 0 ? (passiveIncome / summary.monthlyIncome * 100).toFixed(1) : 0;
    document.getElementById('passive-ratio').textContent = `${passiveRatio}% of total income`;
}

// Initialize Income Composition Chart
function initializeIncomeChart() {
    const ctx = document.getElementById('income-composition-chart').getContext('2d');
    const { regular, passive } = AppState.income;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Regular Income', 'Rental Income', 'Dividend Income', 'Interest Income', 'Additional Income'],
            datasets: [{
                data: [
                    regular.salaryPension,
                    passive.rental,
                    passive.dividend,
                    passive.interest,
                    calculateTotalAdditionalIncome()
                ],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(230, 126, 34, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Income Composition'
                }
            }
        }
    });
}

// Regular Income Functions
function renderRegularIncome() {
    const container = document.getElementById('regular-income-list');
    const { salaryPension } = AppState.income.regular;
    
    container.innerHTML = `
        <div class="card">
            <h4>Salary/Pension</h4>
            <p>Monthly Amount: ${utils.formatCurrency(salaryPension)}</p>
            <button class="btn btn-danger" onclick="deleteRegularIncome()">Delete</button>
        </div>
    `;
}

function showRegularIncomeModal() {
    const modal = document.getElementById('regular-income-modal');
    const form = document.getElementById('regular-income-form');
    const amount = AppState.income.regular.salaryPension;
    
    document.getElementById('regular-income-amount').value = amount || '';
    modal.style.display = 'block';
}

function closeRegularIncomeModal() {
    document.getElementById('regular-income-modal').style.display = 'none';
    document.getElementById('regular-income-form').reset();
}

function saveRegularIncome(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('regular-income-amount').value);
    
    AppState.income.regular.salaryPension = amount;
    calculateIncomeSummary();
    
    closeRegularIncomeModal();
    renderRegularIncome();
    updateIncomeSummary();
    initializeIncomeChart();
    
    return false;
}

function deleteRegularIncome() {
    AppState.income.regular.salaryPension = 0;
    calculateIncomeSummary();
    
    renderRegularIncome();
    updateIncomeSummary();
    initializeIncomeChart();
}

// Passive Income Functions
function renderPassiveIncome() {
    const container = document.getElementById('passive-income-list');
    const { passive } = AppState.income;
    
    let html = '<div class="grid-list">';
    
    // Render predefined passive income
    Object.entries(passive).forEach(([key, amount]) => {
        if (key !== 'custom' && amount > 0) {
            html += createPassiveIncomeCard(key, amount);
        }
    });
    
    // Render custom passive income
    if (passive.custom && passive.custom.length > 0) {
        passive.custom.forEach((item, index) => {
            html += createPassiveIncomeCard(`custom-${index}`, item.amount, item.name, true);
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function createPassiveIncomeCard(key, amount, name = null, isCustom = false) {
    const displayName = name || key.charAt(0).toUpperCase() + key.slice(1);
    
    return `
        <div class="card">
            <h4>${displayName}</h4>
            <p>Monthly Amount: ${utils.formatCurrency(amount)}</p>
            <button class="btn btn-danger" onclick="deletePassiveIncome('${key}', ${isCustom})">Delete</button>
        </div>
    `;
}

function showPassiveIncomeModal() {
    document.getElementById('passive-income-modal').style.display = 'block';
}

function closePassiveIncomeModal() {
    document.getElementById('passive-income-modal').style.display = 'none';
    document.getElementById('passive-income-form').reset();
}

function savePassiveIncome(event) {
    event.preventDefault();
    
    const type = document.getElementById('passive-income-type').value;
    const amount = parseFloat(document.getElementById('passive-income-amount').value);
    
    if (type === 'custom') {
        const name = document.getElementById('passive-income-name').value.trim();
        if (!AppState.income.passive.custom) {
            AppState.income.passive.custom = [];
        }
        AppState.income.passive.custom.push({ name, amount });
    } else {
        AppState.income.passive[type] = amount;
    }
    
    calculateIncomeSummary();
    
    closePassiveIncomeModal();
    renderPassiveIncome();
    updateIncomeSummary();
    initializeIncomeChart();
    
    return false;
}

function deletePassiveIncome(key, isCustom) {
    if (isCustom) {
        const index = parseInt(key.split('-')[1]);
        AppState.income.passive.custom.splice(index, 1);
    } else {
        AppState.income.passive[key] = 0;
    }
    
    calculateIncomeSummary();
    renderPassiveIncome();
    updateIncomeSummary();
    initializeIncomeChart();
}

// Additional Income Functions
function renderAdditionalIncome() {
    const container = document.getElementById('additional-income-list');
    const { additional } = AppState.income;
    
    let html = '<div class="grid-list">';
    
    // Render fixed additional income
    if (additional.fixed && additional.fixed.length > 0) {
        additional.fixed.forEach((item, index) => {
            html += createAdditionalIncomeCard(index, item);
        });
    }
    
    // Render custom additional income
    if (additional.custom && additional.custom.length > 0) {
        additional.custom.forEach((item, index) => {
            html += createAdditionalIncomeCard(index, item, true);
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function createAdditionalIncomeCard(index, income, isCustom = false) {
    return `
        <div class="card">
            <h4>${income.name}</h4>
            <p>Amount: ${utils.formatCurrency(income.amount)}</p>
            <p>Frequency: ${income.frequency}</p>
            <button class="btn btn-danger" onclick="deleteAdditionalIncome(${index}, ${isCustom})">Delete</button>
        </div>
    `;
}

function showAdditionalIncomeModal() {
    document.getElementById('additional-income-modal').style.display = 'block';
}

function closeAdditionalIncomeModal() {
    document.getElementById('additional-income-modal').style.display = 'none';
    document.getElementById('additional-income-form').reset();
}

function saveAdditionalIncome(event) {
    event.preventDefault();
    
    const name = document.getElementById('additional-income-name').value.trim();
    const amount = parseFloat(document.getElementById('additional-income-amount').value);
    const frequency = document.getElementById('additional-income-frequency').value;
    
    const income = { name, amount, frequency };
    
    if (!AppState.income.additional.custom) {
        AppState.income.additional.custom = [];
    }
    AppState.income.additional.custom.push(income);
    
    calculateIncomeSummary();
    
    closeAdditionalIncomeModal();
    renderAdditionalIncome();
    updateIncomeSummary();
    initializeIncomeChart();
    
    return false;
}

function deleteAdditionalIncome(index, isCustom) {
    const type = isCustom ? 'custom' : 'fixed';
    AppState.income.additional[type].splice(index, 1);
    
    calculateIncomeSummary();
    renderAdditionalIncome();
    updateIncomeSummary();
    initializeIncomeChart();
}

// Helper Functions
function calculateTotalPassiveIncome() {
    const { passive } = AppState.income;
    let total = passive.rental + passive.dividend + passive.interest;
    
    if (passive.custom) {
        total += passive.custom.reduce((sum, item) => sum + item.amount, 0);
    }
    
    return total;
}

function calculateTotalAdditionalIncome() {
    const { additional } = AppState.income;
    let total = 0;
    
    // Calculate fixed additional income
    if (additional.fixed) {
        total += additional.fixed.reduce((sum, item) => {
            switch (item.frequency) {
                case 'monthly': return sum + item.amount;
                case 'quarterly': return sum + (item.amount / 3);
                case 'annually': return sum + (item.amount / 12);
                default: return sum;
            }
        }, 0);
    }
    
    // Calculate custom additional income
    if (additional.custom) {
        total += additional.custom.reduce((sum, item) => {
            switch (item.frequency) {
                case 'monthly': return sum + item.amount;
                case 'quarterly': return sum + (item.amount / 3);
                case 'annually': return sum + (item.amount / 12);
                default: return sum;
            }
        }, 0);
    }
    
    return total;
}

function calculateIncomeSummary() {
    const monthlyIncome = AppState.income.regular.salaryPension +
        calculateTotalPassiveIncome() +
        calculateTotalAdditionalIncome();
    
    AppState.income.summary = {
        monthlyIncome,
        annualIncome: monthlyIncome * 12
    };
    
    AppState.save();
}

// Add event listener for passive income type change
document.getElementById('passive-income-type')?.addEventListener('change', function(e) {
    const nameGroup = document.getElementById('passive-income-name-group');
    nameGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
}); 
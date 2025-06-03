// ===== EXPENSES PAGE FUNCTIONALITY =====

let expenseCount = 0;
let expenseData = {
    monthlyRecurring: [],
    annualRecurring: [],
    bigExpenses: []
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        loadExpenseData();
        loadIncomeDataForAnalysis();
        
        // Setup navigation system
        if (typeof setupPageNavigation === 'function') {
            setupPageNavigation(4); // 4 = Expenses page
        }
    });
});

// Add expense item
function addExpenseItem(category, type) {
    expenseCount++;
    const container = document.getElementById(category + 'Items');
    const expenseItem = document.createElement('div');
    expenseItem.className = 'item-card';
    
    let additionalFields = '';
    
    if (category === 'bigExpenses') {
        additionalFields = `
            <div class="form-group">
                <label>Replacement Years</label>
                <input type="number" placeholder="Years" min="1" max="50" onchange="calculateTotals()">
                <small class="text-secondary">How often to replace/buy again</small>
            </div>
        `;
    }
    
    expenseItem.innerHTML = `
        <div class="form-group">
            <label>${type} Name</label>
            <input type="text" placeholder="Enter expense name" onchange="calculateTotals()">
            <div class="amount-display"></div>
        </div>
        <div class="form-group">
            <label>Amount (₹)</label>
            <input type="number" placeholder="0" onchange="calculateTotals(); updateAmountDisplay(this)">
            <div class="amount-display"></div>
        </div>
        ${additionalFields}
        <button class="delete-btn" onclick="removeExpenseItem(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    container.appendChild(expenseItem);
    saveExpenseData();
}

// Remove expense item
function removeExpenseItem(button) {
    button.closest('.item-card').remove();
    calculateTotals();
    saveExpenseData();
}

// Calculate totals and analysis
function calculateTotals() {
    let monthlyTotal = 0;
    let annualTotal = 0;
    
    // Calculate monthly recurring expenses
    let monthlyRecurringTotal = 0;
    const monthlyItems = document.querySelectorAll('#monthlyRecurringItems .item-card');
    monthlyItems.forEach(item => {
        const amount = parseFloat(item.querySelector('input[type="number"]').value) || 0;
        monthlyRecurringTotal += amount;
    });
    
    // Calculate annual recurring expenses
    let annualRecurringTotal = 0;
    const annualItems = document.querySelectorAll('#annualRecurringItems .item-card');
    annualItems.forEach(item => {
        const amount = parseFloat(item.querySelector('input[type="number"]').value) || 0;
        annualRecurringTotal += amount;
    });
    
    // Calculate big expenses (annualized)
    let bigExpensesTotal = 0;
    const bigExpenseItems = document.querySelectorAll('#bigExpensesItems .item-card');
    bigExpenseItems.forEach(item => {
        const amount = parseFloat(item.querySelector('input[type="number"]').value) || 0;
        const years = parseFloat(item.querySelectorAll('input[type="number"]')[1]?.value) || 1;
        
        if (amount > 0 && years > 0) {
            bigExpensesTotal += amount / years; // Annualized cost
        }
    });
    
    // Calculate totals
    monthlyTotal = monthlyRecurringTotal + (annualRecurringTotal / 12) + (bigExpensesTotal / 12);
    annualTotal = (monthlyRecurringTotal * 12) + annualRecurringTotal + bigExpensesTotal;
    
    // Update category totals
    document.getElementById('monthlyRecurringTotal').textContent = formatCurrency(monthlyRecurringTotal);
    document.getElementById('annualRecurringTotal').textContent = formatCurrency(annualRecurringTotal);
    document.getElementById('bigExpensesTotal').textContent = formatCurrency(bigExpensesTotal);
    
    // Update summary totals
    document.getElementById('monthlyTotal').textContent = formatCurrency(monthlyTotal);
    document.getElementById('annualTotal').textContent = formatCurrency(annualTotal);
    
    // Update inflation display
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 6;
    document.getElementById('inflationDisplay').textContent = inflationRate + '%';
    
    // Calculate analysis metrics
    calculateExpenseAnalysis(annualTotal, inflationRate);
    
    // Auto-save after calculation
    setTimeout(() => {
        saveExpenseData();
    }, 1000);
}

// Calculate expense analysis
function calculateExpenseAnalysis(annualExpenses, inflationRate) {
    // Get income data for analysis
    const incomeData = Storage.get('incomeData', {});
    const annualIncome = incomeData.totals?.annualTotal || 0;
    
    // Calculate expense ratio
    const expenseRatio = annualIncome > 0 ? (annualExpenses / annualIncome) * 100 : 0;
    document.getElementById('expenseRatio').textContent = Math.round(expenseRatio) + '%';
    
    // Calculate future expenses (10 years with inflation)
    const futureExpenses = calculateCompoundGrowth(annualExpenses, inflationRate, 10);
    document.getElementById('futureExpenses').textContent = formatCurrency(futureExpenses);
    
    // Calculate savings rate
    const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
    document.getElementById('savingsRate').textContent = Math.round(savingsRate) + '%';
    
    // Update score colors based on performance
    updateAnalysisColors(expenseRatio, savingsRate);
}

// Update analysis colors based on performance
function updateAnalysisColors(expenseRatio, savingsRate) {
    const expenseRatioElement = document.getElementById('expenseRatio');
    const savingsRateElement = document.getElementById('savingsRate');
    
    // Color code expense ratio (lower is better)
    if (expenseRatio > 80) {
        expenseRatioElement.style.color = 'var(--danger-color)';
    } else if (expenseRatio > 60) {
        expenseRatioElement.style.color = 'var(--warning-color)';
    } else {
        expenseRatioElement.style.color = 'var(--success-color)';
    }
    
    // Color code savings rate (higher is better)
    if (savingsRate < 10) {
        savingsRateElement.style.color = 'var(--danger-color)';
    } else if (savingsRate < 25) {
        savingsRateElement.style.color = 'var(--warning-color)';
    } else {
        savingsRateElement.style.color = 'var(--success-color)';
    }
}

// Load income data for analysis
function loadIncomeDataForAnalysis() {
    // This ensures we have the latest income data for expense ratio calculations
    calculateTotals();
}

// Save expense data
function saveExpenseData() {
    const data = {
        expenses: {},
        settings: {
            inflationRate: parseFloat(document.getElementById('inflationRate').value) || 6
        },
        totals: {
            monthlyTotal: parseCurrency(document.getElementById('monthlyTotal').textContent),
            annualTotal: parseCurrency(document.getElementById('annualTotal').textContent),
            monthlyRecurringTotal: parseCurrency(document.getElementById('monthlyRecurringTotal').textContent),
            annualRecurringTotal: parseCurrency(document.getElementById('annualRecurringTotal').textContent),
            bigExpensesTotal: parseCurrency(document.getElementById('bigExpensesTotal').textContent)
        },
        analysis: {
            expenseRatio: parseInt(document.getElementById('expenseRatio').textContent) || 0,
            savingsRate: parseInt(document.getElementById('savingsRate').textContent) || 0,
            futureExpenses: parseCurrency(document.getElementById('futureExpenses').textContent)
        }
    };
    
    // Save expenses by category
    const categories = ['monthlyRecurring', 'annualRecurring', 'bigExpenses'];
    categories.forEach(category => {
        data.expenses[category] = [];
        const items = document.querySelectorAll(`#${category}Items .item-card`);
        items.forEach(item => {
            const inputs = item.querySelectorAll('input');
            
            if (inputs.length >= 2) {
                const name = inputs[0].value;
                const amount = parseFloat(inputs[1].value) || 0;
                
                if (name && amount > 0) {
                    const expenseItem = {
                        name: name,
                        amount: amount
                    };
                    
                    // Add replacement years for big expenses
                    if (category === 'bigExpenses' && inputs.length >= 3) {
                        expenseItem.replacementYears = parseFloat(inputs[2].value) || 1;
                    }
                    
                    data.expenses[category].push(expenseItem);
                }
            }
        });
    });
    
    Storage.set('expenseData', data);
}

// Load expense data
function loadExpenseData() {
    const savedData = Storage.get('expenseData', {});
    
    // Load inflation rate
    if (savedData.settings?.inflationRate) {
        document.getElementById('inflationRate').value = savedData.settings.inflationRate;
    }
    
    if (savedData.expenses) {
        // Load expense items
        Object.keys(savedData.expenses).forEach(category => {
            savedData.expenses[category].forEach(expense => {
                const typeName = getExpenseTypeName(category);
                addExpenseItem(category, typeName);
                
                const lastItem = document.querySelector(`#${category}Items .item-card:last-child`);
                if (lastItem) {
                    const inputs = lastItem.querySelectorAll('input');
                    
                    inputs[0].value = expense.name;
                    inputs[1].value = expense.amount;
                    
                    updateAmountDisplay(inputs[1]);
                    
                    // Load replacement years for big expenses
                    if (category === 'bigExpenses' && expense.replacementYears && inputs.length >= 3) {
                        inputs[2].value = expense.replacementYears;
                    }
                }
            });
        });
    }
    
    calculateTotals();
}

// Get expense type name
function getExpenseTypeName(category) {
    const typeNames = {
        monthlyRecurring: 'Monthly Recurring',
        annualRecurring: 'Annual Recurring',
        bigExpenses: 'Big Expense'
    };
    return typeNames[category] || 'Expense';
}

// Navigation functions
function goBack() {
    navigateToPage('income.html', saveExpenseData);
}

function goNext() {
    if (!validateExpenseData()) {
        showStatus('Please add at least one expense category', 'error');
        return;
    }
    navigateToPage('ff-score.html', saveExpenseData);
}

// Validate expense data
function validateExpenseData() {
    // Check if at least one expense is filled
    let hasExpense = false;
    const categories = ['monthlyRecurring', 'annualRecurring', 'bigExpenses'];
    
    categories.forEach(category => {
        const items = document.querySelectorAll(`#${category}Items .item-card`);
        items.forEach(item => {
            const amount = parseFloat(item.querySelector('input[type="number"]').value) || 0;
            if (amount > 0) {
                hasExpense = true;
            }
        });
    });
    
    return hasExpense;
}

// ===== EXPENSE ANALYSIS FUNCTIONS =====

// Get expense breakdown
function getExpenseBreakdown() {
    const totalAnnual = parseCurrency(document.getElementById('annualTotal').textContent);
    
    if (totalAnnual === 0) return null;
    
    const breakdown = {
        monthlyRecurring: parseCurrency(document.getElementById('monthlyRecurringTotal').textContent) * 12,
        annualRecurring: parseCurrency(document.getElementById('annualRecurringTotal').textContent),
        bigExpenses: parseCurrency(document.getElementById('bigExpensesTotal').textContent)
    };
    
    // Calculate percentages
    Object.keys(breakdown).forEach(key => {
        breakdown[key + 'Percentage'] = calculatePercentage(breakdown[key], totalAnnual);
    });
    
    return breakdown;
}

// Get expense analysis summary
function getExpenseAnalysis() {
    const data = Storage.get('expenseData', {});
    
    return {
        monthlyTotal: data.totals?.monthlyTotal || 0,
        annualTotal: data.totals?.annualTotal || 0,
        inflationRate: data.settings?.inflationRate || 6,
        breakdown: getExpenseBreakdown(),
        analysis: data.analysis || {},
        recommendations: getExpenseRecommendations()
    };
}

// Get expense recommendations
function getExpenseRecommendations() {
    const analysis = Storage.get('expenseData', {}).analysis || {};
    const recommendations = [];
    
    if (analysis.expenseRatio > 80) {
        recommendations.push({
            type: 'warning',
            title: 'High Expense Ratio',
            message: 'Your expenses are more than 80% of your income. Consider reducing discretionary spending.'
        });
    }
    
    if (analysis.savingsRate < 10) {
        recommendations.push({
            type: 'error',
            title: 'Low Savings Rate',
            message: 'Your savings rate is below 10%. This makes it difficult to build wealth. Try to increase income or reduce expenses.'
        });
    } else if (analysis.savingsRate > 25) {
        recommendations.push({
            type: 'success',
            title: 'Excellent Savings Rate',
            message: 'Your savings rate is above 25%. You are on track for financial independence!'
        });
    }
    
    return recommendations;
}

// Export expense data for other modules
function getExpenseData() {
    return getExpenseAnalysis();
} 
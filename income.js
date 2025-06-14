// ===== INCOME PAGE FUNCTIONALITY =====

let incomeCount = 0;
let incomeData = {
    salary: [],
    rental: [],
    dividend: [],
    interest: [],
    otherIncome: []
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        loadIncomeData();
        calculateAutoIncomeFromNetWorth();
        
        // Setup navigation system - use safer timing
        if (typeof safeSetupNavigation === 'function') {
            safeSetupNavigation(3); // 3 = Income page
        } else if (typeof setupPageNavigation === 'function') {
            setTimeout(() => setupPageNavigation(3), 200);
        }
    });
});

// Add income item
function addIncomeItem(category, type) {
    incomeCount++;
    const container = document.getElementById(category + 'Items');
    const incomeItem = document.createElement('div');
    incomeItem.className = 'item-card';
    
    let frequencyOptions = '';
    if (category === 'salary') {
        frequencyOptions = `
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
        `;
    } else {
        frequencyOptions = `
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
        `;
    }
    
    incomeItem.innerHTML = `
        <div class="form-group">
            <label>${type} Source</label>
            <input type="text" placeholder="Enter source name" onchange="calculateTotals()">
            <div class="amount-display"></div>
        </div>
        <div class="form-group">
            <label>Amount (₹)</label>
            <input type="number" placeholder="0" onchange="calculateTotals(); updateAmountDisplay(this)">
            <div class="amount-display"></div>
        </div>
        <div class="form-group">
            <label>Frequency</label>
            <select onchange="calculateTotals()">
                <option value="">Select Frequency</option>
                ${frequencyOptions}
            </select>
        </div>
        <button class="delete-btn" onclick="removeIncomeItem(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    container.appendChild(incomeItem);
    saveIncomeData();
}

// Remove income item
function removeIncomeItem(button) {
    button.closest('.item-card').remove();
    calculateTotals();
    saveIncomeData();
}

// Calculate auto income from net worth data
function calculateAutoIncomeFromNetWorth() {
    // Get asset income data calculated from networth page
    const assetIncomeData = JSON.parse(localStorage.getItem('assetIncomeData') || '{}');
    
    let autoEquityYield = assetIncomeData.dividendIncome || 0;
    let autoFixedIncomeYield = assetIncomeData.interestIncome || 0;
    let autoRentalYield = assetIncomeData.rentalIncome || 0;
    
    // Update auto-calculated displays
    document.getElementById('autoEquityYield').textContent = formatNumber(autoEquityYield);
    document.getElementById('autoFixedIncomeYield').textContent = formatNumber(autoFixedIncomeYield);
    document.getElementById('autoRentalYield').textContent = formatNumber(autoRentalYield);
    
    // Store auto-calculated values for total calculations
    incomeData.autoEquityYield = autoEquityYield;
    incomeData.autoFixedIncomeYield = autoFixedIncomeYield;
    incomeData.autoRentalYield = autoRentalYield;
    
    calculateTotals();
}

// Calculate totals
function calculateTotals() {
    let monthlyTotal = 0;
    let annualTotal = 0;
    
    // Calculate category totals
    const categories = ['salary', 'rental', 'dividend', 'interest', 'otherIncome'];
    
    categories.forEach(category => {
        let categoryMonthly = 0;
        let categoryAnnual = 0;
        
        const items = document.querySelectorAll(`#${category}Items .item-card`);
        items.forEach(item => {
            const amount = parseFloat(item.querySelector('input[type="number"]').value) || 0;
            const frequency = item.querySelector('select').value;
            
            if (amount > 0 && frequency) {
                let monthlyAmount = 0;
                
                switch (frequency) {
                    case 'monthly':
                        monthlyAmount = amount;
                        break;
                    case 'quarterly':
                        monthlyAmount = amount / 3;
                        break;
                    case 'annual':
                        monthlyAmount = amount / 12;
                        break;
                }
                
                categoryMonthly += monthlyAmount;
                categoryAnnual += monthlyAmount * 12;
            }
        });
        
        // Add auto-calculated income
        if (category === 'dividend' && incomeData.autoEquityYield) {
            categoryAnnual += incomeData.autoEquityYield;
            categoryMonthly += incomeData.autoEquityYield / 12;
        }
        
        if (category === 'interest' && incomeData.autoFixedIncomeYield) {
            categoryAnnual += incomeData.autoFixedIncomeYield;
            categoryMonthly += incomeData.autoFixedIncomeYield / 12;
        }
        
        if (category === 'rental' && incomeData.autoRentalYield) {
            categoryAnnual += incomeData.autoRentalYield;
            categoryMonthly += incomeData.autoRentalYield / 12;
        }
        
        // Update category totals
        const totalElement = document.getElementById(category + 'Total');
        if (totalElement) {
            totalElement.textContent = formatCurrency(categoryAnnual);
        }
        
        monthlyTotal += categoryMonthly;
        annualTotal += categoryAnnual;
    });
    
    // Update summary totals
    document.getElementById('monthlyTotal').textContent = formatCurrency(monthlyTotal);
    document.getElementById('annualTotal').textContent = formatCurrency(annualTotal);
    
    // Calculate total asset yield income
    const totalAssetYield = (incomeData.autoEquityYield || 0) + 
                           (incomeData.autoFixedIncomeYield || 0) + 
                           (incomeData.autoRentalYield || 0);
    document.getElementById('assetYieldTotal').textContent = formatCurrency(totalAssetYield);
    
    // Auto-save after calculation
    setTimeout(() => {
        saveIncomeData();
    }, 1000);
}

// Save income data
function saveIncomeData() {
    const data = {
        income: {},
        autoCalculated: {
            equityYield: incomeData.autoEquityYield || 0,
            fixedIncomeYield: incomeData.autoFixedIncomeYield || 0,
            rentalYield: incomeData.autoRentalYield || 0
        },
        totals: {
            monthlyTotal: parseCurrency(document.getElementById('monthlyTotal').textContent),
            annualTotal: parseCurrency(document.getElementById('annualTotal').textContent),
            assetYieldTotal: parseCurrency(document.getElementById('assetYieldTotal').textContent)
        }
    };
    
    // Save income by category
    const categories = ['salary', 'rental', 'dividend', 'interest', 'otherIncome'];
    categories.forEach(category => {
        data.income[category] = [];
        const items = document.querySelectorAll(`#${category}Items .item-card`);
        items.forEach(item => {
            const inputs = item.querySelectorAll('input');
            const select = item.querySelector('select');
            
            if (inputs.length >= 2) {
                const source = inputs[0].value;
                const amount = parseFloat(inputs[1].value) || 0;
                const frequency = select.value;
                
                if (source && amount > 0 && frequency) {
                    data.income[category].push({
                        source: source,
                        amount: amount,
                        frequency: frequency
                    });
                }
            }
        });
    });
    
    Storage.set('incomeData', data);
}

// Load income data
function loadIncomeData() {
    const savedData = Storage.get('incomeData', {});
    
    if (savedData.income) {
        // Clear existing items first to prevent duplication
        const categories = ['salary', 'rental', 'dividend', 'interest', 'otherIncome'];
        categories.forEach(category => {
            const container = document.getElementById(category + 'Items');
            if (container) {
                container.innerHTML = '';
            }
        });
        
        // Load income items
        Object.keys(savedData.income).forEach(category => {
            savedData.income[category].forEach(income => {
                const typeName = getIncomeTypeName(category);
                addIncomeItem(category, typeName);
                
                const lastItem = document.querySelector(`#${category}Items .item-card:last-child`);
                if (lastItem) {
                    const inputs = lastItem.querySelectorAll('input');
                    const select = lastItem.querySelector('select');
                    
                    inputs[0].value = income.source;
                    inputs[1].value = income.amount;
                    select.value = income.frequency;
                    
                    updateAmountDisplay(inputs[1]);
                }
            });
        });
    }
    
    // Load auto-calculated values if available
    if (savedData.autoCalculated) {
        incomeData.autoEquityYield = savedData.autoCalculated.equityYield;
        incomeData.autoFixedIncomeYield = savedData.autoCalculated.fixedIncomeYield;
        incomeData.autoRentalYield = savedData.autoCalculated.rentalYield;
    }
    
    calculateTotals();
}

// Get income type name
function getIncomeTypeName(category) {
    const typeNames = {
        salary: 'Salary/Pension',
        rental: 'Rental Income',
        dividend: 'Dividend Income',
        interest: 'Interest Income',
        otherIncome: 'Other Income'
    };
    return typeNames[category] || 'Income';
}

// Navigation functions
function goBack() {
    navigateToPage('networth.html', saveIncomeData);
}

function goNext() {
    if (!validateIncomeData()) {
        showStatus('Please fill in at least one income source', 'error');
        return;
    }
    navigateToPage('expenses.html', saveIncomeData);
}

// Validate income data
function validateIncomeData() {
    // Check if at least one income source is filled
    let hasIncome = false;
    const categories = ['salary', 'rental', 'dividend', 'interest', 'otherIncome'];
    
    categories.forEach(category => {
        const items = document.querySelectorAll(`#${category}Items .item-card`);
        items.forEach(item => {
            const amount = parseFloat(item.querySelector('input[type="number"]').value) || 0;
            const frequency = item.querySelector('select').value;
            if (amount > 0 && frequency) {
                hasIncome = true;
            }
        });
    });
    
    // Also check auto-calculated income
    if (incomeData.autoEquityYield > 0 || incomeData.autoFixedIncomeYield > 0 || incomeData.autoRentalYield > 0) {
        hasIncome = true;
    }
    
    return hasIncome;
}

// ===== INCOME ANALYSIS FUNCTIONS =====

// Get income breakdown
function getIncomeBreakdown() {
    const totalAnnual = parseCurrency(document.getElementById('annualTotal').textContent);
    
    if (totalAnnual === 0) return null;
    
    const breakdown = {
        salary: parseCurrency(document.getElementById('salaryTotal').textContent),
        rental: parseCurrency(document.getElementById('rentalTotal').textContent),
        dividend: parseCurrency(document.getElementById('dividendTotal').textContent),
        interest: parseCurrency(document.getElementById('interestTotal').textContent),
        other: parseCurrency(document.getElementById('otherIncomeTotal').textContent)
    };
    
    // Calculate percentages
    Object.keys(breakdown).forEach(key => {
        breakdown[key + 'Percentage'] = calculatePercentage(breakdown[key], totalAnnual);
    });
    
    return breakdown;
}

// Get income stability score
function getIncomeStabilityScore() {
    const breakdown = getIncomeBreakdown();
    if (!breakdown) return 0;
    
    let stabilityScore = 0;
    const totalIncome = parseCurrency(document.getElementById('annualTotal').textContent);
    
    // Salary/Pension is most stable (weight: 1.0)
    stabilityScore += (breakdown.salary / totalIncome) * 100;
    
    // Interest income is very stable (weight: 0.9)
    stabilityScore += (breakdown.interest / totalIncome) * 90;
    
    // Rental income is moderately stable (weight: 0.7)
    stabilityScore += (breakdown.rental / totalIncome) * 70;
    
    // Dividend income is less stable (weight: 0.5)
    stabilityScore += (breakdown.dividend / totalIncome) * 50;
    
    // Other income is least stable (weight: 0.3)
    stabilityScore += (breakdown.other / totalIncome) * 30;
    
    return Math.round(stabilityScore);
}

// Export income data for other modules
function getIncomeData() {
    return {
        monthlyTotal: parseCurrency(document.getElementById('monthlyTotal').textContent),
        annualTotal: parseCurrency(document.getElementById('annualTotal').textContent),
        breakdown: getIncomeBreakdown(),
        stabilityScore: getIncomeStabilityScore(),
        autoCalculated: {
            equityYield: incomeData.autoEquityYield || 0,
            fixedIncomeYield: incomeData.autoFixedIncomeYield || 0,
            rentalYield: incomeData.autoRentalYield || 0
        }
    };
} 
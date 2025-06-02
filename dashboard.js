document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialization started');
    
    // Initial load
    loadDashboardData();
    
    // Listen for updates from other pages
    window.addEventListener('storage', loadDashboardData);
    window.addEventListener('localStorageUpdated', loadDashboardData);
});

function loadDashboardData() {
    // Load data from localStorage
    const netWorthData = getFromLocalStorage('netWorthValues') || {};
    const incomeData = getFromLocalStorage('incomeValues') || {};
    const expenseData = getFromLocalStorage('expenseValues') || {};
    
    // Calculate and update summaries
    updateNetWorthSummary(netWorthData);
    updateIncomeSummary(incomeData);
    updateExpenseSummary(expenseData);
    updateFinancialMetrics();
}

function updateNetWorthSummary(data) {
    let totalAssets = calculateTotalAssets(data);
    let totalLiabilities = calculateTotalLiabilities(data);
    let netWorth = totalAssets - totalLiabilities;
    
    updateDisplay('totalAssets', totalAssets);
    updateDisplay('totalLiabilities', totalLiabilities);
    updateDisplay('netWorth', netWorth);
    
    updateWordsDisplay('totalAssetsWords', totalAssets);
    updateWordsDisplay('totalLiabilitiesWords', totalLiabilities);
    updateWordsDisplay('netWorthWords', netWorth);
}

function calculateTotalAssets(data) {
    let total = 0;
    
    // Real Estate
    ['primaryResidence', 'otherProperties'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Investments
    ['stocks', 'mutualFunds', 'bonds', 'ppf', 'epf', 'nps'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Cash & Equivalents
    ['bankBalance', 'cashInHand'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Other Assets
    ['gold', 'vehicle', 'otherAssets'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Custom assets
    if (data.customAssets) {
        data.customAssets.forEach(item => {
            total += parseFloat(item.value || 0);
        });
    }
    
    return total;
}

function calculateTotalLiabilities(data) {
    let total = 0;
    
    // Loans
    ['homeLoan', 'carLoan', 'personalLoan', 'educationLoan'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Credit Card Debt
    total += parseFloat(data.creditCardDebt || 0);
    
    // Custom liabilities
    if (data.customLiabilities) {
        data.customLiabilities.forEach(item => {
            total += parseFloat(item.value || 0);
        });
    }
    
    return total;
}

function updateIncomeSummary(data) {
    let monthlyIncome = calculateMonthlyIncome(data);
    let annualIncome = monthlyIncome * 12;
    
    updateDisplay('monthlyIncome', monthlyIncome);
    updateDisplay('annualIncome', annualIncome);
    
    updateWordsDisplay('monthlyIncomeWords', monthlyIncome);
    updateWordsDisplay('annualIncomeWords', annualIncome);
}

function calculateMonthlyIncome(data) {
    let total = 0;
    
    // Salary
    total += parseFloat(data.salary || 0);
    
    // Rental Income
    total += parseFloat(data.rentalIncome || 0);
    
    // Business Income
    total += parseFloat(data.businessIncome || 0);
    
    // Investment Income (monthly equivalent)
    const annualInvestmentIncome = calculateAnnualInvestmentIncome(data);
    total += annualInvestmentIncome / 12;
    
    // Custom income
    if (data.customIncome) {
        data.customIncome.forEach(item => {
            total += parseFloat(item.value || 0);
        });
    }
    
    return total;
}

function calculateAnnualInvestmentIncome(data) {
    let total = 0;
    
    // Dividend Income
    total += (parseFloat(data.stocks || 0) * (parseFloat(data.stockYield || 0) / 100));
    total += (parseFloat(data.mutualFunds || 0) * (parseFloat(data.mutualFundYield || 0) / 100));
    
    // Interest Income
    total += (parseFloat(data.bonds || 0) * (parseFloat(data.bondYield || 0) / 100));
    total += (parseFloat(data.ppf || 0) * (parseFloat(data.ppfYield || 0) / 100));
    total += (parseFloat(data.epf || 0) * (parseFloat(data.epfYield || 0) / 100));
    total += (parseFloat(data.nps || 0) * (parseFloat(data.npsYield || 0) / 100));
    
    return total;
}

function updateExpenseSummary(data) {
    // Calculate monthly recurring expenses
    let monthlyRecurring = calculateMonthlyRecurring(data);
    
    // Calculate monthly share of big expenses
    let annualBigExpenses = calculateAnnualBigExpenses(data);
    let monthlyBigExpenses = annualBigExpenses / 12;
    
    // Calculate totals
    let totalMonthlyExpenses = monthlyRecurring + monthlyBigExpenses;
    let annualExpenses = totalMonthlyExpenses * 12;
    
    // Update displays
    updateDisplay('monthlyRecurringExpenses', monthlyRecurring);
    updateDisplay('monthlyBigExpenseShare', monthlyBigExpenses);
    updateDisplay('totalMonthlyExpenses', totalMonthlyExpenses);
    updateDisplay('annualExpenses', annualExpenses);
    
    updateWordsDisplay('monthlyRecurringExpensesWords', monthlyRecurring);
    updateWordsDisplay('monthlyBigExpenseShareWords', monthlyBigExpenses);
    updateWordsDisplay('totalMonthlyExpensesWords', totalMonthlyExpenses);
    updateWordsDisplay('annualExpensesWords', annualExpenses);
}

function calculateMonthlyRecurring(data) {
    let total = 0;
    
    // Regular monthly expenses
    ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining', 'carEMI', 'homeEMI'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Custom monthly expenses
    if (data.monthly) {
        data.monthly.forEach(item => {
            total += parseFloat(item.value || 0);
        });
    }
    
    return total;
}

function calculateAnnualBigExpenses(data) {
    let total = 0;
    
    // Regular big expenses
    ['electronics', 'vacations', 'medical', 'education', 'vehicle'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Custom big expenses
    if (data.big) {
        data.big.forEach(item => {
            total += parseFloat(item.value || 0);
        });
    }
    
    return total;
}

function updateFinancialMetrics() {
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').textContent.replace(/[₹,]/g, '')) || 0;
    const monthlyExpenses = parseFloat(document.getElementById('totalMonthlyExpenses').textContent.replace(/[₹,]/g, '')) || 0;
    const netWorth = parseFloat(document.getElementById('netWorth').textContent.replace(/[₹,]/g, '')) || 0;
    
    // Calculate savings rate
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    
    // Calculate expense coverage (months of expenses that can be covered by net worth)
    const expenseCoverage = monthlyExpenses > 0 ? netWorth / monthlyExpenses : 0;
    
    // Update metrics display
    updateDisplay('monthlySavings', monthlySavings);
    updateDisplay('savingsRate', savingsRate, true); // true for percentage
    updateDisplay('expenseCoverage', expenseCoverage, false, true); // true for months
    
    updateWordsDisplay('monthlySavingsWords', monthlySavings);
}

function updateDisplay(elementId, value, isPercentage = false, isMonths = false) {
    const element = document.getElementById(elementId);
    if (element) {
        if (isPercentage) {
            element.textContent = value.toFixed(1) + '%';
        } else if (isMonths) {
            element.textContent = value.toFixed(1) + ' months';
        } else {
            element.textContent = formatCurrency(value);
        }
    }
}

function updateWordsDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `₹${numberToWords(value)}`;
    }
}

function formatCurrency(amount) {
    return amount.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    });
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

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return null;
    }
} 
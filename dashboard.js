/**
 * Financial Dashboard Module
 * Handles real-time visualization and analysis of financial data including assets,
 * liabilities, income, expenses, and key financial metrics
 */

// Constants and Configuration
const CHART_CONFIG = {
    ASSETS: {
        title: 'Asset Distribution',
        colors: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0'],
        categories: {
            'Real Estate': ['buildings', 'plots', 'land'],
            'Investments': ['directEquity', 'equityMF', 'debtMF'],
            'Fixed Income': ['fixedDeposits', 'otherFixedIncome'],
            'Cash & Equivalents': ['cashAtBank', 'cashInHand']
        }
    },
    LIABILITIES: {
        title: 'Liability Distribution',
        colors: ['#F44336', '#FF5722', '#E91E63', '#9C27B0', '#673AB7'],
        categories: {
            'Home Loan': 'homeLoan',
            'Car Loan': 'carLoan',
            'Credit Card': 'creditCard',
            'Education Loan': 'educationLoan'
        }
    },
    INCOME: {
        title: 'Income Distribution',
        colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'],
        categories: {
            'Salary': 'salary',
            'Rental': 'rental',
            'Dividend': 'dividend',
            'Interest': 'interest',
            'Additional': 'fixed'
        }
    },
    EXPENSES: {
        title: 'Expense Distribution',
        colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3'],
        monthlyCategories: {
            'Groceries': 'groceries',
            'Utilities': 'utilities',
            'Subscriptions': 'subscriptions',
            'Shopping': 'shopping',
            'Dining': 'dining',
            'EMIs': ['carEMI', 'homeEMI']
        },
        annualCategories: {
            'Electronics': 'electronics',
            'Vacations': 'vacations',
            'Medical': 'medical',
            'Education': 'education',
            'Vehicle': 'vehicle'
        }
    }
};

const THRESHOLDS = {
    SAVING_RATE: {
        good: 30,    // >= 30% is good
        warning: 15, // 15-29% is warning
        danger: 0    // < 15% is danger
    },
    LIABILITY_RATIO: {
        good: 40,    // < 40% is good
        warning: 80, // 40-80% is warning
        danger: 100  // > 80% is danger
    }
};

// Main Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialization started');
    initializeDashboard();
});

function initializeDashboard() {
    setupEventListeners();
    updateDashboard();
}

// Setup Functions
function setupEventListeners() {
    // Listen for updates from other pages
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdated', updateDashboard);
}

// Event Handlers
function handleStorageChange(event) {
    if (['networthValues', 'incomeValues', 'expenseValues'].includes(event.key)) {
        updateDashboard();
    }
}

// Dashboard Update Functions
function updateDashboard() {
    try {
        console.log('Updating dashboard...');
        
        // Get data from all modules
        const data = {
            netWorth: getFromLocalStorage('networthValues') || {},
            income: getFromLocalStorage('incomeValues') || {},
            expenses: getFromLocalStorage('expenseValues') || {}
        };
        
        // Update all sections
        updateAssetSection(data.netWorth);
        updateLiabilitySection(data.netWorth);
        updateIncomeSection(data.income);
        updateExpenseSection(data.expenses);
        updateFinancialSummary(data);
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// Section Update Functions
function updateAssetSection(data) {
    // Calculate asset distribution
    const assetData = calculateAssetDistribution(data);
    const totalAssets = Object.values(assetData).reduce((a, b) => a + b, 0);
    
    // Update displays
    updateDisplay('totalAssets', totalAssets);
    updateWordsDisplay('totalAssetsWords', totalAssets);
    
    // Create/Update chart
    createPieChart('assetChart', assetData, {
        title: CHART_CONFIG.ASSETS.title,
        colors: CHART_CONFIG.ASSETS.colors
    });
}

function updateLiabilitySection(data) {
    // Calculate liability distribution
    const liabilityData = calculateLiabilityDistribution(data);
    const totalLiabilities = Object.values(liabilityData).reduce((a, b) => a + b, 0);
    
    // Update displays
    updateDisplay('totalLiabilities', totalLiabilities);
    updateWordsDisplay('totalLiabilitiesWords', totalLiabilities);
    
    // Create/Update chart
    createPieChart('liabilityChart', liabilityData, {
        title: CHART_CONFIG.LIABILITIES.title,
        colors: CHART_CONFIG.LIABILITIES.colors
    });
}

function updateIncomeSection(data) {
    // Calculate income distribution
    const incomeData = calculateIncomeDistribution(data);
    const totalIncome = Object.values(incomeData).reduce((a, b) => a + b, 0);
    
    // Update displays
    updateDisplay('totalIncome', totalIncome);
    updateWordsDisplay('totalIncomeWords', totalIncome);
    
    // Create/Update chart
    createPieChart('incomeChart', incomeData, {
        title: CHART_CONFIG.INCOME.title,
        colors: CHART_CONFIG.INCOME.colors
    });
    
    return totalIncome;
}

function updateExpenseSection(data) {
    // Calculate expense distribution
    const expenseData = calculateExpenseDistribution(data);
    const totalExpenses = Object.values(expenseData).reduce((a, b) => a + b, 0);
    
    // Update displays
    updateDisplay('totalExpenses', totalExpenses);
    updateWordsDisplay('totalExpensesWords', totalExpenses);
    
    // Create/Update chart
    createPieChart('expenseChart', expenseData, {
        title: CHART_CONFIG.EXPENSES.title,
        colors: CHART_CONFIG.EXPENSES.colors
    });
    
    return totalExpenses;
}

function updateFinancialSummary(data) {
    // Calculate key metrics
    const metrics = calculateFinancialMetrics(data);
    
    // Update savings displays
    updateDisplay('monthlySavings', metrics.monthlySavings);
    updateWordsDisplay('monthlySavingsWords', metrics.monthlySavings);
    updateDisplay('annualSavings', metrics.annualSavings);
    updateWordsDisplay('annualSavingsWords', metrics.annualSavings);
    
    // Update saving rate
    document.getElementById('savingRate').textContent = metrics.savingRate.toFixed(1) + '%';
    updateProgressBar('savingRateProgress', metrics.savingRate, THRESHOLDS.SAVING_RATE);
    
    // Update liability ratio
    document.getElementById('liabilityRatio').textContent = metrics.liabilityRatio.toFixed(1) + '%';
    updateProgressBar('liabilityRatioProgress', metrics.liabilityRatio, THRESHOLDS.LIABILITY_RATIO);
}

// Calculation Functions
function calculateAssetDistribution(data) {
    const distribution = {};
    
    // Calculate for each category
    Object.entries(CHART_CONFIG.ASSETS.categories).forEach(([category, fields]) => {
        distribution[category] = fields.reduce((total, field) => {
            return total + parseFloat(data[field] || 0);
        }, 0);
    });
    
    // Add custom assets
    if (data.customAssets?.length > 0) {
        distribution['Other Assets'] = data.customAssets.reduce((total, asset) => {
            return total + parseFloat(asset.value || 0);
        }, 0);
    }
    
    return distribution;
}

function calculateLiabilityDistribution(data) {
    const distribution = {};
    
    // Calculate for each category
    Object.entries(CHART_CONFIG.LIABILITIES.categories).forEach(([category, field]) => {
        distribution[category] = parseFloat(data[field] || 0);
    });
    
    // Add custom liabilities
    if (data.customLiabilities?.length > 0) {
        distribution['Other Liabilities'] = data.customLiabilities.reduce((total, liability) => {
            return total + parseFloat(liability.value || 0);
        }, 0);
    }
    
    return distribution;
}

function calculateIncomeDistribution(data) {
    const distribution = {};
    
    // Calculate for each category
    Object.entries(CHART_CONFIG.INCOME.categories).forEach(([category, field]) => {
        distribution[category] = parseFloat(data[field] || 0);
    });
    
    // Add custom income sources
    if (data.customSources?.length > 0) {
        distribution['Other Income'] = data.customSources.reduce((total, source) => {
            return total + parseFloat(source.value || 0);
        }, 0);
    }
    
    return distribution;
}

function calculateExpenseDistribution(data) {
    const distribution = {};
    
    // Calculate monthly expenses
    Object.entries(CHART_CONFIG.EXPENSES.monthlyCategories).forEach(([category, fields]) => {
        if (Array.isArray(fields)) {
            distribution[category] = fields.reduce((total, field) => {
                return total + parseFloat(data[field] || 0);
            }, 0);
        } else {
            distribution[category] = parseFloat(data[fields] || 0);
        }
    });
    
    // Calculate monthly share of annual expenses
    Object.entries(CHART_CONFIG.EXPENSES.annualCategories).forEach(([category, field]) => {
        distribution[category + ' (Monthly)'] = parseFloat(data[field] || 0) / 12;
    });
    
    // Add custom expenses
    if (data.monthly?.length > 0) {
        distribution['Other Monthly'] = data.monthly.reduce((total, expense) => {
            return total + parseFloat(expense.value || 0);
        }, 0);
    }
    
    if (data.big?.length > 0) {
        distribution['Other Annual (Monthly)'] = data.big.reduce((total, expense) => {
            return total + parseFloat(expense.value || 0) / 12;
        }, 0);
    }
    
    return distribution;
}

function calculateFinancialMetrics(data) {
    // Calculate income and expenses
    const monthlyIncome = updateIncomeSection(data.income);
    const monthlyExpenses = updateExpenseSection(data.expenses);
    
    // Calculate savings
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const annualSavings = monthlySavings * 12;
    
    // Calculate saving rate
    const savingRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    
    // Calculate liability ratio
    const { totalAssets, totalLiabilities } = calculateNetWorthFromData(data.netWorth);
    const netWorth = totalAssets - totalLiabilities;
    const liabilityRatio = netWorth > 0 ? (totalLiabilities / netWorth) * 100 : 100;
    
    return {
        monthlySavings,
        annualSavings,
        savingRate,
        liabilityRatio
    };
}

function calculateNetWorthFromData(data) {
    const totalAssets = Object.values(calculateAssetDistribution(data))
        .reduce((a, b) => a + b, 0);
    
    const totalLiabilities = Object.values(calculateLiabilityDistribution(data))
        .reduce((a, b) => a + b, 0);
    
    return { totalAssets, totalLiabilities };
}

// Chart Functions
function createPieChart(canvasId, data, options) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Filter out zero values
    const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value > 0)
    );
    
    // Calculate total for percentages
    const total = Object.values(filteredData).reduce((a, b) => a + b, 0);
    
    // Prepare chart data
    const chartData = {
        labels: Object.keys(filteredData),
        datasets: [{
            data: Object.values(filteredData),
            backgroundColor: options.colors,
            hoverOffset: 4
        }]
    };
    
    // Configure tooltips to show both amount and percentage
    const tooltipCallback = (context) => {
        const value = context.raw;
        const percentage = ((value / total) * 100).toFixed(1);
        return `${formatCurrency(value)} (${percentage}%)`;
    };
    
    // Create or update chart
    if (canvas.chart) {
        canvas.chart.data = chartData;
        canvas.chart.update();
    } else {
        canvas.chart = new Chart(canvas, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: options.title,
                        font: { size: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: tooltipCallback
                        }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            generateLabels: (chart) => {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label}: ${formatCurrency(data.datasets[0].data[i])}`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: isNaN(data.datasets[0].data[i]) || data.datasets[0].data[i] === 0,
                                    index: i
                                }));
                            }
                        }
                    }
                }
            }
        });
    }
}

// Display Functions
function updateProgressBar(elementId, value, thresholds) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Set width
    element.style.width = Math.min(100, Math.max(0, value)) + '%';
    
    // Set color based on thresholds
    if (value >= thresholds.good) {
        element.className = 'progress-bar bg-success';
    } else if (value >= thresholds.warning) {
        element.className = 'progress-bar bg-warning';
    } else {
        element.className = 'progress-bar bg-danger';
    }
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

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
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

// Storage Functions
function getFromLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
} 
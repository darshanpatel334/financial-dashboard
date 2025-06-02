document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialization started');
    
    // Initial load
    updateDashboard();
    
    // Listen for updates from other pages
    window.addEventListener('storage', updateDashboard);
    window.addEventListener('localStorageUpdated', updateDashboard);
});

function updateDashboard() {
    // Get data from other pages
    const netWorthData = getFromLocalStorage('netWorthValues') || {};
    const incomeData = getFromLocalStorage('incomeValues') || {};
    const expenseData = getFromLocalStorage('expenseValues') || {};
    
    // Calculate and update all sections
    updateAssetSection(netWorthData);
    updateLiabilitySection(netWorthData);
    updateIncomeSection(incomeData);
    updateExpenseSection(expenseData);
    updateFinancialSummary(netWorthData, incomeData, expenseData);
}

function updateAssetSection(data) {
    // Prepare asset data
    const assetData = {
        'Real Estate': calculateRealEstate(data),
        'Investments': calculateInvestments(data),
        'Cash & Equivalents': calculateCashEquivalents(data),
        'Other Assets': calculateOtherAssets(data)
    };
    
    // Calculate total assets
    const totalAssets = Object.values(assetData).reduce((a, b) => a + b, 0);
    
    // Update total display
    updateDisplay('totalAssets', totalAssets);
    updateWordsDisplay('totalAssetsWords', totalAssets);
    
    // Create/Update pie chart
    createPieChart('assetChart', assetData, {
        title: 'Asset Distribution',
        colors: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0']
    });
}

function updateLiabilitySection(data) {
    // Prepare liability data
    const liabilityData = {
        'Home Loan': parseFloat(data.homeLoan || 0),
        'Car Loan': parseFloat(data.carLoan || 0),
        'Personal Loan': parseFloat(data.personalLoan || 0),
        'Education Loan': parseFloat(data.educationLoan || 0),
        'Credit Card': parseFloat(data.creditCardDebt || 0)
    };
    
    // Add custom liabilities
    if (data.customLiabilities) {
        liabilityData['Other Liabilities'] = data.customLiabilities.reduce((total, item) => 
            total + parseFloat(item.value || 0), 0);
    }
    
    // Calculate total liabilities
    const totalLiabilities = Object.values(liabilityData).reduce((a, b) => a + b, 0);
    
    // Update total display
    updateDisplay('totalLiabilities', totalLiabilities);
    updateWordsDisplay('totalLiabilitiesWords', totalLiabilities);
    
    // Create/Update pie chart
    createPieChart('liabilityChart', liabilityData, {
        title: 'Liability Distribution',
        colors: ['#F44336', '#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5']
    });
}

function updateIncomeSection(data) {
    // Prepare income data
    const incomeData = {
        'Salary': parseFloat(data.salary || 0),
        'Business': parseFloat(data.business || 0),
        'Investments': parseFloat(data.investments || 0),
        'Rental': parseFloat(data.rental || 0),
        'Other': parseFloat(data.other || 0)
    };
    
    // Add custom income sources
    if (data.customSources) {
        incomeData['Other Sources'] = data.customSources.reduce((total, item) => 
            total + parseFloat(item.value || 0), 0);
    }
    
    // Calculate total monthly income
    const totalIncome = Object.values(incomeData).reduce((a, b) => a + b, 0);
    
    // Update total display
    updateDisplay('totalIncome', totalIncome);
    updateWordsDisplay('totalIncomeWords', totalIncome);
    
    // Create/Update pie chart
    createPieChart('incomeChart', incomeData, {
        title: 'Income Distribution',
        colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800']
    });
    
    return totalIncome;
}

function updateExpenseSection(data) {
    // Calculate monthly recurring expenses
    const monthlyExpenses = {
        'Groceries': parseFloat(data.groceries || 0),
        'Utilities': parseFloat(data.utilities || 0),
        'Subscriptions': parseFloat(data.subscriptions || 0),
        'Shopping': parseFloat(data.shopping || 0),
        'Dining': parseFloat(data.dining || 0),
        'EMIs': parseFloat(data.carEMI || 0) + parseFloat(data.homeEMI || 0)
    };
    
    // Add custom monthly expenses
    if (data.monthly) {
        monthlyExpenses['Other Monthly'] = data.monthly.reduce((total, item) => 
            total + parseFloat(item.value || 0), 0);
    }
    
    // Calculate monthly share of big expenses
    const annualExpenses = {
        'Electronics': parseFloat(data.electronics || 0),
        'Vacations': parseFloat(data.vacations || 0),
        'Medical': parseFloat(data.medical || 0),
        'Education': parseFloat(data.education || 0),
        'Vehicle': parseFloat(data.vehicle || 0)
    };
    
    // Add custom big expenses
    if (data.big) {
        annualExpenses['Other Annual'] = data.big.reduce((total, item) => 
            total + parseFloat(item.value || 0), 0);
    }
    
    // Convert annual to monthly
    const monthlyShare = {};
    Object.entries(annualExpenses).forEach(([key, value]) => {
        monthlyShare[key + ' (Monthly)'] = value / 12;
    });
    
    // Combine all monthly expenses
    const totalMonthlyExpenses = {
        ...monthlyExpenses,
        ...monthlyShare
    };
    
    // Calculate total
    const totalExpenses = Object.values(totalMonthlyExpenses).reduce((a, b) => a + b, 0);
    
    // Update total display
    updateDisplay('totalExpenses', totalExpenses);
    updateWordsDisplay('totalExpensesWords', totalExpenses);
    
    // Create/Update pie chart
    createPieChart('expenseChart', totalMonthlyExpenses, {
        title: 'Expense Distribution',
        colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', 
                '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39']
    });
    
    return totalExpenses;
}

function updateFinancialSummary(netWorthData, incomeData, expenseData) {
    // Calculate total monthly income
    const monthlyIncome = updateIncomeSection(incomeData);
    
    // Calculate total monthly expenses
    const monthlyExpenses = updateExpenseSection(expenseData);
    
    // Calculate monthly savings
    const monthlySavings = monthlyIncome - monthlyExpenses;
    updateDisplay('monthlySavings', monthlySavings);
    updateWordsDisplay('monthlySavingsWords', monthlySavings);
    
    // Calculate annual savings
    const annualSavings = monthlySavings * 12;
    updateDisplay('annualSavings', annualSavings);
    updateWordsDisplay('annualSavingsWords', annualSavings);
    
    // Calculate saving rate
    const savingRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    document.getElementById('savingRate').textContent = savingRate.toFixed(1) + '%';
    updateProgressBar('savingRateProgress', savingRate, {
        good: 30,
        warning: 15,
        danger: 0
    });
    
    // Calculate liability to net worth ratio
    const { totalAssets, totalLiabilities } = calculateNetWorthFromData(netWorthData);
    const netWorth = totalAssets - totalLiabilities;
    const liabilityRatio = netWorth > 0 ? (totalLiabilities / netWorth) * 100 : 0;
    document.getElementById('liabilityRatio').textContent = liabilityRatio.toFixed(1) + '%';
    updateProgressBar('liabilityRatioProgress', liabilityRatio, {
        good: 0,
        warning: 40,
        danger: 80
    });
}

function createPieChart(canvasId, data, options) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
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
            borderWidth: 1
        }]
    };
    
    // Destroy existing chart if it exists
    if (window[canvasId]) {
        window[canvasId].destroy();
    }
    
    // Create new chart
    window[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return {
                                        text: `${label}: ${percentage}%`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ₹${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateProgressBar(elementId, value, thresholds) {
    const progress = document.getElementById(elementId);
    progress.style.width = Math.min(value, 100) + '%';
    
    // Remove existing range classes
    progress.removeAttribute('data-range');
    
    // Set new range class
    if (value >= thresholds.good) {
        progress.setAttribute('data-range', 'good');
    } else if (value >= thresholds.warning) {
        progress.setAttribute('data-range', 'warning');
    } else {
        progress.setAttribute('data-range', 'danger');
    }
}

// Helper functions for asset calculations
function calculateRealEstate(data) {
    return parseFloat(data.primaryResidence || 0) + parseFloat(data.otherProperties || 0);
}

function calculateInvestments(data) {
    return ['stocks', 'mutualFunds', 'bonds', 'ppf', 'epf', 'nps'].reduce((total, id) => 
        total + parseFloat(data[id] || 0), 0);
}

function calculateCashEquivalents(data) {
    return parseFloat(data.bankBalance || 0) + parseFloat(data.cashInHand || 0);
}

function calculateOtherAssets(data) {
    let total = parseFloat(data.gold || 0) + parseFloat(data.vehicle || 0) + parseFloat(data.otherAssets || 0);
    if (data.customAssets) {
        total += data.customAssets.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
    }
    return total;
}

function calculateNetWorthFromData(data) {
    const totalAssets = calculateRealEstate(data) + calculateInvestments(data) + 
                       calculateCashEquivalents(data) + calculateOtherAssets(data);
    
    const totalLiabilities = ['homeLoan', 'carLoan', 'personalLoan', 'educationLoan', 'creditCardDebt']
        .reduce((total, id) => total + parseFloat(data[id] || 0), 0) + 
        (data.customLiabilities ? data.customLiabilities.reduce((total, item) => 
            total + parseFloat(item.value || 0), 0) : 0);
    
    return { totalAssets, totalLiabilities };
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
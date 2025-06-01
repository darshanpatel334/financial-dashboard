document.addEventListener('DOMContentLoaded', function() {
    // Professional color palette
    const colors = {
        blue: ['#2c3e50', '#3498db', '#2980b9', '#1abc9c', '#16a085', '#27ae60'],
        green: ['#27ae60', '#2ecc71', '#229954', '#1abc9c', '#16a085', '#2c3e50'],
        purple: ['#8e44ad', '#9b59b6', '#7d3c98', '#6c3483', '#5b2c6f', '#4a235a'],
        orange: ['#d35400', '#e67e22', '#f39c12', '#f1c40f', '#f4d03f', '#f5b041']
    };

    // Initialize charts
    initializeCharts();
    
    // Update dashboard data
    updateDashboard();
});

function initializeCharts() {
    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#fff',
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Income Chart
    const incomeCtx = document.getElementById('incomeChart').getContext('2d');
    window.incomeChart = new Chart(incomeCtx, {
        type: 'pie',
        data: {
            labels: [
                'Direct Equity Dividend',
                'Equity MF Dividend',
                'Debt MF Interest',
                'Rental Income',
                'Fixed Deposits',
                'Other Income'
            ],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: colors.blue
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                datalabels: {
                    color: '#fff',
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return percentage > 5 ? `${percentage}%` : '';
                    }
                }
            }
        }
    });

    // Expense Chart
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    window.expenseChart = new Chart(expenseCtx, {
        type: 'pie',
        data: {
            labels: ['Monthly', 'Big Expenses'],
            datasets: [{
                data: [0, 0],
                backgroundColor: colors.orange.slice(0, 2)
            }]
        },
        options: commonOptions
    });

    // Asset Chart
    const assetCtx = document.getElementById('assetChart').getContext('2d');
    window.assetChart = new Chart(assetCtx, {
        type: 'pie',
        data: {
            labels: [
                'Buildings',
                'Plots',
                'Land',
                'Direct Equity',
                'Equity MF',
                'Debt MF',
                'Fixed Deposits',
                'Gold',
                'Cash'
            ],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: colors.green
            }]
        },
        options: commonOptions
    });

    // Liability Chart
    const liabilityCtx = document.getElementById('liabilityChart').getContext('2d');
    window.liabilityChart = new Chart(liabilityCtx, {
        type: 'pie',
        data: {
            labels: ['Home Loan', 'Car Loan', 'Credit Card', 'Education Loan', 'Other'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: colors.purple
            }]
        },
        options: commonOptions
    });
}

function updateDashboard() {
    // Load saved values
    const networthValues = getFromLocalStorage('networthValues') || {};
    const expenseValues = getFromLocalStorage('expenseValues') || {};

    // Calculate category totals
    const realEstateTotal = calculateRealEstateTotal(networthValues);
    const investmentsTotal = calculateInvestmentsTotal(networthValues);
    const fixedIncomeTotal = calculateFixedIncomeTotal(networthValues);
    const goldTotal = parseFloat(networthValues.gold) || 0;
    const commodityTotal = parseFloat(networthValues.commodity) || 0;
    const cashTotal = parseFloat(networthValues.cash) || 0;
    const otherAssetsTotal = calculateCustomAssetsTotal(networthValues.customAssets || []);

    // Update category totals in UI
    document.getElementById('totalRealEstate').textContent = formatCurrency(realEstateTotal);
    document.getElementById('totalInvestments').textContent = formatCurrency(investmentsTotal);
    document.getElementById('totalFixedIncome').textContent = formatCurrency(fixedIncomeTotal);
    document.getElementById('totalGold').textContent = formatCurrency(goldTotal);
    document.getElementById('totalCommodity').textContent = formatCurrency(commodityTotal);
    document.getElementById('totalCash').textContent = formatCurrency(cashTotal);
    document.getElementById('totalOtherAssets').textContent = formatCurrency(otherAssetsTotal);

    // Calculate yields and income
    const incomeData = calculateYieldIncome(networthValues);
    updateChartData(window.incomeChart, Object.values(incomeData));

    // Update Asset Chart with new categories
    const assetData = [
        parseFloat(networthValues.buildings) || 0,
        parseFloat(networthValues.plots) || 0,
        parseFloat(networthValues.land) || 0,
        parseFloat(networthValues.directEquity) || 0,
        parseFloat(networthValues.equityMF) || 0,
        parseFloat(networthValues.debtMF) || 0,
        parseFloat(networthValues.fixedDeposits) || 0,
        parseFloat(networthValues.otherFixedIncome) || 0,
        parseFloat(networthValues.gold) || 0,
        parseFloat(networthValues.commodity) || 0,
        parseFloat(networthValues.cash) || 0
    ];
    updateChartData(window.assetChart, assetData);

    // Update other calculations as before
    const totalAssets = assetData.reduce((a, b) => a + b, 0) + otherAssetsTotal;
    const totalLiabilities = calculateTotalLiabilities(networthValues);
    const netWorth = totalAssets - totalLiabilities;
    const totalAnnualIncome = Object.values(incomeData).reduce((a, b) => a + b, 0);
    const totalMonthlyIncome = totalAnnualIncome / 12;
    const totalMonthlyExpenses = calculateTotalMonthlyExpenses(expenseValues);
    const monthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
    const savingsRate = totalMonthlyIncome > 0 ? (monthlySavings / totalMonthlyIncome * 100) : 0;

    // Update summary values
    document.getElementById('totalIncome').textContent = `${formatCurrency(totalMonthlyIncome)} / month`;
    document.getElementById('totalExpenses').textContent = `${formatCurrency(totalMonthlyExpenses)} / month`;
    document.getElementById('totalAssets').textContent = formatCurrency(totalAssets);
    document.getElementById('totalLiabilities').textContent = formatCurrency(totalLiabilities);
    document.getElementById('netWorth').textContent = formatCurrency(netWorth);
    document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
    document.getElementById('ffScore').textContent = calculateFFScore(netWorth, totalMonthlyExpenses);
    document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(1)}%`;
}

function calculateYieldIncome(values) {
    return {
        directEquityDividend: (parseFloat(values.directEquity) || 0) * (parseFloat(values.directEquityYield) || 0) / 100,
        equityMFDividend: (parseFloat(values.equityMF) || 0) * (parseFloat(values.equityMFYield) || 0) / 100,
        debtMFInterest: (parseFloat(values.debtMF) || 0) * (parseFloat(values.debtMFYield) || 0) / 100,
        fixedDepositsInterest: (parseFloat(values.fixedDeposits) || 0) * (parseFloat(values.fixedDepositsYield) || 0) / 100,
        otherFixedIncome: (parseFloat(values.otherFixedIncome) || 0) * (parseFloat(values.otherFixedIncomeYield) || 0) / 100,
        commodityIncome: (parseFloat(values.commodity) || 0) * (parseFloat(values.commodityYield) || 0) / 100,
        rentalIncome: calculateRentalIncome(values)
    };
}

function calculateRentalIncome(values) {
    const buildingsRent = (parseFloat(values.buildings) || 0) * (parseFloat(values.buildingsYield) || 0) / 100;
    const plotsRent = (parseFloat(values.plots) || 0) * (parseFloat(values.plotsYield) || 0) / 100;
    const landRent = (parseFloat(values.land) || 0) * (parseFloat(values.landYield) || 0) / 100;
    return buildingsRent + plotsRent + landRent;
}

function calculateFFScore(netWorth, monthlyExpenses) {
    if (monthlyExpenses <= 0) return 'N/A';
    const years = (netWorth / (monthlyExpenses * 12)).toFixed(1);
    return `${years} years`;
}

function updateChartData(chart, newData) {
    chart.data.datasets[0].data = newData;
    chart.update();
}

function calculateMonthlyExpenses(values) {
    const regularExpenses = ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining'];
    const total = regularExpenses.reduce((sum, key) => sum + (parseFloat(values[key]) || 0), 0);
    return total + calculateCustomExpenses(values.monthly || []);
}

function calculateBigExpenses(values) {
    const bigExpenses = ['carEMI', 'homeEMI', 'electronics', 'vacations'];
    const total = bigExpenses.reduce((sum, key) => sum + (parseFloat(values[key]) || 0), 0);
    return total + calculateCustomExpenses(values.big || []);
}

function calculateCustomExpenses(items) {
    return items.reduce((total, item) => total + (parseFloat(item.value) || 0), 0);
}

function calculateCustomLiabilities(items) {
    return items.reduce((total, item) => total + (parseFloat(item.value) || 0), 0);
}

function calculateRealEstateTotal(values) {
    return (
        (parseFloat(values.buildings) || 0) +
        (parseFloat(values.plots) || 0) +
        (parseFloat(values.land) || 0)
    );
}

function calculateInvestmentsTotal(values) {
    return (
        (parseFloat(values.directEquity) || 0) +
        (parseFloat(values.equityMF) || 0) +
        (parseFloat(values.debtMF) || 0)
    );
}

function calculateFixedIncomeTotal(values) {
    return (
        (parseFloat(values.fixedDeposits) || 0) +
        (parseFloat(values.otherFixedIncome) || 0)
    );
}

function calculateCustomAssetsTotal(items) {
    return items.reduce((total, item) => total + (parseFloat(item.value) || 0), 0);
}

function calculateTotalMonthlyExpenses(values) {
    const monthlyExpenses = calculateMonthlyExpenses(values);
    const bigExpenses = calculateBigExpenses(values);
    return monthlyExpenses + (bigExpenses / 12);
}

function calculateTotalLiabilities(values) {
    return (
        (parseFloat(values.homeLoan) || 0) +
        (parseFloat(values.carLoan) || 0) +
        (parseFloat(values.creditCard) || 0) +
        (parseFloat(values.educationLoan) || 0) +
        calculateCustomLiabilities(values.liabilities || [])
    );
} 
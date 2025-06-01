document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialization started');
    
    // Professional color palette
    const colors = {
        blue: ['#3498db', '#2980b9', '#1abc9c', '#16a085', '#27ae60', '#2c3e50'],
        green: ['#2ecc71', '#27ae60', '#229954', '#1abc9c', '#16a085', '#2c3e50'],
        purple: ['#9b59b6', '#8e44ad', '#7d3c98', '#6c3483', '#5b2c6f', '#4a235a'],
        orange: ['#e67e22', '#d35400', '#f39c12', '#f1c40f', '#f4d03f', '#f5b041']
    };

    try {
        // Check if Chart is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        console.log('Chart.js is loaded');

        // Register Chart.js plugins
        Chart.register(ChartDataLabels);
        console.log('ChartDataLabels plugin registered');

        // Initialize charts
        initializeCharts(colors);
        console.log('Charts initialized');
        
        // Update dashboard data
        updateDashboard();
        console.log('Dashboard updated');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
});

function initializeCharts(colors) {
    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#1a2942',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            datalabels: {
                color: '#ffffff',
                font: {
                    weight: 'bold',
                    size: 12
                },
                formatter: (value, ctx) => {
                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return percentage > 5 ? `${percentage}%` : '';
                },
                textStrokeColor: 'rgba(0,0,0,0.5)',
                textStrokeWidth: 2
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    }
                }
            }
        }
    };

    try {
        // Income Chart
        const incomeCtx = document.getElementById('incomeChart');
        if (!incomeCtx) {
            console.error('Income chart canvas not found');
            return;
        }
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
            options: commonOptions
        });

        // Expense Chart
        const expenseCtx = document.getElementById('expenseChart');
        if (!expenseCtx) {
            console.error('Expense chart canvas not found');
            return;
        }
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
        const assetCtx = document.getElementById('assetChart');
        if (!assetCtx) {
            console.error('Asset chart canvas not found');
            return;
        }
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
        const liabilityCtx = document.getElementById('liabilityChart');
        if (!liabilityCtx) {
            console.error('Liability chart canvas not found');
            return;
        }
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
        
        console.log('All charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

function updateDashboard() {
    console.log('Starting dashboard update');
    
    try {
        // Load saved values
        const networthValues = getFromLocalStorage('networthValues') || {};
        const expenseValues = getFromLocalStorage('expenseValues') || {};
        
        console.log('Loaded values:', { networthValues, expenseValues });

        // Calculate totals
        const totalAssets = calculateTotalAssets(networthValues);
        const totalLiabilities = calculateTotalLiabilities(networthValues);
        const netWorth = totalAssets - totalLiabilities;
        
        // Calculate income and expenses
        const monthlyIncome = calculateMonthlyIncome(networthValues);
        const monthlyExpenses = calculateTotalMonthlyExpenses(expenseValues);
        const monthlySavings = monthlyIncome - monthlyExpenses;
        const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome * 100) : 0;

        // Update summary values
        document.getElementById('totalIncome').textContent = formatCurrency(monthlyIncome) + ' / month';
        document.getElementById('totalExpenses').textContent = formatCurrency(monthlyExpenses) + ' / month';
        document.getElementById('totalAssets').textContent = formatCurrency(totalAssets);
        document.getElementById('totalLiabilities').textContent = formatCurrency(totalLiabilities);
        document.getElementById('netWorth').textContent = formatCurrency(netWorth);
        document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
        document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(1)}%`;
        document.getElementById('ffScore').textContent = calculateFFScore(netWorth, monthlyExpenses);

        // Update charts
        updateCharts(networthValues, expenseValues);
        
        console.log('Dashboard updated successfully');
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
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

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return null;
    }
}

function calculateTotalAssets(values) {
    return (
        parseFloat(values.buildings || 0) +
        parseFloat(values.plots || 0) +
        parseFloat(values.land || 0) +
        parseFloat(values.directEquity || 0) +
        parseFloat(values.equityMF || 0) +
        parseFloat(values.debtMF || 0) +
        parseFloat(values.fixedDeposits || 0) +
        parseFloat(values.gold || 0) +
        parseFloat(values.cash || 0) +
        (values.customAssets || []).reduce((sum, item) => sum + parseFloat(item.value || 0), 0)
    );
}

function calculateMonthlyIncome(values) {
    const annualIncome = (
        (parseFloat(values.directEquity || 0) * (parseFloat(values.directEquityYield || 0) / 100)) +
        (parseFloat(values.equityMF || 0) * (parseFloat(values.equityMFYield || 0) / 100)) +
        (parseFloat(values.debtMF || 0) * (parseFloat(values.debtMFYield || 0) / 100)) +
        (parseFloat(values.fixedDeposits || 0) * (parseFloat(values.fixedDepositsYield || 0) / 100)) +
        (parseFloat(values.buildings || 0) * (parseFloat(values.buildingsYield || 0) / 100))
    );
    return annualIncome / 12;
}

function updateCharts(networthValues, expenseValues) {
    try {
        console.log('Updating charts with values:', { networthValues, expenseValues });

        // Update Income Chart
        const incomeData = calculateYieldIncome(networthValues);
        if (window.incomeChart) {
            updateChartData(window.incomeChart, Object.values(incomeData));
            console.log('Income chart updated with data:', Object.values(incomeData));
        }

        // Update Expense Chart
        const monthlyExpenses = calculateMonthlyExpenses(expenseValues);
        const bigExpenses = calculateBigExpenses(expenseValues);
        if (window.expenseChart) {
            updateChartData(window.expenseChart, [monthlyExpenses, bigExpenses]);
            console.log('Expense chart updated with data:', [monthlyExpenses, bigExpenses]);
        }

        // Update Asset Chart
        const assetData = [
            parseFloat(networthValues.buildings) || 0,
            parseFloat(networthValues.plots) || 0,
            parseFloat(networthValues.land) || 0,
            parseFloat(networthValues.directEquity) || 0,
            parseFloat(networthValues.equityMF) || 0,
            parseFloat(networthValues.debtMF) || 0,
            parseFloat(networthValues.fixedDeposits) || 0,
            parseFloat(networthValues.gold) || 0,
            parseFloat(networthValues.cash) || 0
        ];
        if (window.assetChart) {
            updateChartData(window.assetChart, assetData);
            console.log('Asset chart updated with data:', assetData);
        }

        // Update Liability Chart
        const liabilityData = [
            parseFloat(networthValues.homeLoan) || 0,
            parseFloat(networthValues.carLoan) || 0,
            parseFloat(networthValues.creditCard) || 0,
            parseFloat(networthValues.educationLoan) || 0,
            calculateCustomLiabilities(networthValues.liabilities || [])
        ];
        if (window.liabilityChart) {
            updateChartData(window.liabilityChart, liabilityData);
            console.log('Liability chart updated with data:', liabilityData);
        }

        // Update summary values
        const totalAssets = calculateTotalAssets(networthValues);
        const totalLiabilities = calculateTotalLiabilities(networthValues);
        const netWorth = totalAssets - totalLiabilities;
        const totalMonthlyIncome = Object.values(incomeData).reduce((a, b) => a + b, 0) / 12;
        const totalMonthlyExpenses = calculateTotalMonthlyExpenses(expenseValues);
        const monthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
        const savingsRate = totalMonthlyIncome > 0 ? (monthlySavings / totalMonthlyIncome * 100) : 0;

        document.getElementById('totalIncome').textContent = `${formatCurrency(totalMonthlyIncome)} / month`;
        document.getElementById('totalExpenses').textContent = `${formatCurrency(totalMonthlyExpenses)} / month`;
        document.getElementById('totalAssets').textContent = formatCurrency(totalAssets);
        document.getElementById('totalLiabilities').textContent = formatCurrency(totalLiabilities);
        document.getElementById('netWorth').textContent = formatCurrency(netWorth);
        document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
        document.getElementById('ffScore').textContent = calculateFFScore(netWorth, totalMonthlyExpenses);
        document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(1)}%`;

        console.log('Charts and summary updated successfully');
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

function createIncomeOverviewChart(data) {
    const ctx = document.getElementById('incomeOverviewChart').getContext('2d');
    
    // Calculate total for percentages
    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
    
    const incomeOverviewChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#1a2942',
                        font: {
                            size: 14
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map(function(label, i) {
                                    const value = data.datasets[0].data[i];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return {
                                        text: `${label}: ${percentage}%`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: data.datasets[0].backgroundColor[i],
                                        lineWidth: 2,
                                        hidden: isNaN(data.datasets[0].data[i]) || data.datasets[0].data[i] === 0,
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
                            return `${context.label}: ₹${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
    
    return incomeOverviewChart;
} 
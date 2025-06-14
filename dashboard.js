// Dashboard JavaScript - Direct localStorage access with correct keys
let dashboardData = {};
let charts = {};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loading...');
    initializeDashboard();
});

// Make initializeDashboard globally available
window.initializeDashboard = initializeDashboard;

async function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    try {
        // Load all data from localStorage and sync with Firestore
        await loadAllData();
        
        // Display all sections
        displayPersonalInfo();
        displayFinancialSummary();
        displayAssetAllocation();
        displayIncomeExpenseBreakdown();
        displayIncomeVsExpenseAnalysis();
        displayFinancialHealthAnalytics();
        displayHistoricalSnapshots();
        displayActionItems();
        
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showStatus('Error loading dashboard data', 'error');
    }
}

async function loadAllData() {
    console.log('Loading data from localStorage and Firestore...');
    
    // First load from localStorage
    dashboardData = {
        personalInfo: getStorageData('personalInfo'),
        netWorthData: getStorageData('netWorthData'),
        incomeData: getStorageData('incomeData'),
        expenseData: getStorageData('expenseData'),
        insuranceData: getStorageData('insuranceData'),
        riskProfileData: getStorageData('riskProfileData'),
        ffScoreData: getStorageData('ffScoreData'),
        userData: getStorageData('userData'),
        financialSnapshots: getStorageData('financialSnapshots')
    };
    
    // Try to sync with Firestore data if available
    try {
        const { fetchAllFormData } = await import('./firestoreService.js');
        const firestoreData = await fetchAllFormData();
        
        if (firestoreData && Object.keys(firestoreData).length > 0) {
            console.log('Syncing with Firestore data:', firestoreData);
            
            // Map Firestore keys back to localStorage keys
            const firestoreToLocalMap = {
                'personal_info': 'personalInfo',
                'networth': 'netWorthData',
                'income': 'incomeData',
                'expenses': 'expenseData',
                'insurance': 'insuranceData',
                'risk-profile': 'riskProfileData',
                'ff-score': 'ffScoreData',
                'dashboard': 'financialSnapshots'
            };
            
            // Update localStorage with Firestore data if it's newer or missing locally
            Object.keys(firestoreData).forEach(firestoreKey => {
                const localKey = firestoreToLocalMap[firestoreKey] || firestoreKey;
                const data = firestoreData[firestoreKey];
                
                if (data) {
                    // For dashboard data, extract financialSnapshots
                    if (firestoreKey === 'dashboard' && data.financialSnapshots) {
                        dashboardData.financialSnapshots = data.financialSnapshots;
                        localStorage.setItem('financialSnapshots', JSON.stringify(data.financialSnapshots));
                    } else {
                        // Update dashboardData
                        dashboardData[localKey] = data;
                        
                        // Update localStorage to keep them in sync
                        localStorage.setItem(localKey, JSON.stringify(data));
                    }
                }
            });
            
            console.log('Data synced with Firestore');
        }
    } catch (error) {
        console.log('Firestore sync failed, using localStorage only:', error);
    }
    
    console.log('Loaded dashboard data:', dashboardData);
}

function getStorageData(key) {
    try {
        const data = localStorage.getItem(key);
        if (data) {
            const parsed = JSON.parse(data);
            console.log(`Loaded ${key}:`, parsed);
            return parsed;
        }
        console.log(`No data found for key: ${key}`);
        return null;
    } catch (error) {
        console.error(`Error loading ${key}:`, error);
        return null;
    }
}

function displayPersonalInfo() {
    const personalInfo = dashboardData.personalInfo || dashboardData.userData;
    const container = document.getElementById('personalInfoDisplay');
    
    if (!personalInfo) {
        container.innerHTML = '<div class="no-data-message">No personal information available. Please complete your profile.</div>';
        return;
    }
    
    // Format dependents info
    let dependentsInfo = 'None';
    if (personalInfo.dependents && personalInfo.dependents.length > 0) {
        dependentsInfo = personalInfo.dependents.map(dep => 
            `${dep.name} (${dep.relation}, ${dep.age})`
        ).join(', ');
    }

    container.innerHTML = `
        <div class="personal-info-grid compact-info-grid">
            <div class="info-item compact-info-item">
                <i class="fas fa-user"></i>
                <div>
                    <strong>Full Name:</strong>
                    <span>${personalInfo.fullName || personalInfo.firstName + ' ' + personalInfo.lastName || 'Not provided'}</span>
                </div>
            </div>
            <div class="info-item compact-info-item">
                <i class="fas fa-calendar"></i>
                <div>
                    <strong>Age:</strong>
                    <span>${personalInfo.age || 'Not provided'}</span>
                </div>
            </div>
            <div class="info-item compact-info-item">
                <i class="fas fa-envelope"></i>
                <div>
                    <strong>Email:</strong>
                    <span>${personalInfo.email || 'Not provided'}</span>
                </div>
            </div>
            <div class="info-item compact-info-item">
                <i class="fas fa-users"></i>
                <div>
                    <strong>Dependents:</strong>
                    <span>${dependentsInfo}</span>
                </div>
            </div>
            <div class="info-item compact-info-item">
                <i class="fas fa-briefcase"></i>
                <div>
                    <strong>Occupation:</strong>
                    <span>${personalInfo.occupation || 'Not provided'}</span>
                </div>
            </div>
            <div class="info-item compact-info-item">
                <i class="fas fa-map-marker-alt"></i>
                <div>
                    <strong>City:</strong>
                    <span>${personalInfo.city || 'Not provided'}</span>
                </div>
            </div>
        </div>
    `;
}

function displayFinancialSummary() {
    console.log('Displaying financial summary...');
    
    // Calculate net worth
    const netWorth = calculateNetWorth();
    document.getElementById('netWorthValue').textContent = formatCurrency(netWorth);
    
    // Calculate annual income
    const annualIncome = calculateAnnualIncome();
    document.getElementById('annualIncomeValue').textContent = formatCurrency(annualIncome);
    
    // Calculate annual expenses
    const annualExpenses = calculateAnnualExpenses();
    document.getElementById('annualExpensesValue').textContent = formatCurrency(annualExpenses);
    
    // Display FF Score
    const ffScore = dashboardData.ffScoreData?.ffScore || 0;
    const ffStatus = dashboardData.ffScoreData?.status || 'Not calculated';
    document.getElementById('ffScoreValue').textContent = ffScore;
    document.getElementById('ffScoreStatus').textContent = ffStatus;
    
    console.log('Financial summary updated:', { netWorth, annualIncome, annualExpenses, ffScore });
}

function calculateNetWorth() {
    const netWorthData = dashboardData.netWorthData;
    if (!netWorthData) return 0;
    
    let totalAssets = 0;
    let totalLiabilities = 0;
    
    // Calculate assets
    if (netWorthData.assets) {
        Object.values(netWorthData.assets).forEach(category => {
            if (typeof category === 'object') {
                Object.values(category).forEach(item => {
                    if (item && typeof item.value === 'number') {
                        totalAssets += item.value;
                    }
                });
            }
        });
    }
    
    // Calculate liabilities
    if (netWorthData.liabilities) {
        Object.values(netWorthData.liabilities).forEach(category => {
            if (typeof category === 'object') {
                Object.values(category).forEach(item => {
                    if (item && typeof item.value === 'number') {
                        totalLiabilities += item.value;
                    }
                });
            }
        });
    }
    
    return totalAssets - totalLiabilities;
}

function calculateAnnualIncome() {
    const incomeData = dashboardData.incomeData;
    if (!incomeData) return 0;
    
    let total = 0;
    
    // Use totals if available (most accurate)
    if (incomeData.totals && incomeData.totals.annualTotal) {
        return incomeData.totals.annualTotal;
    }
    
    // Calculate from income categories
    if (incomeData.income && typeof incomeData.income === 'object') {
        Object.keys(incomeData.income).forEach(category => {
            if (Array.isArray(incomeData.income[category])) {
                incomeData.income[category].forEach(item => {
                    if (item && typeof item.amount === 'number' && item.frequency) {
                        let annualAmount = item.amount;
                        // Convert to annual based on frequency
                        switch (item.frequency) {
                            case 'monthly':
                                annualAmount = item.amount * 12;
                                break;
                            case 'quarterly':
                                annualAmount = item.amount * 4;
                                break;
                            case 'half-yearly':
                                annualAmount = item.amount * 2;
                                break;
                            case 'yearly':
                                annualAmount = item.amount;
                                break;
                            default:
                                annualAmount = item.amount * 12; // Default to monthly
                        }
                        total += annualAmount;
                    }
                });
            }
        });
    }
    
    // Add auto-calculated income
    if (incomeData.autoCalculated) {
        total += (incomeData.autoCalculated.equityYield || 0);
        total += (incomeData.autoCalculated.fixedIncomeYield || 0);
        total += (incomeData.autoCalculated.rentalYield || 0);
    }
    
    return total;
}

function calculateAnnualExpenses() {
    const expenseData = dashboardData.expenseData;
    if (!expenseData) return 0;
    
    // Use totals if available (most accurate)
    if (expenseData.totals && expenseData.totals.annualTotal) {
        return expenseData.totals.annualTotal;
    }
    
    let total = 0;
    
    // Calculate from expense categories
    if (expenseData.expenses && typeof expenseData.expenses === 'object') {
        Object.keys(expenseData.expenses).forEach(category => {
            if (Array.isArray(expenseData.expenses[category])) {
                expenseData.expenses[category].forEach(item => {
                    if (item && typeof item.amount === 'number') {
                        if (category === 'monthlyRecurring') {
                            total += item.amount * 12;
                        } else if (category === 'annualRecurring') {
                            total += item.amount;
                        } else if (category === 'bigExpenses') {
                            // Big expenses are typically annual or amortized
                            const years = item.replacementYears || 1;
                            total += item.amount / years;
                        }
                    }
                });
            }
        });
    }
    
    return total;
}

function displayAssetAllocation() {
    console.log('Displaying asset allocation...');
    
    const netWorthData = dashboardData.netWorthData;
    if (!netWorthData) {
        console.log('No net worth data for asset allocation');
        return;
    }
    
    // Create assets chart
    createAssetsChart(netWorthData.assets);
    
    // Create liabilities chart
    createLiabilitiesChart(netWorthData.liabilities);
}

function createAssetsChart(assetsData) {
    const ctx = document.getElementById('assetsChart');
    if (!ctx || !assetsData) return;
    
    const data = [];
    const labels = [];
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    
    Object.keys(assetsData).forEach((category, index) => {
        let categoryTotal = 0;
        if (typeof assetsData[category] === 'object') {
            Object.values(assetsData[category]).forEach(item => {
                if (item && typeof item.value === 'number') {
                    categoryTotal += item.value;
                }
            });
        }
        
        if (categoryTotal > 0) {
            labels.push(category.charAt(0).toUpperCase() + category.slice(1));
            data.push(categoryTotal);
        }
    });
    
    if (charts.assetsChart) {
        charts.assetsChart.destroy();
    }
    
    charts.assetsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.reduce((sum, value) => sum + value, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Calculate total for percentages
    const total = data.reduce((sum, value) => sum + value, 0);
    
    // Create legend with percentages
    try {
        createChartLegendWithPercentages('assetsChart', labels, colors.slice(0, data.length), data, total);
    } catch (error) {
        console.error('Error creating assets legend:', error);
        // Fallback to simple legend
        createChartLegend('assetsLegend', labels, colors.slice(0, data.length), data);
    }
}

function createLiabilitiesChart(liabilitiesData) {
    const ctx = document.getElementById('liabilitiesChart');
    if (!ctx || !liabilitiesData) return;
    
    const data = [];
    const labels = [];
    const colors = ['#F44336', '#FF5722', '#E91E63', '#9C27B0', '#673AB7'];
    
    Object.keys(liabilitiesData).forEach((category, index) => {
        let categoryTotal = 0;
        if (typeof liabilitiesData[category] === 'object') {
            Object.values(liabilitiesData[category]).forEach(item => {
                if (item && typeof item.value === 'number') {
                    categoryTotal += item.value;
                }
            });
        }
        
        if (categoryTotal > 0) {
            labels.push(category.charAt(0).toUpperCase() + category.slice(1));
            data.push(categoryTotal);
        }
    });
    
    if (data.length === 0) {
        const chartContainer = ctx.closest('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="no-data-message">No liabilities data available</div>';
        }
        return;
    }
    
    if (charts.liabilitiesChart) {
        charts.liabilitiesChart.destroy();
    }
    
    charts.liabilitiesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.reduce((sum, value) => sum + value, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Calculate total for percentages
    const total = data.reduce((sum, value) => sum + value, 0);
    
    // Create legend with percentages
    try {
        createChartLegendWithPercentages('liabilitiesChart', labels, colors.slice(0, data.length), data, total);
    } catch (error) {
        console.error('Error creating liabilities legend:', error);
        // Fallback to simple legend
        createChartLegend('liabilitiesLegend', labels, colors.slice(0, data.length), data);
    }
}

function displayIncomeExpenseBreakdown() {
    console.log('Displaying income expense breakdown...');
    console.log('Dashboard data:', dashboardData);
    
    // Create income sources chart
    createIncomeSourcesChart();
    
    // Create expense categories chart
    createExpenseCategoriesChart();
}

function createIncomeSourcesChart() {
    const ctx = document.getElementById('incomeSourcesChart');
    if (!ctx) return;
    
    const incomeData = dashboardData.incomeData;
    console.log('Income data for chart:', incomeData);
    
    if (!incomeData) {
        const chartContainer = ctx.closest('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="no-data-message">No income data available. Please complete the income section first.</div>';
        }
        return;
    }
    
    if (!incomeData.income && !incomeData.autoCalculated) {
        const chartContainer = ctx.closest('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="no-data-message">No income sources found. Please add income sources in the income section.</div>';
        }
        return;
    }
    
    const data = [];
    const labels = [];
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4'];
    
    // Calculate totals for each income category
    const categoryTotals = {};
    
    // Process income categories if they exist
    if (incomeData.income && typeof incomeData.income === 'object') {
        Object.keys(incomeData.income).forEach(category => {
            if (Array.isArray(incomeData.income[category])) {
                let categoryTotal = 0;
                incomeData.income[category].forEach(item => {
                    if (item && typeof item.amount === 'number') {
                        let annualAmount = item.amount;
                        // Convert to annual based on frequency
                        switch (item.frequency) {
                            case 'monthly':
                                annualAmount = item.amount * 12;
                                break;
                            case 'quarterly':
                                annualAmount = item.amount * 4;
                                break;
                            case 'half-yearly':
                                annualAmount = item.amount * 2;
                                break;
                            case 'annual':
                            case 'yearly':
                                annualAmount = item.amount;
                                break;
                            default:
                                annualAmount = item.amount * 12;
                        }
                        categoryTotal += annualAmount;
                    }
                });
                if (categoryTotal > 0) {
                    categoryTotals[category] = categoryTotal;
                }
            }
        });
    }
    
    // Add auto-calculated income
    if (incomeData.autoCalculated) {
        if (incomeData.autoCalculated.equityYield > 0) {
            categoryTotals['equityYield'] = incomeData.autoCalculated.equityYield;
        }
        if (incomeData.autoCalculated.fixedIncomeYield > 0) {
            categoryTotals['fixedIncomeYield'] = incomeData.autoCalculated.fixedIncomeYield;
        }
        if (incomeData.autoCalculated.rentalYield > 0) {
            categoryTotals['rentalYield'] = incomeData.autoCalculated.rentalYield;
        }
    }
    
    // Prepare chart data
    Object.keys(categoryTotals).forEach(category => {
        const categoryName = getCategoryDisplayName(category);
        labels.push(categoryName);
        data.push(categoryTotals[category]);
    });
    
    if (data.length === 0) {
        const chartContainer = ctx.closest('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="no-data-message">No income sources with valid amounts found. Please check your income data.</div>';
        }
        return;
    }
    
    // Calculate total for percentages
    const total = data.reduce((sum, value) => sum + value, 0);
    
    if (charts.incomeSourcesChart) {
        charts.incomeSourcesChart.destroy();
    }
    
    charts.incomeSourcesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Create custom legend with percentages
    try {
        createChartLegendWithPercentages('incomeSourcesChart', labels, colors.slice(0, data.length), data, total);
    } catch (error) {
        console.error('Error creating income sources legend:', error);
    }
}

function createExpenseCategoriesChart() {
    const ctx = document.getElementById('expenseCategoriesChart');
    if (!ctx) return;
    
    const expenseData = dashboardData.expenseData;
    console.log('Expense data for chart:', expenseData);
    
    if (!expenseData) {
        const chartContainer = ctx.closest('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="no-data-message">No expense data available. Please complete the expenses section first.</div>';
        }
        return;
    }
    
    if (!expenseData.expenses) {
        const chartContainer = ctx.closest('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="no-data-message">No expense categories found. Please add expenses in the expenses section.</div>';
        }
        return;
    }
    
    const data = [];
    const labels = [];
    const colors = ['#F44336', '#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'];
    
    // Calculate totals for each expense category
    const categoryTotals = {};
    Object.keys(expenseData.expenses).forEach(category => {
        if (Array.isArray(expenseData.expenses[category])) {
            let categoryTotal = 0;
            expenseData.expenses[category].forEach(item => {
                if (item && typeof item.amount === 'number') {
                    if (category === 'monthlyRecurring') {
                        categoryTotal += item.amount * 12;
                    } else if (category === 'annualRecurring') {
                        categoryTotal += item.amount;
                    } else if (category === 'bigExpenses') {
                        const years = item.replacementYears || 1;
                        categoryTotal += item.amount / years;
                    }
                }
            });
            if (categoryTotal > 0) {
                categoryTotals[category] = categoryTotal;
            }
        }
    });
    
    // Prepare chart data
    Object.keys(categoryTotals).forEach(category => {
        const categoryName = getExpenseCategoryDisplayName(category);
        labels.push(categoryName);
        data.push(categoryTotals[category]);
    });
    
    if (data.length === 0) {
        const chartContainer = ctx.closest('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="no-data-message">No expense categories with valid amounts found. Please check your expense data.</div>';
        }
        return;
    }
    
    // Calculate total for percentages
    const total = data.reduce((sum, value) => sum + value, 0);
    
    if (charts.expenseCategoriesChart) {
        charts.expenseCategoriesChart.destroy();
    }
    
    charts.expenseCategoriesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Create custom legend with percentages
    try {
        createChartLegendWithPercentages('expenseCategoriesChart', labels, colors.slice(0, data.length), data, total);
    } catch (error) {
        console.error('Error creating expense categories legend:', error);
    }
}

function displayIncomeVsExpenseAnalysis() {
    console.log('Displaying income vs expense analysis...');
    
    const monthlyIncome = calculateAnnualIncome() / 12;
    const monthlyExpenses = calculateAnnualExpenses() / 12;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
    
    // Update summary cards
    document.getElementById('monthlySavingsValue').textContent = formatCurrency(monthlySavings);
    document.getElementById('savingsRateValue').textContent = savingsRate.toFixed(1) + '%';
    document.getElementById('expenseRatioValue').textContent = expenseRatio.toFixed(1) + '%';
    
    // Create horizontal bar chart
    createIncomeVsExpenseChart(monthlyIncome, monthlyExpenses);
}

function createIncomeVsExpenseChart(income, expenses) {
    const ctx = document.getElementById('incomeVsExpenseChart');
    if (!ctx) return;
    
    if (charts.incomeVsExpenseChart) {
        charts.incomeVsExpenseChart.destroy();
    }
    
    charts.incomeVsExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monthly Income', 'Monthly Expenses'],
            datasets: [{
                data: [income, expenses],
                backgroundColor: ['#4CAF50', '#F44336'],
                borderColor: ['#388E3C', '#D32F2F'],
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function displayFinancialHealthAnalytics() {
    console.log('Displaying financial health analytics...');
    
    const monthlyIncome = calculateAnnualIncome() / 12;
    const monthlyExpenses = calculateAnnualExpenses() / 12;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    
    // Calculate health indicators
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const emergencyFund = calculateEmergencyFund();
    const lifeInsurance = calculateLifeInsuranceCoverage();
    const investmentRate = calculateInvestmentRate();
    const debtToIncome = calculateDebtToIncomeRatio();
    const riskProfile = dashboardData.riskProfileData?.riskLevel || 'Not Set';
    
    // Update health indicators
    updateHealthIndicator('healthSavingsRate', 'healthSavingsRateBar', savingsRate, '%', 20);
    updateHealthIndicator('healthEmergencyFund', 'healthEmergencyFundBar', emergencyFund, ' months', 6);
    updateHealthIndicator('healthLifeInsurance', 'healthLifeInsuranceBar', lifeInsurance, 'x', 10);
    updateHealthIndicator('healthInvestmentRate', 'healthInvestmentRateBar', investmentRate, '%', 20);
    updateHealthIndicator('healthDebtToIncome', 'healthDebtToIncomeBar', debtToIncome, '%', 30, true);
    
    // Risk profile (special handling)
    document.getElementById('healthRiskProfile').textContent = riskProfile;
    const riskScore = getRiskProfileScore(riskProfile);
    updateProgressBar('healthRiskProfileBar', riskScore, 100);
}

function calculateEmergencyFund() {
    const netWorthData = dashboardData.netWorthData;
    const monthlyExpenses = calculateAnnualExpenses() / 12;
    
    if (!netWorthData || !monthlyExpenses) return 0;
    
    let emergencyFunds = 0;
    if (netWorthData.assets && netWorthData.assets.cash) {
        Object.values(netWorthData.assets.cash).forEach(item => {
            if (item && typeof item.value === 'number') {
                emergencyFunds += item.value;
            }
        });
    }
    
    return monthlyExpenses > 0 ? emergencyFunds / monthlyExpenses : 0;
}

function calculateLifeInsuranceCoverage() {
    const insuranceData = dashboardData.insuranceData;
    const annualIncome = calculateAnnualIncome();
    
    if (!insuranceData || !annualIncome) return 0;
    
    let totalCoverage = 0;
    if (insuranceData.lifeInsurance) {
        Object.values(insuranceData.lifeInsurance).forEach(policy => {
            if (policy && typeof policy.coverage === 'number') {
                totalCoverage += policy.coverage;
            }
        });
    }
    
    return annualIncome > 0 ? totalCoverage / annualIncome : 0;
}

function calculateInvestmentRate() {
    const netWorthData = dashboardData.netWorthData;
    const monthlyIncome = calculateAnnualIncome() / 12;
    
    if (!netWorthData || !monthlyIncome) return 0;
    
    let investments = 0;
    if (netWorthData.assets) {
        ['investments', 'stocks', 'mutualFunds', 'bonds'].forEach(category => {
            if (netWorthData.assets[category]) {
                Object.values(netWorthData.assets[category]).forEach(item => {
                    if (item && typeof item.value === 'number') {
                        investments += item.value;
                    }
                });
            }
        });
    }
    
    // Assume monthly investment is 10% of total investments (rough estimate)
    const monthlyInvestment = investments * 0.1 / 12;
    return monthlyIncome > 0 ? (monthlyInvestment / monthlyIncome) * 100 : 0;
}

function calculateDebtToIncomeRatio() {
    const netWorthData = dashboardData.netWorthData;
    const monthlyIncome = calculateAnnualIncome() / 12;
    
    if (!netWorthData || !monthlyIncome) return 0;
    
    let totalDebt = 0;
    if (netWorthData.liabilities) {
        Object.values(netWorthData.liabilities).forEach(category => {
            if (typeof category === 'object') {
                Object.values(category).forEach(item => {
                    if (item && typeof item.value === 'number') {
                        totalDebt += item.value;
                    }
                });
            }
        });
    }
    
    // Assume monthly debt payment is 5% of total debt (rough estimate)
    const monthlyDebtPayment = totalDebt * 0.05 / 12;
    return monthlyIncome > 0 ? (monthlyDebtPayment / monthlyIncome) * 100 : 0;
}

function getRiskProfileScore(riskLevel) {
    const scores = {
        'Conservative': 25,
        'Moderate': 50,
        'Aggressive': 75,
        'Very Aggressive': 100
    };
    return scores[riskLevel] || 0;
}

function updateHealthIndicator(valueId, barId, value, suffix, target, isReverse = false) {
    const valueElement = document.getElementById(valueId);
    const barElement = document.getElementById(barId);
    
    if (valueElement) {
        valueElement.textContent = value.toFixed(1) + suffix;
    }
    
    if (barElement) {
        updateProgressBar(barId, value, target, isReverse);
    }
}

function updateProgressBar(barId, value, target, isReverse = false) {
    const barElement = document.getElementById(barId);
    if (!barElement) return;
    
    const percentage = Math.min((value / target) * 100, 100);
    barElement.style.width = percentage + '%';
    
    // Color coding
    let color;
    if (isReverse) {
        // For debt-to-income, lower is better
        color = percentage <= 30 ? '#4CAF50' : percentage <= 60 ? '#FF9800' : '#F44336';
    } else {
        // For other metrics, higher is better
        color = percentage >= 80 ? '#4CAF50' : percentage >= 50 ? '#FF9800' : '#F44336';
    }
    
    barElement.style.backgroundColor = color;
}

function displayHistoricalSnapshots() {
    console.log('Displaying historical snapshots...');
    
    // Use snapshots from dashboardData (which includes Firestore sync)
    const snapshots = dashboardData.financialSnapshots || [];
    
    document.getElementById('totalSnapshotsCount').textContent = snapshots.length;
    
    if (snapshots.length > 0) {
        const latestSnapshot = snapshots[snapshots.length - 1];
        const date = new Date(latestSnapshot.date);
        document.getElementById('latestSnapshotDate').textContent = date.toLocaleDateString();
        
        createSnapshotComparisonTable(snapshots);
    } else {
        document.getElementById('latestSnapshotDate').textContent = 'Never';
        document.getElementById('snapshotComparisonTable').innerHTML = 
            '<div class="no-data-message">No snapshots saved yet. Click "Save Current Snapshot" to start tracking your progress.</div>';
    }
}

function createSnapshotComparisonTable(snapshots) {
    if (snapshots.length === 0) return;
    
    const container = document.getElementById('snapshotComparisonTable');
    
    if (snapshots.length === 1) {
        container.innerHTML = `
            <div class="snapshot-single">
                <h4>First Snapshot Saved!</h4>
                <p>Save more snapshots to see comparison and progress tracking.</p>
            </div>
        `;
        return;
    }
    
    // Get current and previous snapshot for comparison
    const currentSnapshot = snapshots[snapshots.length - 1];
    const previousSnapshot = snapshots[snapshots.length - 2];
    
    // Create comparison cards
    let comparisonHTML = `
        <div class="snapshot-comparison">
            <div class="comparison-header">
                <h4>Progress Comparison</h4>
                <p>Current vs Previous Snapshot</p>
            </div>
            <div class="comparison-grid">
    `;
    
    const metrics = [
        { key: 'netWorth', label: 'Net Worth', format: 'currency' },
        { key: 'annualIncome', label: 'Annual Income', format: 'currency' },
        { key: 'annualExpenses', label: 'Annual Expenses', format: 'currency' },
        { key: 'monthlySavings', label: 'Monthly Savings', format: 'currency' },
        { key: 'savingsRate', label: 'Savings Rate', format: 'percentage' },
        { key: 'emergencyFund', label: 'Emergency Fund', format: 'months' },
        { key: 'lifeInsuranceCoverage', label: 'Life Insurance', format: 'multiplier' },
        { key: 'ffScore', label: 'FF Score', format: 'number' }
    ];
    
    metrics.forEach(metric => {
        const currentValue = currentSnapshot[metric.key] || 0;
        const previousValue = previousSnapshot[metric.key] || 0;
        const change = currentValue - previousValue;
        const percentageChange = previousValue !== 0 ? ((change / previousValue) * 100) : 0;
        
        const isPositive = change > 0;
        const isNegative = change < 0;
        const changeClass = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';
        const changeIcon = isPositive ? '↗' : isNegative ? '↘' : '→';
        
        let formattedCurrent, formattedChange;
        switch (metric.format) {
            case 'currency':
                formattedCurrent = formatCurrency(currentValue);
                formattedChange = formatCurrency(Math.abs(change));
                break;
            case 'percentage':
                formattedCurrent = currentValue.toFixed(1) + '%';
                formattedChange = Math.abs(change).toFixed(1) + '%';
                break;
            case 'months':
                formattedCurrent = currentValue.toFixed(1) + ' months';
                formattedChange = Math.abs(change).toFixed(1) + ' months';
                break;
            case 'multiplier':
                formattedCurrent = currentValue.toFixed(1) + 'x';
                formattedChange = Math.abs(change).toFixed(1) + 'x';
                break;
            default:
                formattedCurrent = currentValue.toFixed(0);
                formattedChange = Math.abs(change).toFixed(0);
        }
        
        comparisonHTML += `
            <div class="comparison-card">
                <div class="metric-label">${metric.label}</div>
                <div class="metric-current">${formattedCurrent}</div>
                <div class="metric-change ${changeClass}">
                    <span class="change-icon">${changeIcon}</span>
                    <span class="change-amount">${formattedChange}</span>
                    <span class="change-percentage">(${Math.abs(percentageChange).toFixed(1)}%)</span>
                </div>
            </div>
        `;
    });
    
    comparisonHTML += `
            </div>
        </div>
    `;
    
    // Add historical table for all snapshots
    const recentSnapshots = snapshots.slice(-5).reverse();
    comparisonHTML += `
        <div class="historical-table">
            <h4>Historical Snapshots</h4>
            <div class="table-responsive">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Net Worth</th>
                            <th>Income</th>
                            <th>Expenses</th>
                            <th>Savings Rate</th>
                            <th>FF Score</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    recentSnapshots.forEach((snapshot, index) => {
        const date = new Date(snapshot.date).toLocaleDateString();
        const snapshotIndex = snapshots.length - 1 - index; // Get original index
        comparisonHTML += `
            <tr>
                <td>${date}</td>
                <td>${formatCurrency(snapshot.netWorth || 0)}</td>
                <td>${formatCurrency(snapshot.annualIncome || 0)}</td>
                <td>${formatCurrency(snapshot.annualExpenses || 0)}</td>
                <td>${(snapshot.savingsRate || 0).toFixed(1)}%</td>
                <td>${snapshot.ffScore || 0}</td>
                <td>
                    <div class="snapshot-actions">
                        <button class="delete-snapshot-btn" onclick="deleteSnapshot(${snapshotIndex})" title="Delete this snapshot">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    comparisonHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = comparisonHTML;
    
    // Show net worth progress chart if we have multiple snapshots
    if (snapshots.length >= 2) {
        createNetWorthProgressChart(snapshots);
        document.getElementById('networthProgressSection').style.display = 'block';
    }
}

function displayActionItems() {
    console.log('Displaying action items...');
    
    const actionItems = generateActionItems();
    const container = document.getElementById('actionItemsList');
    
    if (actionItems.length === 0) {
        container.innerHTML = '<div class="no-data-message">Great job! No immediate action items. Keep monitoring your financial health.</div>';
        return;
    }
    
    let html = '<div class="action-items-grid">';
    
    actionItems.forEach(item => {
        html += `
            <div class="action-item ${item.priority}">
                <div class="action-header">
                    <i class="${item.icon}"></i>
                    <h4>${item.title}</h4>
                    <span class="priority-badge ${item.priority}">${item.priority}</span>
                </div>
                <p>${item.description}</p>
                <div class="action-footer">
                    <span class="category">${item.category}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function generateActionItems() {
    const items = [];
    const monthlyIncome = calculateAnnualIncome() / 12;
    const monthlyExpenses = calculateAnnualExpenses() / 12;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const emergencyFund = calculateEmergencyFund();
    const lifeInsurance = calculateLifeInsuranceCoverage();
    
    // Check savings rate
    if (savingsRate < 10) {
        items.push({
            title: 'Improve Savings Rate',
            description: 'Your savings rate is below 10%. Try to reduce expenses or increase income to save at least 20% of your income.',
            priority: 'high',
            category: 'Savings',
            icon: 'fas fa-piggy-bank'
        });
    }
    
    // Check emergency fund
    if (emergencyFund < 3) {
        items.push({
            title: 'Build Emergency Fund',
            description: 'You should have at least 3-6 months of expenses saved for emergencies. Start building your emergency fund.',
            priority: 'high',
            category: 'Emergency Fund',
            icon: 'fas fa-shield-alt'
        });
    }
    
    // Check life insurance
    if (lifeInsurance < 5) {
        items.push({
            title: 'Review Life Insurance',
            description: 'Consider getting life insurance coverage of at least 5-10 times your annual income to protect your family.',
            priority: 'medium',
            category: 'Insurance',
            icon: 'fas fa-umbrella'
        });
    }
    
    // Check if risk profile is set
    if (!dashboardData.riskProfileData) {
        items.push({
            title: 'Complete Risk Profile',
            description: 'Complete your risk profile assessment to get personalized investment recommendations.',
            priority: 'medium',
            category: 'Planning',
            icon: 'fas fa-chart-line'
        });
    }
    
    return items;
}

// Utility functions
function formatCurrency(amount) {
    if (typeof amount !== 'number') return '₹0';
    
    // Ensure we're working with a proper number
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return '₹0';
    
    // Round to avoid floating point precision issues
    const roundedAmount = Math.round(numAmount);
    
    return '₹' + roundedAmount.toLocaleString('en-IN');
}

function createChartLegend(containerId, labels, colors, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="chart-legend-items">';
    labels.forEach((label, index) => {
        html += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <span class="legend-label">${label}</span>
                <span class="legend-value">${formatCurrency(data[index])}</span>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function createChartLegendWithPercentages(chartId, labels, colors, data, total) {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;
    
    // Find the chart-container (parent of chart-wrapper)
    const chartContainer = chartElement.closest('.chart-container');
    if (!chartContainer) return;
    
    const existingLegend = chartContainer.querySelector('.chart-legend-with-percentages');
    if (existingLegend) {
        existingLegend.remove();
    }
    
    let html = '<div class="chart-legend-with-percentages">';
    labels.forEach((label, index) => {
        const percentage = ((data[index] / total) * 100).toFixed(1);
        html += `
            <div class="legend-item-with-percentage">
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <div class="legend-content">
                    <span class="legend-label">${label}</span>
                    <div class="legend-values">
                        <span class="legend-amount">${formatCurrency(data[index])}</span>
                        <span class="legend-percentage">${percentage}%</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    chartContainer.insertAdjacentHTML('beforeend', html);
}

function getCategoryDisplayName(category) {
    const displayNames = {
        'salary': 'Salary/Pension',
        'rental': 'Rental Income',
        'dividend': 'Dividend Income',
        'interest': 'Interest Income',
        'otherIncome': 'Other Income',
        'equityYield': 'Equity Yield',
        'fixedIncomeYield': 'Fixed Income Yield',
        'rentalYield': 'Rental Yield'
    };
    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

function getExpenseCategoryDisplayName(category) {
    const displayNames = {
        'monthlyRecurring': 'Monthly Recurring',
        'annualRecurring': 'Annual Recurring',
        'bigExpenses': 'Big Expenses'
    };
    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Snapshot functionality with Firestore integration
async function saveCurrentSnapshot() {
    try {
        const netWorth = calculateNetWorth();
        const annualIncome = calculateAnnualIncome();
        const annualExpenses = calculateAnnualExpenses();
        const savingsRate = annualIncome > 0 ? (((annualIncome - annualExpenses) / annualIncome) * 100) : 0;
        const emergencyFund = calculateEmergencyFund();
        const lifeInsurance = calculateLifeInsuranceCoverage();
        
        const snapshot = {
            date: new Date().toISOString(),
            netWorth: netWorth,
            annualIncome: annualIncome,
            annualExpenses: annualExpenses,
            monthlySavings: (annualIncome - annualExpenses) / 12,
            savingsRate: savingsRate,
            ffScore: dashboardData.ffScoreData?.ffScore || 0,
            emergencyFund: emergencyFund,
            lifeInsuranceCoverage: lifeInsurance,
            investmentRate: calculateInvestmentRate(),
            debtToIncomeRatio: calculateDebtToIncomeRatio(),
            riskProfile: dashboardData.riskProfileData?.riskLevel || 'Not Set'
        };
        
        const snapshots = dashboardData.financialSnapshots || [];
        snapshots.push(snapshot);
        
        // Update dashboardData
        dashboardData.financialSnapshots = snapshots;
        
        // Save to localStorage
        localStorage.setItem('financialSnapshots', JSON.stringify(snapshots));
        
        // Save to Firestore if user is authenticated
        try {
            const { saveFormData } = await import('./firestoreService.js');
            await saveFormData('dashboard', { financialSnapshots: snapshots });
            console.log('Snapshot saved to Firestore');
        } catch (firestoreError) {
            console.log('Firestore save failed, using localStorage only:', firestoreError);
        }
        
        showStatus('Financial snapshot saved successfully!', 'success');
        displayHistoricalSnapshots(); // Refresh the display
        
    } catch (error) {
        console.error('Error saving snapshot:', error);
        showStatus('Error saving snapshot', 'error');
    }
}

// Navigation functions
function goBack() {
    window.location.href = 'ff-score.html';
}

function goNext() {
    window.location.href = 'find-advisor.html';
}

// PDF Report Generation
function downloadComprehensiveReport() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set up the document
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        let yPosition = 20;
        
        // Header with gradient effect (simulated with colors)
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Financial Dashboard Report', pageWidth / 2, 25, { align: 'center' });
        
        // Date
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 35, { align: 'center' });
        
        yPosition = 60;
        doc.setTextColor(0, 0, 0);
        
        // Personal Information Section
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('Personal Information', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const personalInfo = dashboardData.personalInfo || dashboardData.userData || {};
        const personalData = [
            ['Name:', personalInfo.name || personalInfo.fullName || 'Not provided'],
            ['Email:', personalInfo.email || 'Not provided'],
            ['Phone:', personalInfo.phone || personalInfo.phoneNumber || 'Not provided'],
            ['Age:', personalInfo.age || 'Not provided'],
            ['City:', personalInfo.city || 'Not provided'],
            ['Occupation:', personalInfo.occupation || 'Not provided']
        ];
        
        personalData.forEach(([label, value]) => {
            doc.text(label, 25, yPosition);
            doc.text(value, 80, yPosition);
            yPosition += 8;
        });
        
        yPosition += 10;
        
        // Financial Summary Section
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('Financial Summary', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const netWorth = calculateNetWorth();
        const annualIncome = calculateAnnualIncome();
        const annualExpenses = calculateAnnualExpenses();
        const monthlySavings = (annualIncome - annualExpenses) / 12;
        const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
        const ffScore = dashboardData.ffScoreData?.ffScore || 0;
        
        const financialData = [
            ['Net Worth:', formatCurrency(netWorth)],
            ['Annual Income:', formatCurrency(annualIncome)],
            ['Annual Expenses:', formatCurrency(annualExpenses)],
            ['Monthly Savings:', formatCurrency(monthlySavings)],
            ['Savings Rate:', savingsRate.toFixed(1) + '%'],
            ['FF Score:', ffScore.toString()]
        ];
        
        financialData.forEach(([label, value]) => {
            doc.text(label, 25, yPosition);
            doc.text(value, 80, yPosition);
            yPosition += 8;
        });
        
        yPosition += 10;
        
        // Financial Health Indicators
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('Financial Health Indicators', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const emergencyFund = calculateEmergencyFund();
        const lifeInsurance = calculateLifeInsuranceCoverage();
        const investmentRate = calculateInvestmentRate();
        const debtToIncome = calculateDebtToIncomeRatio();
        const riskProfile = dashboardData.riskProfileData?.riskLevel || 'Not Set';
        
        const healthData = [
            ['Savings Rate:', savingsRate.toFixed(1) + '%'],
            ['Emergency Fund:', emergencyFund.toFixed(1) + ' months'],
            ['Life Insurance Coverage:', lifeInsurance.toFixed(1) + 'x annual income'],
            ['Investment Rate:', investmentRate.toFixed(1) + '%'],
            ['Debt-to-Income Ratio:', debtToIncome.toFixed(1) + '%'],
            ['Risk Profile:', riskProfile]
        ];
        
        healthData.forEach(([label, value]) => {
            doc.text(label, 25, yPosition);
            doc.text(value, 80, yPosition);
            yPosition += 8;
        });
        
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 20;
        }
        
        yPosition += 10;
        
        // Action Items Section
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('Priority Action Items', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const actionItems = generateActionItems();
        if (actionItems.length === 0) {
            doc.text('• Great job! No immediate action items.', 25, yPosition);
            yPosition += 8;
        } else {
            actionItems.forEach(item => {
                doc.setFont('helvetica', 'bold');
                doc.text(`• ${item.title} (${item.priority.toUpperCase()})`, 25, yPosition);
                yPosition += 6;
                doc.setFont('helvetica', 'normal');
                const lines = doc.splitTextToSize(item.description, pageWidth - 50);
                lines.forEach(line => {
                    doc.text(line, 30, yPosition);
                    yPosition += 5;
                });
                yPosition += 3;
                
                // Check if we need a new page
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = 20;
                }
            });
        }
        
        // Footer
        const footerY = pageHeight - 20;
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text('Generated by Nivezo Financial Dashboard', pageWidth / 2, footerY, { align: 'center' });
        
        // Save the PDF
        const fileName = `Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        showStatus('Report downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showStatus('Error generating report', 'error');
    }
}

// Data synchronization helper
async function syncDataToFirestore(key, data) {
    try {
        const { saveFormData } = await import('./firestoreService.js');
        
        // Map localStorage keys to Firestore page names
        const keyToPageMap = {
            'personalInfo': 'personal_info',
            'netWorthData': 'networth',
            'incomeData': 'income',
            'expenseData': 'expenses',
            'insuranceData': 'insurance',
            'riskProfileData': 'risk-profile',
            'ffScoreData': 'ff-score',
            'financialSnapshots': 'dashboard'
        };
        
        const pageName = keyToPageMap[key] || 'dashboard';
        const dataToSave = key === 'financialSnapshots' ? { financialSnapshots: data } : data;
        
        await saveFormData(pageName, dataToSave);
        console.log(`Data synced to Firestore for ${key}`);
        return true;
    } catch (error) {
        console.error(`Failed to sync ${key} to Firestore:`, error);
        return false;
    }
}

// Enhanced data saving function
async function saveDataWithSync(key, data) {
    try {
        // Save to localStorage
        localStorage.setItem(key, JSON.stringify(data));
        
        // Update dashboardData
        dashboardData[key] = data;
        
        // Sync to Firestore
        await syncDataToFirestore(key, data);
        
        return true;
    } catch (error) {
        console.error(`Error saving data for ${key}:`, error);
        return false;
    }
}

// Delete snapshot functionality
async function deleteSnapshot(index) {
    if (!confirm('Are you sure you want to delete this snapshot? This action cannot be undone.')) {
        return;
    }
    
    try {
        const snapshots = dashboardData.financialSnapshots || [];
        
        if (index >= 0 && index < snapshots.length) {
            snapshots.splice(index, 1);
            
            // Update dashboardData
            dashboardData.financialSnapshots = snapshots;
            
            // Save to localStorage
            localStorage.setItem('financialSnapshots', JSON.stringify(snapshots));
            
            // Save to Firestore if user is authenticated
            try {
                const { saveFormData } = await import('./firestoreService.js');
                await saveFormData('dashboard', { financialSnapshots: snapshots });
                console.log('Snapshot deleted from Firestore');
            } catch (firestoreError) {
                console.log('Firestore delete failed, using localStorage only:', firestoreError);
            }
            
            showStatus('Snapshot deleted successfully!', 'success');
            displayHistoricalSnapshots(); // Refresh the display
        }
    } catch (error) {
        console.error('Error deleting snapshot:', error);
        showStatus('Error deleting snapshot', 'error');
    }
}

// Net Worth Progress Chart
function createNetWorthProgressChart(snapshots) {
    const ctx = document.getElementById('networthProgressChart');
    if (!ctx || snapshots.length < 2) return;
    
    // Prepare data for the chart
    const labels = snapshots.map(snapshot => {
        const date = new Date(snapshot.date);
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    });
    
    const networthData = snapshots.map(snapshot => snapshot.netWorth || 0);
    
    // Destroy existing chart if it exists
    if (charts.networthProgressChart) {
        charts.networthProgressChart.destroy();
    }
    
    charts.networthProgressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Net Worth',
                data: networthData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Net Worth: ${formatCurrency(context.parsed.y)}`;
                        },
                        title: function(context) {
                            const snapshotIndex = context[0].dataIndex;
                            const snapshot = snapshots[snapshotIndex];
                            const date = new Date(snapshot.date);
                            return date.toLocaleDateString('en-IN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            });
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: '#6b7280',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Make functions globally available
window.saveCurrentSnapshot = saveCurrentSnapshot;
window.downloadComprehensiveReport = downloadComprehensiveReport;
window.goBack = goBack;
window.goNext = goNext;
window.syncDataToFirestore = syncDataToFirestore;
window.saveDataWithSync = saveDataWithSync;
window.deleteSnapshot = deleteSnapshot; 
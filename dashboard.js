// ===== DASHBOARD PAGE FUNCTIONALITY =====

let dashboardData = {};
let charts = {};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        loadAllData();
        initDashboard();
    });
});

// Load all data from previous pages
function loadAllData() {
    dashboardData = {
        personal: Storage.get('personalData', {}),
        netWorth: Storage.get('netWorthData', {}),
        income: Storage.get('incomeData', {}),
        expenses: Storage.get('expenseData', {}),
        ffScore: Storage.get('ffScoreData', {}),
        insurance: Storage.get('insuranceData', {}),
        riskProfile: Storage.get('riskProfileData', {})
    };
}

// Initialize dashboard
function initDashboard() {
    updateSummaryCards();
    updateHealthIndicators();
    createCharts();
    generateActionItems();
}

// Update summary cards
function updateSummaryCards() {
    // Net Worth
    const netWorth = dashboardData.netWorth.totals?.totalNetWorth || 0;
    document.getElementById('dashboardNetWorth').textContent = formatCurrency(netWorth);
    
    // Annual Income
    const annualIncome = dashboardData.income.totals?.annualTotal || 0;
    document.getElementById('dashboardIncome').textContent = formatCurrency(annualIncome);
    
    // Annual Expenses
    const annualExpenses = dashboardData.expenses.totals?.annualTotal || 0;
    document.getElementById('dashboardExpenses').textContent = formatCurrency(annualExpenses);
    
    // FF Score
    const ffScore = dashboardData.ffScore.currentScore || 0;
    document.getElementById('dashboardFFScore').textContent = ffScore;
    
    // Update FF Score color
    const ffScoreElement = document.getElementById('dashboardFFScore');
    const ffScoreMeaning = getFFScoreMeaning(ffScore);
    ffScoreElement.style.color = ffScoreMeaning.color;
    document.getElementById('ffScoreStatus').textContent = ffScoreMeaning.level;
}

// Update health indicators
function updateHealthIndicators() {
    // Savings Rate
    const annualIncome = dashboardData.income.totals?.annualTotal || 0;
    const annualExpenses = dashboardData.expenses.totals?.annualTotal || 0;
    const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
    
    document.getElementById('savingsRateIndicator').textContent = Math.round(savingsRate) + '%';
    updateProgressBar('savingsRateProgress', savingsRate, 100);
    colorizeIndicator('savingsRateIndicator', savingsRate, 10, 25);
    
    // Life Insurance Ratio
    const lifeInsuranceRatio = dashboardData.insurance.analysis?.lifeInsuranceRatio || 0;
    document.getElementById('lifeInsuranceIndicator').textContent = lifeInsuranceRatio.toFixed(1) + 'x';
    updateProgressBar('lifeInsuranceProgress', Math.min(lifeInsuranceRatio * 6.67, 100), 100); // 15x = 100%
    colorizeIndicator('lifeInsuranceIndicator', lifeInsuranceRatio, 5, 10);
    
    // Risk Profile
    const riskProfile = dashboardData.riskProfile.riskProfile || 'Not Assessed';
    document.getElementById('riskProfileIndicator').textContent = riskProfile;
    
    // Asset Growth Rate
    const assetGrowthRate = dashboardData.ffScore.assetGrowthRate || 0;
    document.getElementById('assetGrowthIndicator').textContent = assetGrowthRate + '%';
}

// Update progress bar
function updateProgressBar(elementId, value, max) {
    const percentage = Math.min((value / max) * 100, 100);
    document.getElementById(elementId).style.width = percentage + '%';
}

// Colorize indicator based on thresholds
function colorizeIndicator(elementId, value, lowThreshold, highThreshold) {
    const element = document.getElementById(elementId);
    if (value >= highThreshold) {
        element.style.color = 'var(--success-color)';
    } else if (value >= lowThreshold) {
        element.style.color = 'var(--warning-color)';
    } else {
        element.style.color = 'var(--danger-color)';
    }
}

// Create all charts
function createCharts() {
    createAssetChart();
    createIncomeExpenseChart();
    createIncomeChart();
    createExpenseChart();
    createAllocationCharts();
    createTimelineChart();
}

// Create asset allocation chart
function createAssetChart() {
    const ctx = document.getElementById('assetChart').getContext('2d');
    const netWorthData = dashboardData.netWorth;
    
    if (!netWorthData.assets) return;
    
    const labels = [];
    const data = [];
    const colors = [chartColors.primary, chartColors.success, chartColors.warning, chartColors.info, chartColors.purple];
    
    Object.keys(netWorthData.assets).forEach((category, index) => {
        const categoryTotal = netWorthData.categoryTotals?.[category] || 0;
        if (categoryTotal > 0) {
            labels.push(formatCategoryName(category));
            data.push(categoryTotal);
        }
    });
    
    charts.assetChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create income vs expense chart
function createIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    const monthlyIncome = (dashboardData.income.totals?.annualTotal || 0) / 12;
    const monthlyExpenses = (dashboardData.expenses.totals?.annualTotal || 0) / 12;
    
    charts.incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monthly Flow'],
            datasets: [{
                label: 'Income',
                data: [monthlyIncome],
                backgroundColor: chartColors.success,
                borderWidth: 0
            }, {
                label: 'Expenses',
                data: [monthlyExpenses],
                backgroundColor: chartColors.danger,
                borderWidth: 0
            }, {
                label: 'Savings',
                data: [monthlyIncome - monthlyExpenses],
                backgroundColor: chartColors.primary,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value / 1000).toFixed(0) + 'K';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create income sources chart
function createIncomeChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    const incomeData = dashboardData.income;
    
    if (!incomeData.breakdown) return;
    
    const breakdown = incomeData.breakdown;
    const labels = ['Salary', 'Rental', 'Dividend', 'Interest', 'Other'];
    const data = [
        breakdown.salary || 0,
        breakdown.rental || 0,
        breakdown.dividend || 0,
        breakdown.interest || 0,
        breakdown.other || 0
    ];
    
    charts.incomeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    chartColors.primary,
                    chartColors.success,
                    chartColors.warning,
                    chartColors.info,
                    chartColors.purple
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create expense breakdown chart
function createExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const expenseData = dashboardData.expenses;
    
    if (!expenseData.breakdown) return;
    
    const breakdown = expenseData.breakdown;
    const labels = ['Monthly Recurring', 'Annual Recurring', 'Big Expenses'];
    const data = [
        breakdown.monthlyRecurring || 0,
        breakdown.annualRecurring || 0,
        breakdown.bigExpenses || 0
    ];
    
    charts.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    chartColors.danger,
                    chartColors.warning,
                    chartColors.orange
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create allocation comparison charts
function createAllocationCharts() {
    // Current allocation chart
    const currentCtx = document.getElementById('currentAllocationChart').getContext('2d');
    const currentAllocation = calculateCurrentAllocation();
    
    charts.currentAllocationChart = new Chart(currentCtx, {
        type: 'doughnut',
        data: createAllocationChartData(currentAllocation),
        options: getAllocationChartOptions()
    });
    
    // Recommended allocation chart
    const recommendedCtx = document.getElementById('recommendedAllocationChart').getContext('2d');
    const recommendedAllocation = dashboardData.riskProfile.assetAllocation || {};
    
    charts.recommendedAllocationChart = new Chart(recommendedCtx, {
        type: 'doughnut',
        data: createAllocationChartData(recommendedAllocation),
        options: getAllocationChartOptions()
    });
}

// Calculate current allocation from net worth data
function calculateCurrentAllocation() {
    const netWorthData = dashboardData.netWorth;
    const totalAssets = netWorthData.totals?.totalAssets || 1;
    
    return {
        equity: ((netWorthData.categoryTotals?.equity || 0) / totalAssets) * 100,
        debt: ((netWorthData.categoryTotals?.fixedIncome || 0) / totalAssets) * 100,
        gold: ((netWorthData.categoryTotals?.gold || 0) / totalAssets) * 100,
        reits: ((netWorthData.categoryTotals?.realEstate || 0) / totalAssets) * 100,
        cash: ((netWorthData.categoryTotals?.cash || 0) / totalAssets) * 100
    };
}

// Create allocation chart data
function createAllocationChartData(allocation) {
    return {
        labels: ['Equity', 'Fixed Income', 'Gold', 'REITs', 'Cash'],
        datasets: [{
            data: [
                allocation.equity || 0,
                allocation.debt || 0,
                allocation.gold || 0,
                allocation.reits || 0,
                allocation.cash || 0
            ],
            backgroundColor: [
                chartColors.success,
                chartColors.primary,
                chartColors.warning,
                chartColors.purple,
                chartColors.info
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
}

// Get allocation chart options
function getAllocationChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };
}

// Create financial timeline chart
function createTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    
    const currentNetWorth = dashboardData.netWorth.totals?.totalNetWorth || 0;
    const annualExpenses = dashboardData.expenses.totals?.annualTotal || 0;
    const growthRate = dashboardData.ffScore.assetGrowthRate || 8;
    const inflationRate = dashboardData.ffScore.inflationRate || 6;
    
    // Project net worth over 30 years
    const years = [];
    const projectedNetWorth = [];
    const projectedExpenses = [];
    
    let netWorth = currentNetWorth;
    let expenses = annualExpenses;
    
    for (let i = 0; i <= 30; i++) {
        years.push(new Date().getFullYear() + i);
        projectedNetWorth.push(netWorth);
        projectedExpenses.push(expenses * 25); // 25x expenses for FI target
        
        netWorth = netWorth * (1 + growthRate / 100);
        expenses = expenses * (1 + inflationRate / 100);
    }
    
    charts.timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Projected Net Worth',
                data: projectedNetWorth,
                borderColor: chartColors.success,
                backgroundColor: chartColors.success + '20',
                fill: true,
                tension: 0.1
            }, {
                label: 'FI Target (25x Expenses)',
                data: projectedExpenses,
                borderColor: chartColors.warning,
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value / 100000).toFixed(0) + 'L';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Generate action items
function generateActionItems() {
    const actionItems = [];
    
    // Based on FF Score
    const ffScore = dashboardData.ffScore.currentScore || 0;
    if (ffScore < 10) {
        actionItems.push({
            priority: 'high',
            icon: '🚨',
            title: 'Build Emergency Fund',
            description: 'Your current savings can only last ' + ffScore + ' years. Focus on building an emergency fund first.',
            category: 'Emergency Planning'
        });
    }
    
    // Based on savings rate
    const annualIncome = dashboardData.income.totals?.annualTotal || 0;
    const annualExpenses = dashboardData.expenses.totals?.annualTotal || 0;
    const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
    
    if (savingsRate < 15) {
        actionItems.push({
            priority: 'high',
            icon: '💰',
            title: 'Increase Savings Rate',
            description: `Your savings rate is ${Math.round(savingsRate)}%. Aim for at least 20% to build wealth effectively.`,
            category: 'Savings Strategy'
        });
    }
    
    // Based on life insurance
    const lifeInsuranceRatio = dashboardData.insurance.analysis?.lifeInsuranceRatio || 0;
    if (lifeInsuranceRatio < 8) {
        actionItems.push({
            priority: 'medium',
            icon: '🛡️',
            title: 'Increase Life Insurance',
            description: `Your life insurance is ${lifeInsuranceRatio.toFixed(1)}x income. Consider increasing to 10-15x.`,
            category: 'Risk Management'
        });
    }
    
    // Based on asset allocation
    const currentAllocation = calculateCurrentAllocation();
    const recommendedAllocation = dashboardData.riskProfile.assetAllocation || {};
    
    if (Math.abs(currentAllocation.equity - (recommendedAllocation.equity || 0)) > 15) {
        actionItems.push({
            priority: 'medium',
            icon: '📊',
            title: 'Rebalance Portfolio',
            description: 'Your current asset allocation differs significantly from your recommended allocation.',
            category: 'Portfolio Management'
        });
    }
    
    // If no issues, provide positive reinforcement
    if (actionItems.length === 0) {
        actionItems.push({
            priority: 'low',
            icon: '✅',
            title: 'Excellent Financial Health!',
            description: 'Your financial situation looks good. Continue monitoring and reviewing regularly.',
            category: 'Maintenance'
        });
    }
    
    // Render action items
    const actionItemsContainer = document.getElementById('actionItems');
    actionItemsContainer.innerHTML = actionItems.map(item => `
        <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${getPriorityColor(item.priority)};">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 0.5rem;">
                            <span style="margin-right: 0.5rem;">${item.icon}</span>
                            ${item.title}
                        </h4>
                        <p style="margin-bottom: 0.5rem; color: var(--text-secondary);">${item.description}</p>
                        <span class="badge" style="background: ${getPriorityColor(item.priority)}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                            ${item.category}
                        </span>
                    </div>
                    <span class="priority-badge" style="background: ${getPriorityColor(item.priority)}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; text-transform: uppercase;">
                        ${item.priority}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Get priority color
function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'var(--danger-color)';
        case 'medium': return 'var(--warning-color)';
        case 'low': return 'var(--success-color)';
        default: return 'var(--info-color)';
    }
}

// Format category name
function formatCategoryName(category) {
    const names = {
        equity: 'Equity',
        fixedIncome: 'Fixed Income',
        realEstate: 'Real Estate',
        gold: 'Gold',
        cash: 'Cash',
        crypto: 'Cryptocurrency',
        other: 'Other'
    };
    return names[category] || category;
}

// Download report functionality
function downloadReport() {
    const reportData = {
        generatedAt: new Date().toISOString(),
        userEmail: firebase.auth().currentUser?.email,
        summary: {
            netWorth: dashboardData.netWorth.totals?.totalNetWorth || 0,
            annualIncome: dashboardData.income.totals?.annualTotal || 0,
            annualExpenses: dashboardData.expenses.totals?.annualTotal || 0,
            ffScore: dashboardData.ffScore.currentScore || 0,
            riskProfile: dashboardData.riskProfile.riskProfile || 'Not Assessed'
        },
        data: dashboardData
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `NiveshMatrix_Financial_Report_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showStatus('Financial report downloaded successfully!', 'success');
}

// Navigation functions
function goBack() {
    window.location.href = 'risk-profile.html';
}

function goNext() {
    window.location.href = 'advisor.html';
}

// ===== CHART DESTRUCTION =====
// Clean up charts when navigating away
window.addEventListener('beforeunload', () => {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
}); 
// ===== DASHBOARD PAGE FUNCTIONALITY =====

let dashboardData = {};
let charts = {};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        
        // Display user email in navigation
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                document.getElementById('userEmail').textContent = user.email;
            }
        });
        
        loadAllData();
        initDashboard();
        initHistorical();
        
        // Mark dashboard as visited for progress tracking
        Storage.set('dashboardVisited', true);
        
        // Setup navigation system - use safer timing
        if (typeof safeSetupNavigation === 'function') {
            safeSetupNavigation(8); // 8 = Dashboard page
        } else if (typeof setupPageNavigation === 'function') {
            setTimeout(() => setupPageNavigation(8), 200);
        }
    });
});

// Load all data from previous pages
function loadAllData() {
    dashboardData = {
        personal: Storage.get('personalInfo', {}),
        netWorth: Storage.get('netWorthData', {}),
        income: Storage.get('incomeData', {}),
        expenses: Storage.get('expenseData', {}),
        ffScore: Storage.get('ffScoreData', {}),
        insurance: Storage.get('insuranceData', {}),
        riskProfile: Storage.get('riskProfileData', {})
    };
    
    console.log('Dashboard data loaded:', dashboardData); // Debug log
}

// Initialize dashboard
function initDashboard() {
    loadAllData();
    updateSummaryCards();
    updateHealthIndicators();
    createCharts();
    generateActionItems();
    displayInvestmentInsights();
}

// Update summary cards
function updateSummaryCards() {
    // Net Worth
    const netWorth = dashboardData.netWorth.totals?.netWorth || 0;
    document.getElementById('dashboardNetWorth').textContent = formatCurrency(netWorth);
    
    // Annual Income
    const annualIncome = dashboardData.income.totals?.annualTotal || 0;
    document.getElementById('dashboardIncome').textContent = formatCurrency(annualIncome);
    
    // Annual Expenses
    const annualExpenses = dashboardData.expenses.totals?.annualTotal || 0;
    document.getElementById('dashboardExpenses').textContent = formatCurrency(annualExpenses);
    
    // FF Score
    const ffScore = dashboardData.ffScore.currentScore || dashboardData.ffScore.score || 0;
    document.getElementById('dashboardFFScore').textContent = ffScore;
    
    // Update FF Score color
    const ffScoreElement = document.getElementById('dashboardFFScore');
    const ffScoreMeaning = getFFScoreMeaning(ffScore);
    ffScoreElement.style.color = ffScoreMeaning.color;
    document.getElementById('ffScoreStatus').textContent = ffScoreMeaning.level;
    
    // Update recurring investments section
    updateRecurringInvestments();
}

// Update recurring investments section
function updateRecurringInvestments() {
    const netWorthData = dashboardData.netWorth || {};
    const recurringInvestments = netWorthData.recurringInvestments || {};
    
    // Calculate totals for each category
    let totalSIP = 0;
    let totalRD = 0;
    let totalOtherSavings = 0;
    
    // SIP totals
    if (recurringInvestments.sip) {
        totalSIP = recurringInvestments.sip.reduce((total, investment) => {
            const amount = investment.amount || 0;
            const frequency = investment.frequency || 'monthly';
            return total + convertToMonthly(amount, frequency);
        }, 0);
    }
    
    // RD totals
    if (recurringInvestments.rd) {
        totalRD = recurringInvestments.rd.reduce((total, investment) => {
            const amount = investment.amount || 0;
            const frequency = investment.frequency || 'monthly';
            return total + convertToMonthly(amount, frequency);
        }, 0);
    }
    
    // Other savings totals
    if (recurringInvestments.otherSavings) {
        totalOtherSavings = recurringInvestments.otherSavings.reduce((total, investment) => {
            const amount = investment.amount || 0;
            const frequency = investment.frequency || 'monthly';
            return total + convertToMonthly(amount, frequency);
        }, 0);
    }
    
    const totalRecurring = totalSIP + totalRD + totalOtherSavings;
    
    // Update display elements if they exist
    const sipElement = document.getElementById('dashboardSIP');
    const rdElement = document.getElementById('dashboardRD');
    const otherSavingsElement = document.getElementById('dashboardOtherSavings');
    const totalRecurringElement = document.getElementById('dashboardTotalRecurring');
    const disciplineScoreElement = document.getElementById('disciplineScore');
    const recurringSection = document.getElementById('recurringInvestmentsSection');
    
    if (sipElement) sipElement.textContent = formatCurrency(totalSIP);
    if (rdElement) rdElement.textContent = formatCurrency(totalRD);
    if (otherSavingsElement) otherSavingsElement.textContent = formatCurrency(totalOtherSavings);
    if (totalRecurringElement) totalRecurringElement.textContent = formatCurrency(totalRecurring);
    
    // Calculate investment discipline score (percentage of income going to regular investments)
    const monthlyIncome = (dashboardData.income.totals?.annualTotal || 0) / 12;
    const disciplinePercentage = monthlyIncome > 0 ? (totalRecurring / monthlyIncome) * 100 : 0;
    
    if (disciplineScoreElement) {
        disciplineScoreElement.textContent = Math.round(disciplinePercentage) + '%';
        // Color code the discipline score
        if (disciplinePercentage >= 30) {
            disciplineScoreElement.style.color = 'var(--success-color)';
        } else if (disciplinePercentage >= 15) {
            disciplineScoreElement.style.color = 'var(--warning-color)';
        } else {
            disciplineScoreElement.style.color = 'var(--danger-color)';
        }
    }
    
    // Show/hide the recurring investments section based on whether there's data
    if (recurringSection) {
        if (totalRecurring > 0) {
            recurringSection.style.display = 'block';
        } else {
            recurringSection.style.display = 'none';
        }
    }
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

// Create asset allocation chart with enhanced legend
function createAssetChart() {
    const ctx = document.getElementById('assetChart').getContext('2d');
    
    // Calculate asset allocation
    const assets = dashboardData.netWorth.assets || {};
    const data = [];
    const labels = [];
    
    Object.keys(assets).forEach(category => {
        if (Array.isArray(assets[category])) {
            const total = assets[category].reduce((sum, item) => sum + (item.value || 0), 0);
            if (total > 0) {
                data.push(total);
                labels.push(formatCategoryName(category));
            }
        }
    });
    
    const total = data.reduce((sum, value) => sum + value, 0);
    
    if (total === 0) {
        ctx.canvas.style.display = 'none';
        return;
    }
    
    const colors = [
        chartColors.primary,
        chartColors.success, 
        chartColors.warning,
        chartColors.danger,
        chartColors.info,
        chartColors.purple
    ];
    
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
                    position: 'bottom',
                    labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const dataset = data.datasets[0];
                                const total = dataset.data.reduce((sum, value) => sum + value, 0);
                                
                                return data.labels.map((label, i) => {
                                    const value = dataset.data[i];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    
                                    return {
                                        text: `${label}: ${percentage}%`,
                                        fillStyle: dataset.backgroundColor[i],
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: dataset.borderWidth,
                                        hidden: isNaN(value) || chart.getDatasetMeta(0).data[i].hidden,
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
                            const value = formatCurrency(context.raw);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
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

// Create income chart with enhanced legend
function createIncomeChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    const incomeData = dashboardData.income.sources || {};
    const data = [];
    const labels = [];
    
    Object.keys(incomeData).forEach(category => {
        if (Array.isArray(incomeData[category])) {
            const monthlyTotal = incomeData[category].reduce((sum, item) => {
                return sum + (item.monthlyAmount || 0);
            }, 0);
            
            if (monthlyTotal > 0) {
                data.push(monthlyTotal);
                labels.push(formatCategoryName(category));
            }
        }
    });
    
    const total = data.reduce((sum, value) => sum + value, 0);
    
    if (total === 0) {
        ctx.canvas.style.display = 'none';
        return;
    }
    
    const colors = [
        chartColors.success,
        chartColors.primary,
        chartColors.info,
        chartColors.warning,
        chartColors.purple
    ];
    
    charts.incomeChart = new Chart(ctx, {
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
                    position: 'bottom',
                    labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const dataset = data.datasets[0];
                                const total = dataset.data.reduce((sum, value) => sum + value, 0);
                                
                                return data.labels.map((label, i) => {
                                    const value = dataset.data[i];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    
                                    return {
                                        text: `${label}: ${percentage}%`,
                                        fillStyle: dataset.backgroundColor[i],
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: dataset.borderWidth,
                                        hidden: isNaN(value) || chart.getDatasetMeta(0).data[i].hidden,
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
                            const value = formatCurrency(context.raw);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${value}/month (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create expense chart with enhanced legend
function createExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    const expenseData = dashboardData.expenses.categories || {};
    const data = [];
    const labels = [];
    
    Object.keys(expenseData).forEach(category => {
        if (Array.isArray(expenseData[category])) {
            const monthlyTotal = expenseData[category].reduce((sum, item) => {
                return sum + (item.monthlyAmount || 0);
            }, 0);
            
            if (monthlyTotal > 0) {
                data.push(monthlyTotal);
                labels.push(formatCategoryName(category));
            }
        }
    });
    
    const total = data.reduce((sum, value) => sum + value, 0);
    
    if (total === 0) {
        ctx.canvas.style.display = 'none';
        return;
    }
    
    const colors = [
        chartColors.danger,
        chartColors.warning,
        chartColors.info,
        chartColors.purple,
        chartColors.primary
    ];
    
    charts.expenseChart = new Chart(ctx, {
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
                    position: 'bottom',
                    labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const dataset = data.datasets[0];
                                const total = dataset.data.reduce((sum, value) => sum + value, 0);
                                
                                return data.labels.map((label, i) => {
                                    const value = dataset.data[i];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    
                                    return {
                                        text: `${label}: ${percentage}%`,
                                        fillStyle: dataset.backgroundColor[i],
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: dataset.borderWidth,
                                        hidden: isNaN(value) || chart.getDatasetMeta(0).data[i].hidden,
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
                            const value = formatCurrency(context.raw);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${value}/month (${percentage}%)`;
                        }
                    }
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
    let totalAssets = 0;
    let categoryTotals = {
        equity: 0,
        fixedIncome: 0,
        realEstate: 0,
        otherAssets: 0
    };
    
    // Calculate category totals from assets data
    if (netWorthData.assets) {
        Object.keys(netWorthData.assets).forEach(category => {
            if (Array.isArray(netWorthData.assets[category])) {
                const categoryTotal = netWorthData.assets[category].reduce((sum, asset) => {
                    return sum + (asset.value || 0);
                }, 0);
                
                categoryTotals[category] = categoryTotal;
                totalAssets += categoryTotal;
            }
        });
    }
    
    // Prevent division by zero
    if (totalAssets === 0) {
        return {
            equity: 0,
            debt: 0,
            gold: 0,
            reits: 0,
            cash: 0
        };
    }
    
    return {
        equity: ((categoryTotals.equity || 0) / totalAssets) * 100,
        debt: ((categoryTotals.fixedIncome || 0) / totalAssets) * 100,
        gold: 0, // Not tracked separately in our model
        reits: ((categoryTotals.realEstate || 0) / totalAssets) * 100,
        cash: ((categoryTotals.otherAssets || 0) / totalAssets) * 100
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

// Get allocation chart options with enhanced legend
function getAllocationChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            const dataset = data.datasets[0];
                            const total = dataset.data.reduce((sum, value) => sum + value, 0);
                            
                            return data.labels.map((label, i) => {
                                const value = dataset.data[i];
                                const percentage = value ? value.toFixed(1) : '0.0';
                                
                                return {
                                    text: `${label}: ${percentage}%`,
                                    fillStyle: dataset.backgroundColor[i],
                                    strokeStyle: dataset.borderColor,
                                    lineWidth: dataset.borderWidth,
                                    hidden: isNaN(value) || chart.getDatasetMeta(0).data[i].hidden,
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
                        return `${context.label}: ${context.raw.toFixed(1)}%`;
                    }
                }
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

// Download report functionality - Beautiful PDF with all data
async function downloadReport() {
    try {
        showStatus('Generating comprehensive financial report...', 'info');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Get all data from localStorage
        const allData = {
            personalInfo: Storage.get('personalInfo', {}),
            netWorth: Storage.get('netWorthData', {}),
            income: Storage.get('incomeData', {}),
            expenses: Storage.get('expenseData', {}),
            ffScore: Storage.get('ffScoreData', {}),
            insurance: Storage.get('insuranceData', {}),
            riskProfile: Storage.get('riskData', {})
        };
        
        const user = firebase.auth().currentUser;
        const currentDate = new Date().toLocaleDateString('en-IN');
        
        // Page dimensions
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);
        
        let yPosition = margin;
        
        // Header with logo and title
        pdf.setFillColor(37, 99, 235); // Primary blue
        pdf.rect(0, 0, pageWidth, 40, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nivezo', margin, 25);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Comprehensive Financial Report', margin, 35);
        
        yPosition = 55;
        
        // User info section
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Report Details', margin, yPosition);
        yPosition += 10;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated for: ${user?.email || 'User'}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Generated on: ${currentDate}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Name: ${allData.personalInfo.fullName || 'Not provided'}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Age: ${allData.personalInfo.age || 'Not provided'} years`, margin, yPosition);
        yPosition += 15;
        
        // Executive Summary
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('Executive Summary', margin, yPosition);
        yPosition += 12;
        
        // Summary cards
        const netWorth = allData.netWorth.totals?.totalNetWorth || 0;
        const annualIncome = allData.income.totals?.annualTotal || 0;
        const annualExpenses = allData.expenses.totals?.annualTotal || 0;
        const ffScore = allData.ffScore.currentScore || 0;
        const riskProfile = allData.riskProfile.riskProfile || 'Not Assessed';
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        
        // Create summary table
        const summaryData = [
            ['Net Worth', formatCurrency(netWorth)],
            ['Annual Income', formatCurrency(annualIncome)],
            ['Annual Expenses', formatCurrency(annualExpenses)],
            ['Financial Freedom Score', `${ffScore} years`],
            ['Risk Profile', riskProfile],
            ['Savings Rate', `${annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome * 100).toFixed(1) : 0}%`]
        ];
        
        summaryData.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label + ':', margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 60, yPosition);
            yPosition += 8;
        });
        
        yPosition += 10;
        
        // Personal Information Section
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('1. Personal Information', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        const personalData = [
            ['Full Name', allData.personalInfo.fullName || 'Not provided'],
            ['Email', allData.personalInfo.email || user?.email || 'Not provided'],
            ['Phone', allData.personalInfo.phone || 'Not provided'],
            ['Date of Birth', allData.personalInfo.dateOfBirth || 'Not provided'],
            ['Age', `${allData.personalInfo.age || 'Not provided'} years`],
            ['Marital Status', allData.personalInfo.maritalStatus || 'Not provided'],
            ['Dependents', allData.personalInfo.dependents || 'Not provided'],
            ['Occupation', allData.personalInfo.occupation || 'Not provided'],
            ['Annual Income', formatCurrency(allData.personalInfo.annualIncome || 0)],
            ['City', allData.personalInfo.city || 'Not provided'],
            ['Financial Goals', allData.personalInfo.financialGoals || 'Not provided']
        ];
        
        personalData.forEach(([label, value]) => {
            if (yPosition > 270) {
                pdf.addPage();
                yPosition = margin;
            }
            pdf.setFont('helvetica', 'bold');
            pdf.text(label + ':', margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value.toString(), margin + 50, yPosition);
            yPosition += 6;
        });
        
        // Net Worth Section
        yPosition += 10;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('2. Net Worth Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        // Assets breakdown
        pdf.setFont('helvetica', 'bold');
        pdf.text('Assets:', margin, yPosition);
        yPosition += 8;
        
        if (allData.netWorth.assets) {
            Object.keys(allData.netWorth.assets).forEach(category => {
                const assets = allData.netWorth.assets[category];
                if (Array.isArray(assets) && assets.length > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`  ${formatCategoryName(category)}:`, margin + 5, yPosition);
                    yPosition += 6;
                    
                    assets.forEach(asset => {
                        if (yPosition > 280) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`    • ${asset.description || 'Asset'}: ${formatCurrency(asset.value || 0)}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                    yPosition += 3;
                }
            });
        }
        
        // Liabilities breakdown
        yPosition += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Liabilities:', margin, yPosition);
        yPosition += 8;
        
        if (allData.netWorth.liabilities) {
            Object.keys(allData.netWorth.liabilities).forEach(category => {
                const liabilities = allData.netWorth.liabilities[category];
                if (Array.isArray(liabilities) && liabilities.length > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`  ${formatCategoryName(category)}:`, margin + 5, yPosition);
                    yPosition += 6;
                    
                    liabilities.forEach(liability => {
                        if (yPosition > 280) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`    • ${liability.description || 'Liability'}: ${formatCurrency(liability.value || 0)}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                    yPosition += 3;
                }
            });
        }
        
        // Income Section
        yPosition += 10;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('3. Income Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        
        if (allData.income.sources) {
            Object.keys(allData.income.sources).forEach(category => {
                const sources = allData.income.sources[category];
                if (Array.isArray(sources) && sources.length > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`${formatCategoryName(category)}:`, margin, yPosition);
                    yPosition += 8;
                    
                    sources.forEach(source => {
                        if (yPosition > 280) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`  • ${source.description || 'Income'}: ${formatCurrency(source.monthlyAmount || 0)}/month`, margin + 5, yPosition);
                        yPosition += 5;
                    });
                    yPosition += 5;
                }
            });
        }
        
        // Expenses Section
        yPosition += 5;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('4. Expense Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        
        if (allData.expenses.categories) {
            Object.keys(allData.expenses.categories).forEach(category => {
                const expenses = allData.expenses.categories[category];
                if (Array.isArray(expenses) && expenses.length > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`${formatCategoryName(category)}:`, margin, yPosition);
                    yPosition += 8;
                    
                    expenses.forEach(expense => {
                        if (yPosition > 280) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`  • ${expense.description || 'Expense'}: ${formatCurrency(expense.monthlyAmount || 0)}/month`, margin + 5, yPosition);
                        yPosition += 5;
                    });
                    yPosition += 5;
                }
            });
        }
        
        // FF Score Section
        yPosition += 5;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('5. Financial Freedom Score Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        const ffData = [
            ['Current FF Score', `${ffScore} years`],
            ['Asset Growth Rate', `${allData.ffScore.assetGrowthRate || 8}% per annum`],
            ['Inflation Rate', `${allData.ffScore.inflationRate || 6}% per annum`],
            ['Monthly Surplus', formatCurrency((annualIncome - annualExpenses) / 12)],
            ['Years to Financial Freedom', `${allData.ffScore.yearsToFI || 'Not calculated'} years`]
        ];
        
        ffData.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label + ':', margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 60, yPosition);
            yPosition += 8;
        });
        
        // Insurance Section
        yPosition += 10;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('6. Insurance Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        const insuranceData = [
            ['Life Insurance Coverage', formatCurrency(allData.insurance.lifeInsurance?.coverageAmount || 0)],
            ['Life Insurance Premium', formatCurrency(allData.insurance.lifeInsurance?.annualPremium || 0)],
            ['Health Insurance Coverage', formatCurrency(allData.insurance.healthInsurance?.coverageAmount || 0)],
            ['Health Insurance Premium', formatCurrency(allData.insurance.healthInsurance?.annualPremium || 0)],
            ['Life Insurance Ratio', `${(allData.insurance.analysis?.lifeInsuranceRatio || 0).toFixed(1)}x of annual income`],
            ['Total Annual Premium', formatCurrency((allData.insurance.lifeInsurance?.annualPremium || 0) + (allData.insurance.healthInsurance?.annualPremium || 0))]
        ];
        
        insuranceData.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label + ':', margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 60, yPosition);
            yPosition += 8;
        });
        
        // Risk Profile Section
        yPosition += 10;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('7. Risk Profile Assessment', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        const riskData = [
            ['Risk Score', `${allData.riskProfile.totalScore || 0}/32`],
            ['Risk Profile', riskProfile],
            ['Investment Horizon', 'Based on questionnaire responses'],
            ['Risk Tolerance', 'Assessed through 8-question survey']
        ];
        
        riskData.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label + ':', margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 60, yPosition);
            yPosition += 8;
        });
        
        // Asset Allocation Recommendations
        if (allData.riskProfile.assetAllocation) {
            yPosition += 5;
            pdf.setFont('helvetica', 'bold');
            pdf.text('Recommended Asset Allocation:', margin, yPosition);
            yPosition += 8;
            
            Object.keys(allData.riskProfile.assetAllocation).forEach(asset => {
                pdf.setFont('helvetica', 'normal');
                pdf.text(`  • ${formatCategoryName(asset)}: ${allData.riskProfile.assetAllocation[asset]}%`, margin + 5, yPosition);
                yPosition += 6;
            });
        }
        
        // Footer
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
            pdf.text('Generated by Nivezo - Your Financial Journey Partner', margin, pageHeight - 10);
        }
        
        // Save the PDF
        const filename = `Nivezo_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);
        
        showStatus('Comprehensive financial report downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF report:', error);
        showStatus('Error generating report. Please try again.', 'error');
    }
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

// Display investment insights from risk profile
function displayInvestmentInsights() {
    const riskData = dashboardData.riskProfile || {};
    const insightsContainer = document.getElementById('investmentInsights');
    
    if (!riskData.riskProfile || !riskData.responses) {
        insightsContainer.innerHTML = `
            <div class="card" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                <h4>Complete Risk Assessment</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Complete your risk profile assessment to see personalized investment insights and recommendations.
                </p>
                <a href="risk-profile.html" class="btn btn-primary">
                    <i class="fas fa-balance-scale"></i> Take Risk Assessment
                </a>
            </div>
        `;
        return;
    }
    
    const insights = generateInvestmentInsights(riskData);
    
    insightsContainer.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div class="card" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: none;">
                <div class="card-body" style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${getRiskProfileEmoji(riskData.riskProfile)}</div>
                    <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Risk Profile: ${riskData.riskProfile}</h3>
                    <p style="color: var(--text-secondary);">Score: ${riskData.totalScore}/32</p>
                </div>
            </div>
        </div>
        
        ${insights.map(insight => `
            <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${getInsightColor(insight.type)};">
                <div class="card-body">
                    <h4 style="margin-bottom: 0.5rem;">
                        <span style="margin-right: 0.5rem;">${insight.icon}</span>
                        ${insight.title}
                    </h4>
                    <p style="margin-bottom: 0; color: var(--text-secondary);">${insight.description}</p>
                </div>
            </div>
        `).join('')}
    `;
}

// Generate investment insights based on risk profile
function generateInvestmentInsights(riskData) {
    const insights = [];
    const responses = riskData.responses || {};
    const riskProfile = riskData.riskProfile;
    
    // Age-based insights
    if (responses.age <= 2) {
        insights.push({
            icon: '⏰',
            title: 'Age Consideration',
            description: 'Given your age, consider shifting towards more conservative investments to preserve capital for retirement.',
            type: 'info'
        });
    } else if (responses.age >= 4) {
        insights.push({
            icon: '🚀',
            title: 'Young Investor Advantage',
            description: 'You have time on your side. Consider higher equity allocation for long-term wealth creation through compounding.',
            type: 'success'
        });
    }
    
    // Emergency fund insights
    if (responses.emergency <= 2) {
        insights.push({
            icon: '🚨',
            title: 'Build Emergency Fund First',
            description: 'Before investing in risky assets, ensure you have 6+ months of expenses in an emergency fund.',
            type: 'warning'
        });
    }
    
    // Investment horizon insights
    if (responses.horizon >= 3) {
        insights.push({
            icon: '📈',
            title: 'Long-term Investment Horizon',
            description: 'Your long investment horizon allows you to ride out market volatility and benefit from the power of compounding.',
            type: 'success'
        });
    }
    
    // Knowledge-based insights
    if (responses.knowledge <= 2) {
        insights.push({
            icon: '📚',
            title: 'Investment Education',
            description: 'Consider learning more about investing or consulting a financial advisor before making complex investment decisions.',
            type: 'info'
        });
    }
    
    // Risk-specific recommendations
    if (riskProfile === 'Conservative') {
        insights.push({
            icon: '🔒',
            title: 'Conservative Strategy',
            description: 'Focus on capital preservation with high-grade bonds, FDs, and blue-chip dividend-paying stocks.',
            type: 'info'
        });
    } else if (riskProfile === 'Aggressive') {
        insights.push({
            icon: '⚡',
            title: 'Aggressive Strategy',
            description: 'Consider growth stocks, small-cap funds, and emerging market investments, but ensure proper diversification.',
            type: 'warning'
        });
    } else if (riskProfile === 'Balanced') {
        insights.push({
            icon: '⚖️',
            title: 'Balanced Strategy',
            description: 'Mix growth and income investments. Consider systematic investment plans (SIPs) for regular equity investment.',
            type: 'success'
        });
    }
    
    // Income stability insights
    if (responses.income <= 2) {
        insights.push({
            icon: '💼',
            title: 'Income Stability',
            description: 'With variable income, maintain a larger emergency fund and avoid highly leveraged investments.',
            type: 'warning'
        });
    }
    
    // Asset allocation recommendation
    if (riskData.assetAllocation) {
        const allocation = riskData.assetAllocation;
        insights.push({
            icon: '📊',
            title: 'Recommended Asset Mix',
            description: `Based on your profile: ${allocation.equity}% Equity, ${allocation.debt}% Fixed Income, ${allocation.gold}% Gold, ${allocation.reits}% REITs, ${allocation.cash}% Cash.`,
            type: 'success'
        });
    }
    
    return insights;
}

// Get risk profile emoji
function getRiskProfileEmoji(riskProfile) {
    const emojis = {
        'Conservative': '🔒',
        'Risk Averse': '🛡️',
        'Balanced': '⚖️',
        'Aggressive': '🚀'
    };
    return emojis[riskProfile] || '📊';
}

// Get insight color based on type
function getInsightColor(type) {
    switch (type) {
        case 'success': return 'var(--success-color)';
        case 'warning': return 'var(--warning-color)';
        case 'info': return 'var(--info-color)';
        default: return 'var(--primary-color)';
    }
}

// ===== HISTORICAL SNAPSHOTS FUNCTIONALITY =====

// Initialize historical functionality
function initHistorical() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('snapshotDate').value = today;
    
    // Load and display existing snapshots
    loadHistoricalSnapshots();
}

// Save current financial snapshot
function saveSnapshot() {
    const date = document.getElementById('snapshotDate').value;
    const label = document.getElementById('snapshotLabel').value;
    
    if (!date) {
        showStatus('Please select a date for the snapshot', 'error');
        return;
    }
    
    // Collect current data
    const snapshot = {
        date: date,
        label: label || `Snapshot ${date}`,
        timestamp: Date.now(),
        data: {
            netWorth: dashboardData.netWorthData?.totals?.netWorth || 0,
            totalAssets: dashboardData.netWorthData?.totals?.totalAssets || 0,
            totalLiabilities: dashboardData.netWorthData?.totals?.totalLiabilities || 0,
            liquidNetWorth: dashboardData.netWorthData?.totals?.liquidNetWorth || 0,
            totalRecurringSavings: dashboardData.netWorthData?.totals?.totalRecurringSavings || 0,
            annualIncome: dashboardData.incomeData?.totals?.total || 0,
            annualExpenses: dashboardData.expensesData?.totals?.total || 0,
            ffScore: dashboardData.ffScoreData?.ffScore || 0,
            savingsRate: dashboardData.savingsRate || 0,
            // Asset breakdown
            assets: {
                realEstate: calculateCategoryTotal('realEstate'),
                equity: calculateCategoryTotal('equity'),
                fixedIncome: calculateCategoryTotal('fixedIncome'),
                otherAssets: calculateCategoryTotal('otherAssets')
            },
            // Recurring investments breakdown
            recurringInvestments: {
                totalSIP: getTotalRecurringByCategory('sip'),
                totalRD: getTotalRecurringByCategory('rd'),
                totalOtherSavings: getTotalRecurringByCategory('otherSavings')
            }
        }
    };
    
    // Save to localStorage
    let snapshots = JSON.parse(localStorage.getItem('historicalSnapshots') || '[]');
    snapshots.push(snapshot);
    
    // Keep only last 20 snapshots to avoid storage issues
    if (snapshots.length > 20) {
        snapshots = snapshots.slice(-20);
    }
    
    localStorage.setItem('historicalSnapshots', JSON.stringify(snapshots));
    
    // Clear form
    document.getElementById('snapshotLabel').value = '';
    
    // Reload display
    loadHistoricalSnapshots();
    
    showStatus('Financial snapshot saved successfully!', 'success');
}

// Load and display historical snapshots
function loadHistoricalSnapshots() {
    const snapshots = JSON.parse(localStorage.getItem('historicalSnapshots') || '[]');
    const container = document.getElementById('historicalSnapshots');
    
    if (snapshots.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📈</div>
                <h4>No Historical Data Yet</h4>
                <p>Save your first financial snapshot to start tracking your progress over time.</p>
            </div>
        `;
        document.getElementById('comparisonCharts').style.display = 'none';
        return;
    }
    
    // Sort snapshots by date
    snapshots.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    container.innerHTML = `
        <h3 style="margin-bottom: 1rem;">Saved Snapshots (${snapshots.length})</h3>
        <div class="grid-3">
            ${snapshots.map((snapshot, index) => `
                <div class="card" style="position: relative;">
                    <button onclick="deleteSnapshot(${index})" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; cursor: pointer;" title="Delete snapshot">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="card-body">
                        <h4 style="margin-bottom: 0.5rem;">${snapshot.label}</h4>
                        <small style="color: var(--text-secondary);">${new Date(snapshot.date).toLocaleDateString()}</small>
                        <div style="margin-top: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span>Net Worth:</span>
                                <strong>₹${snapshot.data.netWorth.toLocaleString('en-IN')}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span>Income:</span>
                                <strong>₹${snapshot.data.annualIncome.toLocaleString('en-IN')}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span>Expenses:</span>
                                <strong>₹${snapshot.data.annualExpenses.toLocaleString('en-IN')}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span>Monthly SIP:</span>
                                <strong>₹${snapshot.data.totalRecurringSavings.toLocaleString('en-IN')}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>FF Score:</span>
                                <strong>${snapshot.data.ffScore} years</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${snapshots.length >= 2 ? `
            <div style="margin-top: 2rem;">
                <h4>Year-over-Year Comparison</h4>
                ${generateComparisonTable(snapshots)}
            </div>
        ` : ''}
    `;
    
    // Show comparison charts if we have multiple snapshots
    if (snapshots.length >= 2) {
        createComparisonCharts(snapshots);
        document.getElementById('comparisonCharts').style.display = 'block';
    }
}

// Generate comparison table
function generateComparisonTable(snapshots) {
    if (snapshots.length < 2) return '';
    
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    
    const comparisons = [
        {
            metric: 'Net Worth',
            current: latest.data.netWorth,
            previous: previous.data.netWorth,
            format: 'currency'
        },
        {
            metric: 'Annual Income',
            current: latest.data.annualIncome,
            previous: previous.data.annualIncome,
            format: 'currency'
        },
        {
            metric: 'Annual Expenses',
            current: latest.data.annualExpenses,
            previous: previous.data.annualExpenses,
            format: 'currency'
        },
        {
            metric: 'Monthly Recurring Savings',
            current: latest.data.totalRecurringSavings,
            previous: previous.data.totalRecurringSavings,
            format: 'currency'
        },
        {
            metric: 'FF Score',
            current: latest.data.ffScore,
            previous: previous.data.ffScore,
            format: 'number'
        }
    ];
    
    return `
        <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding: 1rem; text-align: left;">Metric</th>
                        <th style="padding: 1rem; text-align: right;">Previous (${new Date(previous.date).toLocaleDateString()})</th>
                        <th style="padding: 1rem; text-align: right;">Current (${new Date(latest.date).toLocaleDateString()})</th>
                        <th style="padding: 1rem; text-align: right;">Change</th>
                        <th style="padding: 1rem; text-align: right;">% Change</th>
                    </tr>
                </thead>
                <tbody>
                    ${comparisons.map(comp => {
                        const change = comp.current - comp.previous;
                        const percentChange = comp.previous !== 0 ? (change / comp.previous) * 100 : 0;
                        const isPositive = change > 0;
                        const changeColor = isPositive ? 'var(--success-color)' : 'var(--error-color)';
                        
                        return `
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 1rem; font-weight: 500;">${comp.metric}</td>
                                <td style="padding: 1rem; text-align: right;">
                                    ${comp.format === 'currency' ? '₹' + comp.previous.toLocaleString('en-IN') : comp.previous}
                                </td>
                                <td style="padding: 1rem; text-align: right;">
                                    ${comp.format === 'currency' ? '₹' + comp.current.toLocaleString('en-IN') : comp.current}
                                </td>
                                <td style="padding: 1rem; text-align: right; color: ${changeColor};">
                                    ${isPositive ? '+' : ''}${comp.format === 'currency' ? '₹' + change.toLocaleString('en-IN') : change}
                                </td>
                                <td style="padding: 1rem; text-align: right; color: ${changeColor};">
                                    ${isPositive ? '+' : ''}${percentChange.toFixed(1)}%
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Helper functions for calculating category totals
function calculateCategoryTotal(category) {
    const netWorthData = dashboardData.netWorthData || {};
    const assets = netWorthData.assets || {};
    const categoryAssets = assets[category] || [];
    return categoryAssets.reduce((total, asset) => total + (asset.value || 0), 0);
}

function getTotalRecurringByCategory(category) {
    const netWorthData = dashboardData.netWorthData || {};
    const recurringInvestments = netWorthData.recurringInvestments || {};
    const categoryInvestments = recurringInvestments[category] || [];
    
    return categoryInvestments.reduce((total, investment) => {
        const amount = investment.amount || 0;
        const frequency = investment.frequency || 'monthly';
        return total + convertToMonthly(amount, frequency);
    }, 0);
}

function convertToMonthly(amount, frequency) {
    switch(frequency) {
        case 'monthly': return amount;
        case 'quarterly': return amount / 3;
        case 'semi-annually': return amount / 6;
        case 'annually': return amount / 12;
        default: return amount;
    }
}

// Delete a snapshot
function deleteSnapshot(index) {
    if (confirm('Are you sure you want to delete this snapshot?')) {
        let snapshots = JSON.parse(localStorage.getItem('historicalSnapshots') || '[]');
        snapshots.splice(index, 1);
        localStorage.setItem('historicalSnapshots', JSON.stringify(snapshots));
        loadHistoricalSnapshots();
        showStatus('Snapshot deleted successfully', 'success');
    }
}

// Create comparison charts
function createComparisonCharts(snapshots) {
    // Net Worth Trend Chart
    const netWorthCtx = document.getElementById('netWorthTrendChart');
    if (netWorthCtx) {
        if (charts.netWorthTrendChart) {
            charts.netWorthTrendChart.destroy();
        }
        
        charts.netWorthTrendChart = new Chart(netWorthCtx, {
            type: 'line',
            data: {
                labels: snapshots.map(s => new Date(s.date).toLocaleDateString()),
                datasets: [{
                    label: 'Net Worth',
                    data: snapshots.map(s => s.data.netWorth),
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Income vs Expenses Trend Chart
    const incomeExpenseCtx = document.getElementById('incomeExpenseTrendChart');
    if (incomeExpenseCtx) {
        if (charts.incomeExpenseTrendChart) {
            charts.incomeExpenseTrendChart.destroy();
        }
        
        charts.incomeExpenseTrendChart = new Chart(incomeExpenseCtx, {
            type: 'line',
            data: {
                labels: snapshots.map(s => new Date(s.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Income',
                        data: snapshots.map(s => s.data.annualIncome),
                        borderColor: 'var(--success-color)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: snapshots.map(s => s.data.annualExpenses),
                        borderColor: 'var(--error-color)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
    }
} 
// ===== FINANCIAL ANALYTICS DASHBOARD FUNCTIONALITY =====

let analyticsData = {};
let charts = {};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        loadAllUserData();
        generateAnalytics();
        initializeCalculators();
        
        // Setup navigation system
        if (typeof setupPageNavigation === 'function') {
            setupPageNavigation(9); // 9 = Analytics page
        }
    });
});

// Load all user data from previous pages
function loadAllUserData() {
    analyticsData = {
        personal: Storage.get('personalInfo', {}),
        netWorth: Storage.get('netWorthData', {}),
        income: Storage.get('incomeData', {}),
        expenses: Storage.get('expenseData', {}),
        ffScore: Storage.get('ffScoreData', {}),
        insurance: Storage.get('insuranceData', {}),
        riskProfile: Storage.get('riskProfileData', {})
    };
    
    console.log('Analytics data loaded:', analyticsData);
}

// Generate comprehensive analytics
function generateAnalytics() {
    displayNetWorthSummary();
    displayIncomeExpenseAnalysis();
    displayEmergencyFundStatus();
    displayFinancialHealthInsights();
    displayRiskProfile();
    createCharts();
}

// Initialize calculators with default calculations
function initializeCalculators() {
    calculateSIP();
    calculateGoal();
    calculateFreedom();
    calculateRetirement();
}

// 1. Display Net Worth Summary
function displayNetWorthSummary() {
    const netWorthData = analyticsData.netWorth.totals || {};
    
    // Display totals
    document.getElementById('totalAssets').textContent = formatCurrency(netWorthData.totalAssets || 0);
    document.getElementById('totalLiabilities').textContent = formatCurrency(netWorthData.totalLiabilities || 0);
    document.getElementById('netWorthValue').textContent = formatCurrency(netWorthData.netWorth || 0);
    
    // Create asset distribution chart
    createAssetDistributionChart();
}

// 2. Display Income vs Expense Analysis
function displayIncomeExpenseAnalysis() {
    const incomeData = analyticsData.income.totals || {};
    const expenseData = analyticsData.expenses.totals || {};
    
    const monthlyIncome = (incomeData.annualTotal || 0) / 12;
    const monthlyExpenses = (expenseData.annualTotal || 0) / 12;
    const savingsRatio = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    
    document.getElementById('monthlyIncome').textContent = formatCurrency(monthlyIncome);
    document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
    document.getElementById('savingsRatio').textContent = Math.round(savingsRatio) + '%';
    
    // Create cash flow chart
    createCashFlowChart(monthlyIncome, monthlyExpenses);
}

// 3. Display Emergency Fund Status
function displayEmergencyFundStatus() {
    const netWorthData = analyticsData.netWorth.assets || {};
    const monthlyExpenses = (analyticsData.expenses.totals?.annualTotal || 0) / 12;
    
    // Calculate liquid assets (cash + FD + liquid funds)
    let liquidAssets = 0;
    
    // Add cash
    if (netWorthData.cash && Array.isArray(netWorthData.cash)) {
        liquidAssets += netWorthData.cash.reduce((sum, item) => sum + (parseFloat(item.currentValue) || 0), 0);
    }
    
    // Add fixed deposits
    if (netWorthData.fixedDeposits && Array.isArray(netWorthData.fixedDeposits)) {
        liquidAssets += netWorthData.fixedDeposits.reduce((sum, item) => sum + (parseFloat(item.currentValue) || 0), 0);
    }
    
    // Add debt funds (assuming they're liquid)
    if (netWorthData.mutualFunds && Array.isArray(netWorthData.mutualFunds)) {
        liquidAssets += netWorthData.mutualFunds
            .filter(item => item.category?.toLowerCase().includes('debt') || item.category?.toLowerCase().includes('liquid'))
            .reduce((sum, item) => sum + (parseFloat(item.currentValue) || 0), 0);
    }
    
    const emergencyFundMonths = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0;
    const progressPercentage = Math.min((emergencyFundMonths / 6) * 100, 100);
    
    document.getElementById('emergencyFundMonths').textContent = emergencyFundMonths.toFixed(1);
    document.getElementById('emergencyFundProgress').style.width = progressPercentage + '%';
    
    // Color code based on adequacy
    const monthsElement = document.getElementById('emergencyFundMonths');
    if (emergencyFundMonths >= 6) {
        monthsElement.style.color = 'var(--success-color)';
        document.getElementById('emergencyFundProgress').style.background = 'var(--success-color)';
    } else if (emergencyFundMonths >= 3) {
        monthsElement.style.color = 'var(--warning-color)';
        document.getElementById('emergencyFundProgress').style.background = 'var(--warning-color)';
    } else {
        monthsElement.style.color = 'var(--danger-color)';
        document.getElementById('emergencyFundProgress').style.background = 'var(--danger-color)';
    }
    
    // Display liquid assets breakdown
    displayLiquidAssetsBreakdown(liquidAssets, netWorthData);
}

// Display liquid assets breakdown
function displayLiquidAssetsBreakdown(totalLiquid, netWorthData) {
    const breakdown = [];
    
    // Cash
    if (netWorthData.cash && Array.isArray(netWorthData.cash)) {
        const cashTotal = netWorthData.cash.reduce((sum, item) => sum + (parseFloat(item.currentValue) || 0), 0);
        if (cashTotal > 0) {
            breakdown.push({ label: 'Cash & Savings', amount: cashTotal, percentage: (cashTotal / totalLiquid) * 100 });
        }
    }
    
    // Fixed Deposits
    if (netWorthData.fixedDeposits && Array.isArray(netWorthData.fixedDeposits)) {
        const fdTotal = netWorthData.fixedDeposits.reduce((sum, item) => sum + (parseFloat(item.currentValue) || 0), 0);
        if (fdTotal > 0) {
            breakdown.push({ label: 'Fixed Deposits', amount: fdTotal, percentage: (fdTotal / totalLiquid) * 100 });
        }
    }
    
    // Liquid/Debt Funds
    if (netWorthData.mutualFunds && Array.isArray(netWorthData.mutualFunds)) {
        const liquidFunds = netWorthData.mutualFunds
            .filter(item => item.category?.toLowerCase().includes('debt') || item.category?.toLowerCase().includes('liquid'))
            .reduce((sum, item) => sum + (parseFloat(item.currentValue) || 0), 0);
        if (liquidFunds > 0) {
            breakdown.push({ label: 'Liquid/Debt Funds', amount: liquidFunds, percentage: (liquidFunds / totalLiquid) * 100 });
        }
    }
    
    const container = document.getElementById('liquidAssetsBreakdown');
    container.innerHTML = breakdown.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding: 0.5rem; background: #f8fafc; border-radius: 0.25rem;">
            <span style="font-weight: 500;">${item.label}</span>
            <div style="text-align: right;">
                <div style="font-weight: 600;">${formatCurrency(item.amount)}</div>
                <small style="color: var(--text-secondary);">${item.percentage.toFixed(1)}%</small>
            </div>
        </div>
    `).join('') || '<p style="color: var(--text-secondary); text-align: center;">No liquid assets found</p>';
}

// 4. Display Financial Health Insights
function displayFinancialHealthInsights() {
    const annualIncome = analyticsData.income.totals?.annualTotal || 0;
    const annualExpenses = analyticsData.expenses.totals?.annualTotal || 0;
    const totalLiabilities = analyticsData.netWorth.totals?.totalLiabilities || 0;
    const totalAssets = analyticsData.netWorth.totals?.totalAssets || 0;
    
    // 1. Savings Ratio
    const savingsRatio = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
    document.getElementById('savingsRatioMetric').textContent = Math.round(savingsRatio) + '%';
    updateProgressBar('savingsRatioBar', savingsRatio, 30, 'var(--success-color)');
    colorizeMetric('savingsRatioMetric', savingsRatio, 15, 25);
    
    // 2. EMI-to-Income (estimate from liabilities)
    const estimatedEMI = totalLiabilities * 0.012; // Rough estimate: 1.2% monthly EMI rate
    const monthlyIncome = annualIncome / 12;
    const emiToIncomeRatio = monthlyIncome > 0 ? (estimatedEMI / monthlyIncome) * 100 : 0;
    document.getElementById('emiToIncomeRatio').textContent = Math.round(emiToIncomeRatio) + '%';
    updateProgressBar('emiToIncomeBar', emiToIncomeRatio, 40, 'var(--danger-color)');
    colorizeMetric('emiToIncomeRatio', emiToIncomeRatio, 30, 20, true); // Lower is better
    
    // 3. Asset-to-Liability Ratio
    const assetLiabilityRatio = totalLiabilities > 0 ? totalAssets / totalLiabilities : totalAssets > 0 ? 99 : 0;
    document.getElementById('assetLiabilityRatio').textContent = assetLiabilityRatio.toFixed(1) + 'x';
    updateProgressBar('assetLiabilityBar', Math.min(assetLiabilityRatio * 20, 100), 100, 'var(--success-color)');
    colorizeMetric('assetLiabilityRatio', assetLiabilityRatio, 2, 5);
    
    // 4. YoY Net Worth Growth (estimated)
    const ffScoreData = analyticsData.ffScore;
    const estimatedGrowth = ffScoreData.assetGrowthRate || 8;
    document.getElementById('netWorthGrowth').textContent = estimatedGrowth.toFixed(1) + '%';
    updateProgressBar('netWorthGrowthBar', estimatedGrowth * 5, 100, 'var(--primary-color)');
    colorizeMetric('netWorthGrowth', estimatedGrowth, 6, 12);
}

// Update progress bar
function updateProgressBar(elementId, value, maxValue, color) {
    const percentage = Math.min((value / maxValue) * 100, 100);
    const element = document.getElementById(elementId);
    if (element) {
        element.style.width = percentage + '%';
        element.style.background = color;
    }
}

// Colorize metric based on thresholds
function colorizeMetric(elementId, value, lowThreshold, highThreshold, isReverse = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (isReverse) {
        // For ratios where lower is better
        if (value <= lowThreshold) {
            element.style.color = 'var(--success-color)';
        } else if (value <= highThreshold) {
            element.style.color = 'var(--warning-color)';
        } else {
            element.style.color = 'var(--danger-color)';
        }
    } else {
        // For ratios where higher is better
        if (value >= highThreshold) {
            element.style.color = 'var(--success-color)';
        } else if (value >= lowThreshold) {
            element.style.color = 'var(--warning-color)';
        } else {
            element.style.color = 'var(--danger-color)';
        }
    }
}

// 5. Display Risk Profile
function displayRiskProfile() {
    const riskProfile = analyticsData.riskProfile.riskProfile || 'Not Assessed';
    const totalScore = analyticsData.riskProfile.totalScore || 0;
    
    const riskProfileEmoji = getRiskProfileEmoji(riskProfile);
    
    document.getElementById('riskProfileDisplay').innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">${riskProfileEmoji}</div>
            <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${riskProfile}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">Risk Score: ${totalScore}/32</p>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; text-align: left;">
                <h4 style="margin-bottom: 0.5rem;">Profile Characteristics:</h4>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">
                    ${getRiskProfileDescription(riskProfile)}
                </div>
            </div>
        </div>
    `;
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

// Get risk profile description
function getRiskProfileDescription(riskProfile) {
    const descriptions = {
        'Conservative': 'Prioritizes capital preservation • Low risk tolerance • Prefers guaranteed returns • Suitable for debt instruments',
        'Risk Averse': 'Moderate risk tolerance • Prefers stable investments • Some allocation to growth assets • Balanced approach',
        'Balanced': 'Balanced risk approach • Comfortable with volatility • Mix of growth and income assets • Long-term perspective',
        'Aggressive': 'High risk tolerance • Seeks maximum returns • Comfortable with volatility • Growth-focused strategy'
    };
    return descriptions[riskProfile] || 'Risk profile assessment pending';
}

// ===== CALCULATOR FUNCTIONS =====

// 1. SIP Calculator
function calculateSIP() {
    const monthlyAmount = parseFloat(document.getElementById('sipAmount').value) || 5000;
    const annualReturn = parseFloat(document.getElementById('sipReturn').value) || 12;
    const years = parseFloat(document.getElementById('sipDuration').value) || 10;
    
    const monthlyReturn = annualReturn / 12 / 100;
    const months = years * 12;
    
    // SIP Formula: FV = P * [((1 + r)^n - 1) / r] * (1 + r)
    const futureValue = monthlyAmount * (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn));
    const totalInvested = monthlyAmount * months;
    const returns = futureValue - totalInvested;
    
    document.getElementById('sipInvested').textContent = formatCurrency(totalInvested);
    document.getElementById('sipFutureValue').textContent = formatCurrency(futureValue);
    document.getElementById('sipReturns').textContent = formatCurrency(returns);
}

// 2. Goal-Based Investment Calculator
function calculateGoal() {
    const targetAmount = parseFloat(document.getElementById('goalTarget').value) || 1000000;
    const years = parseFloat(document.getElementById('goalYears').value) || 10;
    const annualReturn = parseFloat(document.getElementById('goalReturn').value) || 12;
    
    const monthlyReturn = annualReturn / 12 / 100;
    const months = years * 12;
    
    // Reverse SIP Formula: P = FV * r / [((1 + r)^n - 1) * (1 + r)]
    const monthlySIP = targetAmount * monthlyReturn / (((Math.pow(1 + monthlyReturn, months) - 1) * (1 + monthlyReturn)));
    const totalInvestment = monthlySIP * months;
    const wealthCreation = targetAmount - totalInvestment;
    
    document.getElementById('goalMonthlySIP').textContent = formatCurrency(monthlySIP);
    document.getElementById('goalTotalInvestment').textContent = formatCurrency(totalInvestment);
    document.getElementById('goalWealthCreation').textContent = formatCurrency(wealthCreation);
}

// 3. Financial Freedom Calculator
function calculateFreedom() {
    const netWorth = parseFloat(document.getElementById('freedomNetWorth').value) || 500000;
    const annualExpenses = parseFloat(document.getElementById('freedomExpenses').value) || 360000;
    const growthRate = parseFloat(document.getElementById('freedomGrowth').value) || 10;
    const inflationRate = parseFloat(document.getElementById('freedomInflation').value) || 6;
    
    let currentNetWorth = netWorth;
    let currentExpenses = annualExpenses;
    let years = 0;
    const maxYears = 100;
    
    // Simulation with compound growth and inflation
    while (currentNetWorth > currentExpenses && years < maxYears) {
        // Deduct annual expenses first
        currentNetWorth -= currentExpenses;
        
        // If net worth becomes negative or zero, break
        if (currentNetWorth <= 0) {
            break;
        }
        
        // Apply asset growth to remaining net worth
        currentNetWorth *= (1 + growthRate / 100);
        
        // Apply inflation to expenses for next year
        currentExpenses *= (1 + inflationRate / 100);
        
        years++;
    }
    
    const freedomYears = Math.min(years, maxYears);
    
    // Update display
    document.getElementById('freedomYears').textContent = freedomYears;
    
    // Update progress bar (scale 0-100, where 25+ years = 100%)
    const progressPercentage = Math.min((freedomYears / 25) * 100, 100);
    document.getElementById('freedomScoreBar').style.width = progressPercentage + '%';
    
    // Update status and color
    let status = '';
    let color = '';
    
    if (freedomYears >= 25) {
        status = 'Excellent - Financially Independent';
        color = 'var(--success-color)';
    } else if (freedomYears >= 15) {
        status = 'Good - On track to freedom';
        color = 'var(--primary-color)';
    } else if (freedomYears >= 5) {
        status = 'Moderate - Building wealth';
        color = 'var(--warning-color)';
    } else {
        status = 'Critical - Needs immediate attention';
        color = 'var(--danger-color)';
    }
    
    document.getElementById('freedomStatus').textContent = status;
    document.getElementById('freedomYears').style.color = color;
}

// 4. Retirement Corpus Calculator
function calculateRetirement() {
    const currentExpense = parseFloat(document.getElementById('retirementExpense').value) || 600000;
    const yearsToRetirement = parseFloat(document.getElementById('retirementYears').value) || 25;
    const inflationRate = parseFloat(document.getElementById('retirementInflation').value) || 6;
    const postRetirementReturn = parseFloat(document.getElementById('retirementReturn').value) || 7;
    const retirementDuration = parseFloat(document.getElementById('retirementDuration').value) || 20;
    
    // Calculate inflation-adjusted expense at retirement
    const inflatedExpense = currentExpense * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    
    // Calculate corpus needed using present value of annuity formula
    const monthlyReturn = postRetirementReturn / 12 / 100;
    const months = retirementDuration * 12;
    const monthlyExpense = inflatedExpense / 12;
    
    // PV = PMT * [(1 - (1 + r)^(-n)) / r]
    const corpusRequired = monthlyExpense * ((1 - Math.pow(1 + monthlyReturn, -months)) / monthlyReturn);
    
    // Calculate monthly SIP needed (assuming 12% pre-retirement return)
    const preRetirementReturn = 12 / 12 / 100;
    const preRetirementMonths = yearsToRetirement * 12;
    const monthlySIP = corpusRequired * preRetirementReturn / (((Math.pow(1 + preRetirementReturn, preRetirementMonths) - 1) * (1 + preRetirementReturn)));
    
    document.getElementById('retirementCorpus').textContent = formatCurrency(corpusRequired);
    document.getElementById('retirementInflatedExpense').textContent = formatCurrency(inflatedExpense);
    document.getElementById('retirementMonthlySIP').textContent = formatCurrency(monthlySIP);
}

// ===== FAQ FUNCTIONALITY =====

function toggleFAQ() {
    const content = document.getElementById('faqContent');
    const chevron = document.getElementById('faqChevron');
    
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        chevron.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('open');
        chevron.style.transform = 'rotate(180deg)';
    }
}

// Create Charts
function createCharts() {
    createAssetDistributionChart();
    // Note: cashFlowChart is created in displayIncomeExpenseAnalysis
}

// Create asset distribution pie chart
function createAssetDistributionChart() {
    const ctx = document.getElementById('assetDistributionChart').getContext('2d');
    const netWorthData = analyticsData.netWorth.assets || {};
    
    const assetData = [];
    const assetLabels = [];
    const assetColors = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#06b6d4'];
    
    // Calculate asset values by category
    const categories = {
        'Equity': ['stocks', 'mutualFunds'],
        'Fixed Deposits': ['fixedDeposits'],
        'Cash': ['cash'],
        'Gold': ['gold'],
        'Real Estate': ['realEstate'],
        'Others': ['otherAssets']
    };
    
    Object.keys(categories).forEach((categoryName, index) => {
        let categoryTotal = 0;
        categories[categoryName].forEach(assetType => {
            if (netWorthData[assetType] && Array.isArray(netWorthData[assetType])) {
                categoryTotal += netWorthData[assetType].reduce((sum, item) => 
                    sum + (parseFloat(item.currentValue) || 0), 0
                );
            }
        });
        
        if (categoryTotal > 0) {
            assetLabels.push(categoryName);
            assetData.push(categoryTotal);
        }
    });
    
    if (assetData.length === 0) {
        // Show placeholder if no data
        assetLabels.push('No Assets');
        assetData.push(1);
    }
    
    charts.assetDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: assetLabels,
            datasets: [{
                data: assetData,
                backgroundColor: assetColors.slice(0, assetData.length),
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
                        usePointStyle: true,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

// Create cash flow bar chart
function createCashFlowChart(monthlyIncome, monthlyExpenses) {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');
    const monthlySavings = monthlyIncome - monthlyExpenses;
    
    charts.cashFlow = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monthly Cash Flow'],
            datasets: [{
                label: 'Income',
                data: [monthlyIncome],
                backgroundColor: '#22c55e',
                borderWidth: 0
            }, {
                label: 'Expenses',
                data: [monthlyExpenses],
                backgroundColor: '#ef4444',
                borderWidth: 0
            }, {
                label: 'Savings',
                data: [monthlySavings],
                backgroundColor: monthlySavings >= 0 ? '#3b82f6' : '#f59e0b',
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

// Navigation functions
function goBack() {
    window.location.href = 'dashboard.html';
}

function goToFindAdvisor() {
    showStatus('Navigating to Find Advisor page...', 'success');
    setTimeout(() => {
        window.location.href = 'find-advisor.html';
    }, 1000);
}

function completeJourney() {
    showStatus('Financial analytics review completed! You can always return to analyze your data.', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

// Clean up charts when navigating away
window.addEventListener('beforeunload', () => {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
}); 
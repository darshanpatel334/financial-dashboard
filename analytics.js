// ===== FINANCIAL ANALYTICS DASHBOARD FUNCTIONALITY =====

let analyticsData = {};
let charts = {};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        loadAllUserData();
        generateAnalytics();
        
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
    calculateFinancialHealthScore();
    calculateKeyRatios();
    generateEducationalInsights();
    displayRiskProfile();
    populateResourcesAndTools();
    createAnalyticsCharts();
}

// Calculate overall financial health score (for educational purposes)
function calculateFinancialHealthScore() {
    let totalScore = 0;
    let maxScore = 100;
    
    // FF Score (30 points)
    const ffScore = analyticsData.ffScore.currentScore || 0;
    const ffPoints = Math.min((ffScore / 25) * 30, 30);
    totalScore += ffPoints;
    
    // Savings Rate (25 points)
    const annualIncome = analyticsData.income.totals?.annualTotal || 0;
    const annualExpenses = analyticsData.expenses.totals?.annualTotal || 0;
    const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
    const savingsPoints = Math.min((savingsRate / 30) * 25, 25);
    totalScore += savingsPoints;
    
    // Insurance Coverage (20 points)
    const lifeInsuranceRatio = analyticsData.insurance.analysis?.lifeInsuranceRatio || 0;
    const insurancePoints = Math.min((lifeInsuranceRatio / 10) * 20, 20);
    totalScore += insurancePoints;
    
    // Diversification (15 points)
    const diversificationPoints = calculateDiversificationScore();
    totalScore += diversificationPoints;
    
    // Emergency Fund (10 points)
    const emergencyFundPoints = calculateEmergencyFundScore();
    totalScore += emergencyFundPoints;
    
    const healthScore = Math.round(totalScore);
    document.getElementById('healthScore').textContent = healthScore;
    
    // Color code the score
    const scoreElement = document.getElementById('healthScore');
    if (healthScore >= 80) {
        scoreElement.style.color = 'var(--success-color)';
    } else if (healthScore >= 60) {
        scoreElement.style.color = 'var(--warning-color)';
    } else {
        scoreElement.style.color = 'var(--danger-color)';
    }
    
    // Generate breakdown
    generateHealthScoreBreakdown({
        ffScore: ffPoints,
        savingsRate: savingsPoints,
        insurance: insurancePoints,
        diversification: diversificationPoints,
        emergencyFund: emergencyFundPoints
    });
    
    // Generate improvement areas
    generateImprovementAreas(healthScore, {
        ffScore: ffPoints,
        savingsRate: savingsPoints,
        insurance: insurancePoints,
        diversification: diversificationPoints,
        emergencyFund: emergencyFundPoints
    });
}

// Calculate diversification score
function calculateDiversificationScore() {
    const netWorthData = analyticsData.netWorth;
    if (!netWorthData.assets) return 0;
    
    const categories = Object.keys(netWorthData.assets || {}).filter(cat => 
        Array.isArray(netWorthData.assets[cat]) && netWorthData.assets[cat].length > 0
    );
    
    if (categories.length < 2) return 0;
    if (categories.length < 3) return 5;
    if (categories.length < 4) return 10;
    return 15;
}

// Calculate emergency fund score
function calculateEmergencyFundScore() {
    const riskProfile = analyticsData.riskProfile.responses?.emergency || 1;
    return Math.min(riskProfile * 2.5, 10);
}

// Generate health score breakdown
function generateHealthScoreBreakdown(scores) {
    const breakdown = [
        { label: 'Financial Freedom Score', score: scores.ffScore, max: 30 },
        { label: 'Savings Rate', score: scores.savingsRate, max: 25 },
        { label: 'Insurance Coverage', score: scores.insurance, max: 20 },
        { label: 'Portfolio Diversification', score: scores.diversification, max: 15 },
        { label: 'Emergency Fund', score: scores.emergencyFund, max: 10 }
    ];
    
    const breakdownContainer = document.getElementById('healthScoreBreakdown');
    breakdownContainer.innerHTML = breakdown.map(item => {
        const percentage = (item.score / item.max) * 100;
        return `
            <div style="margin-bottom: 0.75rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                    <span>${item.label}</span>
                    <span>${Math.round(item.score)}/${item.max}</span>
                </div>
                <div class="progress-bar" style="height: 0.4rem; background: #e5e7eb; border-radius: 0.2rem;">
                    <div class="progress-fill" style="width: ${percentage}%; height: 100%; background: ${percentage >= 80 ? 'var(--success-color)' : percentage >= 60 ? 'var(--warning-color)' : 'var(--danger-color)'}; border-radius: 0.2rem; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Generate improvement areas (educational insights)
function generateImprovementAreas(healthScore, scores) {
    const areas = [];
    
    if (scores.ffScore < 15) areas.push({ icon: '🎯', text: 'Consider building emergency fund and reducing expenses', priority: 'high' });
    if (scores.savingsRate < 15) areas.push({ icon: '💰', text: 'Review spending patterns to increase savings rate', priority: 'high' });
    if (scores.insurance < 12) areas.push({ icon: '🛡️', text: 'Evaluate insurance coverage adequacy', priority: 'medium' });
    if (scores.diversification < 8) areas.push({ icon: '📊', text: 'Consider diversifying across asset classes', priority: 'medium' });
    if (scores.emergencyFund < 6) areas.push({ icon: '⚠️', text: 'Build emergency fund for financial security', priority: 'medium' });
    
    if (areas.length === 0) {
        areas.push({ icon: '✅', text: 'Financial metrics look healthy - continue monitoring', priority: 'low' });
    }
    
    const areasContainer = document.getElementById('improvementAreas');
    areasContainer.innerHTML = areas.map(area => {
        const color = area.priority === 'high' ? 'var(--danger-color)' : 
                     area.priority === 'medium' ? 'var(--warning-color)' : 'var(--success-color)';
        return `
            <div style="display: flex; align-items: center; margin-bottom: 0.75rem; padding: 0.75rem; border-left: 3px solid ${color}; background: ${color}20; border-radius: 0.25rem;">
                <span style="margin-right: 0.75rem; font-size: 1.2rem;">${area.icon}</span>
                <span style="flex: 1; font-size: 0.9rem;">${area.text}</span>
                <span style="font-size: 0.7rem; padding: 0.2rem 0.5rem; background: ${color}; color: white; border-radius: 0.2rem; text-transform: uppercase;">
                    ${area.priority}
                </span>
            </div>
        `;
    }).join('');
}

// Calculate key financial ratios
function calculateKeyRatios() {
    const annualIncome = analyticsData.income.totals?.annualTotal || 0;
    const annualExpenses = analyticsData.expenses.totals?.annualTotal || 0;
    const totalLiabilities = analyticsData.netWorth.totals?.totalLiabilities || 0;
    const lifeInsuranceRatio = analyticsData.insurance.analysis?.lifeInsuranceRatio || 0;
    
    // Savings Rate
    const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
    document.getElementById('savingsRateMetric').textContent = Math.round(savingsRate) + '%';
    colorizeMetric('savingsRateMetric', savingsRate, 15, 25);
    
    // Debt-to-Income
    const debtToIncome = annualIncome > 0 ? (totalLiabilities / annualIncome) * 100 : 0;
    document.getElementById('debtToIncome').textContent = Math.round(debtToIncome) + '%';
    colorizeMetric('debtToIncome', debtToIncome, 30, 20, true); // Lower is better
    
    // Insurance Coverage
    document.getElementById('insuranceCoverage').textContent = lifeInsuranceRatio.toFixed(1) + 'x';
    colorizeMetric('insuranceCoverage', lifeInsuranceRatio, 8, 12);
    
    // Emergency Fund
    const emergencyFundRatio = analyticsData.riskProfile.responses?.emergency || 0;
    document.getElementById('emergencyFundRatio').textContent = emergencyFundRatio * 1.5; // Rough estimation
    colorizeMetric('emergencyFundRatio', emergencyFundRatio, 2, 4);
}

// Colorize metric based on thresholds
function colorizeMetric(elementId, value, lowThreshold, highThreshold, isReverse = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (isReverse) {
        // For debt ratios where lower is better
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

// Generate educational insights
function generateEducationalInsights() {
    const insights = [
        {
            title: 'Savings Rate',
            content: 'Your savings rate indicates what percentage of your income you save. A higher savings rate (20%+) typically leads to faster wealth building and financial independence.'
        },
        {
            title: 'Debt-to-Income Ratio',
            content: 'This ratio shows how much of your income goes toward debt payments. Generally, keeping this below 20% is considered healthy for long-term financial stability.'
        },
        {
            title: 'Emergency Fund',
            content: 'An emergency fund covering 6+ months of expenses provides financial security during unexpected situations like job loss or medical emergencies.'
        },
        {
            title: 'Life Insurance Coverage',
            content: 'Life insurance should typically be 10-15 times your annual income to adequately protect your family\'s financial future.'
        },
        {
            title: 'Portfolio Diversification',
            content: 'Diversifying across different asset classes (equity, fixed income, real estate) can help reduce risk and optimize returns over time.'
        }
    ];
    
    const insightsContainer = document.getElementById('educationalInsights');
    insightsContainer.innerHTML = insights.map(insight => `
        <div class="card" style="margin-bottom: 1rem;">
            <div class="card-body">
                <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">${insight.title}</h4>
                <p style="margin: 0; color: var(--text-secondary); line-height: 1.5;">${insight.content}</p>
            </div>
        </div>
    `).join('');
}

// Display risk profile information
function displayRiskProfile() {
    const riskProfile = analyticsData.riskProfile.riskProfile || 'Not Assessed';
    const totalScore = analyticsData.riskProfile.totalScore || 0;
    
    document.getElementById('riskProfileDisplay').innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${getRiskProfileEmoji(riskProfile)}</div>
            <h3 style="color: var(--primary-color);">${riskProfile}</h3>
            <p style="color: var(--text-secondary);">Score: ${totalScore}/32</p>
        </div>
    `;
    
    const responses = analyticsData.riskProfile.responses || {};
    document.getElementById('riskAssessmentDetails').innerHTML = `
        <div style="font-size: 0.9rem;">
            <div style="margin-bottom: 0.5rem;"><strong>Investment Horizon:</strong> ${getHorizonText(responses.horizon)}</div>
            <div style="margin-bottom: 0.5rem;"><strong>Risk Tolerance:</strong> ${getRiskToleranceText(responses.volatility)}</div>
            <div style="margin-bottom: 0.5rem;"><strong>Investment Knowledge:</strong> ${getKnowledgeText(responses.knowledge)}</div>
            <div><strong>Income Stability:</strong> ${getIncomeText(responses.income)}</div>
        </div>
    `;
}

// Helper functions for risk profile display
function getRiskProfileEmoji(riskProfile) {
    const emojis = {
        'Conservative': '🔒',
        'Risk Averse': '🛡️',
        'Balanced': '⚖️',
        'Aggressive': '🚀'
    };
    return emojis[riskProfile] || '📊';
}

function getHorizonText(horizon) {
    const texts = { 1: 'Less than 2 years', 2: '2-5 years', 3: '5-10 years', 4: 'More than 10 years' };
    return texts[horizon] || 'Not specified';
}

function getRiskToleranceText(volatility) {
    const texts = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High' };
    return texts[volatility] || 'Not specified';
}

function getKnowledgeText(knowledge) {
    const texts = { 1: 'Beginner', 2: 'Basic', 3: 'Good', 4: 'Expert' };
    return texts[knowledge] || 'Not specified';
}

function getIncomeText(income) {
    const texts = { 1: 'Variable', 2: 'Moderately Stable', 3: 'Very Stable', 4: 'Multiple Sources' };
    return texts[income] || 'Not specified';
}

// Populate resources and tools
function populateResourcesAndTools() {
    // Useful Apps
    const apps = [
        'ET Money - Expense tracking',
        'Coin by Zerodha - Mutual funds',
        'Kuvera - Investment platform',
        'PayTM Money - Investment app',
        'CRED - Credit card management'
    ];
    
    document.getElementById('usefulApps').innerHTML = apps.map(app => 
        `<div style="margin-bottom: 0.5rem; font-size: 0.9rem;">• ${app}</div>`
    ).join('');
    
    // Educational Resources
    const resources = [
        'Varsity by Zerodha - Free trading courses',
        'RBI Financial Education - Official guides',
        'SEBI Investor Education - Regulatory guidance',
        'Economic Times - Financial news',
        'MoneyControl - Market analysis'
    ];
    
    document.getElementById('educationalResources').innerHTML = resources.map(resource => 
        `<div style="margin-bottom: 0.5rem; font-size: 0.9rem;">• ${resource}</div>`
    ).join('');
    
    // Online Calculators
    const calculators = [
        'SIP Calculator',
        'Retirement Planning Calculator',
        'EMI Calculator',
        'Tax Calculator',
        'FD Calculator'
    ];
    
    document.getElementById('onlineCalculators').innerHTML = calculators.map(calc => 
        `<div style="margin-bottom: 0.5rem; font-size: 0.9rem;">• ${calc}</div>`
    ).join('');
}

// Create analytics charts
function createAnalyticsCharts() {
    createNetWorthTrendChart();
    createCashFlowChart();
}

// Create net worth trend chart (simulated data)
function createNetWorthTrendChart() {
    const ctx = document.getElementById('netWorthTrendChart').getContext('2d');
    const currentNetWorth = analyticsData.netWorth.totals?.netWorth || 0;
    
    // Generate trend data (current month and 11 previous months)
    const months = [];
    const netWorthData = [];
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
        // Simulate growth with some variation
        const growthFactor = (12 - i) / 12;
        netWorthData.push(Math.round(currentNetWorth * (0.7 + growthFactor * 0.3)));
    }
    
    charts.netWorthTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Net Worth',
                data: netWorthData,
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primary + '20',
                fill: true,
                tension: 0.1
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
                    display: false
                }
            }
        }
    });
}

// Create cash flow chart
function createCashFlowChart() {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');
    
    const monthlyIncome = (analyticsData.income.totals?.annualTotal || 0) / 12;
    const monthlyExpenses = (analyticsData.expenses.totals?.annualTotal || 0) / 12;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    
    charts.cashFlow = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monthly Cash Flow'],
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
                label: 'Surplus',
                data: [monthlySavings],
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

// Navigation functions
function goBack() {
    window.location.href = 'dashboard.html';
}

function completeJourney() {
    // Clear any temporary data and redirect to dashboard
    showStatus('Financial journey completed! You can always come back to review your analytics.', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

// Chart colors (consistent with other pages)
const chartColors = {
    primary: '#2563eb',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6'
};

// Clean up charts when navigating away
window.addEventListener('beforeunload', () => {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
}); 
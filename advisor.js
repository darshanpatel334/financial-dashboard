// ===== FINANCIAL ADVISOR PAGE FUNCTIONALITY =====

let advisorData = {};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        loadAllUserData();
        generateAdvisoryReport();
    });
});

// Load all user data from previous pages
function loadAllUserData() {
    advisorData = {
        personal: Storage.get('personalData', {}),
        netWorth: Storage.get('netWorthData', {}),
        income: Storage.get('incomeData', {}),
        expenses: Storage.get('expenseData', {}),
        ffScore: Storage.get('ffScoreData', {}),
        insurance: Storage.get('insuranceData', {}),
        riskProfile: Storage.get('riskProfileData', {})
    };
}

// Generate comprehensive advisory report
function generateAdvisoryReport() {
    calculateFinancialHealthScore();
    generatePersonalizedRecommendations();
    generateInvestmentStrategy();
    generateGoalBasedPlanning();
    generateRiskManagementStrategy();
    generateTaxOptimization();
    generateActionPlan();
    generateResourceRecommendations();
}

// Calculate overall financial health score
function calculateFinancialHealthScore() {
    let totalScore = 0;
    let maxScore = 100;
    
    // FF Score (30 points)
    const ffScore = advisorData.ffScore.currentScore || 0;
    const ffPoints = Math.min((ffScore / 25) * 30, 30); // 25+ years = full points
    totalScore += ffPoints;
    
    // Savings Rate (20 points)
    const annualIncome = advisorData.income.totals?.annualTotal || 0;
    const annualExpenses = advisorData.expenses.totals?.annualTotal || 0;
    const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
    const savingsPoints = Math.min((savingsRate / 30) * 20, 20); // 30% = full points
    totalScore += savingsPoints;
    
    // Insurance Coverage (15 points)
    const lifeInsuranceRatio = advisorData.insurance.analysis?.lifeInsuranceRatio || 0;
    const healthCoverageScore = advisorData.insurance.analysis?.healthCoverageScore || 0;
    const insurancePoints = Math.min(((lifeInsuranceRatio / 10) * 10) + ((healthCoverageScore / 10) * 5), 15);
    totalScore += insurancePoints;
    
    // Diversification (15 points)
    const diversificationPoints = calculateDiversificationScore();
    totalScore += diversificationPoints;
    
    // Emergency Fund (10 points)
    const emergencyFundPoints = calculateEmergencyFundScore();
    totalScore += emergencyFundPoints;
    
    // Investment Knowledge (10 points)
    const knowledgePoints = calculateKnowledgeScore();
    totalScore += knowledgePoints;
    
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
        emergencyFund: emergencyFundPoints,
        knowledge: knowledgePoints
    });
    
    // Generate priority areas
    generatePriorityAreas(healthScore, {
        ffScore: ffPoints,
        savingsRate: savingsPoints,
        insurance: insurancePoints,
        diversification: diversificationPoints,
        emergencyFund: emergencyFundPoints,
        knowledge: knowledgePoints
    });
}

// Calculate diversification score
function calculateDiversificationScore() {
    const netWorthData = advisorData.netWorth;
    if (!netWorthData.categoryTotals) return 0;
    
    const totalAssets = netWorthData.totals?.totalAssets || 1;
    const categories = Object.keys(netWorthData.categoryTotals || {});
    
    if (categories.length < 2) return 0;
    if (categories.length < 3) return 5;
    if (categories.length < 4) return 10;
    return 15;
}

// Calculate emergency fund score
function calculateEmergencyFundScore() {
    const riskProfile = advisorData.riskProfile.responses?.emergency || 1;
    return Math.min(riskProfile * 2.5, 10); // 4 (6+ months) = 10 points
}

// Calculate knowledge score
function calculateKnowledgeScore() {
    const knowledge = advisorData.riskProfile.responses?.knowledge || 1;
    return Math.min(knowledge * 2.5, 10); // 4 (expert) = 10 points
}

// Generate health score breakdown
function generateHealthScoreBreakdown(scores) {
    const breakdown = [
        { label: 'Financial Freedom', score: scores.ffScore, max: 30 },
        { label: 'Savings Rate', score: scores.savingsRate, max: 20 },
        { label: 'Insurance Coverage', score: scores.insurance, max: 15 },
        { label: 'Diversification', score: scores.diversification, max: 15 },
        { label: 'Emergency Fund', score: scores.emergencyFund, max: 10 },
        { label: 'Investment Knowledge', score: scores.knowledge, max: 10 }
    ];
    
    const breakdownContainer = document.getElementById('healthScoreBreakdown');
    breakdownContainer.innerHTML = breakdown.map(item => {
        const percentage = (item.score / item.max) * 100;
        return `
            <div style="margin-bottom: 0.5rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>${item.label}</span>
                    <span>${Math.round(item.score)}/${item.max}</span>
                </div>
                <div class="progress-bar" style="height: 0.3rem;">
                    <div class="progress-fill" style="width: ${percentage}%; background: ${percentage >= 80 ? 'var(--success-color)' : percentage >= 60 ? 'var(--warning-color)' : 'var(--danger-color)'}"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Generate priority areas
function generatePriorityAreas(healthScore, scores) {
    const areas = [];
    
    if (scores.ffScore < 15) areas.push({ icon: '🚨', text: 'Build Emergency Fund', priority: 'high' });
    if (scores.savingsRate < 10) areas.push({ icon: '💰', text: 'Increase Savings Rate', priority: 'high' });
    if (scores.insurance < 8) areas.push({ icon: '🛡️', text: 'Improve Insurance Coverage', priority: 'medium' });
    if (scores.diversification < 8) areas.push({ icon: '📊', text: 'Diversify Investments', priority: 'medium' });
    if (scores.emergencyFund < 6) areas.push({ icon: '⚠️', text: 'Build Emergency Fund', priority: 'medium' });
    if (scores.knowledge < 6) areas.push({ icon: '📚', text: 'Learn About Investing', priority: 'low' });
    
    if (areas.length === 0) {
        areas.push({ icon: '✅', text: 'Maintain Current Strategy', priority: 'low' });
    }
    
    const priorityContainer = document.getElementById('priorityAreas');
    priorityContainer.innerHTML = areas.map(area => {
        const color = area.priority === 'high' ? 'var(--danger-color)' : 
                     area.priority === 'medium' ? 'var(--warning-color)' : 'var(--success-color)';
        return `
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem; padding: 0.5rem; border-left: 3px solid ${color}; background: ${color}20;">
                <span style="margin-right: 0.5rem;">${area.icon}</span>
                <span style="flex: 1;">${area.text}</span>
                <span style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: ${color}; color: white; border-radius: 0.2rem; text-transform: uppercase;">
                    ${area.priority}
                </span>
            </div>
        `;
    }).join('');
}

// Generate personalized recommendations
function generatePersonalizedRecommendations() {
    const recommendations = [];
    
    // Based on age and life stage
    const age = advisorData.personal.age || 30;
    if (age < 30) {
        recommendations.push({
            category: 'Life Stage Advice',
            icon: '🚀',
            title: 'Young Professional Strategy',
            description: 'Focus on aggressive growth investments, build emergency fund, and start SIPs in equity mutual funds.',
            actions: [
                'Start SIP of ₹10,000+ in large-cap equity funds',
                'Build emergency fund of 6 months expenses',
                'Get adequate term life insurance'
            ]
        });
    } else if (age < 40) {
        recommendations.push({
            category: 'Career Growth',
            icon: '📈',
            title: 'Wealth Accumulation Phase',
            description: 'Balance growth and stability, increase insurance coverage, and consider real estate investment.',
            actions: [
                'Increase equity allocation to 60-70%',
                'Consider real estate investment',
                'Optimize tax-saving investments'
            ]
        });
    } else if (age < 55) {
        recommendations.push({
            category: 'Pre-Retirement',
            icon: '🎯',
            title: 'Wealth Preservation Focus',
            description: 'Start shifting towards conservative investments and maximize retirement savings.',
            actions: [
                'Gradually reduce equity allocation',
                'Maximize EPF/PPF contributions',
                'Consider senior citizen schemes'
            ]
        });
    }
    
    // Based on FF Score
    const ffScore = advisorData.ffScore.currentScore || 0;
    if (ffScore < 10) {
        recommendations.push({
            category: 'Financial Security',
            icon: '⚡',
            title: 'Emergency Wealth Building',
            description: 'Your current wealth can only sustain for ' + ffScore + ' years. Immediate action required.',
            actions: [
                'Reduce expenses by 20-30%',
                'Increase income through side hustles',
                'Invest at least 50% of income'
            ]
        });
    } else if (ffScore >= 25) {
        recommendations.push({
            category: 'Financial Independence',
            icon: '🏆',
            title: 'Achieved Financial Independence',
            description: 'Congratulations! You have achieved financial independence. Consider advanced strategies.',
            actions: [
                'Explore philanthropic opportunities',
                'Consider early retirement options',
                'Optimize tax strategies'
            ]
        });
    }
    
    // Based on risk profile
    const riskProfile = advisorData.riskProfile.riskProfile;
    if (riskProfile === 'Conservative') {
        recommendations.push({
            category: 'Investment Approach',
            icon: '🔒',
            title: 'Conservative Investment Strategy',
            description: 'Focus on capital preservation with steady growth through low-risk investments.',
            actions: [
                'Invest in high-grade bonds and FDs',
                'Consider balanced mutual funds',
                'Maintain higher cash allocation'
            ]
        });
    } else if (riskProfile === 'Aggressive') {
        recommendations.push({
            category: 'Investment Approach',
            icon: '🚀',
            title: 'Aggressive Growth Strategy',
            description: 'Maximize returns through high-growth investments while managing risk.',
            actions: [
                'Focus on small and mid-cap funds',
                'Consider international diversification',
                'Use systematic investment plans'
            ]
        });
    }
    
    renderRecommendations('personalizedRecommendations', recommendations);
}

// Generate investment strategy
function generateInvestmentStrategy() {
    const riskProfile = advisorData.riskProfile.riskProfile || 'Balanced';
    const allocation = advisorData.riskProfile.assetAllocation || {};
    
    // Asset allocation strategy
    const allocationStrategy = `
        <div class="grid-2" style="gap: 1rem;">
            ${Object.keys(allocation).map(asset => {
                const percentage = allocation[asset];
                const assetNames = {
                    equity: 'Equity',
                    debt: 'Fixed Income',
                    gold: 'Gold',
                    reits: 'REITs',
                    cash: 'Cash'
                };
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-secondary); border-radius: 0.5rem;">
                        <span>${assetNames[asset] || asset}</span>
                        <strong>${percentage}%</strong>
                    </div>
                `;
            }).join('')}
        </div>
        <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
            This allocation is optimized for your ${riskProfile.toLowerCase()} risk profile and investment goals.
        </p>
    `;
    
    document.getElementById('allocationStrategy').innerHTML = allocationStrategy;
    
    // Specific investment recommendations
    const investmentRecs = generateSpecificInvestmentRecommendations(riskProfile);
    document.getElementById('investmentRecommendations').innerHTML = investmentRecs;
}

// Generate specific investment recommendations
function generateSpecificInvestmentRecommendations(riskProfile) {
    const recommendations = {
        'Conservative': [
            'HDFC Top 100 Fund (Large Cap)',
            'ICICI Prudential Balanced Advantage Fund',
            'SBI Savings Fund (Liquid)',
            'Axis Long Term Equity Fund (ELSS)'
        ],
        'Risk Averse': [
            'Mirae Asset Large Cap Fund',
            'HDFC Balanced Advantage Fund',
            'UTI Nifty Index Fund',
            'Axis Bluechip Fund'
        ],
        'Balanced': [
            'Axis Bluechip Fund (Large Cap)',
            'Mirae Asset Emerging Bluechip (Large & Mid Cap)',
            'Parag Parikh Flexi Cap Fund',
            'HDFC Index Fund - Nifty 50'
        ],
        'Aggressive': [
            'Axis Small Cap Fund',
            'SBI Small Cap Fund',
            'Kotak Emerging Equity Fund (Mid Cap)',
            'Parag Parikh Flexi Cap Fund'
        ]
    };
    
    const funds = recommendations[riskProfile] || recommendations['Balanced'];
    
    return `
        <ul style="margin: 0; padding-left: 1.5rem;">
            ${funds.map(fund => `<li style="margin-bottom: 0.5rem;">${fund}</li>`).join('')}
        </ul>
        <p style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-secondary);">
            <strong>Note:</strong> These are sample recommendations. Please research and consider your goals before investing.
        </p>
    `;
}

// Generate goal-based planning
function generateGoalBasedPlanning() {
    const age = advisorData.personal.age || 30;
    const annualIncome = advisorData.income.totals?.annualTotal || 0;
    
    const shortTermGoals = [
        'Emergency Fund (6 months expenses)',
        'Vacation Fund (₹2-5 lakhs)',
        'Gadgets/Electronics (₹50K-2L)'
    ];
    
    const mediumTermGoals = [
        'Home Down Payment (20-30% of property value)',
        'Car Purchase (₹5-15 lakhs)',
        'Children\'s Education Fund'
    ];
    
    const longTermGoals = [
        'Retirement Corpus (25x annual expenses)',
        'Children\'s Marriage/Education',
        'Debt-free Homeownership'
    ];
    
    document.getElementById('shortTermGoals').innerHTML = generateGoalsList(shortTermGoals);
    document.getElementById('mediumTermGoals').innerHTML = generateGoalsList(mediumTermGoals);
    document.getElementById('longTermGoals').innerHTML = generateGoalsList(longTermGoals);
}

// Generate goals list
function generateGoalsList(goals) {
    return goals.map(goal => `
        <div style="text-align: left; margin-bottom: 0.5rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: 0.5rem; font-size: 0.9rem;">
            ${goal}
        </div>
    `).join('');
}

// Generate risk management strategy
function generateRiskManagementStrategy() {
    const strategies = [
        {
            icon: '🛡️',
            title: 'Life Insurance Optimization',
            description: 'Ensure adequate term life insurance coverage of 10-15x annual income.',
            current: `Current: ${(advisorData.insurance.analysis?.lifeInsuranceRatio || 0).toFixed(1)}x income`,
            recommendation: 'Increase term insurance coverage if below 10x income.'
        },
        {
            icon: '🏥',
            title: 'Health Insurance Enhancement',
            description: 'Maintain comprehensive health insurance with inflation protection.',
            current: `Current: ₹${formatNumber(advisorData.insurance.totals?.totalHealthCoverage || 0)} coverage`,
            recommendation: 'Consider family floater with ₹10-20 lakh coverage.'
        },
        {
            icon: '🔄',
            title: 'Investment Diversification',
            description: 'Spread investments across asset classes to reduce concentration risk.',
            current: 'Based on your current portfolio allocation',
            recommendation: 'Maintain 3-5 different asset classes in portfolio.'
        },
        {
            icon: '💰',
            title: 'Emergency Fund Management',
            description: 'Maintain liquid emergency fund for 6-12 months of expenses.',
            current: 'Based on risk profile assessment',
            recommendation: 'Keep emergency fund in savings account or liquid funds.'
        }
    ];
    
    document.getElementById('riskManagement').innerHTML = strategies.map(strategy => `
        <div class="card" style="margin-bottom: 1rem;">
            <div class="card-body">
                <h4 style="margin-bottom: 0.5rem;">
                    <span style="margin-right: 0.5rem;">${strategy.icon}</span>
                    ${strategy.title}
                </h4>
                <p style="margin-bottom: 0.5rem; color: var(--text-secondary);">${strategy.description}</p>
                <div style="font-size: 0.8rem;">
                    <strong>Current Status:</strong> ${strategy.current}<br>
                    <strong>Recommendation:</strong> ${strategy.recommendation}
                </div>
            </div>
        </div>
    `).join('');
}

// Generate tax optimization recommendations
function generateTaxOptimization() {
    const taxStrategies = [
        {
            icon: '📊',
            title: '80C Investments (₹1.5L limit)',
            description: 'Maximize tax-saving investments: EPF, PPF, ELSS, Life Insurance premiums.',
            savings: 'Save ₹46,800 annually (31.2% tax rate)'
        },
        {
            icon: '🏥',
            title: '80D Health Insurance (₹25K-50K)',
            description: 'Health insurance premiums for self, family, and parents.',
            savings: 'Save ₹7,800-15,600 annually'
        },
        {
            icon: '🏠',
            title: 'Home Loan Benefits',
            description: 'Principal (80C) + Interest (24) deductions on home loans.',
            savings: 'Save up to ₹3.12L annually'
        },
        {
            icon: '💼',
            title: 'HRA Optimization',
            description: 'Structure salary to maximize HRA exemption if living in rented accommodation.',
            savings: 'Save significant tax based on rent'
        }
    ];
    
    document.getElementById('taxOptimization').innerHTML = taxStrategies.map(strategy => `
        <div class="card" style="margin-bottom: 1rem;">
            <div class="card-body">
                <h4 style="margin-bottom: 0.5rem;">
                    <span style="margin-right: 0.5rem;">${strategy.icon}</span>
                    ${strategy.title}
                </h4>
                <p style="margin-bottom: 0.5rem; color: var(--text-secondary);">${strategy.description}</p>
                <div style="font-size: 0.8rem; color: var(--success-color);">
                    <strong>Potential Savings:</strong> ${strategy.savings}
                </div>
            </div>
        </div>
    `).join('');
}

// Generate 90-day action plan
function generateActionPlan() {
    const thirtyDayActions = [
        'Open investment accounts (Demat, MF)',
        'Research and select mutual funds',
        'Set up emergency fund bank account',
        'Review and optimize insurance policies'
    ];
    
    const sixtyDayActions = [
        'Start SIP investments in selected funds',
        'Build emergency fund (Month 1 of 6)',
        'Optimize tax-saving investments',
        'Create investment tracking system'
    ];
    
    const ninetyDayActions = [
        'Review and rebalance portfolio',
        'Automate all investment processes',
        'Plan for next quarter goals',
        'Schedule quarterly review meetings'
    ];
    
    document.getElementById('thirtyDayPlan').innerHTML = generateActionList(thirtyDayActions);
    document.getElementById('sixtyDayPlan').innerHTML = generateActionList(sixtyDayActions);
    document.getElementById('ninetyDayPlan').innerHTML = generateActionList(ninetyDayActions);
}

// Generate action list
function generateActionList(actions) {
    return actions.map(action => `
        <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
            <input type="checkbox" style="margin-right: 0.5rem;">
            <span style="font-size: 0.9rem;">${action}</span>
        </div>
    `).join('');
}

// Generate resource recommendations
function generateResourceRecommendations() {
    const apps = [
        { name: 'Groww', description: 'Mutual fund and stock investing' },
        { name: 'Zerodha Coin', description: 'Direct mutual fund investment' },
        { name: 'ET Money', description: 'Expense tracking and investment' },
        { name: 'Paytm Money', description: 'Investment and insurance' }
    ];
    
    const resources = [
        { name: 'Varsity by Zerodha', description: 'Comprehensive investing education' },
        { name: 'SEBI Investor Portal', description: 'Official investment guidance' },
        { name: 'Morningstar India', description: 'Mutual fund research and ratings' },
        { name: 'Value Research', description: 'Investment analysis and advice' }
    ];
    
    document.getElementById('recommendedApps').innerHTML = apps.map(app => `
        <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: 0.5rem;">
            <strong>${app.name}</strong><br>
            <small class="text-secondary">${app.description}</small>
        </div>
    `).join('');
    
    document.getElementById('educationalResources').innerHTML = resources.map(resource => `
        <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: 0.5rem;">
            <strong>${resource.name}</strong><br>
            <small class="text-secondary">${resource.description}</small>
        </div>
    `).join('');
}

// Render recommendations helper
function renderRecommendations(containerId, recommendations) {
    const container = document.getElementById(containerId);
    container.innerHTML = recommendations.map(rec => `
        <div class="card" style="margin-bottom: 1.5rem;">
            <div class="card-body">
                <div style="display: flex; align-items: flex-start; margin-bottom: 1rem;">
                    <span style="font-size: 1.5rem; margin-right: 1rem;">${rec.icon}</span>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 0.25rem;">${rec.title}</h4>
                        <small style="color: var(--primary-color); font-weight: 600;">${rec.category}</small>
                    </div>
                </div>
                <p style="margin-bottom: 1rem; color: var(--text-secondary);">${rec.description}</p>
                <div>
                    <strong style="font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Action Steps:</strong>
                    <ul style="margin: 0; padding-left: 1.5rem;">
                        ${rec.actions.map(action => `<li style="margin-bottom: 0.25rem; font-size: 0.9rem;">${action}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `).join('');
}

// Navigation functions
function goBack() {
    window.location.href = 'dashboard.html';
}

function completeJourney() {
    // Save completion status
    Storage.set('assessmentCompleted', {
        completedAt: new Date().toISOString(),
        userEmail: firebase.auth().currentUser?.email
    });
    
    showStatus('Financial assessment completed successfully! 🎉', 'success');
    
    setTimeout(() => {
        if (confirm('Assessment completed! Would you like to return to the dashboard to review your data?')) {
            window.location.href = 'dashboard.html';
        }
    }, 2000);
} 
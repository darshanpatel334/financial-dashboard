document.addEventListener('DOMContentLoaded', function() {
    // Load all data from localStorage
    const personalData = JSON.parse(localStorage.getItem('personalData') || '{}');
    const netWorthData = JSON.parse(localStorage.getItem('netWorthData') || '{}');
    const incomeData = JSON.parse(localStorage.getItem('incomeData') || '{}');
    const expenseData = JSON.parse(localStorage.getItem('expenseData') || '{}');
    const ffScoreData = JSON.parse(localStorage.getItem('ffScoreData') || '{}');
    const insuranceData = JSON.parse(localStorage.getItem('insuranceData') || '{}');
    const riskProfileData = JSON.parse(localStorage.getItem('riskProfileData') || '{}');

    // Currency formatter
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });

    // Populate Financial Analysis
    const financialAnalysis = document.getElementById('financialAnalysis');
    const analysis = analyzeFinancialHealth(
        netWorthData,
        incomeData,
        expenseData,
        ffScoreData
    );

    financialAnalysis.innerHTML = `
        <div class="analysis-content">
            <div class="analysis-summary">
                <h3>Financial Health Summary</h3>
                <p>${analysis.summary}</p>
            </div>
            <div class="analysis-metrics">
                <div class="metric">
                    <h4>Net Worth</h4>
                    <p>${analysis.netWorthStatus}</p>
                </div>
                <div class="metric">
                    <h4>Savings Rate</h4>
                    <p>${analysis.savingsStatus}</p>
                </div>
                <div class="metric">
                    <h4>Debt Management</h4>
                    <p>${analysis.debtStatus}</p>
                </div>
            </div>
        </div>
    `;

    // Populate Investment Strategy
    const investmentStrategy = document.getElementById('investmentStrategy');
    const strategy = generateInvestmentStrategy(riskProfileData, netWorthData, age);

    investmentStrategy.innerHTML = `
        <div class="strategy-content">
            <div class="strategy-summary">
                <h3>Recommended Investment Approach</h3>
                <p>${strategy.summary}</p>
            </div>
            <div class="strategy-allocation">
                <h4>Recommended Asset Allocation</h4>
                <ul>
                    ${Object.entries(strategy.allocation).map(([asset, percentage]) => `
                        <li>${asset}: ${percentage}%</li>
                    `).join('')}
                </ul>
            </div>
            <div class="strategy-recommendations">
                <h4>Investment Recommendations</h4>
                <ul>
                    ${strategy.recommendations.map(rec => `
                        <li>${rec}</li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;

    // Populate Protection Recommendations
    const protectionRecommendations = document.getElementById('protectionRecommendations');
    const protection = generateProtectionRecommendations(
        insuranceData,
        incomeData,
        personalData
    );

    protectionRecommendations.innerHTML = `
        <div class="protection-content">
            <div class="protection-summary">
                <h3>Insurance Coverage Analysis</h3>
                <p>${protection.summary}</p>
            </div>
            <div class="protection-recommendations">
                <h4>Recommended Coverage</h4>
                <ul>
                    ${protection.recommendations.map(rec => `
                        <li>${rec}</li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;

    // Populate Action Plan
    const actionPlan = document.getElementById('actionPlan');
    const plan = generateActionPlan(
        analysis,
        strategy,
        protection,
        ffScoreData
    );

    actionPlan.innerHTML = `
        <div class="plan-content">
            <div class="plan-timeline">
                <h3>Immediate Actions (0-3 months)</h3>
                <ul>
                    ${plan.immediate.map(action => `
                        <li class="action-item ${action.priority}">${action.task}</li>
                    `).join('')}
                </ul>
            </div>
            <div class="plan-timeline">
                <h3>Short Term (3-12 months)</h3>
                <ul>
                    ${plan.shortTerm.map(action => `
                        <li class="action-item ${action.priority}">${action.task}</li>
                    `).join('')}
                </ul>
            </div>
            <div class="plan-timeline">
                <h3>Long Term (1+ years)</h3>
                <ul>
                    ${plan.longTerm.map(action => `
                        <li class="action-item ${action.priority}">${action.task}</li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;

    // Populate Financial Education
    const financialEducation = document.getElementById('financialEducation');
    const education = generateEducationResources(
        riskProfileData,
        ffScoreData
    );

    financialEducation.innerHTML = `
        <div class="education-content">
            <div class="education-topics">
                ${education.topics.map(topic => `
                    <div class="education-topic">
                        <h4>${topic.title}</h4>
                        <p>${topic.description}</p>
                        <ul>
                            ${topic.resources.map(resource => `
                                <li>
                                    <i class="fas ${resource.icon}"></i>
                                    ${resource.title}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
});

function analyzeFinancialHealth(netWorth, income, expenses, ffScore) {
    const analysis = {
        summary: '',
        netWorthStatus: '',
        savingsStatus: '',
        debtStatus: ''
    };

    // Calculate metrics
    const monthlyIncome = income.monthly ? income.monthly.total : 0;
    const monthlyExpenses = expenses.totalExpenses || 0;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const totalAssets = netWorth.assets ? netWorth.assets.total : 0;
    const totalLiabilities = netWorth.liabilities ? netWorth.liabilities.total : 0;
    const debtToIncomeRatio = monthlyIncome > 0 ? (totalLiabilities / (monthlyIncome * 12)) * 100 : 0;

    // Analyze net worth
    if (netWorth.netWorth > 0) {
        analysis.netWorthStatus = `Your net worth is ${formatter.format(netWorth.netWorth)}. This is a positive indicator of your financial health.`;
    } else {
        analysis.netWorthStatus = `Your net worth is ${formatter.format(netWorth.netWorth)}. Focus on building assets and reducing liabilities.`;
    }

    // Analyze savings
    if (savingsRate >= 30) {
        analysis.savingsStatus = `Excellent savings rate of ${savingsRate.toFixed(1)}%. Keep up the good work!`;
    } else if (savingsRate >= 20) {
        analysis.savingsStatus = `Good savings rate of ${savingsRate.toFixed(1)}%. Consider increasing it further.`;
    } else {
        analysis.savingsStatus = `Your savings rate of ${savingsRate.toFixed(1)}% needs improvement. Aim for at least 20%.`;
    }

    // Analyze debt
    if (debtToIncomeRatio <= 30) {
        analysis.debtStatus = 'Your debt levels are healthy and manageable.';
    } else if (debtToIncomeRatio <= 50) {
        analysis.debtStatus = 'Your debt levels are moderate. Consider debt reduction strategies.';
    } else {
        analysis.debtStatus = 'Your debt levels are high. Prioritize debt reduction.';
    }

    // Overall summary
    if (ffScore.scores && ffScore.scores.total >= 70) {
        analysis.summary = 'Your overall financial health is strong. Focus on optimization and growth.';
    } else if (ffScore.scores && ffScore.scores.total >= 50) {
        analysis.summary = 'Your financial health is moderate. There are specific areas that need attention.';
    } else {
        analysis.summary = 'Your financial health needs significant improvement. Focus on building strong fundamentals.';
    }

    return analysis;
}

function generateInvestmentStrategy(riskProfile, netWorth, age) {
    const strategy = {
        summary: '',
        allocation: {},
        recommendations: []
    };

    if (!riskProfile.profile) {
        strategy.summary = 'Please complete your risk profile assessment for personalized investment recommendations.';
        return strategy;
    }

    // Set allocation based on risk profile
    strategy.allocation = riskProfile.allocation;

    // Generate recommendations based on risk profile
    switch (riskProfile.profile.name) {
        case 'Aggressive':
            strategy.summary = 'Your risk tolerance allows for a growth-focused portfolio with significant equity exposure.';
            strategy.recommendations = [
                'Consider high-growth equity mutual funds',
                'Explore mid and small-cap investments',
                'Look into international equity exposure',
                'Maintain emergency fund in liquid assets'
            ];
            break;
        case 'Moderately Aggressive':
            strategy.summary = 'Balance growth with some stability through a mix of equity and debt investments.';
            strategy.recommendations = [
                'Focus on large-cap and multi-cap funds',
                'Include some debt funds for stability',
                'Consider hybrid funds',
                'Maintain adequate emergency fund'
            ];
            break;
        case 'Moderate':
            strategy.summary = 'Maintain a balanced approach with equal focus on growth and capital preservation.';
            strategy.recommendations = [
                'Invest in balanced advantage funds',
                'Consider corporate bond funds',
                'Include blue-chip equity funds',
                'Keep sufficient liquid assets'
            ];
            break;
        case 'Conservative':
            strategy.summary = 'Focus on capital preservation with steady, low-risk returns.';
            strategy.recommendations = [
                'Prioritize high-quality debt funds',
                'Consider government securities',
                'Look into fixed deposits',
                'Maintain high liquidity'
            ];
            break;
        default:
            strategy.summary = 'Very conservative approach focusing on capital preservation.';
            strategy.recommendations = [
                'Focus on bank fixed deposits',
                'Consider post office schemes',
                'Look into government bonds',
                'Maintain high liquidity'
            ];
    }

    return strategy;
}

function generateProtectionRecommendations(insurance, income, personal) {
    const protection = {
        summary: '',
        recommendations: []
    };

    const monthlyIncome = income.monthly ? income.monthly.total : 0;
    const annualIncome = monthlyIncome * 12;

    // Life Insurance Analysis
    const recommendedLifeCover = annualIncome * 12; // 12 times annual income
    const currentLifeCover = insurance.life ? insurance.life.total : 0;

    if (currentLifeCover < recommendedLifeCover) {
        protection.recommendations.push(
            `Increase life insurance coverage by ${formatter.format(recommendedLifeCover - currentLifeCover)}`
        );
    }

    // Health Insurance Analysis
    const recommendedHealthCover = Math.max(annualIncome * 0.5, 500000); // 50% of annual income or 5 lakhs
    const currentHealthCover = insurance.health ? insurance.health.total : 0;

    if (currentHealthCover < recommendedHealthCover) {
        protection.recommendations.push(
            `Increase health insurance coverage by ${formatter.format(recommendedHealthCover - currentHealthCover)}`
        );
    }

    // Generate summary
    if (protection.recommendations.length === 0) {
        protection.summary = 'Your insurance coverage appears adequate for your current needs.';
    } else {
        protection.summary = 'There are gaps in your insurance coverage that need to be addressed.';
    }

    // Add general recommendations
    protection.recommendations.push(
        'Review insurance coverage annually',
        'Consider critical illness coverage',
        'Evaluate personal accident insurance needs'
    );

    return protection;
}

function generateActionPlan(analysis, strategy, protection, ffScore) {
    const plan = {
        immediate: [],
        shortTerm: [],
        longTerm: []
    };

    // Immediate Actions (0-3 months)
    if (analysis.savingsStatus.includes('needs improvement')) {
        plan.immediate.push({
            task: 'Create a monthly budget and track expenses',
            priority: 'high'
        });
    }

    if (protection.recommendations.length > 0) {
        plan.immediate.push({
            task: 'Address insurance coverage gaps',
            priority: 'high'
        });
    }

    // Short Term Actions (3-12 months)
    if (analysis.debtStatus.includes('high')) {
        plan.shortTerm.push({
            task: 'Implement debt reduction strategy',
            priority: 'high'
        });
    }

    if (strategy.recommendations.length > 0) {
        plan.shortTerm.push({
            task: 'Rebalance investment portfolio according to recommended allocation',
            priority: 'medium'
        });
    }

    // Long Term Actions (1+ years)
    plan.longTerm.push({
        task: 'Review and adjust financial goals annually',
        priority: 'medium'
    });

    plan.longTerm.push({
        task: 'Build long-term investment strategy',
        priority: 'medium'
    });

    return plan;
}

function generateEducationResources(riskProfile, ffScore) {
    return {
        topics: [
            {
                title: 'Investment Basics',
                description: 'Understanding fundamental investment concepts',
                resources: [
                    {
                        title: 'Introduction to Mutual Funds',
                        icon: 'fa-chart-line'
                    },
                    {
                        title: 'Understanding Asset Allocation',
                        icon: 'fa-chart-pie'
                    },
                    {
                        title: 'Risk and Return Relationship',
                        icon: 'fa-balance-scale'
                    }
                ]
            },
            {
                title: 'Financial Planning',
                description: 'Essential financial planning concepts',
                resources: [
                    {
                        title: 'Budgeting Strategies',
                        icon: 'fa-wallet'
                    },
                    {
                        title: 'Emergency Fund Planning',
                        icon: 'fa-shield-alt'
                    },
                    {
                        title: 'Goal-based Investing',
                        icon: 'fa-bullseye'
                    }
                ]
            },
            {
                title: 'Tax Planning',
                description: 'Understanding tax-saving investments',
                resources: [
                    {
                        title: 'Tax-saving Investment Options',
                        icon: 'fa-receipt'
                    },
                    {
                        title: 'Understanding ELSS Funds',
                        icon: 'fa-chart-bar'
                    },
                    {
                        title: 'Tax Benefits of Insurance',
                        icon: 'fa-shield-alt'
                    }
                ]
            }
        ]
    };
} 
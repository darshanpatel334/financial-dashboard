// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateFinancialHealth();
    updatePriorityActions();
    updateInvestmentRecommendations();
    updateTaxPlanning();
    renderFinancialGoals();
    updateMonthlyActions();
    initializeHealthScoreChart();
});

// Update Financial Health
function updateFinancialHealth() {
    const scores = calculateFinancialHealthScores();
    
    document.getElementById('overall-score').textContent = `${scores.overall.toFixed(1)}%`;
    document.getElementById('savings-rate').textContent = `${scores.savingsRate.toFixed(1)}%`;
    document.getElementById('debt-ratio').textContent = `${scores.debtRatio.toFixed(1)}%`;
    
    const status = getHealthStatus(scores.overall);
    document.getElementById('health-status').textContent = status;
    document.getElementById('health-status').className = `text-${getStatusColor(status)}`;
    
    const mix = assessInvestmentMix();
    document.getElementById('investment-mix').textContent = mix;
}

// Initialize Health Score Chart
function initializeHealthScoreChart() {
    const ctx = document.getElementById('health-score-chart').getContext('2d');
    const scores = calculateFinancialHealthScores();
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Savings', 'Debt Management', 'Investment Mix', 'Insurance', 'Emergency Fund'],
            datasets: [{
                label: 'Your Scores',
                data: [
                    scores.savingsRate,
                    100 - scores.debtRatio,
                    scores.investmentMix,
                    scores.insuranceCoverage,
                    scores.emergencyFund
                ],
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderColor: 'rgba(46, 204, 113, 1)',
                pointBackgroundColor: 'rgba(46, 204, 113, 1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    beginAtZero: true
                }
            }
        }
    });
}

// Priority Actions
function updatePriorityActions() {
    const container = document.getElementById('priority-actions');
    const actions = generatePriorityActions();
    
    let html = '<div class="grid-list">';
    actions.forEach(action => {
        html += `
            <div class="card">
                <h4>${action.title}</h4>
                <p>${action.description}</p>
                <p class="text-${action.priority}">${action.priority.toUpperCase()} Priority</p>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Investment Recommendations
function updateInvestmentRecommendations() {
    const container = document.getElementById('investment-recommendations');
    const { riskProfile } = AppState;
    const recommendations = generateInvestmentRecommendations();
    
    let html = `
        <div class="mb-3">
            <h4>Recommended Asset Allocation</h4>
            <p>Based on your risk profile: ${riskProfile.profile}</p>
            <ul>
                <li>Equity: ${riskProfile.recommendedAllocation.equity}%</li>
                <li>Debt: ${riskProfile.recommendedAllocation.debt}%</li>
                <li>Liquid: ${riskProfile.recommendedAllocation.liquid}%</li>
            </ul>
        </div>
        
        <div class="grid-list">
    `;
    
    recommendations.forEach(rec => {
        html += `
            <div class="card">
                <h4>${rec.type}</h4>
                <p>${rec.description}</p>
                <ul>
                    ${rec.options.map(opt => `<li>${opt}</li>`).join('')}
                </ul>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Tax Planning
function updateTaxPlanning() {
    const container = document.getElementById('tax-planning');
    const recommendations = generateTaxRecommendations();
    
    let html = '<div class="grid-list">';
    recommendations.forEach(rec => {
        html += `
            <div class="card">
                <h4>${rec.category}</h4>
                <p>${rec.description}</p>
                <ul>
                    ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Financial Goals
function renderFinancialGoals() {
    const container = document.getElementById('financial-goals');
    const { goals } = AppState.advisor;
    
    let html = '<div class="grid-list">';
    
    if (goals && goals.length > 0) {
        goals.forEach((goal, index) => {
            const progress = calculateGoalProgress(goal);
            html += createGoalCard(goal, progress, index);
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function createGoalCard(goal, progress, index) {
    return `
        <div class="card">
            <h4>${goal.name}</h4>
            <p>Type: ${goal.type}</p>
            <p>Target: ${utils.formatCurrency(goal.amount)}</p>
            <p>Timeline: ${goal.timeline} years</p>
            <p>Priority: ${goal.priority}</p>
            <div class="progress mb-2">
                <div class="progress-bar" style="width: ${progress}%">
                    ${progress}% Complete
                </div>
            </div>
            <button class="btn btn-danger" onclick="deleteGoal(${index})">Delete</button>
        </div>
    `;
}

// Monthly Actions
function updateMonthlyActions() {
    const container = document.getElementById('monthly-actions');
    const actions = generateMonthlyActions();
    
    let html = '<div class="grid-list">';
    actions.forEach(action => {
        html += `
            <div class="card">
                <h4>${action.category}</h4>
                <ul>
                    ${action.tasks.map(task => `
                        <li>
                            <label>
                                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                                ${task.description}
                            </label>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Modal Functions
function showGoalModal() {
    document.getElementById('goal-modal').style.display = 'block';
}

function closeGoalModal() {
    document.getElementById('goal-modal').style.display = 'none';
    document.getElementById('goal-form').reset();
}

// Save Functions
function saveGoal(event) {
    event.preventDefault();
    
    const goal = {
        name: document.getElementById('goal-name').value.trim(),
        type: document.getElementById('goal-type').value,
        amount: parseFloat(document.getElementById('goal-amount').value),
        timeline: parseInt(document.getElementById('goal-timeline').value),
        priority: document.getElementById('goal-priority').value,
        startDate: new Date().toISOString(),
        progress: 0
    };
    
    if (!AppState.advisor.goals) {
        AppState.advisor.goals = [];
    }
    
    AppState.advisor.goals.push(goal);
    AppState.save();
    
    closeGoalModal();
    renderFinancialGoals();
    updatePriorityActions();
    updateMonthlyActions();
    
    return false;
}

function deleteGoal(index) {
    AppState.advisor.goals.splice(index, 1);
    AppState.save();
    
    renderFinancialGoals();
    updatePriorityActions();
    updateMonthlyActions();
}

// Helper Functions
function calculateFinancialHealthScores() {
    const { income, expenses, netWorth, insurance } = AppState;
    
    // Calculate savings rate
    const monthlyIncome = income.summary.monthlyIncome;
    const monthlyExpenses = expenses.summary.totalMonthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    
    // Calculate debt ratio
    const totalAssets = netWorth.summary.totalAssets;
    const totalLiabilities = netWorth.summary.totalLiabilities;
    const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 100;
    
    // Calculate investment mix score
    const investmentMix = calculateInvestmentMixScore();
    
    // Calculate insurance coverage score
    const insuranceCoverage = calculateInsuranceCoverageScore();
    
    // Calculate emergency fund score
    const emergencyFund = calculateEmergencyFundScore();
    
    // Calculate overall score
    const overall = (
        savingsRate * 0.25 +
        (100 - debtRatio) * 0.25 +
        investmentMix * 0.2 +
        insuranceCoverage * 0.15 +
        emergencyFund * 0.15
    );
    
    return {
        overall,
        savingsRate,
        debtRatio,
        investmentMix,
        insuranceCoverage,
        emergencyFund
    };
}

function calculateInvestmentMixScore() {
    const { riskProfile, netWorth } = AppState;
    const recommended = riskProfile.recommendedAllocation;
    
    // Calculate current allocation
    const totalInvestments = calculateTotalInvestments();
    if (totalInvestments === 0) return 0;
    
    const current = {
        equity: (calculateEquityInvestments() / totalInvestments) * 100,
        debt: (calculateDebtInvestments() / totalInvestments) * 100,
        liquid: (calculateLiquidInvestments() / totalInvestments) * 100
    };
    
    // Calculate deviation from recommended allocation
    const deviation = Math.abs(current.equity - recommended.equity) +
        Math.abs(current.debt - recommended.debt) +
        Math.abs(current.liquid - recommended.liquid);
    
    // Convert deviation to score (0-100)
    return Math.max(0, 100 - deviation);
}

function calculateInsuranceCoverageScore() {
    const { insurance, income } = AppState;
    const annualIncome = income.summary.annualIncome;
    
    // Life insurance should be 10x annual income
    const recommendedLife = annualIncome * 10;
    const lifeCoverage = calculateTotalLifeCoverage();
    const lifeScore = Math.min(100, (lifeCoverage / recommendedLife) * 100);
    
    // Medical insurance should be 5x monthly income
    const recommendedMedical = (annualIncome / 12) * 5;
    const medicalCoverage = calculateTotalMedicalCoverage();
    const medicalScore = Math.min(100, (medicalCoverage / recommendedMedical) * 100);
    
    return (lifeScore * 0.6 + medicalScore * 0.4);
}

function calculateEmergencyFundScore() {
    const { expenses, netWorth } = AppState;
    const monthlyExpenses = expenses.summary.totalMonthlyExpenses;
    
    // Calculate liquid assets (cash, savings)
    const liquidAssets = calculateLiquidInvestments();
    
    // Emergency fund should cover 6 months of expenses
    const recommendedEmergencyFund = monthlyExpenses * 6;
    
    return Math.min(100, (liquidAssets / recommendedEmergencyFund) * 100);
}

function calculateTotalInvestments() {
    return calculateEquityInvestments() + calculateDebtInvestments() + calculateLiquidInvestments();
}

function calculateEquityInvestments() {
    const { equity } = AppState.netWorth.assets;
    let total = 0;
    
    Object.entries(equity).forEach(([key, value]) => {
        if (key !== 'custom') {
            total += value.value;
        }
    });
    
    if (equity.custom) {
        total += equity.custom.reduce((sum, item) => sum + item.value, 0);
    }
    
    return total;
}

function calculateDebtInvestments() {
    const { fixedIncome } = AppState.netWorth.assets;
    let total = 0;
    
    Object.entries(fixedIncome).forEach(([key, value]) => {
        if (key !== 'custom') {
            total += value.value;
        }
    });
    
    if (fixedIncome.custom) {
        total += fixedIncome.custom.reduce((sum, item) => sum + item.value, 0);
    }
    
    return total;
}

function calculateLiquidInvestments() {
    const { fixedIncome } = AppState.netWorth.assets;
    return (
        fixedIncome.savingAccount.value +
        (fixedIncome.custom?.reduce((sum, item) => {
            return item.type === 'liquid' ? sum + item.value : sum;
        }, 0) || 0)
    );
}

function calculateTotalLifeCoverage() {
    const { life } = AppState.insurance;
    if (!life) return 0;
    
    return life.reduce((total, policy) => total + policy.sumAssured, 0);
}

function calculateTotalMedicalCoverage() {
    const { medical } = AppState.insurance;
    if (!medical) return 0;
    
    return medical.reduce((total, policy) => total + policy.sumAssured, 0);
}

function calculateGoalProgress(goal) {
    const startDate = new Date(goal.startDate);
    const now = new Date();
    const elapsed = (now - startDate) / (1000 * 60 * 60 * 24 * 365); // years
    
    return Math.min(100, (elapsed / goal.timeline) * 100);
}

function getHealthStatus(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
}

function getStatusColor(status) {
    switch (status) {
        case 'Excellent': return 'success';
        case 'Good': return 'info';
        case 'Fair': return 'warning';
        default: return 'danger';
    }
}

function assessInvestmentMix() {
    const score = calculateInvestmentMixScore();
    if (score >= 80) return 'Well Balanced';
    if (score >= 60) return 'Moderately Balanced';
    if (score >= 40) return 'Needs Rebalancing';
    return 'Poorly Balanced';
}

function generatePriorityActions() {
    const scores = calculateFinancialHealthScores();
    const actions = [];
    
    // Emergency Fund
    if (scores.emergencyFund < 100) {
        actions.push({
            title: 'Build Emergency Fund',
            description: 'Aim to save 6 months of expenses in easily accessible accounts.',
            priority: scores.emergencyFund < 50 ? 'danger' : 'warning'
        });
    }
    
    // High Debt
    if (scores.debtRatio > 50) {
        actions.push({
            title: 'Reduce High-Interest Debt',
            description: 'Focus on paying down high-interest debts to improve financial health.',
            priority: scores.debtRatio > 70 ? 'danger' : 'warning'
        });
    }
    
    // Low Savings
    if (scores.savingsRate < 20) {
        actions.push({
            title: 'Increase Savings Rate',
            description: 'Try to save at least 20% of your monthly income.',
            priority: scores.savingsRate < 10 ? 'danger' : 'warning'
        });
    }
    
    // Insurance Coverage
    if (scores.insuranceCoverage < 70) {
        actions.push({
            title: 'Improve Insurance Coverage',
            description: 'Consider increasing life and medical insurance coverage.',
            priority: scores.insuranceCoverage < 40 ? 'danger' : 'warning'
        });
    }
    
    // Investment Mix
    if (scores.investmentMix < 70) {
        actions.push({
            title: 'Rebalance Investment Portfolio',
            description: 'Align your investments with recommended asset allocation.',
            priority: scores.investmentMix < 40 ? 'warning' : 'info'
        });
    }
    
    return actions;
}

function generateInvestmentRecommendations() {
    const { riskProfile } = AppState;
    const profile = riskProfile.profile;
    
    const recommendations = [
        {
            type: 'Equity',
            description: 'Stock market investments for long-term growth',
            options: [
                'Large-cap mutual funds for stability',
                'Mid-cap funds for growth',
                'Index funds for market returns'
            ]
        },
        {
            type: 'Debt',
            description: 'Fixed income investments for stability',
            options: [
                'Government bonds for safety',
                'Corporate bonds for higher returns',
                'Debt mutual funds for liquidity'
            ]
        },
        {
            type: 'Alternative',
            description: 'Alternative investments for diversification',
            options: [
                'Real Estate Investment Trusts (REITs)',
                'Gold ETFs for hedge',
                'International funds for global exposure'
            ]
        }
    ];
    
    return recommendations;
}

function generateTaxRecommendations() {
    return [
        {
            category: 'Tax-Saving Investments',
            description: 'Maximize tax deductions through investments',
            actions: [
                'Invest in ELSS mutual funds',
                'Consider PPF for long-term tax benefits',
                'Maximize 80C deductions'
            ]
        },
        {
            category: 'Insurance Premium Benefits',
            description: 'Tax benefits from insurance premiums',
            actions: [
                'Life insurance premiums under 80C',
                'Health insurance premiums under 80D',
                'Maximize family health coverage'
            ]
        },
        {
            category: 'Home Loan Benefits',
            description: 'Tax benefits from home loans',
            actions: [
                'Principal repayment under 80C',
                'Interest payment under 24(b)',
                'Additional benefits for first-time buyers'
            ]
        }
    ];
}

function generateMonthlyActions() {
    return [
        {
            category: 'Budgeting',
            tasks: [
                { description: 'Review monthly expenses', completed: false },
                { description: 'Track savings progress', completed: false },
                { description: 'Update emergency fund', completed: false }
            ]
        },
        {
            category: 'Investments',
            tasks: [
                { description: 'Review investment performance', completed: false },
                { description: 'Make SIP investments', completed: false },
                { description: 'Check portfolio balance', completed: false }
            ]
        },
        {
            category: 'Insurance',
            tasks: [
                { description: 'Pay due premiums', completed: false },
                { description: 'Review coverage adequacy', completed: false }
            ]
        },
        {
            category: 'Debt Management',
            tasks: [
                { description: 'Pay credit card bills', completed: false },
                { description: 'Review loan EMIs', completed: false }
            ]
        }
    ];
} 
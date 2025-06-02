// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updatePersonalInfo();
    updateFinancialSummary();
    updateAssetAllocation();
    updateInsuranceCoverage();
    updatePriorityActions();
    updateFinancialGoals();
    initializeMonthlySummaryChart();
    initializeAssetAllocationChart();
    initializeInsuranceCoverageChart();
});

// Update Personal Info
function updatePersonalInfo() {
    const { personalInfo, riskProfile, ffScore } = AppState;
    
    // Update name
    document.getElementById('user-name').textContent = personalInfo.name || 'Not Set';
    
    // Update age
    const age = personalInfo.birthdate ? utils.calculateAge(new Date(personalInfo.birthdate)) : 'Not Set';
    document.getElementById('user-age').textContent = age;
    
    // Update risk profile
    document.getElementById('risk-profile').textContent = riskProfile.profile || 'Not Assessed';
    
    // Update FF Score
    document.getElementById('ff-score').textContent = ffScore.results ? `${ffScore.results.score}%` : 'Not Calculated';
}

// Update Financial Summary
function updateFinancialSummary() {
    const { netWorth, income, expenses } = AppState;
    
    // Update net worth
    const totalNetWorth = netWorth.summary.netWorth;
    document.getElementById('total-networth').textContent = utils.formatCurrency(totalNetWorth);
    document.getElementById('networth-words').textContent = utils.numberToWords(totalNetWorth);
    
    // Update monthly income
    const monthlyIncome = income.summary.monthlyIncome;
    document.getElementById('monthly-income').textContent = utils.formatCurrency(monthlyIncome);
    document.getElementById('income-words').textContent = utils.numberToWords(monthlyIncome);
    
    // Update monthly expenses
    const monthlyExpenses = expenses.summary.totalMonthlyExpenses;
    document.getElementById('monthly-expenses').textContent = utils.formatCurrency(monthlyExpenses);
    document.getElementById('expenses-words').textContent = utils.numberToWords(monthlyExpenses);
    
    // Update monthly savings
    const monthlySavings = monthlyIncome - monthlyExpenses;
    document.getElementById('monthly-savings').textContent = utils.formatCurrency(monthlySavings);
    document.getElementById('savings-words').textContent = utils.numberToWords(monthlySavings);
}

// Initialize Monthly Summary Chart
function initializeMonthlySummaryChart() {
    const ctx = document.getElementById('monthly-summary-chart').getContext('2d');
    const { income, expenses } = AppState;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monthly Overview'],
            datasets: [
                {
                    label: 'Income',
                    data: [income.summary.monthlyIncome],
                    backgroundColor: 'rgba(46, 204, 113, 0.8)'
                },
                {
                    label: 'Expenses',
                    data: [expenses.summary.totalMonthlyExpenses],
                    backgroundColor: 'rgba(231, 76, 60, 0.8)'
                },
                {
                    label: 'Savings',
                    data: [income.summary.monthlyIncome - expenses.summary.totalMonthlyExpenses],
                    backgroundColor: 'rgba(52, 152, 219, 0.8)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Financial Overview'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update Asset Allocation
function updateAssetAllocation() {
    const container = document.getElementById('allocation-comparison');
    const { riskProfile, netWorth } = AppState;
    
    const recommended = riskProfile.recommendedAllocation;
    const totalInvestments = calculateTotalInvestments();
    
    const current = {
        equity: (calculateEquityInvestments() / totalInvestments) * 100,
        debt: (calculateDebtInvestments() / totalInvestments) * 100,
        liquid: (calculateLiquidInvestments() / totalInvestments) * 100
    };
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Asset Class</th>
                    <th>Current</th>
                    <th>Recommended</th>
                    <th>Difference</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Equity</td>
                    <td>${current.equity.toFixed(1)}%</td>
                    <td>${recommended.equity}%</td>
                    <td class="text-${Math.abs(current.equity - recommended.equity) > 5 ? 'warning' : 'success'}">
                        ${(current.equity - recommended.equity).toFixed(1)}%
                    </td>
                </tr>
                <tr>
                    <td>Debt</td>
                    <td>${current.debt.toFixed(1)}%</td>
                    <td>${recommended.debt}%</td>
                    <td class="text-${Math.abs(current.debt - recommended.debt) > 5 ? 'warning' : 'success'}">
                        ${(current.debt - recommended.debt).toFixed(1)}%
                    </td>
                </tr>
                <tr>
                    <td>Liquid</td>
                    <td>${current.liquid.toFixed(1)}%</td>
                    <td>${recommended.liquid}%</td>
                    <td class="text-${Math.abs(current.liquid - recommended.liquid) > 5 ? 'warning' : 'success'}">
                        ${(current.liquid - recommended.liquid).toFixed(1)}%
                    </td>
                </tr>
            </tbody>
        </table>
    `;
}

// Initialize Asset Allocation Chart
function initializeAssetAllocationChart() {
    const ctx = document.getElementById('asset-allocation-chart').getContext('2d');
    const totalInvestments = calculateTotalInvestments();
    
    const equity = calculateEquityInvestments();
    const debt = calculateDebtInvestments();
    const liquid = calculateLiquidInvestments();
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Equity', 'Debt', 'Liquid'],
            datasets: [{
                data: [equity, debt, liquid],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(241, 196, 15, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Current Asset Allocation'
                }
            }
        }
    });
}

// Update Insurance Coverage
function updateInsuranceCoverage() {
    const container = document.getElementById('insurance-status');
    const { insurance, income } = AppState;
    
    const annualIncome = income.summary.annualIncome;
    const lifeCoverage = calculateTotalLifeCoverage();
    const medicalCoverage = calculateTotalMedicalCoverage();
    
    const recommendedLife = annualIncome * 10;
    const recommendedMedical = (annualIncome / 12) * 5;
    
    container.innerHTML = `
        <div class="mb-3">
            <h5>Life Insurance</h5>
            <p>Coverage: ${utils.formatCurrency(lifeCoverage)}</p>
            <p>Recommended: ${utils.formatCurrency(recommendedLife)}</p>
            <p class="text-${lifeCoverage >= recommendedLife ? 'success' : 'warning'}">
                ${lifeCoverage >= recommendedLife ? 'Adequate Coverage' : 'Consider Increasing Coverage'}
            </p>
        </div>
        
        <div class="mb-3">
            <h5>Medical Insurance</h5>
            <p>Coverage: ${utils.formatCurrency(medicalCoverage)}</p>
            <p>Recommended: ${utils.formatCurrency(recommendedMedical)}</p>
            <p class="text-${medicalCoverage >= recommendedMedical ? 'success' : 'warning'}">
                ${medicalCoverage >= recommendedMedical ? 'Adequate Coverage' : 'Consider Increasing Coverage'}
            </p>
        </div>
    `;
}

// Initialize Insurance Coverage Chart
function initializeInsuranceCoverageChart() {
    const ctx = document.getElementById('insurance-coverage-chart').getContext('2d');
    const { insurance } = AppState;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Life Insurance', 'Medical Insurance'],
            datasets: [{
                data: [
                    calculateTotalLifeCoverage(),
                    calculateTotalMedicalCoverage()
                ],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(52, 152, 219, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Insurance Coverage Distribution'
                }
            }
        }
    });
}

// Update Priority Actions
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

// Update Financial Goals
function updateFinancialGoals() {
    const container = document.getElementById('financial-goals');
    const { goals } = AppState.advisor;
    
    if (!goals || goals.length === 0) {
        container.innerHTML = '<p>No financial goals set. Add goals in the Financial Advisor section.</p>';
        return;
    }
    
    let html = '<div class="grid-list">';
    goals.forEach(goal => {
        const progress = calculateGoalProgress(goal);
        html += `
            <div class="card">
                <h4>${goal.name}</h4>
                <p>Target: ${utils.formatCurrency(goal.amount)}</p>
                <p>Timeline: ${goal.timeline} years</p>
                <div class="progress mb-2">
                    <div class="progress-bar" style="width: ${progress}%">
                        ${progress.toFixed(1)}% Complete
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Helper Functions
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

function generatePriorityActions() {
    const actions = [];
    const { income, expenses, netWorth, insurance, riskProfile } = AppState;
    
    // Check emergency fund
    const monthlyExpenses = expenses.summary.totalMonthlyExpenses;
    const liquidAssets = calculateLiquidInvestments();
    const recommendedEmergencyFund = monthlyExpenses * 6;
    
    if (liquidAssets < recommendedEmergencyFund) {
        actions.push({
            title: 'Build Emergency Fund',
            description: `Need ${utils.formatCurrency(recommendedEmergencyFund - liquidAssets)} more in liquid assets.`,
            priority: liquidAssets < recommendedEmergencyFund * 0.5 ? 'danger' : 'warning'
        });
    }
    
    // Check insurance coverage
    const annualIncome = income.summary.annualIncome;
    const lifeCoverage = calculateTotalLifeCoverage();
    const recommendedLife = annualIncome * 10;
    
    if (lifeCoverage < recommendedLife) {
        actions.push({
            title: 'Increase Life Insurance',
            description: `Need ${utils.formatCurrency(recommendedLife - lifeCoverage)} more in life coverage.`,
            priority: lifeCoverage < recommendedLife * 0.5 ? 'danger' : 'warning'
        });
    }
    
    // Check investment allocation
    const totalInvestments = calculateTotalInvestments();
    const currentEquity = (calculateEquityInvestments() / totalInvestments) * 100;
    const recommendedEquity = riskProfile.recommendedAllocation.equity;
    
    if (Math.abs(currentEquity - recommendedEquity) > 10) {
        actions.push({
            title: 'Rebalance Portfolio',
            description: 'Current asset allocation deviates significantly from recommendations.',
            priority: Math.abs(currentEquity - recommendedEquity) > 20 ? 'warning' : 'info'
        });
    }
    
    // Check savings rate
    const monthlyIncome = income.summary.monthlyIncome;
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
    
    if (savingsRate < 20) {
        actions.push({
            title: 'Increase Savings',
            description: 'Current savings rate is below recommended 20%.',
            priority: savingsRate < 10 ? 'danger' : 'warning'
        });
    }
    
    return actions;
} 
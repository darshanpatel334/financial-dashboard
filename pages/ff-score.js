document.addEventListener('DOMContentLoaded', function() {
    const ffScoreForm = document.getElementById('ffScoreForm');
    const ffScoreResult = document.getElementById('ffScoreResult');
    const ffScoreMessage = document.getElementById('ffScoreMessage');
    const savingsScore = document.getElementById('savingsScore');
    const assetScore = document.getElementById('assetScore');
    const investmentScore = document.getElementById('investmentScore');

    // Load data from previous pages
    const incomeData = JSON.parse(localStorage.getItem('incomeData') || '{}');
    const expenseData = JSON.parse(localStorage.getItem('expenseData') || '{}');
    const netWorthData = JSON.parse(localStorage.getItem('netWorthData') || '{}');

    // Set initial values from previous data
    if (incomeData.monthly) {
        document.getElementById('monthlyIncome').value = incomeData.monthly.total || 0;
    }

    if (netWorthData.assets) {
        document.getElementById('totalAssets').value = netWorthData.assets.total || 0;
    }

    if (expenseData.totalExpenses) {
        document.getElementById('monthlyExpenseGoal').value = expenseData.totalExpenses;
    }

    ffScoreForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 0;
        const monthlySavings = parseFloat(document.getElementById('monthlySavings').value) || 0;
        const totalAssets = parseFloat(document.getElementById('totalAssets').value) || 0;
        const investmentReturns = parseFloat(document.getElementById('investmentReturns').value) || 8;
        const retirementAge = parseInt(document.getElementById('retirementAge').value) || 60;
        const monthlyExpenseGoal = parseFloat(document.getElementById('monthlyExpenseGoal').value) || 0;

        // Calculate savings rate
        const savingsRateValue = (monthlySavings / monthlyIncome) * 100;
        document.getElementById('savingsRate').value = savingsRateValue.toFixed(2);

        // Calculate scores
        const savingsRateScore = calculateSavingsRateScore(savingsRateValue);
        const assetCoverageScore = calculateAssetCoverageScore(totalAssets, monthlyExpenseGoal);
        const investmentStrategyScore = calculateInvestmentStrategyScore(investmentReturns);

        // Update score breakdown
        savingsScore.textContent = savingsRateScore;
        assetScore.textContent = assetCoverageScore;
        investmentScore.textContent = investmentStrategyScore;

        // Calculate total FF score
        const totalScore = savingsRateScore + assetCoverageScore + investmentStrategyScore;
        ffScoreResult.textContent = totalScore;

        // Display message based on score
        ffScoreMessage.textContent = getScoreMessage(totalScore);
        ffScoreMessage.className = 'score-message ' + getScoreClass(totalScore);

        // Save to localStorage
        const ffScoreData = {
            monthlyIncome,
            monthlySavings,
            savingsRate: savingsRateValue,
            totalAssets,
            investmentReturns,
            retirementAge,
            monthlyExpenseGoal,
            scores: {
                savings: savingsRateScore,
                assets: assetCoverageScore,
                investment: investmentStrategyScore,
                total: totalScore
            },
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('ffScoreData', JSON.stringify(ffScoreData));
    });

    // Load previous FF score data if available
    const savedFFData = localStorage.getItem('ffScoreData');
    if (savedFFData) {
        const data = JSON.parse(savedFFData);
        document.getElementById('monthlySavings').value = data.monthlySavings;
        document.getElementById('savingsRate').value = data.savingsRate.toFixed(2);
        document.getElementById('investmentReturns').value = data.investmentReturns;
        document.getElementById('retirementAge').value = data.retirementAge;
        document.getElementById('monthlyExpenseGoal').value = data.monthlyExpenseGoal;

        // Update scores
        savingsScore.textContent = data.scores.savings;
        assetScore.textContent = data.scores.assets;
        investmentScore.textContent = data.scores.investment;
        ffScoreResult.textContent = data.scores.total;

        // Update message
        ffScoreMessage.textContent = getScoreMessage(data.scores.total);
        ffScoreMessage.className = 'score-message ' + getScoreClass(data.scores.total);
    }
});

// Helper functions for score calculations
function calculateSavingsRateScore(savingsRate) {
    if (savingsRate >= 50) return 40;
    if (savingsRate >= 40) return 35;
    if (savingsRate >= 30) return 30;
    if (savingsRate >= 20) return 25;
    if (savingsRate >= 10) return 20;
    return Math.round(savingsRate * 2);
}

function calculateAssetCoverageScore(assets, monthlyExpense) {
    const yearsOfExpensesCovered = assets / (monthlyExpense * 12);
    if (yearsOfExpensesCovered >= 25) return 30;
    if (yearsOfExpensesCovered >= 20) return 25;
    if (yearsOfExpensesCovered >= 15) return 20;
    if (yearsOfExpensesCovered >= 10) return 15;
    if (yearsOfExpensesCovered >= 5) return 10;
    return Math.round(yearsOfExpensesCovered * 2);
}

function calculateInvestmentStrategyScore(returns) {
    if (returns >= 12) return 30;
    if (returns >= 10) return 25;
    if (returns >= 8) return 20;
    if (returns >= 6) return 15;
    if (returns >= 4) return 10;
    return Math.round(returns * 2);
}

function getScoreMessage(score) {
    if (score >= 90) return "Excellent! You're on track for financial freedom!";
    if (score >= 70) return "Great progress! Keep up the good work!";
    if (score >= 50) return "You're making progress, but there's room for improvement.";
    if (score >= 30) return "Consider increasing your savings and investment returns.";
    return "Start building your financial freedom journey with higher savings.";
}

function getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'great';
    if (score >= 50) return 'good';
    if (score >= 30) return 'fair';
    return 'poor';
} 
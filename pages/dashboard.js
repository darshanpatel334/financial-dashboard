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

    // Populate Personal Overview
    const personalInfo = document.getElementById('personalInfo');
    if (personalData.fullName) {
        const age = calculateAge(new Date(personalData.birthdate));
        personalInfo.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <strong>Name:</strong> ${personalData.fullName}
                </div>
                <div class="info-item">
                    <strong>Age:</strong> ${age} years
                </div>
                <div class="info-item">
                    <strong>Email:</strong> ${personalData.email}
                </div>
            </div>
        `;
    } else {
        personalInfo.innerHTML = '<p>Please complete your personal information.</p>';
    }

    // Populate Net Worth Summary
    const netWorthSummary = document.getElementById('netWorthSummary');
    if (netWorthData.netWorth !== undefined) {
        netWorthSummary.innerHTML = `
            <div class="summary-content">
                <p class="amount">${formatter.format(netWorthData.netWorth)}</p>
                <div class="breakdown">
                    <p>Assets: ${formatter.format(netWorthData.assets.total)}</p>
                    <p>Liabilities: ${formatter.format(netWorthData.liabilities.total)}</p>
                </div>
            </div>
        `;
    } else {
        netWorthSummary.innerHTML = '<p>Please complete your net worth assessment.</p>';
    }

    // Populate Cash Flow Summary
    const cashFlowSummary = document.getElementById('cashFlowSummary');
    if (incomeData.monthly && expenseData.totalExpenses) {
        const monthlySavings = incomeData.monthly.total - expenseData.totalExpenses;
        const savingsRate = (monthlySavings / incomeData.monthly.total) * 100;
        
        cashFlowSummary.innerHTML = `
            <div class="summary-content">
                <div class="breakdown">
                    <p>Income: ${formatter.format(incomeData.monthly.total)}/month</p>
                    <p>Expenses: ${formatter.format(expenseData.totalExpenses)}/month</p>
                    <p>Savings: ${formatter.format(monthlySavings)}/month</p>
                    <p>Savings Rate: ${savingsRate.toFixed(1)}%</p>
                </div>
            </div>
        `;
    } else {
        cashFlowSummary.innerHTML = '<p>Please complete your income and expense details.</p>';
    }

    // Populate FF Score Summary
    const ffScoreSummary = document.getElementById('ffScoreSummary');
    if (ffScoreData.scores) {
        ffScoreSummary.innerHTML = `
            <div class="summary-content">
                <p class="score">${ffScoreData.scores.total}/100</p>
                <div class="breakdown">
                    <p>Savings: ${ffScoreData.scores.savings}/40</p>
                    <p>Assets: ${ffScoreData.scores.assets}/30</p>
                    <p>Investment: ${ffScoreData.scores.investment}/30</p>
                </div>
            </div>
        `;
    } else {
        ffScoreSummary.innerHTML = '<p>Please complete your FF Score assessment.</p>';
    }

    // Populate Risk Profile Summary
    const riskProfileSummary = document.getElementById('riskProfileSummary');
    if (riskProfileData.profile) {
        riskProfileSummary.innerHTML = `
            <div class="summary-content">
                <p class="profile">${riskProfileData.profile.name}</p>
                <div class="allocation">
                    <p>Recommended Allocation:</p>
                    <ul>
                        <li>Equity: ${riskProfileData.allocation.equity}%</li>
                        <li>Debt: ${riskProfileData.allocation.debt}%</li>
                        <li>Gold: ${riskProfileData.allocation.gold}%</li>
                        <li>Cash: ${riskProfileData.allocation.cash}%</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        riskProfileSummary.innerHTML = '<p>Please complete your risk profile assessment.</p>';
    }

    // Populate Insurance Summaries
    const lifeInsuranceSummary = document.getElementById('lifeInsuranceSummary');
    const healthInsuranceSummary = document.getElementById('healthInsuranceSummary');
    
    if (insuranceData.life) {
        lifeInsuranceSummary.innerHTML = `
            <div class="summary-content">
                <p class="amount">${formatter.format(insuranceData.life.total)}</p>
                <div class="breakdown">
                    <p>Term: ${formatter.format(insuranceData.life.term)}</p>
                    <p>Endowment: ${formatter.format(insuranceData.life.endowment)}</p>
                    <p>ULIP: ${formatter.format(insuranceData.life.ulip)}</p>
                </div>
            </div>
        `;
    } else {
        lifeInsuranceSummary.innerHTML = '<p>Please complete your life insurance details.</p>';
    }

    if (insuranceData.health) {
        healthInsuranceSummary.innerHTML = `
            <div class="summary-content">
                <p class="amount">${formatter.format(insuranceData.health.total)}</p>
                <div class="breakdown">
                    <p>Basic: ${formatter.format(insuranceData.health.basic)}</p>
                    <p>Critical: ${formatter.format(insuranceData.health.critical)}</p>
                    <p>Accidental: ${formatter.format(insuranceData.health.accidental)}</p>
                </div>
            </div>
        `;
    } else {
        healthInsuranceSummary.innerHTML = '<p>Please complete your health insurance details.</p>';
    }

    // Generate Action Items
    const actionItems = document.getElementById('actionItems');
    const actions = generateActionItems(
        personalData,
        netWorthData,
        incomeData,
        expenseData,
        ffScoreData,
        insuranceData,
        riskProfileData
    );

    if (actions.length > 0) {
        actionItems.innerHTML = `
            <ul class="action-list">
                ${actions.map(action => `
                    <li class="action-item ${action.priority}">
                        <i class="fas ${action.icon}"></i>
                        <span>${action.message}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        actionItems.innerHTML = '<p>Great job! No immediate actions required.</p>';
    }
});

function calculateAge(birthDate) {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
}

function generateActionItems(personal, netWorth, income, expenses, ffScore, insurance, riskProfile) {
    const actions = [];

    // Check personal information
    if (!personal.fullName) {
        actions.push({
            message: "Complete your personal information",
            priority: "high",
            icon: "fa-user"
        });
    }

    // Check net worth
    if (!netWorth.netWorth) {
        actions.push({
            message: "Calculate your net worth",
            priority: "high",
            icon: "fa-wallet"
        });
    }

    // Check income and expenses
    if (income.monthly && expenses.totalExpenses) {
        const savingsRate = ((income.monthly.total - expenses.totalExpenses) / income.monthly.total) * 100;
        if (savingsRate < 20) {
            actions.push({
                message: "Increase your savings rate (currently " + savingsRate.toFixed(1) + "%)",
                priority: "high",
                icon: "fa-piggy-bank"
            });
        }
    }

    // Check FF Score
    if (ffScore.scores && ffScore.scores.total < 50) {
        actions.push({
            message: "Work on improving your FF Score",
            priority: "medium",
            icon: "fa-chart-line"
        });
    }

    // Check insurance coverage
    if (insurance.analysis && insurance.analysis.lifeRatio < 0.7) {
        actions.push({
            message: "Increase your life insurance coverage",
            priority: "high",
            icon: "fa-shield-alt"
        });
    }

    if (insurance.analysis && insurance.analysis.healthRatio < 0.7) {
        actions.push({
            message: "Increase your health insurance coverage",
            priority: "high",
            icon: "fa-heartbeat"
        });
    }

    // Check risk profile
    if (!riskProfile.profile) {
        actions.push({
            message: "Complete your risk profile assessment",
            priority: "medium",
            icon: "fa-chart-pie"
        });
    }

    return actions;
} 
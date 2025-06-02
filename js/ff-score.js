// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateFFScoreSummary();
    updateCalculationParams();
    renderProjectionTable();
    initializeFFProgressChart();
});

// Update summary values
function updateFFScoreSummary() {
    const { summary } = AppState.ffScore;
    
    document.getElementById('current-ff-score').textContent = `${summary.currentScore.toFixed(1)}%`;
    document.getElementById('years-to-freedom').textContent = summary.yearsToFreedom;
    
    document.getElementById('required-corpus').textContent = utils.formatCurrency(summary.requiredCorpus);
    document.getElementById('required-corpus-words').textContent = utils.numberToWords(summary.requiredCorpus);
    
    document.getElementById('current-corpus').textContent = utils.formatCurrency(summary.currentCorpus);
    document.getElementById('current-corpus-words').textContent = utils.numberToWords(summary.currentCorpus);
    
    // Update FF Status
    const status = getFFStatus(summary.currentScore);
    document.getElementById('ff-status').textContent = status;
    document.getElementById('ff-status').className = `text-${getStatusColor(status)}`;
}

// Update calculation parameters display
function updateCalculationParams() {
    const { params } = AppState.ffScore;
    const { personalInfo } = AppState;
    const { expenses } = AppState;
    
    document.getElementById('calc-monthly-expenses').textContent = utils.formatCurrency(expenses.summary.totalMonthlyExpenses);
    document.getElementById('calc-annual-expenses').textContent = utils.formatCurrency(expenses.summary.totalAnnualExpenses);
    document.getElementById('calc-expected-return').textContent = `${params.expectedReturn}%`;
    document.getElementById('calc-expected-inflation').textContent = `${expenses.summary.expectedInflation}%`;
    document.getElementById('calc-life-expectancy').textContent = `${params.lifeExpectancy} years`;
    
    const age = calculateAge(new Date(personalInfo.birthdate));
    document.getElementById('calc-current-age').textContent = `${age} years`;
}

// Initialize FF Progress Chart
function initializeFFProgressChart() {
    const ctx = document.getElementById('ff-progress-chart').getContext('2d');
    const { summary } = AppState.ffScore;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Current Corpus', 'Remaining Required'],
            datasets: [{
                data: [
                    summary.currentCorpus,
                    Math.max(0, summary.requiredCorpus - summary.currentCorpus)
                ],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Financial Freedom Progress'
                }
            }
        }
    });
}

// Render projection table
function renderProjectionTable() {
    const tbody = document.getElementById('projection-table-body');
    const { projection } = AppState.ffScore;
    
    let html = '';
    projection.forEach(year => {
        const status = getFFStatus(year.ffScore);
        html += `
            <tr>
                <td>${year.year}</td>
                <td>${year.age}</td>
                <td>${utils.formatCurrency(year.annualExpenses)}</td>
                <td>${utils.formatCurrency(year.requiredCorpus)}</td>
                <td>${utils.formatCurrency(year.expectedCorpus)}</td>
                <td>${year.ffScore.toFixed(1)}%</td>
                <td class="text-${getStatusColor(status)}">${status}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Modal Functions
function showCalculationModal() {
    const modal = document.getElementById('calculation-modal');
    const { params } = AppState.ffScore;
    
    document.getElementById('expected-return').value = params.expectedReturn;
    document.getElementById('life-expectancy').value = params.lifeExpectancy;
    
    modal.style.display = 'block';
}

function closeCalculationModal() {
    document.getElementById('calculation-modal').style.display = 'none';
    document.getElementById('calculation-form').reset();
}

function showProjectionModal() {
    const modal = document.getElementById('projection-modal');
    const { params } = AppState.ffScore;
    
    document.getElementById('monthly-savings').value = params.monthlySavings;
    document.getElementById('annual-savings-increase').value = params.annualSavingsIncrease;
    
    modal.style.display = 'block';
}

function closeProjectionModal() {
    document.getElementById('projection-modal').style.display = 'none';
    document.getElementById('projection-form').reset();
}

// Save Functions
function saveCalculationParams(event) {
    event.preventDefault();
    
    const expectedReturn = parseFloat(document.getElementById('expected-return').value);
    const lifeExpectancy = parseInt(document.getElementById('life-expectancy').value);
    
    AppState.ffScore.params = {
        ...AppState.ffScore.params,
        expectedReturn,
        lifeExpectancy
    };
    
    calculateFFScore();
    
    closeCalculationModal();
    updateFFScoreSummary();
    updateCalculationParams();
    renderProjectionTable();
    initializeFFProgressChart();
    
    return false;
}

function saveProjectionParams(event) {
    event.preventDefault();
    
    const monthlySavings = parseFloat(document.getElementById('monthly-savings').value);
    const annualSavingsIncrease = parseFloat(document.getElementById('annual-savings-increase').value);
    
    AppState.ffScore.params = {
        ...AppState.ffScore.params,
        monthlySavings,
        annualSavingsIncrease
    };
    
    calculateFFScore();
    
    closeProjectionModal();
    updateFFScoreSummary();
    renderProjectionTable();
    initializeFFProgressChart();
    
    return false;
}

// Helper Functions
function calculateFFScore() {
    const { personalInfo, expenses, netWorth, ffScore } = AppState;
    const { params } = ffScore;
    
    // Get current age
    const age = calculateAge(new Date(personalInfo.birthdate));
    
    // Calculate current corpus from net worth
    const currentCorpus = calculateCurrentCorpus();
    
    // Calculate required corpus
    const monthlyExpenses = expenses.summary.totalMonthlyExpenses;
    const annualExpenses = expenses.summary.totalAnnualExpenses;
    const inflationRate = expenses.summary.expectedInflation / 100;
    const expectedReturn = params.expectedReturn / 100;
    const yearsToLive = params.lifeExpectancy - age;
    
    const requiredCorpus = calculateRequiredCorpus(annualExpenses, inflationRate, expectedReturn, yearsToLive);
    
    // Calculate current FF score
    const currentScore = (currentCorpus / requiredCorpus) * 100;
    
    // Calculate years to freedom
    const yearsToFreedom = calculateYearsToFreedom(
        currentCorpus,
        requiredCorpus,
        params.monthlySavings * 12,
        params.annualSavingsIncrease / 100,
        expectedReturn
    );
    
    // Generate year-by-year projection
    const projection = generateProjection(
        age,
        currentCorpus,
        requiredCorpus,
        annualExpenses,
        params.monthlySavings * 12,
        params.annualSavingsIncrease / 100,
        expectedReturn,
        inflationRate,
        yearsToLive
    );
    
    // Update state
    AppState.ffScore.summary = {
        currentScore,
        yearsToFreedom,
        requiredCorpus,
        currentCorpus
    };
    
    AppState.ffScore.projection = projection;
    
    AppState.save();
}

function calculateCurrentCorpus() {
    const { assets } = AppState.netWorth;
    let corpus = 0;
    
    // Add up all income-generating assets
    Object.values(assets).forEach(category => {
        Object.entries(category).forEach(([key, items]) => {
            if (key === 'custom') {
                items.forEach(item => {
                    if (item.yield > 0) {
                        corpus += item.value;
                    }
                });
            } else {
                if (items.yield > 0) {
                    corpus += items.value;
                }
            }
        });
    });
    
    return corpus;
}

function calculateRequiredCorpus(annualExpenses, inflationRate, expectedReturn, yearsToLive) {
    // Using the 4% rule as a base, adjusted for inflation and expected return
    const safeWithdrawalRate = Math.max(0.04, expectedReturn - inflationRate);
    return annualExpenses / safeWithdrawalRate;
}

function calculateYearsToFreedom(currentCorpus, requiredCorpus, annualSavings, savingsIncrease, expectedReturn) {
    let years = 0;
    let corpus = currentCorpus;
    let savings = annualSavings;
    
    while (corpus < requiredCorpus && years < 100) {
        corpus = corpus * (1 + expectedReturn) + savings;
        savings = savings * (1 + savingsIncrease);
        years++;
    }
    
    return years < 100 ? years : Infinity;
}

function generateProjection(age, currentCorpus, requiredCorpus, annualExpenses, annualSavings, savingsIncrease, expectedReturn, inflationRate, yearsToLive) {
    const projection = [];
    let corpus = currentCorpus;
    let savings = annualSavings;
    let expenses = annualExpenses;
    let required = requiredCorpus;
    
    for (let year = 0; year < yearsToLive; year++) {
        corpus = corpus * (1 + expectedReturn) + savings;
        savings = savings * (1 + savingsIncrease);
        expenses = expenses * (1 + inflationRate);
        required = expenses / (expectedReturn - inflationRate);
        
        projection.push({
            year: new Date().getFullYear() + year,
            age: age + year,
            annualExpenses: expenses,
            requiredCorpus: required,
            expectedCorpus: corpus,
            ffScore: (corpus / required) * 100
        });
        
        if (corpus >= required) break;
    }
    
    return projection;
}

function calculateAge(birthdate) {
    const today = new Date();
    const age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        return age - 1;
    }
    
    return age;
}

function getFFStatus(score) {
    if (score >= 100) return 'Financially Free';
    if (score >= 75) return 'Almost There';
    if (score >= 50) return 'Good Progress';
    if (score >= 25) return 'Getting Started';
    return 'Just Beginning';
}

function getStatusColor(status) {
    switch (status) {
        case 'Financially Free': return 'success';
        case 'Almost There': return 'info';
        case 'Good Progress': return 'primary';
        case 'Getting Started': return 'warning';
        default: return 'secondary';
    }
} 
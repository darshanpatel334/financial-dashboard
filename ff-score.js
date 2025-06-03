// ===== FF SCORE PAGE FUNCTIONALITY =====

let ffData = {
    netWorth: 0,
    annualExpenses: 0,
    assetGrowthRate: 8,
    inflationRate: 6,
    currentScore: 0
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        loadDataFromPreviousPages();
        calculateFFScore();
        calculateScenarios();
    });
});

// Load data from previous pages
function loadDataFromPreviousPages() {
    // Load net worth data
    const netWorthData = Storage.get('netWorthData', {});
    if (netWorthData.totals) {
        // Use liquid net worth for FF Score calculation (more accurate for financial freedom)
        ffData.netWorth = netWorthData.totals.liquidNetWorth || netWorthData.totals.netWorth || 0;
        document.getElementById('currentNetWorth').textContent = formatCurrency(ffData.netWorth);
    }
    
    // Load expense data
    const expenseData = Storage.get('expenseData', {});
    if (expenseData.totals) {
        ffData.annualExpenses = expenseData.totals.annualTotal || 0;
        document.getElementById('currentExpenses').textContent = formatCurrency(ffData.annualExpenses);
    }
    
    // Load inflation rate from expenses
    if (expenseData.settings?.inflationRate) {
        ffData.inflationRate = expenseData.settings.inflationRate;
        document.getElementById('inflationRate').value = ffData.inflationRate;
    }
    
    // Update display
    document.getElementById('currentGrowthRate').textContent = ffData.assetGrowthRate + '%';
}

// Calculate FF Score
function calculateFFScore() {
    // Get current values
    ffData.assetGrowthRate = parseFloat(document.getElementById('assetGrowthRate').value) || 8;
    ffData.inflationRate = parseFloat(document.getElementById('inflationRate').value) || 6;
    
    // Update display
    document.getElementById('currentGrowthRate').textContent = ffData.assetGrowthRate + '%';
    
    // Calculate the score
    ffData.currentScore = calculateFFScoreValue(ffData.netWorth, ffData.annualExpenses, ffData.assetGrowthRate, ffData.inflationRate);
    
    // Update main score display
    document.getElementById('ffScore').textContent = ffData.currentScore;
    
    // Get score meaning
    const scoreMeaning = getFFScoreMeaning(ffData.currentScore);
    document.getElementById('ffScoreEmoji').textContent = scoreMeaning.emoji;
    document.getElementById('ffScoreLevel').textContent = scoreMeaning.level;
    document.getElementById('ffScoreLevel').style.color = scoreMeaning.color;
    
    // Update progress bar
    updateProgressBar(ffData.currentScore);
    
    // Generate suggestions
    generateSuggestions();
    
    // Save data
    saveFFData();
}

// Enhanced FF Score calculation using corrected algorithm
function calculateFFScoreValue(netWorth, annualExpenses, growthRate, inflationRate) {
    if (netWorth <= 0 || annualExpenses <= 0) {
        return 0;
    }
    
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
    
    return Math.min(years, maxYears);
}

// Calculate scenario analysis
function calculateScenarios() {
    // Conservative scenario (6% growth, 6% inflation)
    const conservativeScore = calculateFFScoreValue(ffData.netWorth, ffData.annualExpenses, 6, 6);
    document.getElementById('conservativeScore').textContent = conservativeScore;
    
    // Moderate scenario (10% growth, 6% inflation)
    const moderateScore = calculateFFScoreValue(ffData.netWorth, ffData.annualExpenses, 10, 6);
    document.getElementById('moderateScore').textContent = moderateScore;
    
    // Aggressive scenario (15% growth, 6% inflation)
    const aggressiveScore = calculateFFScoreValue(ffData.netWorth, ffData.annualExpenses, 15, 6);
    document.getElementById('aggressiveScore').textContent = aggressiveScore;
    
    // Color code the scenarios
    colorCodeScore('conservativeScore', conservativeScore);
    colorCodeScore('moderateScore', moderateScore);
    colorCodeScore('aggressiveScore', aggressiveScore);
}

// Color code score based on value
function colorCodeScore(elementId, score) {
    const element = document.getElementById(elementId);
    if (score >= 25) {
        element.style.color = 'var(--success-color)';
    } else if (score >= 10) {
        element.style.color = 'var(--warning-color)';
    } else {
        element.style.color = 'var(--danger-color)';
    }
}

// Update progress bar
function updateProgressBar(score) {
    let percentage = 0;
    
    if (score >= 70) {
        percentage = 100;
    } else if (score >= 25) {
        percentage = 70 + ((score - 25) / 45) * 30; // 70-100%
    } else if (score >= 10) {
        percentage = 30 + ((score - 10) / 15) * 40; // 30-70%
    } else {
        percentage = (score / 10) * 30; // 0-30%
    }
    
    document.getElementById('ffProgress').style.width = percentage + '%';
}

// Generate improvement suggestions
function generateSuggestions() {
    const suggestionsContainer = document.getElementById('suggestions');
    const suggestions = [];
    
    if (ffData.currentScore < 10) {
        suggestions.push({
            icon: '🚨',
            title: 'Critical: Build Emergency Fund',
            description: 'Your current savings can only last ' + ffData.currentScore + ' years. Focus on building an emergency fund of 6-12 months expenses first.',
            priority: 'high'
        });
        
        suggestions.push({
            icon: '💰',
            title: 'Increase Savings Rate',
            description: 'Try to save at least 20-30% of your income. Consider reducing discretionary expenses.',
            priority: 'high'
        });
    } else if (ffData.currentScore < 25) {
        suggestions.push({
            icon: '📈',
            title: 'Optimize Investment Returns',
            description: 'Consider diversifying into higher-return assets like equity mutual funds or stocks.',
            priority: 'medium'
        });
        
        suggestions.push({
            icon: '💸',
            title: 'Review and Reduce Expenses',
            description: 'Look for opportunities to reduce monthly expenses without compromising lifestyle.',
            priority: 'medium'
        });
    } else if (ffData.currentScore < 50) {
        suggestions.push({
            icon: '🎯',
            title: 'You\'re on the Right Track!',
            description: 'Continue your current strategy. Consider increasing investments in growth assets.',
            priority: 'low'
        });
    } else {
        suggestions.push({
            icon: '🏆',
            title: 'Excellent Financial Position!',
            description: 'You have achieved strong financial independence. Consider philanthropic goals or early retirement.',
            priority: 'low'
        });
    }
    
    // Always add income suggestion if applicable
    const incomeData = Storage.get('incomeData', {});
    const expenseData = Storage.get('expenseData', {});
    
    if (incomeData.totals && expenseData.analysis) {
        const savingsRate = expenseData.analysis.savingsRate || 0;
        if (savingsRate < 20) {
            suggestions.push({
                icon: '💼',
                title: 'Increase Income Sources',
                description: 'Consider side hustles, skill development, or passive income streams to boost your savings rate.',
                priority: 'medium'
            });
        }
    }
    
    // Render suggestions
    suggestionsContainer.innerHTML = suggestions.map(suggestion => `
        <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${getPriorityColor(suggestion.priority)};">
            <div class="card-body">
                <h4 style="margin-bottom: 0.5rem;">
                    <span style="margin-right: 0.5rem;">${suggestion.icon}</span>
                    ${suggestion.title}
                </h4>
                <p style="margin-bottom: 0; color: var(--text-secondary);">${suggestion.description}</p>
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

// Calculate what-if scenarios
function calculateWhatIf() {
    const additionalSavings = parseFloat(document.getElementById('additionalSavings').value) || 0;
    const expenseReduction = parseFloat(document.getElementById('expenseReduction').value) || 0;
    
    // Calculate new net worth (assuming additional savings for 1 year)
    const newNetWorth = ffData.netWorth + (additionalSavings * 12);
    
    // Calculate new annual expenses
    const newAnnualExpenses = Math.max(0, ffData.annualExpenses - (expenseReduction * 12));
    
    // Calculate improved score
    const improvedScore = calculateFFScoreValue(newNetWorth, newAnnualExpenses, ffData.assetGrowthRate, ffData.inflationRate);
    
    document.getElementById('improvedScore').textContent = improvedScore;
    colorCodeScore('improvedScore', improvedScore);
}

// Save FF data
function saveFFData() {
    const data = {
        netWorth: ffData.netWorth,
        annualExpenses: ffData.annualExpenses,
        assetGrowthRate: ffData.assetGrowthRate,
        inflationRate: ffData.inflationRate,
        currentScore: ffData.currentScore,
        scenarios: {
            conservative: parseInt(document.getElementById('conservativeScore').textContent),
            moderate: parseInt(document.getElementById('moderateScore').textContent),
            aggressive: parseInt(document.getElementById('aggressiveScore').textContent)
        },
        scoreMeaning: getFFScoreMeaning(ffData.currentScore),
        calculatedAt: new Date().toISOString()
    };
    
    Storage.set('ffScoreData', data);
}

// Navigation functions
function goBack() {
    navigateToPage('expenses.html', saveFFData);
}

function goNext() {
    navigateToPage('insurance.html', saveFFData);
}

// ===== EXPORT FUNCTIONS =====

// Get FF Score data for other modules
function getFFScoreData() {
    return {
        score: ffData.currentScore,
        netWorth: ffData.netWorth,
        annualExpenses: ffData.annualExpenses,
        assetGrowthRate: ffData.assetGrowthRate,
        inflationRate: ffData.inflationRate,
        scoreMeaning: getFFScoreMeaning(ffData.currentScore),
        scenarios: {
            conservative: parseInt(document.getElementById('conservativeScore').textContent),
            moderate: parseInt(document.getElementById('moderateScore').textContent),
            aggressive: parseInt(document.getElementById('aggressiveScore').textContent)
        }
    };
} 
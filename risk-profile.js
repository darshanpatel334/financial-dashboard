// ===== RISK PROFILE PAGE FUNCTIONALITY =====

let riskData = {
    currentQuestionIndex: 0,
    responses: {},
    totalScore: 0,
    riskProfile: ''
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        initQuestionListeners();
        loadRiskData();
        
        // Setup navigation system - use safer timing
        if (typeof safeSetupNavigation === 'function') {
            safeSetupNavigation(7); // 7 = Risk Profile page
        } else if (typeof setupPageNavigation === 'function') {
            setTimeout(() => setupPageNavigation(7), 200);
        }
    });
});

// Initialize question listeners
function initQuestionListeners() {
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
        input.addEventListener('change', () => {
            updateProgress();
            updateQuestionStyles();
        });
    });
}

// Update progress bar
function updateProgress() {
    const totalQuestions = 8;
    const answeredQuestions = getAnsweredQuestions().length;
    const progress = (answeredQuestions / totalQuestions) * 100;
    
    document.getElementById('questionProgress').style.width = progress + '%';
}

// Get answered questions
function getAnsweredQuestions() {
    const questionNames = ['age', 'horizon', 'goal', 'volatility', 'income', 'knowledge', 'emergency', 'appetite'];
    return questionNames.filter(name => {
        return document.querySelector(`input[name="${name}"]:checked`);
    });
}

// Update question styles
function updateQuestionStyles() {
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
        const option = input.closest('.radio-option');
        if (input.checked) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Calculate risk profile
function calculateRiskProfile() {
    const questionNames = ['age', 'horizon', 'goal', 'volatility', 'income', 'knowledge', 'emergency', 'appetite'];
    
    // Check if all questions are answered
    const answeredQuestions = getAnsweredQuestions();
    if (answeredQuestions.length < 8) {
        showStatus('Please answer all questions before calculating your risk profile', 'error');
        return;
    }
    
    // Calculate total score
    let totalScore = 0;
    const responses = {};
    
    questionNames.forEach(name => {
        const checkedInput = document.querySelector(`input[name="${name}"]:checked`);
        if (checkedInput) {
            const score = parseInt(checkedInput.value);
            responses[name] = score;
            totalScore += score;
        }
    });
    
    riskData.responses = responses;
    riskData.totalScore = totalScore;
    
    // Determine risk profile
    const riskProfile = determineRiskProfile(totalScore);
    riskData.riskProfile = riskProfile.type;
    
    // Display risk score
    displayRiskScore(totalScore, riskProfile);
    
    // Save data without asset allocation
    riskData = {
        responses: responses,
        totalScore: totalScore,
        riskProfile: riskProfile.type
    };
    
    Storage.set('riskProfileData', riskData);
    
    // Show success message
    showStatus('Risk profile calculated successfully! View your analytics dashboard to understand your profile.', 'success');
}

// Determine risk profile based on score
function determineRiskProfile(score) {
    if (score <= 12) {
        return {
            type: 'Conservative',
            emoji: '🔒',
            color: '#22c55e',
            description: 'You prefer stability and capital preservation over high returns. Low risk tolerance.',
            characteristics: [
                'Prioritizes capital preservation',
                'Low tolerance for volatility',
                'Prefers guaranteed returns',
                'Suitable for debt instruments'
            ]
        };
    } else if (score <= 20) {
        return {
            type: 'Risk Averse',
            emoji: '🛡️',
            color: '#3b82f6',
            description: 'You prefer moderate risk with stable returns. Cautious approach to investing.',
            characteristics: [
                'Moderate risk tolerance',
                'Prefers stable investments',
                'Some allocation to growth assets',
                'Balanced approach'
            ]
        };
    } else if (score <= 26) {
        return {
            type: 'Balanced',
            emoji: '⚖️',
            color: '#f59e0b',
            description: 'You balance risk and returns. Comfortable with moderate market fluctuations.',
            characteristics: [
                'Balanced risk approach',
                'Comfortable with volatility',
                'Mix of growth and income assets',
                'Long-term perspective'
            ]
        };
    } else {
        return {
            type: 'Aggressive',
            emoji: '🚀',
            color: '#ef4444',
            description: 'You seek high returns and are comfortable with high risk and volatility.',
            characteristics: [
                'High risk tolerance',
                'Seeks maximum returns',
                'Comfortable with volatility',
                'Growth-focused strategy'
            ]
        };
    }
}

// Display risk score
function displayRiskScore(score, profile) {
    document.getElementById('riskScore').textContent = score;
    document.getElementById('riskProfileEmoji').textContent = profile.emoji;
    document.getElementById('riskProfileLevel').textContent = profile.type;
    document.getElementById('riskProfileLevel').style.color = profile.color;
    document.getElementById('riskProfileDescription').textContent = profile.description;
    
    document.getElementById('riskScoreDisplay').style.display = 'block';
}

// Generate risk insights
function generateRiskInsights(profile, responses) {
    const insights = [];
    
    // Age-based insights
    if (responses.age <= 2) {
        insights.push({
            icon: '⏰',
            title: 'Age Consideration',
            description: 'Given your age, consider shifting towards more conservative investments to preserve capital.',
            type: 'info'
        });
    } else if (responses.age >= 4) {
        insights.push({
            icon: '🚀',
            title: 'Young Investor Advantage',
            description: 'You have time on your side. Consider higher equity allocation for long-term wealth creation.',
            type: 'success'
        });
    }
    
    // Emergency fund insights
    if (responses.emergency <= 2) {
        insights.push({
            icon: '🚨',
            title: 'Build Emergency Fund First',
            description: 'Before investing in risky assets, ensure you have 6+ months of expenses in an emergency fund.',
            type: 'warning'
        });
    }
    
    // Investment horizon insights
    if (responses.horizon >= 3) {
        insights.push({
            icon: '📈',
            title: 'Long-term Investment Horizon',
            description: 'Your long investment horizon allows you to ride out market volatility and benefit from compounding.',
            type: 'success'
        });
    }
    
    // Knowledge-based insights
    if (responses.knowledge <= 2) {
        insights.push({
            icon: '📚',
            title: 'Investment Education',
            description: 'Consider learning more about investing or consulting a financial advisor before making complex investment decisions.',
            type: 'info'
        });
    }
    
    // Risk-specific recommendations
    if (profile.type === 'Conservative') {
        insights.push({
            icon: '🔒',
            title: 'Conservative Strategy',
            description: 'Focus on capital preservation with high-grade bonds, FDs, and blue-chip dividend stocks.',
            type: 'info'
        });
    } else if (profile.type === 'Aggressive') {
        insights.push({
            icon: '⚡',
            title: 'Aggressive Strategy',
            description: 'Consider growth stocks, small-cap funds, and emerging market investments, but ensure proper diversification.',
            type: 'warning'
        });
    }
    
    // Income stability insights
    if (responses.income <= 2) {
        insights.push({
            icon: '💼',
            title: 'Income Stability',
            description: 'With variable income, maintain a larger emergency fund and avoid highly leveraged investments.',
            type: 'warning'
        });
    }
    
    // Render insights
    const insightsContainer = document.getElementById('riskInsights');
    insightsContainer.innerHTML = insights.map(insight => `
        <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${getInsightColor(insight.type)};">
            <div class="card-body">
                <h4 style="margin-bottom: 0.5rem;">
                    <span style="margin-right: 0.5rem;">${insight.icon}</span>
                    ${insight.title}
                </h4>
                <p style="margin-bottom: 0; color: var(--text-secondary);">${insight.description}</p>
            </div>
        </div>
    `).join('');
    
    document.getElementById('insightsSection').style.display = 'block';
}

// Get insight color based on type
function getInsightColor(type) {
    switch (type) {
        case 'success': return 'var(--success-color)';
        case 'warning': return 'var(--warning-color)';
        case 'info': return 'var(--info-color)';
        default: return 'var(--primary-color)';
    }
}

// Load risk data
function loadRiskData() {
    const savedData = Storage.get('riskProfileData', {});
    
    if (savedData.responses) {
        // Restore form selections
        Object.keys(savedData.responses).forEach(questionName => {
            const value = savedData.responses[questionName];
            const input = document.querySelector(`input[name="${questionName}"][value="${value}"]`);
            if (input) {
                input.checked = true;
            }
        });
        
        // Update styles and progress
        updateQuestionStyles();
        updateProgress();
        
        // If calculation was completed, show results
        if (savedData.riskProfile) {
            riskData = { ...savedData };
            const profile = determineRiskProfile(savedData.totalScore);
            displayRiskScore(savedData.totalScore, profile);
            generateRiskInsights(profile, savedData.responses);
        }
    }
}

// Save risk data
function saveRiskData() {
    const data = {
        responses: riskData.responses,
        totalScore: riskData.totalScore,
        riskProfile: riskData.riskProfile,
        calculatedAt: new Date().toISOString()
    };
    
    Storage.set('riskProfileData', data);
}

// Navigation functions
function goBack() {
    navigateToPage('insurance', saveRiskData);
}

function goNext() {
    if (!riskData.riskProfile) {
        showStatus('Please complete the risk assessment before proceeding', 'error');
        return;
    }
    navigateToPage('analytics', saveRiskData);
}

// ===== EXPORT FUNCTIONS =====

// Get risk profile data for other modules
function getRiskProfileData() {
    return {
        riskProfile: riskData.riskProfile,
        totalScore: riskData.totalScore,
        responses: riskData.responses,
        profileDetails: riskData.riskProfile ? determineRiskProfile(riskData.totalScore) : null
    };
} 
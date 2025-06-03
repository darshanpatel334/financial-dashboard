// ===== INSURANCE PAGE FUNCTIONALITY =====

let insuranceCount = 0;
let insuranceData = {
    termInsurance: [],
    endowmentInsurance: [],
    individualHealth: [],
    familyHealth: [],
    groupHealth: []
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        loadInsuranceData();
        calculateTotals();
    });
});

// Add insurance item
function addInsuranceItem(category, type) {
    insuranceCount++;
    const container = document.getElementById(category + 'Items');
    const insuranceItem = document.createElement('div');
    insuranceItem.className = 'item-card';
    
    let additionalFields = '';
    
    // Add specific fields based on category
    if (category.includes('Health') || category === 'groupHealth') {
        additionalFields = `
            <div class="form-group">
                <label>Coverage Amount (₹)</label>
                <input type="number" placeholder="Coverage amount" onchange="calculateTotals(); updateAmountDisplay(this)">
                <div class="amount-display"></div>
            </div>
        `;
    } else {
        // Life insurance
        additionalFields = `
            <div class="form-group">
                <label>Coverage Amount (₹)</label>
                <input type="number" placeholder="Coverage amount" onchange="calculateTotals(); updateAmountDisplay(this)">
                <div class="amount-display"></div>
            </div>
            <div class="form-group">
                <label>Policy Term (Years)</label>
                <input type="number" placeholder="Policy term" min="1" max="100" onchange="calculateTotals()">
            </div>
        `;
    }
    
    insuranceItem.innerHTML = `
        <div class="form-group">
            <label>Policy Name/Company</label>
            <input type="text" placeholder="Enter policy name" onchange="calculateTotals()">
        </div>
        <div class="form-group">
            <label>Annual Premium (₹)</label>
            <input type="number" placeholder="0" onchange="calculateTotals(); updateAmountDisplay(this)">
            <div class="amount-display"></div>
        </div>
        ${additionalFields}
        <button class="delete-btn" onclick="removeInsuranceItem(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    container.appendChild(insuranceItem);
    saveInsuranceData();
}

// Remove insurance item
function removeInsuranceItem(button) {
    button.closest('.item-card').remove();
    calculateTotals();
    saveInsuranceData();
}

// Calculate totals and analysis
function calculateTotals() {
    let totalLifeCoverage = 0;
    let totalHealthCoverage = 0;
    let totalPremiums = 0;
    
    // Calculate category totals
    const categories = {
        termInsurance: { isLife: true },
        endowmentInsurance: { isLife: true },
        individualHealth: { isLife: false },
        familyHealth: { isLife: false },
        groupHealth: { isLife: false }
    };
    
    Object.keys(categories).forEach(category => {
        let categoryPremium = 0;
        let categoryCoverage = 0;
        
        const items = document.querySelectorAll(`#${category}Items .item-card`);
        items.forEach(item => {
            const inputs = item.querySelectorAll('input[type="number"]');
            const premium = parseFloat(inputs[0]?.value) || 0; // First number input is always premium
            const coverage = parseFloat(inputs[1]?.value) || 0; // Second is coverage
            
            categoryPremium += premium;
            categoryCoverage += coverage;
            totalPremiums += premium;
            
            if (categories[category].isLife) {
                totalLifeCoverage += coverage;
            } else {
                totalHealthCoverage += coverage;
            }
        });
        
        // Update category totals
        const totalElement = document.getElementById(category + 'Total');
        if (totalElement) {
            totalElement.textContent = formatCurrency(categoryCoverage);
        }
    });
    
    // Update summary totals
    document.getElementById('totalLifeCoverage').textContent = formatCurrency(totalLifeCoverage);
    document.getElementById('totalHealthCoverage').textContent = formatCurrency(totalHealthCoverage);
    document.getElementById('totalPremiums').textContent = formatCurrency(totalPremiums);
    
    // Calculate adequacy analysis
    calculateAdequacyAnalysis(totalLifeCoverage, totalHealthCoverage);
    
    // Generate recommendations
    generateInsuranceRecommendations();
    
    // Auto-save after calculation
    setTimeout(() => {
        saveInsuranceData();
    }, 1000);
}

// Calculate adequacy analysis
function calculateAdequacyAnalysis(totalLifeCoverage, totalHealthCoverage) {
    // Get income data for analysis
    const incomeData = Storage.get('incomeData', {});
    const annualIncome = incomeData.totals?.annualTotal || 0;
    
    // Calculate life insurance ratio
    const lifeInsuranceRatio = annualIncome > 0 ? totalLifeCoverage / annualIncome : 0;
    document.getElementById('lifeInsuranceRatio').textContent = lifeInsuranceRatio.toFixed(1) + 'x';
    
    // Determine life insurance status
    let lifeInsuranceStatus = '';
    let lifeInsuranceColor = '';
    
    if (lifeInsuranceRatio >= 15) {
        lifeInsuranceStatus = 'Excellent Coverage';
        lifeInsuranceColor = 'var(--success-color)';
    } else if (lifeInsuranceRatio >= 10) {
        lifeInsuranceStatus = 'Adequate Coverage';
        lifeInsuranceColor = 'var(--success-color)';
    } else if (lifeInsuranceRatio >= 5) {
        lifeInsuranceStatus = 'Needs Improvement';
        lifeInsuranceColor = 'var(--warning-color)';
    } else {
        lifeInsuranceStatus = 'Critically Low';
        lifeInsuranceColor = 'var(--danger-color)';
    }
    
    document.getElementById('lifeInsuranceStatus').textContent = lifeInsuranceStatus;
    document.getElementById('lifeInsuranceRatio').style.color = lifeInsuranceColor;
    
    // Calculate health coverage score (1-10 scale)
    let healthScore = 0;
    
    if (totalHealthCoverage >= 2000000) healthScore = 10; // 20L+
    else if (totalHealthCoverage >= 1000000) healthScore = 8; // 10-20L
    else if (totalHealthCoverage >= 500000) healthScore = 6; // 5-10L
    else if (totalHealthCoverage >= 300000) healthScore = 4; // 3-5L
    else if (totalHealthCoverage >= 100000) healthScore = 2; // 1-3L
    else healthScore = 0; // Below 1L
    
    document.getElementById('healthCoverageScore').textContent = healthScore + '/10';
    
    // Determine health coverage status
    let healthCoverageStatus = '';
    let healthCoverageColor = '';
    
    if (healthScore >= 8) {
        healthCoverageStatus = 'Excellent Coverage';
        healthCoverageColor = 'var(--success-color)';
    } else if (healthScore >= 6) {
        healthCoverageStatus = 'Good Coverage';
        healthCoverageColor = 'var(--success-color)';
    } else if (healthScore >= 4) {
        healthCoverageStatus = 'Basic Coverage';
        healthCoverageColor = 'var(--warning-color)';
    } else {
        healthCoverageStatus = 'Insufficient Coverage';
        healthCoverageColor = 'var(--danger-color)';
    }
    
    document.getElementById('healthCoverageStatus').textContent = healthCoverageStatus;
    document.getElementById('healthCoverageScore').style.color = healthCoverageColor;
}

// Generate insurance recommendations
function generateInsuranceRecommendations() {
    const recommendationsContainer = document.getElementById('insuranceRecommendations');
    const recommendations = [];
    
    // Get current data
    const incomeData = Storage.get('incomeData', {});
    const personalData = Storage.get('personalData', {});
    const annualIncome = incomeData.totals?.annualTotal || 0;
    const totalLifeCoverage = parseCurrency(document.getElementById('totalLifeCoverage').textContent);
    const totalHealthCoverage = parseCurrency(document.getElementById('totalHealthCoverage').textContent);
    
    // Life insurance recommendations
    const lifeInsuranceRatio = annualIncome > 0 ? totalLifeCoverage / annualIncome : 0;
    
    if (lifeInsuranceRatio < 5) {
        recommendations.push({
            icon: '🚨',
            title: 'Critical: Increase Life Insurance',
            description: `Your life insurance is only ${lifeInsuranceRatio.toFixed(1)}x your annual income. Aim for at least 10-15x (₹${formatNumber(annualIncome * 10)} - ₹${formatNumber(annualIncome * 15)}).`,
            priority: 'high'
        });
    } else if (lifeInsuranceRatio < 10) {
        recommendations.push({
            icon: '⚠️',
            title: 'Consider Increasing Life Insurance',
            description: `Your current coverage is ${lifeInsuranceRatio.toFixed(1)}x income. Consider increasing to 10-15x for better family protection.`,
            priority: 'medium'
        });
    }
    
    // Health insurance recommendations
    if (totalHealthCoverage < 500000) {
        recommendations.push({
            icon: '🏥',
            title: 'Increase Health Insurance Coverage',
            description: 'Medical inflation is high. Consider coverage of at least ₹5-10 lakhs for adequate protection against major illnesses.',
            priority: 'high'
        });
    } else if (totalHealthCoverage < 1000000) {
        recommendations.push({
            icon: '💊',
            title: 'Consider Higher Health Coverage',
            description: 'Your current health coverage is decent, but consider increasing to ₹10-20 lakhs for comprehensive protection.',
            priority: 'medium'
        });
    }
    
    // Term vs Endowment analysis
    const termCoverage = parseCurrency(document.getElementById('termInsuranceTotal').textContent);
    const endowmentCoverage = parseCurrency(document.getElementById('endowmentInsuranceTotal').textContent);
    
    if (endowmentCoverage > termCoverage && endowmentCoverage > 0) {
        recommendations.push({
            icon: '📊',
            title: 'Optimize Insurance Strategy',
            description: 'Consider converting endowment policies to term insurance + separate mutual fund investments for better returns.',
            priority: 'medium'
        });
    }
    
    // Age-based recommendations
    if (personalData.age) {
        if (personalData.age > 40 && totalHealthCoverage < 1000000) {
            recommendations.push({
                icon: '⏰',
                title: 'Age-Based Health Coverage',
                description: 'As you age, medical expenses increase. Consider higher health insurance coverage and critical illness riders.',
                priority: 'medium'
            });
        }
    }
    
    // Family recommendations
    if (personalData.maritalStatus === 'married' || (personalData.dependents && personalData.dependents.length > 0)) {
        if (lifeInsuranceRatio < 15) {
            recommendations.push({
                icon: '👨‍👩‍👧‍👦',
                title: 'Family Protection',
                description: 'With family responsibilities, ensure adequate life insurance coverage of 15x annual income.',
                priority: 'high'
            });
        }
    }
    
    // If no major issues, provide positive reinforcement
    if (recommendations.length === 0) {
        recommendations.push({
            icon: '✅',
            title: 'Well Protected!',
            description: 'Your insurance coverage appears adequate. Review annually and adjust for income changes.',
            priority: 'low'
        });
    }
    
    // Render recommendations
    recommendationsContainer.innerHTML = recommendations.map(recommendation => `
        <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${getPriorityColor(recommendation.priority)};">
            <div class="card-body">
                <h4 style="margin-bottom: 0.5rem;">
                    <span style="margin-right: 0.5rem;">${recommendation.icon}</span>
                    ${recommendation.title}
                </h4>
                <p style="margin-bottom: 0; color: var(--text-secondary);">${recommendation.description}</p>
            </div>
        </div>
    `).join('');
}

// Get priority color (reuse from ff-score.js)
function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'var(--danger-color)';
        case 'medium': return 'var(--warning-color)';
        case 'low': return 'var(--success-color)';
        default: return 'var(--info-color)';
    }
}

// Save insurance data
function saveInsuranceData() {
    const data = {
        insurance: {},
        totals: {
            totalLifeCoverage: parseCurrency(document.getElementById('totalLifeCoverage').textContent),
            totalHealthCoverage: parseCurrency(document.getElementById('totalHealthCoverage').textContent),
            totalPremiums: parseCurrency(document.getElementById('totalPremiums').textContent)
        },
        analysis: {
            lifeInsuranceRatio: parseFloat(document.getElementById('lifeInsuranceRatio').textContent) || 0,
            healthCoverageScore: parseInt(document.getElementById('healthCoverageScore').textContent) || 0,
            lifeInsuranceStatus: document.getElementById('lifeInsuranceStatus').textContent,
            healthCoverageStatus: document.getElementById('healthCoverageStatus').textContent
        }
    };
    
    // Save insurance by category
    const categories = ['termInsurance', 'endowmentInsurance', 'individualHealth', 'familyHealth', 'groupHealth'];
    categories.forEach(category => {
        data.insurance[category] = [];
        const items = document.querySelectorAll(`#${category}Items .item-card`);
        items.forEach(item => {
            const inputs = item.querySelectorAll('input');
            
            if (inputs.length >= 3) {
                const policyName = inputs[0].value;
                const premium = parseFloat(inputs[1].value) || 0;
                const coverage = parseFloat(inputs[2].value) || 0;
                
                if (policyName && (premium > 0 || coverage > 0)) {
                    const insuranceItem = {
                        policyName: policyName,
                        annualPremium: premium,
                        coverageAmount: coverage
                    };
                    
                    // Add policy term for life insurance
                    if (category.includes('Insurance') && inputs.length >= 4) {
                        insuranceItem.policyTerm = parseFloat(inputs[3].value) || 0;
                    }
                    
                    data.insurance[category].push(insuranceItem);
                }
            }
        });
    });
    
    Storage.set('insuranceData', data);
}

// Load insurance data
function loadInsuranceData() {
    const savedData = Storage.get('insuranceData', {});
    
    if (savedData.insurance) {
        // Load insurance items
        Object.keys(savedData.insurance).forEach(category => {
            savedData.insurance[category].forEach(insurance => {
                const typeName = getInsuranceTypeName(category);
                addInsuranceItem(category, typeName);
                
                const lastItem = document.querySelector(`#${category}Items .item-card:last-child`);
                if (lastItem) {
                    const inputs = lastItem.querySelectorAll('input');
                    
                    if (inputs.length >= 3) {
                        inputs[0].value = insurance.policyName;
                        inputs[1].value = insurance.annualPremium;
                        inputs[2].value = insurance.coverageAmount;
                        
                        updateAmountDisplay(inputs[1]);
                        updateAmountDisplay(inputs[2]);
                        
                        // Load policy term for life insurance
                        if (insurance.policyTerm && inputs.length >= 4) {
                            inputs[3].value = insurance.policyTerm;
                        }
                    }
                }
            });
        });
    }
    
    calculateTotals();
}

// Get insurance type name
function getInsuranceTypeName(category) {
    const typeNames = {
        termInsurance: 'Term Insurance',
        endowmentInsurance: 'Endowment/ULIP',
        individualHealth: 'Individual Health Insurance',
        familyHealth: 'Family Health Insurance',
        groupHealth: 'Group Health Insurance'
    };
    return typeNames[category] || 'Insurance';
}

// Navigation functions
function goBack() {
    navigateToPage('ff-score.html', saveInsuranceData);
}

function goNext() {
    navigateToPage('risk-profile.html', saveInsuranceData);
}

// ===== EXPORT FUNCTIONS =====

// Get insurance data for other modules
function getInsuranceData() {
    const data = Storage.get('insuranceData', {});
    return {
        totals: data.totals || {},
        analysis: data.analysis || {},
        recommendations: generateInsuranceRecommendations,
        categories: data.insurance || {}
    };
} 
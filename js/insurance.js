// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateInsuranceSummary();
    renderLifeInsurance();
    renderMedicalInsurance();
    updateCoverageAnalysis();
    initializeInsuranceChart();
});

// Update summary values
function updateInsuranceSummary() {
    const { life, medical } = AppState.insurance;
    
    // Calculate totals
    const totalLifeCoverage = calculateTotalLifeCoverage();
    const totalMedicalCoverage = calculateTotalMedicalCoverage();
    const totalPremiums = calculateTotalPremiums();
    
    // Update display
    document.getElementById('total-life-coverage').textContent = utils.formatCurrency(totalLifeCoverage);
    document.getElementById('life-coverage-words').textContent = utils.numberToWords(totalLifeCoverage);
    
    document.getElementById('total-medical-coverage').textContent = utils.formatCurrency(totalMedicalCoverage);
    document.getElementById('medical-coverage-words').textContent = utils.numberToWords(totalMedicalCoverage);
    
    document.getElementById('total-premiums').textContent = utils.formatCurrency(totalPremiums);
    document.getElementById('premiums-words').textContent = utils.numberToWords(totalPremiums);
    
    // Update coverage status
    const status = assessCoverageStatus(totalLifeCoverage, totalMedicalCoverage);
    document.getElementById('coverage-status').textContent = status;
    document.getElementById('coverage-status').className = `text-${getCoverageStatusColor(status)}`;
}

// Initialize Insurance Chart
function initializeInsuranceChart() {
    const ctx = document.getElementById('insurance-chart').getContext('2d');
    const { life, medical } = AppState.insurance;
    
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

// Life Insurance Functions
function renderLifeInsurance() {
    const container = document.getElementById('life-insurance-list');
    const { life } = AppState.insurance;
    
    let html = '<div class="grid-list">';
    
    // Render life insurance policies
    if (life && life.length > 0) {
        life.forEach((policy, index) => {
            html += createPolicyCard('life', index, policy);
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Medical Insurance Functions
function renderMedicalInsurance() {
    const container = document.getElementById('medical-insurance-list');
    const { medical } = AppState.insurance;
    
    let html = '<div class="grid-list">';
    
    // Render medical insurance policies
    if (medical && medical.length > 0) {
        medical.forEach((policy, index) => {
            html += createPolicyCard('medical', index, policy);
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Create Policy Card HTML
function createPolicyCard(type, index, policy) {
    return `
        <div class="card">
            <h4>${policy.name}</h4>
            <p>Type: ${policy.type}</p>
            <p>Sum Assured: ${utils.formatCurrency(policy.sumAssured)}</p>
            <p>Annual Premium: ${utils.formatCurrency(policy.premium)}</p>
            ${type === 'life' ? `<p>Term: ${policy.term} years</p>` : ''}
            ${type === 'medical' && policy.roomRentLimit ? `<p>Room Rent Limit: ${utils.formatCurrency(policy.roomRentLimit)}</p>` : ''}
            ${type === 'medical' ? `<p>Co-Pay: ${policy.hasCoPay ? 'Yes' : 'No'}</p>` : ''}
            <p>Start Date: ${new Date(policy.startDate).toLocaleDateString()}</p>
            <button class="btn btn-danger" onclick="deletePolicy('${type}', ${index})">Delete</button>
        </div>
    `;
}

// Modal Functions
function showLifeInsuranceModal() {
    document.getElementById('life-insurance-modal').style.display = 'block';
}

function closeLifeInsuranceModal() {
    document.getElementById('life-insurance-modal').style.display = 'none';
    document.getElementById('life-insurance-form').reset();
}

function showMedicalInsuranceModal() {
    document.getElementById('medical-insurance-modal').style.display = 'block';
}

function closeMedicalInsuranceModal() {
    document.getElementById('medical-insurance-modal').style.display = 'none';
    document.getElementById('medical-insurance-form').reset();
}

// Save Functions
function saveLifeInsurance(event) {
    event.preventDefault();
    
    const policy = {
        name: document.getElementById('life-policy-name').value.trim(),
        type: document.getElementById('life-policy-type').value,
        sumAssured: parseFloat(document.getElementById('life-sum-assured').value),
        premium: parseFloat(document.getElementById('life-premium').value),
        term: parseInt(document.getElementById('life-term').value),
        startDate: document.getElementById('life-start-date').value
    };
    
    if (!AppState.insurance.life) {
        AppState.insurance.life = [];
    }
    
    AppState.insurance.life.push(policy);
    AppState.save();
    
    closeLifeInsuranceModal();
    renderLifeInsurance();
    updateInsuranceSummary();
    initializeInsuranceChart();
    updateCoverageAnalysis();
    
    return false;
}

function saveMedicalInsurance(event) {
    event.preventDefault();
    
    const policy = {
        name: document.getElementById('medical-policy-name').value.trim(),
        type: document.getElementById('medical-policy-type').value,
        sumAssured: parseFloat(document.getElementById('medical-sum-assured').value),
        premium: parseFloat(document.getElementById('medical-premium').value),
        roomRentLimit: parseFloat(document.getElementById('medical-room-limit').value) || 0,
        hasCoPay: document.getElementById('medical-copay').checked,
        startDate: document.getElementById('medical-start-date').value
    };
    
    if (!AppState.insurance.medical) {
        AppState.insurance.medical = [];
    }
    
    AppState.insurance.medical.push(policy);
    AppState.save();
    
    closeMedicalInsuranceModal();
    renderMedicalInsurance();
    updateInsuranceSummary();
    initializeInsuranceChart();
    updateCoverageAnalysis();
    
    return false;
}

// Delete Function
function deletePolicy(type, index) {
    AppState.insurance[type].splice(index, 1);
    AppState.save();
    
    if (type === 'life') {
        renderLifeInsurance();
    } else {
        renderMedicalInsurance();
    }
    
    updateInsuranceSummary();
    initializeInsuranceChart();
    updateCoverageAnalysis();
}

// Helper Functions
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

function calculateTotalPremiums() {
    const { life, medical } = AppState.insurance;
    let total = 0;
    
    if (life) {
        total += life.reduce((sum, policy) => sum + policy.premium, 0);
    }
    
    if (medical) {
        total += medical.reduce((sum, policy) => sum + policy.premium, 0);
    }
    
    return total;
}

function assessCoverageStatus(lifeCoverage, medicalCoverage) {
    const { personalInfo } = AppState;
    const age = utils.calculateAge(new Date(personalInfo.birthdate));
    const { income } = AppState;
    const annualIncome = income.summary.annualIncome;
    
    // Life insurance should be at least 10x annual income
    const recommendedLife = annualIncome * 10;
    // Medical insurance should be at least 5x monthly income
    const recommendedMedical = (annualIncome / 12) * 5;
    
    if (lifeCoverage >= recommendedLife && medicalCoverage >= recommendedMedical) {
        return 'Well Covered';
    } else if (lifeCoverage >= recommendedLife * 0.7 && medicalCoverage >= recommendedMedical * 0.7) {
        return 'Adequately Covered';
    } else if (lifeCoverage >= recommendedLife * 0.4 && medicalCoverage >= recommendedMedical * 0.4) {
        return 'Partially Covered';
    } else {
        return 'Inadequately Covered';
    }
}

function getCoverageStatusColor(status) {
    switch (status) {
        case 'Well Covered': return 'success';
        case 'Adequately Covered': return 'info';
        case 'Partially Covered': return 'warning';
        default: return 'danger';
    }
}

function updateCoverageAnalysis() {
    const container = document.getElementById('coverage-analysis');
    const { personalInfo, income } = AppState;
    
    const age = utils.calculateAge(new Date(personalInfo.birthdate));
    const annualIncome = income.summary.annualIncome;
    const lifeCoverage = calculateTotalLifeCoverage();
    const medicalCoverage = calculateTotalMedicalCoverage();
    
    const recommendedLife = annualIncome * 10;
    const recommendedMedical = (annualIncome / 12) * 5;
    
    const lifeGap = Math.max(0, recommendedLife - lifeCoverage);
    const medicalGap = Math.max(0, recommendedMedical - medicalCoverage);
    
    container.innerHTML = `
        <div class="mb-3">
            <h4>Life Insurance Analysis</h4>
            <p>Recommended Coverage: ${utils.formatCurrency(recommendedLife)}</p>
            <p>Current Coverage: ${utils.formatCurrency(lifeCoverage)}</p>
            <p>Coverage Gap: ${utils.formatCurrency(lifeGap)}</p>
            <p class="text-${lifeCoverage >= recommendedLife ? 'success' : 'warning'}">
                ${lifeCoverage >= recommendedLife ? 'Adequate life coverage' : 'Consider increasing life coverage'}
            </p>
        </div>
        
        <div class="mb-3">
            <h4>Medical Insurance Analysis</h4>
            <p>Recommended Coverage: ${utils.formatCurrency(recommendedMedical)}</p>
            <p>Current Coverage: ${utils.formatCurrency(medicalCoverage)}</p>
            <p>Coverage Gap: ${utils.formatCurrency(medicalGap)}</p>
            <p class="text-${medicalCoverage >= recommendedMedical ? 'success' : 'warning'}">
                ${medicalCoverage >= recommendedMedical ? 'Adequate medical coverage' : 'Consider increasing medical coverage'}
            </p>
        </div>
        
        <div>
            <h4>Recommendations</h4>
            <ul>
                ${lifeGap > 0 ? `<li>Consider adding term life insurance of ${utils.formatCurrency(lifeGap)}</li>` : ''}
                ${medicalGap > 0 ? `<li>Consider increasing medical coverage by ${utils.formatCurrency(medicalGap)}</li>` : ''}
                ${age > 45 ? '<li>Consider adding critical illness coverage</li>' : ''}
                ${AppState.insurance.medical?.some(p => p.hasCoPay) ? '<li>Consider upgrading policies with co-pay to reduce out-of-pocket expenses</li>' : ''}
            </ul>
        </div>
    `;
} 
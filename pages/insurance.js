document.addEventListener('DOMContentLoaded', function() {
    const insuranceForm = document.getElementById('insuranceForm');
    const totalLifeInsurance = document.getElementById('totalLifeInsurance');
    const totalHealthInsurance = document.getElementById('totalHealthInsurance');
    const insuranceMessage = document.getElementById('insuranceMessage');

    // Load income data for coverage analysis
    const incomeData = JSON.parse(localStorage.getItem('incomeData') || '{}');
    const monthlyIncome = incomeData.monthly ? incomeData.monthly.total : 0;
    const annualIncome = monthlyIncome * 12;

    insuranceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get life insurance values
        const termInsurance = parseFloat(document.getElementById('termInsurance').value) || 0;
        const endowmentPlans = parseFloat(document.getElementById('endowmentPlans').value) || 0;
        const ulipCoverage = parseFloat(document.getElementById('ulipCoverage').value) || 0;

        // Get health insurance values
        const healthInsurance = parseFloat(document.getElementById('healthInsurance').value) || 0;
        const criticalIllness = parseFloat(document.getElementById('criticalIllness').value) || 0;
        const accidentalCoverage = parseFloat(document.getElementById('accidentalCoverage').value) || 0;

        // Get other insurance values
        const motorInsurance = parseFloat(document.getElementById('motorInsurance').value) || 0;
        const homeInsurance = parseFloat(document.getElementById('homeInsurance').value) || 0;

        // Calculate totals
        const totalLifeCoverage = termInsurance + endowmentPlans + ulipCoverage;
        const totalHealthCoverage = healthInsurance + criticalIllness + accidentalCoverage;

        // Format the results with Indian currency format
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });

        // Display the results
        totalLifeInsurance.textContent = formatter.format(totalLifeCoverage);
        totalHealthInsurance.textContent = formatter.format(totalHealthCoverage);

        // Analyze coverage and provide recommendations
        const coverageAnalysis = analyzeInsuranceCoverage(
            totalLifeCoverage,
            totalHealthCoverage,
            annualIncome
        );

        insuranceMessage.textContent = coverageAnalysis.message;
        insuranceMessage.className = 'score-message ' + coverageAnalysis.class;

        // Save to localStorage
        const insuranceData = {
            life: {
                term: termInsurance,
                endowment: endowmentPlans,
                ulip: ulipCoverage,
                total: totalLifeCoverage
            },
            health: {
                basic: healthInsurance,
                critical: criticalIllness,
                accidental: accidentalCoverage,
                total: totalHealthCoverage
            },
            other: {
                motor: motorInsurance,
                home: homeInsurance
            },
            analysis: coverageAnalysis,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('insuranceData', JSON.stringify(insuranceData));
    });

    // Load previous data if available
    const savedData = localStorage.getItem('insuranceData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Load life insurance values
        document.getElementById('termInsurance').value = data.life.term;
        document.getElementById('endowmentPlans').value = data.life.endowment;
        document.getElementById('ulipCoverage').value = data.life.ulip;

        // Load health insurance values
        document.getElementById('healthInsurance').value = data.health.basic;
        document.getElementById('criticalIllness').value = data.health.critical;
        document.getElementById('accidentalCoverage').value = data.health.accidental;

        // Load other insurance values
        document.getElementById('motorInsurance').value = data.other.motor;
        document.getElementById('homeInsurance').value = data.other.home;

        // Display saved totals
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });

        totalLifeInsurance.textContent = formatter.format(data.life.total);
        totalHealthInsurance.textContent = formatter.format(data.health.total);

        // Display saved analysis
        if (data.analysis) {
            insuranceMessage.textContent = data.analysis.message;
            insuranceMessage.className = 'score-message ' + data.analysis.class;
        }
    }
});

function analyzeInsuranceCoverage(lifeCoverage, healthCoverage, annualIncome) {
    let message = '';
    let className = '';

    // Recommended life coverage is 10-15 times annual income
    const recommendedLifeCoverage = annualIncome * 12;
    const lifeRatio = lifeCoverage / recommendedLifeCoverage;

    // Recommended health coverage is 50% of annual income or minimum 5 lakhs
    const recommendedHealthCoverage = Math.max(annualIncome * 0.5, 500000);
    const healthRatio = healthCoverage / recommendedHealthCoverage;

    if (lifeRatio >= 1 && healthRatio >= 1) {
        message = "Excellent! Your insurance coverage is well-aligned with your needs.";
        className = "excellent";
    } else if (lifeRatio >= 0.7 && healthRatio >= 0.7) {
        message = "Good coverage, but consider increasing for better protection.";
        className = "good";
    } else if (lifeRatio >= 0.4 && healthRatio >= 0.4) {
        message = "Moderate coverage. Recommended to increase both life and health insurance.";
        className = "fair";
    } else {
        message = "Insurance coverage is low. Strongly recommended to increase coverage for better financial security.";
        className = "poor";
    }

    return {
        message,
        class: className,
        lifeRatio,
        healthRatio
    };
} 
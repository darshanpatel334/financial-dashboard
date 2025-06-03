document.addEventListener('DOMContentLoaded', function() {
    const riskProfileForm = document.getElementById('riskProfileForm');
    const riskProfileResult = document.getElementById('riskProfileResult');
    const riskProfileMessage = document.getElementById('riskProfileMessage');
    const recommendedAllocation = document.getElementById('recommendedAllocation');

    riskProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const experience = parseInt(document.getElementById('investmentExperience').value);
        const knowledge = parseInt(document.getElementById('marketKnowledge').value);
        const volatility = parseInt(document.getElementById('marketVolatility').value);
        const goal = parseInt(document.getElementById('investmentGoal').value);
        const horizon = parseInt(document.getElementById('investmentHorizon').value);

        // Calculate risk score (out of 100)
        const totalScore = calculateRiskScore(experience, knowledge, volatility, goal, horizon);
        const riskProfile = determineRiskProfile(totalScore);
        const allocation = getRecommendedAllocation(totalScore);

        // Display results
        riskProfileResult.textContent = riskProfile.name;
        riskProfileMessage.textContent = riskProfile.description;
        riskProfileMessage.className = 'score-message ' + riskProfile.class;

        // Display allocation recommendation
        recommendedAllocation.innerHTML = `
            <h4>Recommended Asset Allocation:</h4>
            <ul>
                <li>Equity: ${allocation.equity}%</li>
                <li>Debt: ${allocation.debt}%</li>
                <li>Gold: ${allocation.gold}%</li>
                <li>Cash: ${allocation.cash}%</li>
            </ul>
        `;

        // Save to localStorage
        const riskProfileData = {
            scores: {
                experience,
                knowledge,
                volatility,
                goal,
                horizon,
                total: totalScore
            },
            profile: riskProfile,
            allocation,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('riskProfileData', JSON.stringify(riskProfileData));
    });

    // Load previous data if available
    const savedData = localStorage.getItem('riskProfileData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Set form values
        document.getElementById('investmentExperience').value = data.scores.experience;
        document.getElementById('marketKnowledge').value = data.scores.knowledge;
        document.getElementById('marketVolatility').value = data.scores.volatility;
        document.getElementById('investmentGoal').value = data.scores.goal;
        document.getElementById('investmentHorizon').value = data.scores.horizon;

        // Display results
        riskProfileResult.textContent = data.profile.name;
        riskProfileMessage.textContent = data.profile.description;
        riskProfileMessage.className = 'score-message ' + data.profile.class;

        // Display allocation
        recommendedAllocation.innerHTML = `
            <h4>Recommended Asset Allocation:</h4>
            <ul>
                <li>Equity: ${data.allocation.equity}%</li>
                <li>Debt: ${data.allocation.debt}%</li>
                <li>Gold: ${data.allocation.gold}%</li>
                <li>Cash: ${data.allocation.cash}%</li>
            </ul>
        `;
    }
});

function calculateRiskScore(experience, knowledge, volatility, goal, horizon) {
    // Weighted calculation of risk score
    const weights = {
        experience: 0.15,
        knowledge: 0.20,
        volatility: 0.25,
        goal: 0.25,
        horizon: 0.15
    };

    const score = (
        (experience * weights.experience) +
        (knowledge * weights.knowledge) +
        (volatility * weights.volatility) +
        (goal * weights.goal) +
        (horizon * weights.horizon)
    ) * 20; // Convert to 100-point scale

    return Math.round(score);
}

function determineRiskProfile(score) {
    if (score >= 80) {
        return {
            name: "Aggressive",
            description: "You have a high risk tolerance and can handle significant market volatility for potentially higher returns.",
            class: "excellent"
        };
    } else if (score >= 60) {
        return {
            name: "Moderately Aggressive",
            description: "You're comfortable with market volatility and willing to take calculated risks for better returns.",
            class: "great"
        };
    } else if (score >= 40) {
        return {
            name: "Moderate",
            description: "You seek a balance between growth and stability, accepting moderate market fluctuations.",
            class: "good"
        };
    } else if (score >= 20) {
        return {
            name: "Conservative",
            description: "You prefer stability and are willing to accept lower returns for reduced risk.",
            class: "fair"
        };
    } else {
        return {
            name: "Very Conservative",
            description: "Capital preservation is your priority, and you're most comfortable with minimal risk.",
            class: "poor"
        };
    }
}

function getRecommendedAllocation(score) {
    if (score >= 80) {
        return {
            equity: 75,
            debt: 15,
            gold: 5,
            cash: 5
        };
    } else if (score >= 60) {
        return {
            equity: 60,
            debt: 25,
            gold: 10,
            cash: 5
        };
    } else if (score >= 40) {
        return {
            equity: 45,
            debt: 35,
            gold: 15,
            cash: 5
        };
    } else if (score >= 20) {
        return {
            equity: 30,
            debt: 45,
            gold: 15,
            cash: 10
        };
    } else {
        return {
            equity: 15,
            debt: 55,
            gold: 20,
            cash: 10
        };
    }
} 
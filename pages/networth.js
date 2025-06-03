document.addEventListener('DOMContentLoaded', function() {
    const netWorthForm = document.getElementById('netWorthForm');
    const netWorthResult = document.getElementById('netWorthResult');

    netWorthForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get all asset values
        const cashAndSavings = parseFloat(document.getElementById('cashAndSavings').value) || 0;
        const investments = parseFloat(document.getElementById('investments').value) || 0;
        const realEstate = parseFloat(document.getElementById('realEstate').value) || 0;

        // Get all liability values
        const loans = parseFloat(document.getElementById('loans').value) || 0;
        const creditCardDebt = parseFloat(document.getElementById('creditCardDebt').value) || 0;

        // Calculate total assets and liabilities
        const totalAssets = cashAndSavings + investments + realEstate;
        const totalLiabilities = loans + creditCardDebt;

        // Calculate net worth
        const netWorth = totalAssets - totalLiabilities;

        // Format the result with Indian currency format
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });

        // Display the result
        netWorthResult.textContent = formatter.format(netWorth);

        // Save to localStorage for future reference
        const netWorthData = {
            assets: {
                cashAndSavings,
                investments,
                realEstate,
                total: totalAssets
            },
            liabilities: {
                loans,
                creditCardDebt,
                total: totalLiabilities
            },
            netWorth,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('netWorthData', JSON.stringify(netWorthData));
    });

    // Load previous data if available
    const savedData = localStorage.getItem('netWorthData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('cashAndSavings').value = data.assets.cashAndSavings;
        document.getElementById('investments').value = data.assets.investments;
        document.getElementById('realEstate').value = data.assets.realEstate;
        document.getElementById('loans').value = data.liabilities.loans;
        document.getElementById('creditCardDebt').value = data.liabilities.creditCardDebt;
        netWorthResult.textContent = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(data.netWorth);
    }
}); 
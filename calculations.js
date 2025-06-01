// Utility function to parse number input
function parseInputValue(id) {
    const element = document.getElementById(id);
    return element ? parseFloat(element.value) || 0 : 0;
}

// Update display of a total
function updateTotal(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = formatCurrency(value);
    }
}

// Calculate and update category totals
function updateCategoryTotals() {
    // Real Estate
    const buildings = parseInputValue('buildings');
    const plots = parseInputValue('plots');
    const land = parseInputValue('land');
    const buildingsYield = parseInputValue('buildingsYield');
    const plotsYield = parseInputValue('plotsYield');
    const landYield = parseInputValue('landYield');

    const realEstateTotal = buildings + plots + land;
    updateTotal('totalRealEstate', realEstateTotal);

    // Calculate annual rental income
    const annualRentalIncome = 
        (buildings * buildingsYield / 100) +
        (plots * plotsYield / 100) +
        (land * landYield / 100);
    
    // Display monthly rental income
    const monthlyRentalIncome = annualRentalIncome / 12;
    updateTotal('monthlyRentalIncome', monthlyRentalIncome);

    // Investments
    const investmentsTotal = 
        parseInputValue('directEquity') +
        parseInputValue('equityMF') +
        parseInputValue('debtMF');
    updateTotal('totalInvestments', investmentsTotal);

    // Fixed Income
    const fixedIncomeTotal = 
        parseInputValue('fixedDeposits') +
        parseInputValue('otherFixedIncome');
    updateTotal('totalFixedIncome', fixedIncomeTotal);

    // Commodities (including gold)
    const commodityTotal = 
        parseInputValue('gold') +
        parseInputValue('commodity');
    updateTotal('totalCommodity', commodityTotal);

    // Cash
    const cashTotal = parseInputValue('cash');
    updateTotal('totalCash', cashTotal);

    // Custom Assets
    const customAssetsList = document.getElementById('customAssetsList');
    let customAssetsTotal = 0;
    if (customAssetsList) {
        const customInputs = customAssetsList.querySelectorAll('input[type="number"]');
        customInputs.forEach(input => {
            if (!input.id.includes('Yield')) {
                customAssetsTotal += parseFloat(input.value) || 0;
            }
        });
    }
    updateTotal('totalOtherAssets', customAssetsTotal);

    // Total Assets
    const totalAssets = 
        realEstateTotal +
        investmentsTotal +
        fixedIncomeTotal +
        commodityTotal +
        cashTotal +
        customAssetsTotal;
    updateTotal('totalAssets', totalAssets);

    // Calculate Liabilities
    const liabilitiesTotal = 
        parseInputValue('homeLoan') +
        parseInputValue('carLoan') +
        parseInputValue('creditCard') +
        parseInputValue('educationLoan');

    // Custom Liabilities
    const customLiabilitiesList = document.getElementById('customLiabilitiesList');
    let customLiabilitiesTotal = 0;
    if (customLiabilitiesList) {
        const customInputs = customLiabilitiesList.querySelectorAll('input[type="number"]');
        customInputs.forEach(input => {
            customLiabilitiesTotal += parseFloat(input.value) || 0;
        });
    }

    // Update Total Liabilities
    const totalLiabilities = liabilitiesTotal + customLiabilitiesTotal;
    updateTotal('totalLiabilities', totalLiabilities);

    // Update Net Worth
    const netWorth = totalAssets - totalLiabilities;
    updateTotal('netWorth', netWorth);

    // Save the totals to localStorage
    const totals = {
        realEstate: {
            total: realEstateTotal,
            monthlyRentalIncome: monthlyRentalIncome,
            annualRentalIncome: annualRentalIncome
        },
        investments: investmentsTotal,
        fixedIncome: fixedIncomeTotal,
        gold: parseInputValue('gold'),
        commodity: commodityTotal,
        cash: cashTotal,
        customAssets: customAssetsTotal,
        totalAssets: totalAssets,
        totalLiabilities: totalLiabilities,
        netWorth: netWorth
    };
    saveToLocalStorage('networthTotals', totals);

    // Update income data
    const incomeData = {
        annual: {
            rental: annualRentalIncome,
            // ... other annual incomes ...
        },
        monthly: {
            rental: monthlyRentalIncome,
            // ... other monthly incomes ...
        }
    };
    saveToLocalStorage('incomeData', incomeData);

    // If we're on the income page, update the rental income field
    const rentalInput = document.getElementById('rental');
    if (rentalInput) {
        rentalInput.value = Math.round(monthlyRentalIncome);
        // Trigger income recalculation if we're on the income page
        if (typeof calculateTotalIncome === 'function') {
            calculateTotalIncome();
        }
    }
}

// Calculate and update income totals
function updateIncomeTotals() {
    // Rental Income (Real Estate)
    const buildingsIncome = parseInputValue('buildings') * (parseInputValue('buildingsYield') / 100);
    const plotsIncome = parseInputValue('plots') * (parseInputValue('plotsYield') / 100);
    const landIncome = parseInputValue('land') * (parseInputValue('landYield') / 100);
    const totalRentalIncome = buildingsIncome + plotsIncome + landIncome;
    
    // Dividend Income (Equity)
    const directEquityIncome = parseInputValue('directEquity') * (parseInputValue('directEquityYield') / 100);
    const equityMFIncome = parseInputValue('equityMF') * (parseInputValue('equityMFYield') / 100);
    const totalDividendIncome = directEquityIncome + equityMFIncome;
    
    // Interest Income (Fixed Income)
    const debtMFIncome = parseInputValue('debtMF') * (parseInputValue('debtMFYield') / 100);
    const fixedDepositsIncome = parseInputValue('fixedDeposits') * (parseInputValue('fixedDepositsYield') / 100);
    const otherFixedIncome = parseInputValue('otherFixedIncome') * (parseInputValue('otherFixedIncomeYield') / 100);
    const totalInterestIncome = debtMFIncome + fixedDepositsIncome + otherFixedIncome;
    
    const totalAnnualIncome = totalRentalIncome + totalDividendIncome + totalInterestIncome;
    const monthlyIncome = totalAnnualIncome / 12;

    // Save income data with category breakdowns
    const incomeData = {
        annual: totalAnnualIncome,
        monthly: monthlyIncome,
        breakdown: {
            rental: {
                total: totalRentalIncome,
                buildings: buildingsIncome,
                plots: plotsIncome,
                land: landIncome
            },
            dividend: {
                total: totalDividendIncome,
                directEquity: directEquityIncome,
                equityMF: equityMFIncome
            },
            interest: {
                total: totalInterestIncome,
                debtMF: debtMFIncome,
                fixedDeposits: fixedDepositsIncome,
                otherFixed: otherFixedIncome
            }
        }
    };
    saveToLocalStorage('incomeData', incomeData);

    // If we're on the income page, update the income fields
    const rentalInput = document.getElementById('rental');
    const dividendInput = document.getElementById('dividend');
    const interestInput = document.getElementById('interest');

    if (rentalInput) rentalInput.value = Math.round(totalRentalIncome / 12);
    if (dividendInput) dividendInput.value = Math.round(totalDividendIncome / 12);
    if (interestInput) interestInput.value = Math.round(totalInterestIncome / 12);

    // Trigger income page calculations if we're on that page
    if (typeof calculateTotalIncome === 'function') {
        calculateTotalIncome();
    }
}

// Setup event listeners for automatic calculations
function setupCalculations() {
    const form = document.getElementById('networthForm');
    if (form) {
        // Listen for any input changes
        form.addEventListener('input', function(e) {
            if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
                updateCategoryTotals();
                updateIncomeTotals();
            }
        });

        // Initial calculation
        updateCategoryTotals();
        updateIncomeTotals();
    }
}

// Initialize calculations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupCalculations();
}); 
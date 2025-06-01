document.addEventListener('DOMContentLoaded', function() {
    // Load saved values from localStorage
    loadSavedValues();
    
    // Get input elements
    const netWorthInput = document.getElementById('netWorth');
    const monthlyExpenseInput = document.getElementById('monthlyExpense');
    const returnRateInput = document.getElementById('returnRate');
    const inflationRateInput = document.getElementById('inflationRate');
    
    // Get display elements
    const scoreElement = document.getElementById('score');
    const progressBar = document.getElementById('progressBar');
    const yearsLabel = document.getElementById('yearsLabel');
    const initialNetWorthElement = document.getElementById('initialNetWorth');
    const annualExpenseElement = document.getElementById('annualExpense');
    const returnRateValue = document.getElementById('returnRateValue');
    const inflationRateValue = document.getElementById('inflationRateValue');
    
    // Add input event listeners
    [netWorthInput, monthlyExpenseInput, returnRateInput, inflationRateInput].forEach(input => {
        input.addEventListener('input', calculateScore);
    });
    
    // Initial calculation
    calculateScore();
    
    function calculateScore() {
        // Get values
        const netWorth = parseFloat(netWorthInput.value) || 0;
        const monthlyExpense = parseFloat(monthlyExpenseInput.value) || 0;
        const returnRate = parseFloat(returnRateInput.value) || 0;
        const inflationRate = parseFloat(inflationRateInput.value) || 0;
        
        // Calculate years of freedom
        const annualExpense = monthlyExpense * 12;
        const realReturnRate = (1 + returnRate/100) / (1 + inflationRate/100) - 1;
        let years = 0;
        
        if (realReturnRate > 0 && netWorth > 0 && annualExpense > 0) {
            years = Math.log(1 - (netWorth * realReturnRate / annualExpense)) / Math.log(1 + realReturnRate);
            years = Math.max(0, -years);
        }
        
        // Update display
        scoreElement.textContent = years.toFixed(1);
        yearsLabel.textContent = `${years === 1 ? 'year' : 'years'} without active income`;
        
        // Update progress bar (assuming 65 years as maximum)
        const progressPercentage = Math.min((years / 65) * 100, 100);
        progressBar.style.width = `${progressPercentage}%`;
        
        // Update summary
        initialNetWorthElement.textContent = `₹${formatNumber(netWorth)}`;
        annualExpenseElement.textContent = `₹${formatNumber(annualExpense)}`;
        returnRateValue.textContent = `${returnRate}%`;
        inflationRateValue.textContent = `${inflationRate}%`;
        
        // Update number in words
        updateNumberInWords('netWorth', netWorth);
        updateNumberInWords('monthlyExpense', monthlyExpense);
        updateNumberInWords('returnRate', returnRate);
        updateNumberInWords('inflationRate', inflationRate);

        // Highlight the appropriate range in the FF matrix
        const ffMatrixRows = document.querySelectorAll('#ffMatrixBody tr');
        ffMatrixRows.forEach(row => {
            row.classList.remove('highlighted');
            const minYears = parseFloat(row.dataset.min);
            const maxYears = row.dataset.max ? parseFloat(row.dataset.max) : Infinity;
            
            if (years >= minYears && years <= maxYears) {
                row.classList.add('highlighted');
            }
        });
    }
});

function updateAllNumbersInWords() {
    ['currentAge', 'netWorth', 'monthlyExpense', 'returnRate', 'inflationRate'].forEach(id => {
        updateNumberInWords(id);
    });
}

function updateNumberInWords(inputId) {
    const input = document.getElementById(inputId);
    const wordsSpan = document.getElementById(inputId + 'Words');
    const value = parseFloat(input.value) || 0;
    
    if (inputId === 'returnRate' || inputId === 'inflationRate') {
        wordsSpan.textContent = `${numberToWords(value)} percent`;
    } else if (inputId === 'currentAge') {
        wordsSpan.textContent = `${numberToWords(value)} years old`;
    } else {
        wordsSpan.textContent = `₹${numberToWords(value)}`;
    }
}

function numberToWords(num) {
    if (num === 0) return 'Zero';
    
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
    const teens = ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));
    if (num < 11) return units[num];
    if (num < 20) return teens[num - 11];
    if (num < 100) {
        const ten = Math.floor(num / 10);
        const one = num % 10;
        return tens[ten] + (one ? ' ' + units[one] : '');
    }
    if (num < 1000) return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
}

function loadSavedValues() {
    // Load net worth from networthValues
    const networthValues = getFromLocalStorage('networthValues') || {};
    const expenseValues = getFromLocalStorage('expenseValues') || {};
    
    // Calculate total net worth
    let totalNetWorth = 0;
    if (networthValues) {
        // Calculate total assets
        const assets = Object.keys(networthValues)
            .filter(key => !key.includes('Yield') && !key.includes('custom') && key !== 'lastUpdated')
            .reduce((sum, key) => sum + (parseFloat(networthValues[key]) || 0), 0);
        
        // Add custom assets
        if (networthValues.customAssets) {
            totalNetWorth += networthValues.customAssets.reduce((sum, asset) => 
                sum + (parseFloat(asset.value) || 0), 0);
        }
        
        // Calculate total liabilities
        const liabilities = ['homeLoan', 'carLoan', 'creditCard', 'educationLoan']
            .reduce((sum, key) => sum + (parseFloat(networthValues[key]) || 0), 0);
        
        // Add custom liabilities
        if (networthValues.customLiabilities) {
            liabilities += networthValues.customLiabilities.reduce((sum, liability) => 
                sum + (parseFloat(liability.value) || 0), 0);
        }
        
        totalNetWorth = assets - liabilities;
    }
    
    // Calculate total monthly expenses
    let totalMonthlyExpenses = 0;
    if (expenseValues) {
        // Regular monthly expenses
        const monthlyExpenses = ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining', 'carEMI', 'homeEMI']
            .reduce((sum, key) => sum + (parseFloat(expenseValues[key]) || 0), 0);
        
        // Big expenses converted to monthly
        const bigExpenses = ['electronics', 'vacations']
            .reduce((sum, key) => sum + (parseFloat(expenseValues[key]) || 0), 0);
        
        // Custom expenses
        const customMonthly = (expenseValues.monthly || [])
            .reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
        
        const customBig = (expenseValues.big || [])
            .reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
        
        // Calculate total monthly (including big expenses spread over 12 months)
        totalMonthlyExpenses = monthlyExpenses + customMonthly + (bigExpenses + customBig) / 12;
    }
    
    // Set the calculated values
    document.getElementById('netWorth').value = totalNetWorth.toFixed(2);
    document.getElementById('monthlyExpense').value = totalMonthlyExpenses.toFixed(2);
    
    // Load other saved values
    const savedValues = getFromLocalStorage('freedomValues') || {};
    if (savedValues.userName) document.getElementById('userName').value = savedValues.userName;
    if (savedValues.currentAge) document.getElementById('currentAge').value = savedValues.currentAge;
    if (savedValues.returnRate) document.getElementById('returnRate').value = savedValues.returnRate;
    if (savedValues.inflationRate) document.getElementById('inflationRate').value = savedValues.inflationRate;
    
    // Trigger initial calculation
    calculateScore();
}

function calculateFinancialFreedom() {
    // Save values to localStorage
    const freedomValues = {
        userName: document.getElementById('userName').value,
        currentAge: document.getElementById('currentAge').value,
        netWorth: document.getElementById('netWorth').value,
        monthlyExpense: document.getElementById('monthlyExpense').value,
        returnRate: document.getElementById('returnRate').value,
        inflationRate: document.getElementById('inflationRate').value
    };
    saveToLocalStorage('freedomValues', freedomValues);
    
    // Get user name
    const userName = document.getElementById('userName').value || "Friend";
    document.getElementById('personalizedResult').innerHTML = `${userName}, your financial freedom score is:`;
    
    // Get input values
    const currentAge = parseInt(document.getElementById('currentAge').value) || 0;
    const netWorth = parseFloat(document.getElementById('netWorth').value) || 0;
    const monthlyExpense = parseFloat(document.getElementById('monthlyExpense').value) || 0;
    const returnRatePercent = parseFloat(document.getElementById('returnRate').value) || 0;
    const inflationRatePercent = parseFloat(document.getElementById('inflationRate').value) || 0;
    
    // Calculate annual expense
    const annualExpense = monthlyExpense * 12;
    
    // Update summary with current values
    document.getElementById('initialNetWorth').textContent = formatCurrency(netWorth);
    document.getElementById('annualExpense').textContent = formatCurrency(annualExpense);
    document.getElementById('returnRateValue').textContent = `${returnRatePercent}%`;
    document.getElementById('inflationRateValue').textContent = `${inflationRatePercent}%`;
    
    // Convert percentage rates to decimal
    const returnRate = returnRatePercent / 100.0;
    const inflationRate = inflationRatePercent / 100.0;
    
    // Simulate year-by-year until net worth is depleted
    let yearCount = 0;
    let currentNetWorth = netWorth;
    const maxYears = 150; // Allow for up to 150 years
    
    while (currentNetWorth > 0 && yearCount < maxYears) {
        // Calculate inflated expenses for the current year
        const inflationFactor = Math.pow(1 + inflationRate, yearCount);
        const currentAnnualExpense = annualExpense * inflationFactor;
        
        // Check if net worth can cover this year's expenses
        if (currentNetWorth < currentAnnualExpense) break;
        
        // Deduct expenses at the start of the year
        currentNetWorth -= currentAnnualExpense;
        
        // Grow the remaining net worth at the end of the year
        currentNetWorth *= (1 + returnRate);
        
        // Move to next year
        yearCount++;
    }
    
    // Update the UI with results
    document.getElementById('score').textContent = yearCount;
    document.getElementById('yearsLabel').textContent = `${yearCount} years without active income`;
    
    // Update progress bar
    const remainingLife = 100 - currentAge;
    const progressPercentage = Math.min((yearCount / remainingLife) * 100, 100);
    document.getElementById('progressBar').style.width = `${progressPercentage}%`;
}
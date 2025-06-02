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
    
    // Add storage event listeners for cross-page updates
    window.addEventListener('storage', function(e) {
        console.log('Storage event triggered:', e.key);
        if (e.key === 'networthValues' || e.key === 'expenseValues') {
            loadSavedValues();
            calculateScore();
        }
    });
    
    // Add custom event listener for localStorage changes within the same page
    window.addEventListener('localStorageUpdated', function(e) {
        console.log('LocalStorage updated event received');
        loadSavedValues();
        calculateScore();
    });
    
    // Add input event listeners
    [netWorthInput, monthlyExpenseInput, returnRateInput, inflationRateInput].forEach(input => {
        if (input) {
        input.addEventListener('input', () => {
            updateNumberInWords(input.id);
                calculateScore();
            });
        }
    });
    
    // Initial calculation
    calculateScore();
    
    function calculateScore() {
        // Get values
        const netWorth = parseFloat(document.getElementById('netWorth').value) || 0;
        const monthlyExpense = parseFloat(document.getElementById('monthlyExpense').value) || 0;
        const returnRate = parseFloat(document.getElementById('returnRate').value) || 0;
        const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 0;
        
        // Calculate annual expense
        const annualExpense = monthlyExpense * 12;
        
        // Initialize variables for calculation
        let currentNetWorth = netWorth;
        let years = 0;
        
        // Calculate year by year until net worth becomes negative
        while (currentNetWorth > 0) {
            // Calculate inflated expenses for this year
            const inflatedExpense = annualExpense * Math.pow(1 + inflationRate/100, years);
            
            // Set aside expenses at start of year
            if (currentNetWorth < inflatedExpense) {
                // If we can't cover this year's expenses, break
                break;
            }
            
            // Deduct expenses at start of year
            currentNetWorth -= inflatedExpense;
            
            // Grow remaining net worth at return rate
            currentNetWorth *= (1 + returnRate/100);
            
            years++;
            
            // Safety check to prevent infinite loop
            if (years > 150) break;
        }
        
        // Round to 1 decimal place
        years = Math.round(years * 10) / 10;
        
        // Update display
        const scoreElement = document.getElementById('score');
        const yearsLabel = document.getElementById('yearsLabel');
        const progressBar = document.getElementById('progressBar');
        const initialNetWorthElement = document.getElementById('initialNetWorth');
        const annualExpenseElement = document.getElementById('annualExpense');
        const returnRateValue = document.getElementById('returnRateValue');
        const inflationRateValue = document.getElementById('inflationRateValue');
        
        if (scoreElement) {
            scoreElement.textContent = years.toFixed(1);
            // Update words display
            const scoreWordsElement = document.getElementById('scoreWords');
            if (scoreWordsElement) {
                scoreWordsElement.textContent = `${numberToWords(years)} years`;
            }
        }
        
        if (yearsLabel) yearsLabel.textContent = `${years === 1 ? 'year' : 'years'} without active income`;
        
        // Update progress bar (max 100%)
        const progressPercentage = Math.min((years / 65) * 100, 100);
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;
        
        // Update summary values with both numbers and words
        if (initialNetWorthElement) {
            initialNetWorthElement.textContent = formatCurrency(netWorth);
            const netWorthWordsElement = document.getElementById('initialNetWorthWords');
            if (netWorthWordsElement) {
                netWorthWordsElement.textContent = `₹${numberToWords(netWorth)}`;
            }
        }
        
        if (annualExpenseElement) {
            annualExpenseElement.textContent = formatCurrency(annualExpense);
            const annualExpenseWordsElement = document.getElementById('annualExpenseWords');
            if (annualExpenseWordsElement) {
                annualExpenseWordsElement.textContent = `₹${numberToWords(annualExpense)}`;
            }
        }
        
        if (returnRateValue) {
            returnRateValue.textContent = `${returnRate}%`;
            const returnRateWordsElement = document.getElementById('returnRateWords');
            if (returnRateWordsElement) {
                returnRateWordsElement.textContent = `${numberToWords(returnRate)} percent`;
            }
        }
        
        if (inflationRateValue) {
            inflationRateValue.textContent = `${inflationRate}%`;
            const inflationRateWordsElement = document.getElementById('inflationRateWords');
            if (inflationRateWordsElement) {
                inflationRateWordsElement.textContent = `${numberToWords(inflationRate)} percent`;
            }
        }
        
        // Save the current values
        const freedomValues = {
            userName: document.getElementById('userName').value,
            currentAge: document.getElementById('currentAge').value,
            netWorth: netWorth,
            monthlyExpense: monthlyExpense,
            returnRate: returnRate,
            inflationRate: inflationRate,
            ffScore: years,
            lastUpdated: new Date().toISOString()
        };
        saveToLocalStorage('freedomValues', freedomValues);
        
        // Dispatch events to notify other pages
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('localStorageUpdated'));
        
        // Log the values for debugging
        console.log('FF Score Calculation:', {
            netWorth,
            monthlyExpense,
            annualExpense,
            returnRate,
            inflationRate,
            years
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
    console.log('Loading saved values for FF Score calculation');
    
    // Load net worth from networthValues
    const networthValues = getFromLocalStorage('networthValues') || {};
    const expenseValues = getFromLocalStorage('expenseValues') || {};
    
    console.log('Loaded values:', { networthValues, expenseValues });
    
    // Calculate total net worth
    let totalNetWorth = 0;
    if (networthValues) {
        // Calculate total assets
        const assets = Object.keys(networthValues)
            .filter(key => !key.includes('Yield') && !key.includes('custom') && 
                !['lastUpdated', 'totalAssets', 'totalLiabilities', 'netWorth'].includes(key))
            .reduce((sum, key) => {
                const value = parseFloat(networthValues[key]) || 0;
                // Only add positive values (assets)
                return sum + (value > 0 ? value : 0);
            }, 0);
        
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
            totalNetWorth -= networthValues.customLiabilities.reduce((sum, liability) => 
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
        const bigExpenses = ['electronics', 'vacations', 'medical', 'education', 'vehicle']
            .reduce((sum, key) => sum + (parseFloat(expenseValues[key]) || 0), 0);
        
        // Custom expenses
        const customMonthly = (expenseValues.monthly || [])
            .reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
        
        const customBig = (expenseValues.big || [])
            .reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
        
        // Calculate total monthly (including big expenses spread over 12 months)
        totalMonthlyExpenses = monthlyExpenses + customMonthly + (bigExpenses + customBig) / 12;
    }
    
    console.log('Calculated values:', {
        totalNetWorth,
        totalMonthlyExpenses
    });
    
    // Set the calculated values
    const netWorthInput = document.getElementById('netWorth');
    const monthlyExpenseInput = document.getElementById('monthlyExpense');
    
    if (netWorthInput) {
        netWorthInput.value = totalNetWorth.toFixed(2);
        updateNumberInWords('netWorth');
    }
    if (monthlyExpenseInput) {
        monthlyExpenseInput.value = totalMonthlyExpenses.toFixed(2);
        updateNumberInWords('monthlyExpense');
    }
    
    // Load other saved values
    const savedValues = getFromLocalStorage('freedomValues') || {};
    const userName = document.getElementById('userName');
    const currentAge = document.getElementById('currentAge');
    const returnRate = document.getElementById('returnRate');
    const inflationRate = document.getElementById('inflationRate');
    
    if (userName && savedValues.userName) userName.value = savedValues.userName;
    if (currentAge && savedValues.currentAge) currentAge.value = savedValues.currentAge;
    if (returnRate && savedValues.returnRate) returnRate.value = savedValues.returnRate;
    if (inflationRate && savedValues.inflationRate) inflationRate.value = savedValues.inflationRate;
    
    // Update words display for all values
    ['userName', 'currentAge', 'returnRate', 'inflationRate'].forEach(id => {
        updateNumberInWords(id);
    });
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
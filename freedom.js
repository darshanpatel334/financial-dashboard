document.addEventListener('DOMContentLoaded', function() {
    console.log('FF Score calculation initialization started');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial load
    loadFFData();
    
    // Listen for updates from other pages
    window.addEventListener('storage', loadFFData);
    window.addEventListener('localStorageUpdated', loadFFData);
});

function setupEventListeners() {
    // Add input event listeners for return and inflation rates
    ['expectedReturn', 'expectedInflation'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                if (parseFloat(input.value) < 0) {
                    input.value = '0';
                }
                updateCurrentNumbers(); // Update current numbers
                calculateFFScore();
            });
        }
    });
}

function loadFFData() {
    // Load saved rates
    const savedRates = getFromLocalStorage('ffRates') || {};
    if (savedRates.return) {
        document.getElementById('expectedReturn').value = savedRates.return;
    }
    if (savedRates.inflation) {
        document.getElementById('expectedInflation').value = savedRates.inflation;
    }
    
    // Update current numbers and calculate score
    updateCurrentNumbers();
    calculateFFScore();
}

function updateCurrentNumbers() {
    // Get current net worth
    const netWorthData = getFromLocalStorage('netWorthValues') || {};
    let totalAssets = calculateTotalAssets(netWorthData);
    let totalLiabilities = calculateTotalLiabilities(netWorthData);
    let currentNetWorth = totalAssets - totalLiabilities;
    
    // Get current annual expenses
    const expenseData = getFromLocalStorage('expenseValues') || {};
    let annualExpenses = calculateAnnualExpenses(expenseData);
    
    // Update the display
    updateDisplay('currentNetWorth', currentNetWorth);
    updateDisplay('annualExpenses', annualExpenses);
    
    // Add words display for better readability
    updateWordsDisplay('currentNetWorthWords', currentNetWorth);
    updateWordsDisplay('annualExpensesWords', annualExpenses);
    
    return { currentNetWorth, annualExpenses };
}

function calculateFFScore() {
    // Get current numbers
    const { currentNetWorth, annualExpenses } = updateCurrentNumbers();
    
    // Get rates
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) / 100 || 0;
    const expectedInflation = parseFloat(document.getElementById('expectedInflation').value) / 100 || 0;
    
    // Save rates
    saveToLocalStorage('ffRates', {
        return: document.getElementById('expectedReturn').value,
        inflation: document.getElementById('expectedInflation').value
    });
    
    // Calculate FF Score
    const ffScore = calculateYearsToDepletion(
        currentNetWorth,
        annualExpenses,
        expectedReturn,
        expectedInflation
    );
    
    // Update display
    updateFFDisplay(ffScore, currentNetWorth, annualExpenses);
}

function calculateYearsToDepletion(initialNetWorth, initialAnnualExpenses, returnRate, inflationRate) {
    let years = 0;
    let currentNetWorth = initialNetWorth;
    let currentAnnualExpense = initialAnnualExpenses;
    
    console.log('Starting FF Score calculation:');
    console.log(`Initial Net Worth: ₹${formatCurrency(currentNetWorth)}`);
    console.log(`Initial Annual Expense: ₹${formatCurrency(currentAnnualExpense)}`);
    console.log(`Return Rate: ${(returnRate * 100).toFixed(1)}%`);
    console.log(`Inflation Rate: ${(inflationRate * 100).toFixed(1)}%`);
    
    while (currentNetWorth > 0 && years < 100) { // Cap at 100 years
        console.log(`\nYear ${years}:`);
        
        // 1. Set aside this year's expenses at the start
        currentNetWorth -= currentAnnualExpense;
        console.log(`After setting aside expenses: ₹${formatCurrency(currentNetWorth)}`);
        
        // If net worth becomes negative after setting aside expenses, break
        if (currentNetWorth <= 0) {
            console.log('Net worth depleted after setting aside expenses');
            break;
        }
        
        // 2. Grow remaining corpus at return rate
        currentNetWorth *= (1 + returnRate);
        console.log(`After growth at ${(returnRate * 100).toFixed(1)}%: ₹${formatCurrency(currentNetWorth)}`);
        
        // 3. Increase next year's expenses by inflation
        currentAnnualExpense *= (1 + inflationRate);
        console.log(`Next year's expenses (with ${(inflationRate * 100).toFixed(1)}% inflation): ₹${formatCurrency(currentAnnualExpense)}`);
        
        years++;
    }
    
    console.log(`\nFinal FF Score: ${years} years`);
    return years;
}

function calculateTotalAssets(data) {
    let total = 0;
    
    // Real Estate
    ['primaryResidence', 'otherProperties'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Investments
    ['stocks', 'mutualFunds', 'bonds', 'ppf', 'epf', 'nps'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Cash & Equivalents
    ['bankBalance', 'cashInHand'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Other Assets
    ['gold', 'vehicle', 'otherAssets'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Custom assets
    if (data.customAssets) {
        data.customAssets.forEach(item => {
            total += parseFloat(item.value || 0);
        });
    }
    
    return total;
}

function calculateTotalLiabilities(data) {
    let total = 0;
    
    // Loans
    ['homeLoan', 'carLoan', 'personalLoan', 'educationLoan'].forEach(id => {
        total += parseFloat(data[id] || 0);
    });
    
    // Credit Card Debt
    total += parseFloat(data.creditCardDebt || 0);
    
    // Custom liabilities
    if (data.customLiabilities) {
        data.customLiabilities.forEach(item => {
            total += parseFloat(item.value || 0);
        });
    }
    
    return total;
}

function calculateAnnualExpenses(data) {
    // Calculate monthly recurring expenses
    let monthlyRecurring = 0;
    
    // Regular monthly expenses
    ['groceries', 'utilities', 'subscriptions', 'shopping', 'dining', 'carEMI', 'homeEMI'].forEach(id => {
        monthlyRecurring += parseFloat(data[id] || 0);
    });
    
    // Custom monthly expenses
    if (data.monthly) {
        data.monthly.forEach(item => {
            monthlyRecurring += parseFloat(item.value || 0);
        });
    }
    
    // Calculate annual big expenses
    let annualBigExpenses = 0;
    
    // Regular big expenses
    ['electronics', 'vacations', 'medical', 'education', 'vehicle'].forEach(id => {
        annualBigExpenses += parseFloat(data[id] || 0);
    });
    
    // Custom big expenses
    if (data.big) {
        data.big.forEach(item => {
            annualBigExpenses += parseFloat(item.value || 0);
        });
    }
    
    // Total annual expenses = (monthly recurring × 12) + annual big expenses
    return (monthlyRecurring * 12) + annualBigExpenses;
}

function updateFFDisplay(ffScore, netWorth, annualExpenses) {
    // Update FF Score
    updateDisplay('ffScore', ffScore);
    updateDisplay('ffScoreYears', ffScore);
    
    // Update supporting numbers
    updateDisplay('currentNetWorth', netWorth);
    updateDisplay('annualExpenses', annualExpenses);
    
    // Update FF Status and colors
    let ffStatus = '';
    let ffDescription = '';
    let colorRange = '';
    
    if (ffScore >= 100) {
        ffStatus = 'Ultimate Financial Freedom 🏝️';
        ffDescription = 'Congratulations! You have achieved complete financial independence';
        colorRange = 'ultimate';
    } else if (ffScore >= 70) {
        ffStatus = 'Achieved FF ✅';
        ffDescription = 'You have achieved financial freedom';
        colorRange = 'achieved';
    } else if (ffScore >= 50) {
        ffStatus = 'Very Close 🔓';
        ffDescription = 'You are very close to achieving financial freedom';
        colorRange = 'close';
    } else if (ffScore >= 25) {
        ffStatus = 'Getting There — Keep Going 🚶';
        ffDescription = 'You are making good progress towards financial freedom';
        colorRange = 'progress';
    } else if (ffScore >= 10) {
        ffStatus = 'Still Dependent — Work & Build ⚙️';
        ffDescription = 'Focus on increasing savings and investments';
        colorRange = 'dependent';
    } else {
        ffStatus = 'Financially Insecure — Focus Now 🔴';
        ffDescription = 'Prioritize building emergency fund and reducing debt';
        colorRange = 'insecure';
    }
    
    document.getElementById('ffStatus').textContent = ffStatus;
    document.getElementById('ffDescription').textContent = ffDescription;
    
    // Update colors
    const scoreCircle = document.querySelector('.score-circle');
    const progressBar = document.getElementById('ffProgressBar');
    
    // Remove all existing range classes
    const ranges = ['ultimate', 'achieved', 'close', 'progress', 'dependent', 'insecure'];
    ranges.forEach(range => {
        scoreCircle.removeAttribute('data-range');
        progressBar.removeAttribute('data-range');
    });
    
    // Add new range class
    scoreCircle.setAttribute('data-range', colorRange);
    progressBar.setAttribute('data-range', colorRange);
    
    // Update progress bar
    updateProgressBar(ffScore);
}

function updateProgressBar(score) {
    const progressBar = document.getElementById('ffProgressBar');
    const maxScore = 100; // Changed to 100 to match Ultimate FF threshold
    const percentage = Math.min((score / maxScore) * 100, 100);
    progressBar.style.width = percentage + '%';
}

function updateDisplay(elementId, value, isYears = false) {
    const element = document.getElementById(elementId);
    if (element) {
        if (isYears) {
            element.textContent = value.toFixed(1) + ' years';
        } else if (typeof value === 'number' && !isYears) {
            element.textContent = formatCurrency(value);
        } else {
            element.textContent = value;
        }
    }
}

function formatCurrency(amount) {
    return amount.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    });
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return null;
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
}
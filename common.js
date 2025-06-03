// ===== UTILITY FUNCTIONS =====

// Show status messages
function showStatus(message, type = 'success') {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
}

// Number to words conversion (Indian format)
function numberToWords(num) {
    if (num === 0) return "Zero";
    
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    function convertHundreds(n) {
        let result = "";
        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n >= 10) {
            result += teens[n - 10] + " ";
        } else if (n > 0) {
            result += ones[n] + " ";
        }
        return result;
    }
    
    if (num >= 10000000) { // Crores
        return convertHundreds(Math.floor(num / 10000000)) + "Crore " + numberToWords(num % 10000000);
    } else if (num >= 100000) { // Lakhs
        return convertHundreds(Math.floor(num / 100000)) + "Lakh " + numberToWords(num % 100000);
    } else if (num >= 1000) { // Thousands
        return convertHundreds(Math.floor(num / 1000)) + "Thousand " + numberToWords(num % 1000);
    } else {
        return convertHundreds(num);
    }
}

// Format currency (Indian format)
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format number with commas (Indian format)
function formatNumber(num) {
    return num.toLocaleString('en-IN');
}

// Parse currency string to number
function parseCurrency(str) {
    return parseFloat(str.replace(/[₹,]/g, '')) || 0;
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Calculate age from date of birth
function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Debounce function for auto-save
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local storage helpers
const Storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },
    
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
    
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// ===== AUTHENTICATION HELPERS =====

// Check if user is authenticated
function checkAuth() {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                resolve(user);
            } else {
                window.location.href = 'index.html';
            }
        });
    });
}

// Initialize user info display
function initUserInfo() {
    firebase.auth().onAuthStateChanged((user) => {
        const userEmailElement = document.getElementById('userEmail');
        if (user && userEmailElement) {
            userEmailElement.textContent = user.email;
        }
    });
}

// ===== FORM HELPERS =====

// Create form group HTML
function createFormGroup(label, inputType, name, placeholder = '', required = false, value = '') {
    return `
        <div class="form-group">
            <label for="${name}">${label}${required ? ' *' : ''}</label>
            <input type="${inputType}" 
                   id="${name}" 
                   name="${name}" 
                   placeholder="${placeholder}" 
                   value="${value}"
                   ${required ? 'required' : ''}>
            <div class="amount-display"></div>
        </div>
    `;
}

// Create select form group HTML
function createSelectGroup(label, name, options, required = false, selectedValue = '') {
    let optionsHtml = '<option value="">Select ' + label + '</option>';
    options.forEach(option => {
        const selected = option.value === selectedValue ? 'selected' : '';
        optionsHtml += `<option value="${option.value}" ${selected}>${option.text}</option>`;
    });
    
    return `
        <div class="form-group">
            <label for="${name}">${label}${required ? ' *' : ''}</label>
            <select id="${name}" name="${name}" ${required ? 'required' : ''}>
                ${optionsHtml}
            </select>
        </div>
    `;
}

// Update amount display with words
function updateAmountDisplay(input) {
    const value = parseFloat(input.value) || 0;
    const displayElement = input.parentElement.querySelector('.amount-display');
    if (displayElement && value > 0) {
        displayElement.textContent = numberToWords(value);
    } else if (displayElement) {
        displayElement.textContent = '';
    }
}

// ===== NAVIGATION HELPERS =====

// Navigate to page with data saving
function navigateToPage(targetPage, saveFunction = null) {
    if (saveFunction) {
        saveFunction();
    }
    showStatus('Data saved successfully!');
    setTimeout(() => {
        window.location.href = targetPage;
    }, 1500);
}

// ===== CALCULATION HELPERS =====

// Calculate total from array of objects
function calculateTotal(items, property) {
    return items.reduce((sum, item) => sum + (item[property] || 0), 0);
}

// Calculate percentage
function calculatePercentage(part, whole) {
    return whole === 0 ? 0 : (part / whole) * 100;
}

// ===== DATA VALIDATION =====

// Validate required fields
function validateRequiredFields(formId) {
    const form = document.getElementById(formId);
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            field.style.borderColor = 'var(--border-color)';
        }
    });
    
    return isValid;
}

// ===== FINANCIAL CALCULATIONS =====

// Calculate compound growth
function calculateCompoundGrowth(principal, rate, years) {
    return principal * Math.pow(1 + rate / 100, years);
}

// Calculate Financial Freedom Score
function calculateFFScore(netWorth, annualExpenses, assetGrowthRate, inflationRate) {
    let currentNetWorth = netWorth;
    let currentExpenses = annualExpenses;
    let years = 0;
    
    while (currentNetWorth > 0 && years < 100) {
        currentNetWorth -= currentExpenses;
        if (currentNetWorth <= 0) break;
        
        currentNetWorth *= (1 + assetGrowthRate / 100);
        currentExpenses *= (1 + inflationRate / 100);
        years++;
    }
    
    return years;
}

// Get FF Score meaning
function getFFScoreMeaning(score) {
    if (score >= 100) return { level: "Ultimate Financial Freedom", emoji: "🏝️", color: "#10b981" };
    if (score >= 70) return { level: "Achieved FF", emoji: "✅", color: "#22c55e" };
    if (score >= 50) return { level: "Very Close", emoji: "🔓", color: "#3b82f6" };
    if (score >= 25) return { level: "Getting There — Keep Going", emoji: "🚶", color: "#f59e0b" };
    if (score >= 10) return { level: "Still Dependent — Work & Build", emoji: "⚙️", color: "#ef4444" };
    return { level: "Financially Insecure — Focus Now", emoji: "🔴", color: "#dc2626" };
}

// ===== CHART HELPERS =====

// Create pie chart data
function createPieChartData(data, labels, colors) {
    return {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
}

// Chart color palette
const chartColors = {
    primary: '#2563eb',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#0ea5e9',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6',
    orange: '#f97316'
};

// ===== INITIALIZATION =====

// Initialize common page elements
function initCommonElements() {
    initUserInfo();
    
    // Add event listeners for amount inputs
    document.addEventListener('input', (e) => {
        if (e.target.type === 'number' && e.target.closest('.form-group')) {
            updateAmountDisplay(e.target);
        }
    });
    
    // Initialize modals
    initModals();
}

// Initialize modal functionality
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeButtons = document.querySelectorAll('.close');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            modals.forEach(modal => modal.style.display = 'none');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.style.display = 'block';
            }
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// ===== EXPORT FOR NODE.JS (if needed) =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        numberToWords,
        formatCurrency,
        formatNumber,
        parseCurrency,
        validateEmail,
        calculateAge,
        calculateFFScore,
        getFFScoreMeaning,
        Storage
    };
}

// ===== ENHANCED MATHEMATICAL VALIDATION =====

// Validate all calculations across the application
function validateAllCalculations() {
    const validationResults = {
        netWorth: validateNetWorthCalculations(),
        income: validateIncomeCalculations(),
        expenses: validateExpenseCalculations(),
        ffScore: validateFFScoreCalculations(),
        insurance: validateInsuranceCalculations(),
        interconnections: validateDataInterconnections()
    };
    
    console.log('Financial Dashboard Validation Results:', validationResults);
    return validationResults;
}

// Validate Net Worth calculations
function validateNetWorthCalculations() {
    const netWorthData = Storage.get('netWorthData', {});
    if (!netWorthData.totals) return { valid: false, error: 'No net worth data' };
    
    // Recalculate totals to verify
    let calculatedAssets = 0;
    let calculatedLiabilities = 0;
    
    // Verify asset calculations
    if (netWorthData.assets) {
        Object.keys(netWorthData.assets).forEach(category => {
            if (Array.isArray(netWorthData.assets[category])) {
                netWorthData.assets[category].forEach(asset => {
                    if (typeof asset.value === 'number' && asset.value > 0) {
                        calculatedAssets += asset.value;
                    }
                });
            }
        });
    }
    
    // Verify liability calculations
    if (netWorthData.liabilities && Array.isArray(netWorthData.liabilities)) {
        netWorthData.liabilities.forEach(liability => {
            if (typeof liability.amount === 'number' && liability.amount > 0) {
                calculatedLiabilities += liability.amount;
            }
        });
    }
    
    const calculatedNetWorth = calculatedAssets - calculatedLiabilities;
    const storedNetWorth = netWorthData.totals.netWorth;
    const variance = Math.abs(calculatedNetWorth - storedNetWorth);
    
    return {
        valid: variance < 1, // Allow for rounding differences
        calculatedAssets,
        calculatedLiabilities,
        calculatedNetWorth,
        storedNetWorth,
        variance
    };
}

// Validate Income calculations
function validateIncomeCalculations() {
    const incomeData = Storage.get('incomeData', {});
    if (!incomeData.totals) return { valid: false, error: 'No income data' };
    
    let calculatedAnnual = 0;
    let calculatedMonthly = 0;
    
    // Verify manual income entries
    if (incomeData.income) {
        Object.keys(incomeData.income).forEach(category => {
            if (Array.isArray(incomeData.income[category])) {
                incomeData.income[category].forEach(income => {
                    if (income.amount && income.frequency) {
                        let annualAmount = 0;
                        switch (income.frequency) {
                            case 'monthly':
                                annualAmount = income.amount * 12;
                                break;
                            case 'quarterly':
                                annualAmount = income.amount * 4;
                                break;
                            case 'annual':
                                annualAmount = income.amount;
                                break;
                        }
                        calculatedAnnual += annualAmount;
                    }
                });
            }
        });
    }
    
    // Add auto-calculated yields from assets
    const netWorthData = Storage.get('netWorthData', {});
    if (netWorthData.assets) {
        Object.keys(netWorthData.assets).forEach(category => {
            if (Array.isArray(netWorthData.assets[category])) {
                netWorthData.assets[category].forEach(asset => {
                    if (asset.value && asset.yield) {
                        calculatedAnnual += (asset.value * asset.yield) / 100;
                    }
                });
            }
        });
    }
    
    calculatedMonthly = calculatedAnnual / 12;
    
    const variance = Math.abs(calculatedAnnual - incomeData.totals.annualTotal);
    
    return {
        valid: variance < 10, // Allow for small rounding differences
        calculatedAnnual,
        calculatedMonthly,
        storedAnnual: incomeData.totals.annualTotal,
        variance
    };
}

// Validate Expense calculations
function validateExpenseCalculations() {
    const expenseData = Storage.get('expenseData', {});
    if (!expenseData.totals) return { valid: false, error: 'No expense data' };
    
    let calculatedAnnual = 0;
    
    // Verify expense calculations
    if (expenseData.expenses) {
        // Monthly recurring expenses
        if (expenseData.expenses.monthlyRecurring) {
            expenseData.expenses.monthlyRecurring.forEach(expense => {
                calculatedAnnual += expense.amount * 12;
            });
        }
        
        // Annual recurring expenses
        if (expenseData.expenses.annualRecurring) {
            expenseData.expenses.annualRecurring.forEach(expense => {
                calculatedAnnual += expense.amount;
            });
        }
        
        // Big expenses (amortized)
        if (expenseData.expenses.bigExpenses) {
            expenseData.expenses.bigExpenses.forEach(expense => {
                const years = expense.replacementYears || 1;
                calculatedAnnual += expense.amount / years;
            });
        }
    }
    
    const variance = Math.abs(calculatedAnnual - expenseData.totals.annualTotal);
    
    return {
        valid: variance < 10,
        calculatedAnnual,
        storedAnnual: expenseData.totals.annualTotal,
        variance
    };
}

// Enhanced FF Score calculation with validation
function calculateFFScoreEnhanced(netWorth, annualExpenses, assetGrowthRate, inflationRate) {
    if (netWorth <= 0 || annualExpenses <= 0) return 0;
    
    let currentNetWorth = netWorth;
    let currentExpenses = annualExpenses;
    let years = 0;
    const maxYears = 100;
    
    // Simulation with compound growth and inflation
    while (currentNetWorth > currentExpenses && years < maxYears) {
        // Deduct annual expenses
        currentNetWorth -= currentExpenses;
        
        if (currentNetWorth <= 0) break;
        
        // Apply asset growth
        currentNetWorth *= (1 + assetGrowthRate / 100);
        
        // Apply inflation to expenses
        currentExpenses *= (1 + inflationRate / 100);
        
        years++;
    }
    
    return Math.min(years, maxYears);
}

// Validate FF Score calculations
function validateFFScoreCalculations() {
    const ffScoreData = Storage.get('ffScoreData', {});
    const netWorthData = Storage.get('netWorthData', {});
    const expenseData = Storage.get('expenseData', {});
    
    if (!ffScoreData || !netWorthData.totals || !expenseData.totals) {
        return { valid: false, error: 'Missing required data for FF Score calculation' };
    }
    
    const calculatedScore = calculateFFScoreEnhanced(
        netWorthData.totals.netWorth,
        expenseData.totals.annualTotal,
        ffScoreData.assetGrowthRate || 10,
        ffScoreData.inflationRate || 6
    );
    
    const variance = Math.abs(calculatedScore - ffScoreData.score);
    
    return {
        valid: variance <= 1,
        calculatedScore,
        storedScore: ffScoreData.score,
        variance,
        netWorth: netWorthData.totals.netWorth,
        annualExpenses: expenseData.totals.annualTotal
    };
}

// Validate Insurance calculations
function validateInsuranceCalculations() {
    const insuranceData = Storage.get('insuranceData', {});
    const personalInfo = Storage.get('personalInfo', {});
    const incomeData = Storage.get('incomeData', {});
    
    if (!insuranceData || !personalInfo || !incomeData.totals) {
        return { valid: false, error: 'Missing data for insurance calculations' };
    }
    
    // Validate life insurance adequacy calculation
    const annualIncome = incomeData.totals.annualTotal;
    const age = personalInfo.age;
    const yearsToRetirement = Math.max(0, 60 - age);
    
    // Standard formula: 8-10 times annual income or income till retirement
    const recommendedLifeInsurance = Math.max(
        annualIncome * 8,
        annualIncome * yearsToRetirement
    );
    
    let totalLifeInsurance = 0;
    if (insuranceData.lifeInsurance) {
        insuranceData.lifeInsurance.forEach(policy => {
            totalLifeInsurance += policy.coverage || 0;
        });
    }
    
    const adequacyRatio = totalLifeInsurance / recommendedLifeInsurance;
    
    return {
        valid: true,
        recommendedLifeInsurance,
        totalLifeInsurance,
        adequacyRatio,
        isAdequate: adequacyRatio >= 0.8
    };
}

// Validate data interconnections between pages
function validateDataInterconnections() {
    const validations = [];
    
    // 1. Income should include asset yields from net worth
    const netWorthData = Storage.get('netWorthData', {});
    const incomeData = Storage.get('incomeData', {});
    
    let expectedYieldIncome = 0;
    if (netWorthData.assets) {
        Object.keys(netWorthData.assets).forEach(category => {
            if (Array.isArray(netWorthData.assets[category])) {
                netWorthData.assets[category].forEach(asset => {
                    if (asset.value && asset.yield) {
                        expectedYieldIncome += (asset.value * asset.yield) / 100;
                    }
                });
            }
        });
    }
    
    validations.push({
        check: 'Asset yields reflected in income',
        expected: expectedYieldIncome,
        actual: incomeData.totals?.annualTotal || 0,
        valid: Math.abs(expectedYieldIncome - (incomeData.totals?.annualTotal || 0)) < 50000
    });
    
    // 2. FF Score should use correct net worth and expenses
    const expenseData = Storage.get('expenseData', {});
    const ffScoreData = Storage.get('ffScoreData', {});
    
    validations.push({
        check: 'FF Score uses correct net worth',
        expected: netWorthData.totals?.netWorth || 0,
        actual: ffScoreData.netWorth || 0,
        valid: Math.abs((netWorthData.totals?.netWorth || 0) - (ffScoreData.netWorth || 0)) < 1000
    });
    
    validations.push({
        check: 'FF Score uses correct expenses',
        expected: expenseData.totals?.annualTotal || 0,
        actual: ffScoreData.annualExpenses || 0,
        valid: Math.abs((expenseData.totals?.annualTotal || 0) - (ffScoreData.annualExpenses || 0)) < 1000
    });
    
    // 3. Insurance calculations should use correct income
    const insuranceData = Storage.get('insuranceData', {});
    
    if (insuranceData.analysis) {
        validations.push({
            check: 'Insurance uses current income',
            expected: incomeData.totals?.annualTotal || 0,
            actual: insuranceData.baseIncome || 0,
            valid: Math.abs((incomeData.totals?.annualTotal || 0) - (insuranceData.baseIncome || 0)) < 10000
        });
    }
    
    return validations;
}

// ===== IMPROVED CALCULATION FUNCTIONS =====

// Enhanced compound growth calculation with error handling
function calculateCompoundGrowthEnhanced(principal, rate, years, monthlyContribution = 0) {
    if (principal < 0 || rate < -100 || years < 0) {
        throw new Error('Invalid parameters for compound growth calculation');
    }
    
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    
    // Principal compound growth
    const principalGrowth = principal * Math.pow(1 + rate / 100, years);
    
    // Monthly contribution compound growth (annuity formula)
    let contributionGrowth = 0;
    if (monthlyContribution > 0 && monthlyRate > 0) {
        contributionGrowth = monthlyContribution * 
            ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    } else if (monthlyContribution > 0) {
        contributionGrowth = monthlyContribution * months;
    }
    
    return Math.round(principalGrowth + contributionGrowth);
}

// Enhanced FF Score calculation with detailed breakdown
function calculateFFScoreDetailed(netWorth, annualExpenses, assetGrowthRate, inflationRate) {
    const breakdown = {
        initialNetWorth: netWorth,
        initialExpenses: annualExpenses,
        assetGrowthRate,
        inflationRate,
        yearlyBreakdown: [],
        finalScore: 0
    };
    
    let currentNetWorth = netWorth;
    let currentExpenses = annualExpenses;
    let year = 0;
    
    while (currentNetWorth > currentExpenses && year < 100) {
        const yearData = {
            year: year + 1,
            startingNetWorth: Math.round(currentNetWorth),
            expenses: Math.round(currentExpenses),
            netWorthAfterExpenses: Math.round(currentNetWorth - currentExpenses),
            growth: 0,
            endingNetWorth: 0
        };
        
        // Deduct expenses
        currentNetWorth -= currentExpenses;
        
        if (currentNetWorth <= 0) {
            yearData.endingNetWorth = 0;
            breakdown.yearlyBreakdown.push(yearData);
            break;
        }
        
        // Apply growth
        const growth = currentNetWorth * (assetGrowthRate / 100);
        yearData.growth = Math.round(growth);
        currentNetWorth += growth;
        yearData.endingNetWorth = Math.round(currentNetWorth);
        
        // Apply inflation to expenses
        currentExpenses *= (1 + inflationRate / 100);
        
        breakdown.yearlyBreakdown.push(yearData);
        year++;
    }
    
    breakdown.finalScore = year;
    return breakdown;
}

// Risk-adjusted return calculation
function calculateRiskAdjustedReturn(returns, riskFreeRate = 6) {
    if (!Array.isArray(returns) || returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Sharpe ratio calculation
    const sharpeRatio = standardDeviation > 0 ? (avgReturn - riskFreeRate) / standardDeviation : 0;
    
    return {
        averageReturn: avgReturn,
        standardDeviation,
        sharpeRatio,
        riskAdjustedReturn: avgReturn - (standardDeviation * 0.5) // Simple risk adjustment
    };
}

// Asset allocation optimization
function optimizeAssetAllocation(age, riskProfile, investmentHorizon) {
    const baseEquityAllocation = Math.max(0, Math.min(100, 100 - age));
    
    // Risk profile adjustments
    const riskAdjustments = {
        'Conservative': -20,
        'Risk Averse': -10,
        'Balanced': 0,
        'Aggressive': +10
    };
    
    // Investment horizon adjustments
    const horizonAdjustments = {
        'Short Term': -20,
        'Medium Term': -5,
        'Long Term': +10
    };
    
    let equityAllocation = baseEquityAllocation + 
                          (riskAdjustments[riskProfile] || 0) + 
                          (horizonAdjustments[investmentHorizon] || 0);
    
    equityAllocation = Math.max(10, Math.min(90, equityAllocation));
    
    const debtAllocation = 100 - equityAllocation;
    
    return {
        equity: equityAllocation,
        debt: debtAllocation,
        reasoning: `Based on age ${age}, ${riskProfile} risk profile, and ${investmentHorizon} investment horizon`
    };
}

// ===== UTILITY FUNCTION IMPROVEMENTS =====

// Enhanced number formatting with Indian currency system
function formatIndianCurrency(amount, includePaise = false) {
    if (amount >= 10000000) {
        return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) {
        return '₹' + (amount / 100000).toFixed(2) + ' L';
    } else if (amount >= 1000) {
        return '₹' + (amount / 1000).toFixed(1) + ' K';
    } else {
        return '₹' + amount.toFixed(includePaise ? 2 : 0);
    }
}

// Enhanced validation with specific error messages
function validateFinancialData(data, type) {
    const errors = [];
    
    switch (type) {
        case 'networth':
            if (!data.totals) errors.push('Missing totals calculation');
            if (data.totals && data.totals.netWorth < 0) errors.push('Negative net worth detected');
            if (!data.assets || Object.keys(data.assets).length === 0) errors.push('No assets defined');
            break;
            
        case 'income':
            if (!data.totals) errors.push('Missing income totals');
            if (data.totals && data.totals.annualTotal <= 0) errors.push('No income recorded');
            break;
            
        case 'expenses':
            if (!data.totals) errors.push('Missing expense totals');
            if (data.totals && data.totals.annualTotal <= 0) errors.push('No expenses recorded');
            break;
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// ===== EXPORT VALIDATION FUNCTION =====
window.validateAllCalculations = validateAllCalculations; 
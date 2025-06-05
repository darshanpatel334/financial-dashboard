// ===== UTILITY FUNCTIONS =====

// Show status messages with proper z-index
function showStatus(message, type = 'success') {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';
        statusElement.style.zIndex = '10000'; // Ensure it appears above everything
        statusElement.style.position = 'fixed';
        statusElement.style.top = '20px';
        statusElement.style.right = '20px';
        statusElement.style.backgroundColor = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : type === 'info' ? '#3b82f6' : '#22c55e';
        statusElement.style.color = 'white';
        statusElement.style.padding = '1rem 1.5rem';
        statusElement.style.borderRadius = '0.5rem';
        statusElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        statusElement.style.maxWidth = '400px';
        statusElement.style.wordWrap = 'break-word';
        
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
    
    // Refresh navigation to show updated completion status
    setTimeout(() => {
        refreshNavigationStatus();
    }, 100);
    
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

// ===== USER JOURNEY PROGRESS TRACKING =====

// Define the journey steps in order
const JOURNEY_STEPS = [
    { key: 'personalInfo', page: 'personal-info.html', name: 'Personal Information' },
    { key: 'netWorthData', page: 'networth.html', name: 'Net Worth' },
    { key: 'incomeData', page: 'income.html', name: 'Income Analysis' },
    { key: 'expenseData', page: 'expenses.html', name: 'Expense Analysis' },
    { key: 'ffScoreData', page: 'ff-score.html', name: 'FF Score' },
    { key: 'insuranceData', page: 'insurance.html', name: 'Insurance' },
    { key: 'riskProfileData', page: 'risk-profile.html', name: 'Risk Profile' },
    { key: 'completed', page: 'dashboard.html', name: 'Dashboard' }
];

// Check user progress and determine where they should be redirected
function checkUserProgress() {
    const progress = getUserProgress();
    return progress;
}

// Get user progress with step validation
function getUserProgress() {
    const steps = [
        { key: 'personalInfo', page: 'personal-info.html', name: 'Personal Info' },
        { key: 'netWorthData', page: 'networth.html', name: 'Net Worth' },
        { key: 'incomeData', page: 'income.html', name: 'Income' },
        { key: 'expenseData', page: 'expenses.html', name: 'Expenses' },
        { key: 'ffScoreData', page: 'ff-score.html', name: 'FF Score' },
        { key: 'insuranceData', page: 'insurance.html', name: 'Insurance' },
        { key: 'riskProfileData', page: 'risk-profile.html', name: 'Risk Profile' },
        { key: 'dashboard', page: 'dashboard.html', name: 'Dashboard' },
        { key: 'analytics', page: 'advisor.html', name: 'Analytics' },
        { key: 'findAdvisor', page: 'find-advisor.html', name: 'Find Advisor' }
    ];
    
    let currentStep = 1;
    let completedSteps = [];
    
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        let isCompleted = false;
        
        if (step.key === 'dashboard') {
            // Dashboard is accessible if at least risk profile is completed
            const riskData = Storage.get('riskProfileData', {});
            isCompleted = riskData.totalScore && riskData.totalScore > 0;
        } else if (step.key === 'analytics') {
            // Analytics is accessible if dashboard is completed OR if risk profile is completed
            const riskData = Storage.get('riskProfileData', {});
            const dashboardVisited = Storage.get('dashboardVisited', false);
            isCompleted = dashboardVisited || (riskData.totalScore && riskData.totalScore > 0);
        } else if (step.key === 'findAdvisor') {
            // Find Advisor is accessible if analytics is accessible
            const findAdvisorVisited = Storage.get('findAdvisorVisited', false);
            const analyticsVisited = Storage.get('analyticsVisited', false);
            const riskData = Storage.get('riskProfileData', {});
            isCompleted = findAdvisorVisited || analyticsVisited || (riskData.totalScore && riskData.totalScore > 0);
        } else {
            const stepData = Storage.get(step.key, {});
            isCompleted = validateStepCompletion(step.key, stepData);
        }
        
        if (isCompleted) {
            completedSteps.push(stepNumber);
            currentStep = Math.max(currentStep, stepNumber + 1);
        }
    });
    
    return {
        currentStep: Math.min(currentStep, 10), // Cap at 10 (find advisor)
        completedSteps,
        totalSteps: 10,
        canAccessDashboard: completedSteps.includes(7) // Can access dashboard if risk profile is complete
    };
}

// Validate step completion
function validateStepCompletion(stepKey, data) {
    if (!data || typeof data !== 'object') return false;
    
    switch (stepKey) {
        case 'personalInfo':
            // Check for either fullName or firstName+lastName, and age
            return (data.fullName || (data.firstName && data.lastName)) && 
                   (data.age || data.dateOfBirth);
            
        case 'netWorthData':
            // Check if totals exist and net worth is calculated
            return data.totals && typeof data.totals.netWorth === 'number';
            
        case 'incomeData':
            return data.totals && typeof data.totals.annualTotal === 'number' && data.totals.annualTotal > 0;
            
        case 'expenseData':
            return data.totals && typeof data.totals.annualTotal === 'number' && data.totals.annualTotal > 0;
            
        case 'ffScoreData':
            return (data.currentScore && typeof data.currentScore === 'number' && data.currentScore > 0) ||
                   (data.score && typeof data.score === 'number' && data.score > 0);
            
        case 'insuranceData':
            // Check for any insurance data - totals or insurance categories
            return (data.totals && (data.totals.totalLifeCoverage > 0 || data.totals.totalHealthCoverage > 0)) ||
                   (data.insurance && Object.keys(data.insurance).some(category => 
                       Array.isArray(data.insurance[category]) && data.insurance[category].length > 0));
            
        case 'riskProfileData':
            // Risk profile is complete when score is calculated
            return data.totalScore && typeof data.totalScore === 'number' && data.totalScore > 0 && data.riskProfile;
            
        default:
            return false;
    }
}

// Smart redirect based on user progress
function smartRedirect() {
    const progress = checkUserProgress();
    
    if (progress.isComplete) {
        // All steps completed, go to dashboard
        return 'dashboard.html';
    } else if (progress.current) {
        // Go to current incomplete step
        return progress.current.page;
    } else {
        // Start from beginning
        return 'personal-info.html';
    }
}

// Initialize progress tracking on any page
function initProgressTracking() {
    const currentPage = getCurrentPageName();
    const progress = checkUserProgress();
    
    // Only redirect if we're on landing page
    if (currentPage === 'index.html') {
        // If user has completed everything, show option to go to dashboard
        if (progress.isComplete) {
            showDashboardOption();
        }
    }
    
    // Remove auto-redirect from other pages - let users navigate freely
    
    return progress;
}

// Get current page name
function getCurrentPageName() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

// Show dashboard option on landing page
function showDashboardOption() {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const dashboardButton = document.createElement('div');
        dashboardButton.style.marginTop = '2rem';
        dashboardButton.innerHTML = `
            <div class="instruction-box" style="background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);">
                <h3 style="color: #0369a1; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i> Welcome Back!
                </h3>
                <p style="margin-bottom: 1.5rem;">You've completed your financial assessment. View your personalized dashboard or update your information.</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="window.location.href='dashboard.html'">
                        <i class="fas fa-chart-line"></i> View Dashboard
                    </button>
                    <button class="btn btn-secondary" onclick="window.location.href='personal-info.html'">
                        <i class="fas fa-edit"></i> Update Information
                    </button>
                </div>
            </div>
        `;
        heroSection.appendChild(dashboardButton);
    }
}

// Update progress bar display (if exists on page)
function updateProgressDisplay(progress) {
    const progressBar = document.getElementById('journeyProgress');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) {
        progressBar.style.width = progress.percentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = `${progress.completed.length} of ${JOURNEY_STEPS.length - 1} steps completed (${progress.percentage}%)`;
    }
}

// Export progress functions
window.checkUserProgress = checkUserProgress;
window.smartRedirect = smartRedirect;
window.initProgressTracking = initProgressTracking;

// ===== UNIVERSAL NAVIGATION SYSTEM =====

// Create and setup progress navigation for any page
// Define navigation steps configuration
const NAVIGATION_STEPS = [
    { id: 1, name: 'Personal Info', page: 'personal-info.html' },
    { id: 2, name: 'Net Worth', page: 'networth.html' },
    { id: 3, name: 'Income', page: 'income.html' },
    { id: 4, name: 'Expenses', page: 'expenses.html' },
    { id: 5, name: 'FF Score', page: 'ff-score.html' },
    { id: 6, name: 'Insurance', page: 'insurance.html' },
    { id: 7, name: 'Risk Profile', page: 'risk-profile.html' },
    { id: 8, name: 'Dashboard', page: 'dashboard.html' },
    { id: 9, name: 'Analytics', page: 'advisor.html' },
    { id: 10, name: 'Find Advisor', page: 'find-advisor.html' }
];

function setupPageNavigation(currentPageIndex = 1) {
    // Generate navigation steps dynamically
    const stepsHtml = NAVIGATION_STEPS.map((step, index) => {
        const isLast = index === NAVIGATION_STEPS.length - 1;
        return `
            <div class="progress-step ${currentPageIndex === step.id ? 'current' : ''}" data-step="${step.id}" data-page="${step.page}">
                <div class="progress-dot"></div>
                <span>${step.name}</span>
            </div>
            ${!isLast ? '<div class="progress-line"></div>' : ''}
        `;
    }).join('');

    const navHtml = `
        <div id="progressNavigation" style="margin-bottom: 2rem; text-align: center;">
            <div class="progress-container" style="background: rgba(255, 255, 255, 0.95); padding: 1.5rem; border-radius: 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); margin-bottom: 2rem;">
                <div class="progress-dots" style="display: flex; justify-content: center; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    ${stepsHtml}
                </div>
            </div>
        </div>
        <style>
            .progress-step {
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 80px;
            }

            .progress-step:hover {
                transform: translateY(-2px);
            }

            .progress-dot {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #e0e0e0;
                margin-bottom: 0.5rem;
                transition: all 0.3s ease;
                position: relative;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .progress-step.completed .progress-dot {
                background: #4CAF50;
                border-color: #4CAF50;
            }

            .progress-step.completed .progress-dot::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: bold;
            }

            .progress-step.current .progress-dot {
                background: #2196F3;
                border-color: #2196F3;
                animation: pulse 2s infinite;
            }

            .progress-step span {
                font-size: 0.8rem;
                color: #666;
                text-align: center;
                font-weight: 500;
            }

            .progress-step.completed span {
                color: #4CAF50;
                font-weight: 600;
            }

            .progress-step.current span {
                color: #2196F3;
                font-weight: 600;
            }

            .progress-line {
                width: 30px;
                height: 2px;
                background: #e0e0e0;
                margin: 0 0.5rem;
                margin-top: 10px;
            }

            @keyframes pulse {
                0% { 
                    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
                    transform: scale(1.05);
                }
                100% { 
                    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
                    transform: scale(1);
                }
            }

            @media (max-width: 768px) {
                .progress-dots {
                    flex-direction: column;
                    gap: 1rem;
                }

                .progress-line {
                    width: 2px;
                    height: 20px;
                    margin: 0;
                }
            }
        </style>
    `;
    
    // Find insertion point - first look for page-header, then h1, then container
    let insertionPoint = document.querySelector('.page-header');
    
    if (!insertionPoint) {
        // Look for h1 tag
        insertionPoint = document.querySelector('h1');
        if (insertionPoint) {
            // Insert before h1
            insertionPoint.insertAdjacentHTML('beforebegin', navHtml);
            setupNavigationInteractions();
            return;
        }
    }
    
    if (!insertionPoint) {
        // Fall back to container
        insertionPoint = document.querySelector('.container');
        if (insertionPoint) {
            insertionPoint.insertAdjacentHTML('afterbegin', navHtml);
        }
    } else {
        // Insert before page-header
        insertionPoint.insertAdjacentHTML('beforebegin', navHtml);
    }
    
    if (insertionPoint) {
        // Setup click handlers and progress status
        setupNavigationInteractions();
    }
}

// Setup navigation interactions and progress updates
function setupNavigationInteractions() {
    const progress = getUserProgress();
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach((step) => {
        const stepNumber = parseInt(step.getAttribute('data-step'));
        step.classList.remove('completed');
        
        // Mark completed steps
        if (progress.completedSteps.includes(stepNumber)) {
            step.classList.add('completed');
        }
        
        // Add click handler for navigation
        step.addEventListener('click', () => {
            const page = step.getAttribute('data-page');
            if (page) {
                // Allow navigation to completed steps or next available step
                if (progress.completedSteps.includes(stepNumber) || stepNumber <= progress.currentStep) {
                    window.location.href = page;
                } else {
                    showStatus('Please complete the previous steps first', 'warning');
                }
            }
        });
    });
}

// Refresh navigation status (useful when data changes)
function refreshNavigationStatus() {
    const progressSteps = document.querySelectorAll('.progress-step');
    if (progressSteps.length > 0) {
        setupNavigationInteractions();
    }
}

// Auto-refresh navigation when localStorage changes
window.addEventListener('storage', (e) => {
    // Refresh navigation when data changes
    if (e.key && (e.key.includes('Info') || e.key.includes('Data'))) {
        setTimeout(refreshNavigationStatus, 100);
    }
});

// Also refresh on focus (when returning to tab)
window.addEventListener('focus', () => {
    setTimeout(refreshNavigationStatus, 100);
});

// Export navigation functions
window.setupPageNavigation = setupPageNavigation;
window.setupNavigationInteractions = setupNavigationInteractions;
window.refreshNavigationStatus = refreshNavigationStatus; 
// ===== DASHBOARD PAGE FUNCTIONALITY =====

let dashboardData = {};
let charts = {};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        initCommonElements();
        
        // Display user email in navigation
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                const userEmailElement = document.getElementById('userEmail');
                if (userEmailElement) {
                    // Use the getUserDisplayName function from auth.js
                    if (typeof getUserDisplayName === 'function') {
                        userEmailElement.textContent = getUserDisplayName();
                    } else {
                        // Fallback to extracting first name from email
                        const emailPart = user.email.split('@')[0];
                        const namePart = emailPart.replace(/[0-9]/g, '').split('.')[0];
                        userEmailElement.textContent = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                    }
                }
            }
        });
        
        loadAllData();
        initDashboard();
        initHistorical();
        
        // Mark dashboard as visited for progress tracking
        Storage.set('dashboardVisited', true);
        
        // Setup navigation system - use safer timing
        if (typeof safeSetupNavigation === 'function') {
            safeSetupNavigation(8); // 8 = Dashboard page
        } else if (typeof setupPageNavigation === 'function') {
            setTimeout(() => setupPageNavigation(8), 200);
        }
    });
});

// Load all data from previous pages
function loadAllData() {
    dashboardData = {
        personal: Storage.get('personalInfo', {}),
        netWorth: Storage.get('netWorthData', {}),
        income: Storage.get('incomeData', {}),
        expenses: Storage.get('expenseData', {}),
        ffScore: Storage.get('ffScoreData', {}),
        insurance: Storage.get('insuranceData', {}),
        riskProfile: Storage.get('riskProfileData', {})
    };
    
    console.log('Dashboard data loaded:', dashboardData); // Debug log
    console.log('Available storage keys:', Object.keys(localStorage)); // Debug log
}

// Initialize dashboard
function initDashboard() {
    console.log('Initializing dashboard...');
    loadAllData();
    updatePersonalInfoDisplay();
    updateSummaryCards();
    createAssetAllocationCharts();
    createIncomeExpenseCharts();
    createIncomeVsExpenseAnalysis();
    updateHealthIndicators();
    initHistorical();
    generateActionItems();
    console.log('Dashboard initialization complete');
}

// Update personal information display
function updatePersonalInfoDisplay() {
    const personalInfo = dashboardData.personal || {};
    const personalInfoContainer = document.getElementById('personalInfoSummary');
    
    if (!personalInfoContainer) return;
    
    const age = personalInfo.age || calculateAge(personalInfo.dateOfBirth) || 'Not specified';
    const dependents = personalInfo.dependents || [];
    const maritalStatus = personalInfo.maritalStatus || 'Not specified';
    
    personalInfoContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold;">
                ${personalInfo.firstName ? personalInfo.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
                <h3 style="margin: 0; color: var(--text-primary);">${personalInfo.firstName || 'User'} ${personalInfo.lastName || ''}</h3>
                <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary);">${personalInfo.email || 'No email provided'}</p>
            </div>
        </div>
        
        <div style="padding: 1rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h4 style="margin: 0 0 0.75rem 0; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-user-circle"></i> Demographics
            </h4>
            <div style="display: grid; gap: 0.5rem;">
                <div><strong>Age:</strong> ${age} years</div>
                <div><strong>Marital Status:</strong> ${formatCategoryName(maritalStatus)}</div>
            </div>
        </div>
        
        <div style="padding: 1rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h4 style="margin: 0 0 0.75rem 0; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-users"></i> Dependents (${dependents.length})
            </h4>
            ${dependents.length > 0 ? 
                dependents.map(dep => `
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9;">
                        <span><strong>${dep.name}</strong></span>
                        <span>${dep.age} years (${formatCategoryName(dep.relation)})</span>
                    </div>
                `).join('') :
                '<div style="color: var(--text-secondary); font-style: italic;">No dependents listed</div>'
            }
        </div>
    `;
}

// Calculate age from date of birth
function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Update summary cards
function updateSummaryCards() {
    console.log('Updating summary cards...');
    
    try {
        // Net Worth
        const netWorth = dashboardData.netWorth?.totals?.netWorth || 0;
        const netWorthElement = document.getElementById('dashboardNetWorth');
        if (netWorthElement) {
            netWorthElement.textContent = formatCurrency(netWorth);
        }
        
        // Annual Income
        const annualIncome = dashboardData.income?.totals?.annualTotal || 0;
        const incomeElement = document.getElementById('dashboardIncome');
        if (incomeElement) {
            incomeElement.textContent = formatCurrency(annualIncome);
        }
        
        // Annual Expenses
        const annualExpenses = dashboardData.expenses?.totals?.annualTotal || 0;
        const expensesElement = document.getElementById('dashboardExpenses');
        if (expensesElement) {
            expensesElement.textContent = formatCurrency(annualExpenses);
        }
        
        // FF Score
        const ffScore = dashboardData.ffScore?.currentScore || dashboardData.ffScore?.score || 0;
        const ffScoreElement = document.getElementById('dashboardFFScore');
        if (ffScoreElement) {
            ffScoreElement.textContent = ffScore;
            
            // Update FF Score color and status
            const ffScoreMeaning = getFFScoreMeaning(ffScore);
            ffScoreElement.style.color = ffScoreMeaning.color;
            
            const statusElement = document.getElementById('ffScoreStatus');
            if (statusElement) {
                statusElement.textContent = ffScoreMeaning.level;
            }
        }
        
        console.log('Summary cards updated successfully');
        
    } catch (error) {
        console.error('Error updating summary cards:', error);
    }
}

// Update recurring investments section
function updateRecurringInvestments() {
    const netWorthData = dashboardData.netWorth || {};
    const recurringInvestments = netWorthData.recurringInvestments || {};
    
    // Calculate totals for each category
    let totalSIP = 0;
    let totalRD = 0;
    let totalOtherSavings = 0;
    
    // SIP totals
    if (recurringInvestments.sip) {
        totalSIP = recurringInvestments.sip.reduce((total, investment) => {
            const amount = investment.amount || 0;
            const frequency = investment.frequency || 'monthly';
            return total + convertToMonthly(amount, frequency);
        }, 0);
    }
    
    // RD totals
    if (recurringInvestments.rd) {
        totalRD = recurringInvestments.rd.reduce((total, investment) => {
            const amount = investment.amount || 0;
            const frequency = investment.frequency || 'monthly';
            return total + convertToMonthly(amount, frequency);
        }, 0);
    }
    
    // Other savings totals
    if (recurringInvestments.otherSavings) {
        totalOtherSavings = recurringInvestments.otherSavings.reduce((total, investment) => {
            const amount = investment.amount || 0;
            const frequency = investment.frequency || 'monthly';
            return total + convertToMonthly(amount, frequency);
        }, 0);
    }
    
    const totalRecurring = totalSIP + totalRD + totalOtherSavings;
    
    // Update display elements if they exist
    const sipElement = document.getElementById('dashboardSIP');
    const rdElement = document.getElementById('dashboardRD');
    const otherSavingsElement = document.getElementById('dashboardOtherSavings');
    const totalRecurringElement = document.getElementById('dashboardTotalRecurring');
    const disciplineScoreElement = document.getElementById('disciplineScore');
    const recurringSection = document.getElementById('recurringInvestmentsSection');
    
    if (sipElement) sipElement.textContent = formatCurrency(totalSIP);
    if (rdElement) rdElement.textContent = formatCurrency(totalRD);
    if (otherSavingsElement) otherSavingsElement.textContent = formatCurrency(totalOtherSavings);
    if (totalRecurringElement) totalRecurringElement.textContent = formatCurrency(totalRecurring);
    
    // Calculate investment discipline score (percentage of income going to regular investments)
    const monthlyIncome = (dashboardData.income.totals?.annualTotal || 0) / 12;
    const disciplinePercentage = monthlyIncome > 0 ? (totalRecurring / monthlyIncome) * 100 : 0;
    
    if (disciplineScoreElement) {
        disciplineScoreElement.textContent = Math.round(disciplinePercentage) + '%';
        // Color code the discipline score
        if (disciplinePercentage >= 30) {
            disciplineScoreElement.style.color = 'var(--success-color)';
        } else if (disciplinePercentage >= 15) {
            disciplineScoreElement.style.color = 'var(--warning-color)';
        } else {
            disciplineScoreElement.style.color = 'var(--danger-color)';
        }
    }
    
    // Show/hide the recurring investments section based on whether there's data
    if (recurringSection) {
        if (totalRecurring > 0) {
            recurringSection.style.display = 'block';
        } else {
            recurringSection.style.display = 'none';
        }
    }
}

// Update savings analysis
function updateSavingsAnalysis() {
    console.log('Updating savings analysis...');
    
    try {
        const annualIncome = dashboardData.income?.totals?.annualTotal || 0;
        const annualExpenses = dashboardData.expenses?.totals?.annualTotal || 0;
        const monthlyIncome = annualIncome / 12;
        const monthlyExpenses = annualExpenses / 12;
        const monthlySavings = monthlyIncome - monthlyExpenses;
        
        // Update monthly savings
        const monthlySavingsElement = document.getElementById('monthlySavings');
        if (monthlySavingsElement) {
            monthlySavingsElement.textContent = formatCurrency(monthlySavings);
            monthlySavingsElement.className = monthlySavings >= 0 ? 'score-number positive' : 'score-number negative';
        }
        
        // Update savings rate
        const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
        const savingsRateElement = document.getElementById('savingsRate');
        if (savingsRateElement) {
            savingsRateElement.textContent = Math.round(savingsRate) + '%';
            if (savingsRate >= 20) {
                savingsRateElement.className = 'score-number positive';
            } else if (savingsRate >= 10) {
                savingsRateElement.className = 'score-number warning';
            } else {
                savingsRateElement.className = 'score-number negative';
            }
        }
        
        // Update expense ratio
        const expenseRatio = annualIncome > 0 ? (annualExpenses / annualIncome) * 100 : 0;
        const expenseRatioElement = document.getElementById('expenseRatio');
        if (expenseRatioElement) {
            expenseRatioElement.textContent = Math.round(expenseRatio) + '%';
            if (expenseRatio <= 70) {
                expenseRatioElement.className = 'score-number positive';
            } else if (expenseRatio <= 85) {
                expenseRatioElement.className = 'score-number warning';
            } else {
                expenseRatioElement.className = 'score-number negative';
            }
        }
        
        console.log('Savings analysis updated successfully');
        
    } catch (error) {
        console.error('Error updating savings analysis:', error);
    }
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    
    // Update savings display elements
    const monthlySavingsElement = document.getElementById('monthlySavings');
    const savingsRateDisplayElement = document.getElementById('savingsRateDisplay');
    const savingsChangeElement = document.getElementById('savingsChange');
    const incomeExpenseChangeElement = document.getElementById('incomeExpenseChange');
    
    if (monthlySavingsElement) {
        monthlySavingsElement.textContent = formatCurrency(monthlySavings);
        monthlySavingsElement.style.color = monthlySavings >= 0 ? 'var(--success-color)' : 'var(--error-color)';
    }
    
    if (savingsRateDisplayElement) {
        savingsRateDisplayElement.textContent = Math.round(savingsRate) + '%';
        if (savingsRate >= 25) {
            savingsRateDisplayElement.style.color = 'var(--success-color)';
        } else if (savingsRate >= 15) {
            savingsRateDisplayElement.style.color = 'var(--warning-color)';
        } else {
            savingsRateDisplayElement.style.color = 'var(--error-color)';
        }
    }
    
    // Show historical comparison for income/expenses
    showIncomeExpenseChange(incomeExpenseChangeElement, savingsChangeElement, monthlySavings);
}

// Show income/expense change from last snapshot
function showIncomeExpenseChange(incomeExpenseChangeElement, savingsChangeElement, currentMonthlySavings) {
    const snapshots = JSON.parse(localStorage.getItem('historicalSnapshots') || '[]');
    
    if (snapshots.length < 2) {
        if (incomeExpenseChangeElement) {
            incomeExpenseChangeElement.innerHTML = '<i class="fas fa-info-circle"></i> Save snapshots to track changes over time';
        }
        if (savingsChangeElement) {
            savingsChangeElement.textContent = '-';
            savingsChangeElement.style.color = 'var(--text-secondary)';
        }
        return;
    }
    
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    
    // Income change
    const currentIncome = latest.data.annualIncome;
    const previousIncome = previous.data.annualIncome;
    const incomeChange = currentIncome - previousIncome;
    const incomePercentChange = previousIncome !== 0 ? (incomeChange / previousIncome) * 100 : 0;
    
    // Expense change
    const currentExpenses = latest.data.annualExpenses;
    const previousExpenses = previous.data.annualExpenses;
    const expenseChange = currentExpenses - previousExpenses;
    const expensePercentChange = previousExpenses !== 0 ? (expenseChange / previousExpenses) * 100 : 0;
    
    // Savings change
    const previousMonthlySavings = (previousIncome - previousExpenses) / 12;
    const savingsChange = currentMonthlySavings - previousMonthlySavings;
    const savingsPercentChange = previousMonthlySavings !== 0 ? (savingsChange / Math.abs(previousMonthlySavings)) * 100 : 0;
    
    if (incomeExpenseChangeElement) {
        const incomeIsPositive = incomeChange > 0;
        const expenseIsPositive = expenseChange > 0;
        
        incomeExpenseChangeElement.innerHTML = `
            Income: <span style="color: ${incomeIsPositive ? 'var(--success-color)' : 'var(--error-color)'};">
                ${incomeIsPositive ? '+' : ''}${formatCurrency(incomeChange)} (${incomeIsPositive ? '+' : ''}${incomePercentChange.toFixed(1)}%)
            </span> | 
            Expenses: <span style="color: ${expenseIsPositive ? 'var(--error-color)' : 'var(--success-color)'};">
                ${expenseIsPositive ? '+' : ''}${formatCurrency(expenseChange)} (${expenseIsPositive ? '+' : ''}${expensePercentChange.toFixed(1)}%)
            </span>
            since ${new Date(previous.date).toLocaleDateString()}
        `;
    }
    
    if (savingsChangeElement) {
        const savingsIsPositive = savingsChange > 0;
        const changeColor = savingsIsPositive ? 'var(--success-color)' : 'var(--error-color)';
        
        savingsChangeElement.innerHTML = `
            <span style="color: ${changeColor};">
                ${savingsIsPositive ? '+' : ''}${formatCurrency(savingsChange)}
            </span><br>
            <small>(${savingsIsPositive ? '+' : ''}${savingsPercentChange.toFixed(1)}%)</small>
        `;
        savingsChangeElement.style.color = changeColor;
    }
}

// Update health indicators
function updateHealthIndicators() {
    // Savings Rate
    const annualIncome = dashboardData.income.totals?.annualTotal || 0;
    const annualExpenses = dashboardData.expenses.totals?.annualTotal || 0;
    const monthlyIncome = annualIncome / 12;
    const monthlyExpenses = annualExpenses / 12;
    const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
    
    document.getElementById('savingsRateIndicator').textContent = Math.round(savingsRate) + '%';
    updateProgressBar('savingsRateProgress', savingsRate, 100);
    colorizeIndicator('savingsRateIndicator', savingsRate, 10, 25);
    
    // Emergency Fund calculation (liquid assets / monthly expenses)
    const netWorth = dashboardData.netWorth || {};
    const cashAssets = (netWorth.assets?.cash || []).reduce((total, asset) => total + (asset.value || 0), 0);
    const emergencyFundMonths = monthlyExpenses > 0 ? cashAssets / monthlyExpenses : 0;
    
    document.getElementById('emergencyFundIndicator').textContent = Math.round(emergencyFundMonths) + ' months';
    
    // Life Insurance Ratio
    const lifeInsuranceRatio = dashboardData.insurance?.analysis?.lifeInsuranceRatio || 0;
    document.getElementById('lifeInsuranceIndicator').textContent = lifeInsuranceRatio.toFixed(1) + 'x';
    colorizeIndicator('lifeInsuranceIndicator', lifeInsuranceRatio, 5, 10);
    
    // Risk Profile
    const riskProfile = dashboardData.riskProfile?.riskProfile || dashboardData.riskProfile?.category || 'Not Assessed';
    document.getElementById('riskProfileIndicator').textContent = riskProfile;
    
    // Debt-to-Income ratio
    const totalLiabilities = netWorth.totals?.totalLiabilities || 0;
    const debtToIncomeRatio = annualIncome > 0 ? (totalLiabilities / annualIncome) * 100 : 0;
    document.getElementById('debtToIncomeIndicator').textContent = Math.round(debtToIncomeRatio) + '%';
    
    // Investment Rate (recurring investments / income)
    const recurringInvestments = netWorth.recurringInvestments || {};
    const totalRecurringMonthly = (recurringInvestments.sip || []).reduce((total, inv) => total + convertToMonthly(inv.amount || 0, inv.frequency || 'monthly'), 0) +
                                 (recurringInvestments.rd || []).reduce((total, inv) => total + convertToMonthly(inv.amount || 0, inv.frequency || 'monthly'), 0) +
                                 (recurringInvestments.otherSavings || []).reduce((total, inv) => total + convertToMonthly(inv.amount || 0, inv.frequency || 'monthly'), 0);
    const investmentRate = monthlyIncome > 0 ? (totalRecurringMonthly / monthlyIncome) * 100 : 0;
    document.getElementById('investmentRateIndicator').textContent = Math.round(investmentRate) + '%';
    
    // Color coding for indicators
    colorizeIndicator('emergencyFundIndicator', emergencyFundMonths, 3, 6);
    colorizeIndicatorReverse('debtToIncomeIndicator', debtToIncomeRatio, 20, 40); // Reverse - lower is better
    colorizeIndicator('investmentRateIndicator', investmentRate, 15, 25);
    
    // Update emergency fund status
    const emergencyStatus = document.getElementById('emergencyFundStatus');
    if (emergencyStatus) {
        if (emergencyFundMonths >= 6) {
            emergencyStatus.textContent = 'Excellent coverage';
            emergencyStatus.style.color = 'var(--success-color)';
        } else if (emergencyFundMonths >= 3) {
            emergencyStatus.textContent = 'Good coverage';
            emergencyStatus.style.color = 'var(--warning-color)';
        } else {
            emergencyStatus.textContent = 'Needs improvement';
            emergencyStatus.style.color = 'var(--error-color)';
        }
    }
}

// Update progress bar
function updateProgressBar(elementId, value, max) {
    const percentage = Math.min((value / max) * 100, 100);
    document.getElementById(elementId).style.width = percentage + '%';
}

// Colorize indicator based on thresholds
function colorizeIndicator(elementId, value, lowThreshold, highThreshold) {
    const element = document.getElementById(elementId);
    if (value >= highThreshold) {
        element.style.color = 'var(--success-color)';
    } else if (value >= lowThreshold) {
        element.style.color = 'var(--warning-color)';
    } else {
        element.style.color = 'var(--danger-color)';
    }
}

// Colorize indicator in reverse (lower values are better)
function colorizeIndicatorReverse(elementId, value, lowThreshold, highThreshold) {
    const element = document.getElementById(elementId);
    if (value <= lowThreshold) {
        element.style.color = 'var(--success-color)';
    } else if (value <= highThreshold) {
        element.style.color = 'var(--warning-color)';
    } else {
        element.style.color = 'var(--danger-color)';
    }
}

// Create all charts
// Create asset allocation charts
function createAssetAllocationCharts() {
    console.log('Creating asset allocation charts...');
    createAssetChart();
    createLiabilityChart();
}

// Create income and expense pie charts
function createIncomeExpenseCharts() {
    console.log('Creating income and expense charts...');
    createIncomeChart();
    createExpenseChart();
}

// Create income vs expense analysis
function createIncomeVsExpenseAnalysis() {
    console.log('Creating income vs expense analysis...');
    createIncomeExpenseChart();
    updateSavingsAnalysis();
}

// Create asset allocation chart with enhanced legend
function createAssetChart() {
    const ctx = document.getElementById('assetChart').getContext('2d');
    
    // Calculate asset allocation
    const assets = dashboardData.netWorth.assets || {};
    const data = [];
    const labels = [];
    
    Object.keys(assets).forEach(category => {
        if (Array.isArray(assets[category])) {
            const total = assets[category].reduce((sum, item) => sum + (item.value || 0), 0);
            if (total > 0) {
                data.push(total);
                labels.push(formatCategoryName(category));
            }
        }
    });
    
    const total = data.reduce((sum, value) => sum + value, 0);
    
    if (total === 0) {
        ctx.canvas.style.display = 'none';
        document.getElementById('assetLegend').innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No asset data available</p>';
        return;
    }
    
    const colors = [
        chartColors.primary,
        chartColors.success, 
        chartColors.warning,
        chartColors.danger,
        chartColors.info,
        chartColors.purple
    ];
    
    charts.assetChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide default legend, we'll create custom one
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = formatCurrency(context.raw);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Create custom legend
    createAssetLegend(labels, data, colors, total);
    
    // Show historical comparison
    showAssetAllocationChange();
}

// Create custom asset legend
function createAssetLegend(labels, data, colors, total) {
    const legendContainer = document.getElementById('assetLegend');
    
    let legendHTML = '<h4 style="margin-bottom: 1rem;">Asset Breakdown</h4>';
    
    labels.forEach((label, index) => {
        const value = data[index];
        const percentage = ((value / total) * 100).toFixed(1);
        
        legendHTML += `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; padding: 0.5rem; background: #f8fafc; border-radius: 0.5rem;">
                <div style="display: flex; align-items: center;">
                    <div style="width: 16px; height: 16px; background: ${colors[index]}; border-radius: 3px; margin-right: 0.75rem;"></div>
                    <span style="font-weight: 500;">${label}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--text-primary);">${formatCurrency(value)}</div>
                    <small style="color: var(--text-secondary);">${percentage}%</small>
                </div>
            </div>
        `;
    });
    
    legendContainer.innerHTML = legendHTML;
}

// Show asset allocation change from last snapshot
function showAssetAllocationChange() {
    const snapshots = JSON.parse(localStorage.getItem('historicalSnapshots') || '[]');
    const changeContainer = document.getElementById('assetAllocationChange');
    
    if (snapshots.length < 2) {
        changeContainer.innerHTML = '<i class="fas fa-info-circle"></i> Save snapshots to track changes over time';
        return;
    }
    
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    
    const currentTotal = latest.data.totalAssets;
    const previousTotal = previous.data.totalAssets;
    const change = currentTotal - previousTotal;
    const percentChange = previousTotal !== 0 ? (change / previousTotal) * 100 : 0;
    
    const isPositive = change > 0;
    const changeColor = isPositive ? 'var(--success-color)' : 'var(--error-color)';
    const changeIcon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    
    changeContainer.innerHTML = `
        <i class="fas ${changeIcon}" style="color: ${changeColor};"></i>
        <span style="color: ${changeColor}; font-weight: 600;">
            ${isPositive ? '+' : ''}${formatCurrency(change)} (${isPositive ? '+' : ''}${percentChange.toFixed(1)}%)
        </span>
        since ${new Date(previous.date).toLocaleDateString()}
    `;
}

// Create liability chart
function createLiabilityChart() {
    const liabilities = dashboardData.netWorth.liabilities || [];
    
    if (liabilities.length === 0) {
        document.getElementById('liabilitySection').style.display = 'none';
        return;
    }
    
    document.getElementById('liabilitySection').style.display = 'block';
    
    const ctx = document.getElementById('liabilityChart').getContext('2d');
    
    // Group liabilities by type
    const liabilityGroups = {};
    liabilities.forEach(liability => {
        const type = formatCategoryName(liability.type || 'other');
        if (!liabilityGroups[type]) {
            liabilityGroups[type] = 0;
        }
        liabilityGroups[type] += liability.amount || 0;
    });
    
    const labels = Object.keys(liabilityGroups);
    const data = Object.values(liabilityGroups);
    const total = data.reduce((sum, value) => sum + value, 0);
    
    if (total === 0) {
        document.getElementById('liabilitySection').style.display = 'none';
        return;
    }
    
    const colors = [
        chartColors.danger,
        chartColors.warning,
        chartColors.info,
        chartColors.purple,
        chartColors.primary
    ];
    
    charts.liabilityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = formatCurrency(context.raw);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Create custom legend
    createLiabilityLegend(labels, data, colors, total);
    
    // Show historical comparison
    showLiabilityChange();
}

// Create custom liability legend
function createLiabilityLegend(labels, data, colors, total) {
    const legendContainer = document.getElementById('liabilityLegend');
    
    let legendHTML = '<h4 style="margin-bottom: 1rem;">Liability Breakdown</h4>';
    
    labels.forEach((label, index) => {
        const value = data[index];
        const percentage = ((value / total) * 100).toFixed(1);
        
        legendHTML += `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; padding: 0.5rem; background: #fef2f2; border-radius: 0.5rem;">
                <div style="display: flex; align-items: center;">
                    <div style="width: 16px; height: 16px; background: ${colors[index]}; border-radius: 3px; margin-right: 0.75rem;"></div>
                    <span style="font-weight: 500;">${label}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--text-primary);">${formatCurrency(value)}</div>
                    <small style="color: var(--text-secondary);">${percentage}%</small>
                </div>
            </div>
        `;
    });
    
    legendContainer.innerHTML = legendHTML;
}

// Show liability change from last snapshot
function showLiabilityChange() {
    const snapshots = JSON.parse(localStorage.getItem('historicalSnapshots') || '[]');
    const changeContainer = document.getElementById('liabilityChange');
    
    if (snapshots.length < 2) {
        changeContainer.innerHTML = '<i class="fas fa-info-circle"></i> Save snapshots to track changes over time';
        return;
    }
    
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    
    const currentTotal = latest.data.totalLiabilities;
    const previousTotal = previous.data.totalLiabilities;
    const change = currentTotal - previousTotal;
    const percentChange = previousTotal !== 0 ? (change / previousTotal) * 100 : 0;
    
    const isPositive = change > 0;
    const changeColor = isPositive ? 'var(--error-color)' : 'var(--success-color)'; // Reversed for liabilities
    const changeIcon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    
    changeContainer.innerHTML = `
        <i class="fas ${changeIcon}" style="color: ${changeColor};"></i>
        <span style="color: ${changeColor}; font-weight: 600;">
            ${isPositive ? '+' : ''}${formatCurrency(change)} (${isPositive ? '+' : ''}${percentChange.toFixed(1)}%)
        </span>
        since ${new Date(previous.date).toLocaleDateString()}
    `;
}

// Create income vs expense chart (horizontal bar)
function createIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    const monthlyIncome = (dashboardData.income.totals?.annualTotal || 0) / 12;
    const monthlyExpenses = (dashboardData.expenses.totals?.annualTotal || 0) / 12;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    
    charts.incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses', 'Savings'],
            datasets: [{
                data: [monthlyIncome, monthlyExpenses, monthlySavings],
                backgroundColor: [
                    chartColors.success,
                    chartColors.danger,
                    monthlySavings >= 0 ? chartColors.primary : chartColors.warning
                ],
                borderWidth: 0,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y', // This makes it horizontal
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value / 1000).toFixed(0) + 'K';
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.x;
                            const percentage = monthlyIncome > 0 ? ((value / monthlyIncome) * 100).toFixed(1) + '%' : '0%';
                            return `${context.label}: ${formatCurrency(value)} (${percentage})`;
                        }
                    }
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            }
        }
    });
}

// Create income chart with enhanced legend
function createIncomeChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    // Try multiple data structure possibilities
    const incomeData = dashboardData.income?.income || dashboardData.income?.sources || dashboardData.income?.categories || {};
    const data = [];
    const labels = [];
    
    console.log('Income data structure:', incomeData); // Debug log
    
    Object.keys(incomeData).forEach(category => {
        if (Array.isArray(incomeData[category])) {
            const monthlyTotal = incomeData[category].reduce((sum, item) => {
                const amount = item.amount || 0;
                const frequency = item.frequency || 'monthly';
                return sum + convertToMonthly(amount, frequency);
            }, 0);
            
            if (monthlyTotal > 0) {
                data.push(monthlyTotal);
                labels.push(formatCategoryName(category));
            }
        }
    });
    
    const total = data.reduce((sum, value) => sum + value, 0);
    
    if (total === 0) {
        // Show message instead of hiding
        const chartContainer = ctx.canvas.parentElement;
        chartContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);"><i class="fas fa-chart-pie" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i><p>No income data available</p></div>';
        return;
    }
    
    const colors = [
        chartColors.success,
        chartColors.primary,
        chartColors.info,
        chartColors.warning,
        chartColors.purple
    ];
    
    charts.incomeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const dataset = data.datasets[0];
                                const total = dataset.data.reduce((sum, value) => sum + value, 0);
                                
                                return data.labels.map((label, i) => {
                                    const value = dataset.data[i];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    
                                    return {
                                        text: `${label}: ${percentage}%`,
                                        fillStyle: dataset.backgroundColor[i],
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: dataset.borderWidth,
                                        hidden: isNaN(value) || chart.getDatasetMeta(0).data[i].hidden,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = formatCurrency(context.raw);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${value}/month (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create expense chart with enhanced legend
function createExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Try multiple data structure possibilities
    const expenseData = dashboardData.expenses?.expenses || dashboardData.expenses?.categories || dashboardData.expenses?.sources || {};
    const data = [];
    const labels = [];
    
    console.log('Expense data structure:', expenseData); // Debug log
    
    Object.keys(expenseData).forEach(category => {
        if (Array.isArray(expenseData[category])) {
            const monthlyTotal = expenseData[category].reduce((sum, item) => {
                const amount = item.amount || 0;
                const frequency = item.frequency || 'monthly';
                return sum + convertToMonthly(amount, frequency);
            }, 0);
            
            if (monthlyTotal > 0) {
                data.push(monthlyTotal);
                labels.push(formatCategoryName(category));
            }
        }
    });
    
    const total = data.reduce((sum, value) => sum + value, 0);
    
    if (total === 0) {
        // Show message instead of hiding
        const chartContainer = ctx.canvas.parentElement;
        chartContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);"><i class="fas fa-chart-pie" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i><p>No expense data available</p></div>';
        return;
    }
    
    const colors = [
        chartColors.danger,
        chartColors.warning,
        chartColors.info,
        chartColors.purple,
        chartColors.primary
    ];
    
    charts.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const dataset = data.datasets[0];
                                const total = dataset.data.reduce((sum, value) => sum + value, 0);
                                
                                return data.labels.map((label, i) => {
                                    const value = dataset.data[i];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    
                                    return {
                                        text: `${label}: ${percentage}%`,
                                        fillStyle: dataset.backgroundColor[i],
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: dataset.borderWidth,
                                        hidden: isNaN(value) || chart.getDatasetMeta(0).data[i].hidden,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = formatCurrency(context.raw);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${value}/month (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create allocation comparison charts
function createAllocationCharts() {
    // Current allocation chart
    const currentCtx = document.getElementById('currentAllocationChart').getContext('2d');
    const currentAllocation = calculateCurrentAllocation();
    
    charts.currentAllocationChart = new Chart(currentCtx, {
        type: 'doughnut',
        data: createAllocationChartData(currentAllocation),
        options: getAllocationChartOptions()
    });
    
    // Recommended allocation chart
    const recommendedCtx = document.getElementById('recommendedAllocationChart').getContext('2d');
    const recommendedAllocation = dashboardData.riskProfile.assetAllocation || {};
    
    charts.recommendedAllocationChart = new Chart(recommendedCtx, {
        type: 'doughnut',
        data: createAllocationChartData(recommendedAllocation),
        options: getAllocationChartOptions()
    });
}

// Calculate current allocation from net worth data
function calculateCurrentAllocation() {
    const netWorthData = dashboardData.netWorth;
    let totalAssets = 0;
    let categoryTotals = {
        equity: 0,
        fixedIncome: 0,
        realEstate: 0,
        otherAssets: 0
    };
    
    // Calculate category totals from assets data
    if (netWorthData.assets) {
        Object.keys(netWorthData.assets).forEach(category => {
            if (Array.isArray(netWorthData.assets[category])) {
                const categoryTotal = netWorthData.assets[category].reduce((sum, asset) => {
                    return sum + (asset.value || 0);
                }, 0);
                
                categoryTotals[category] = categoryTotal;
                totalAssets += categoryTotal;
            }
        });
    }
    
    // Prevent division by zero
    if (totalAssets === 0) {
        return {
            equity: 0,
            debt: 0,
            gold: 0,
            reits: 0,
            cash: 0
        };
    }
    
    return {
        equity: ((categoryTotals.equity || 0) / totalAssets) * 100,
        debt: ((categoryTotals.fixedIncome || 0) / totalAssets) * 100,
        gold: 0, // Not tracked separately in our model
        reits: ((categoryTotals.realEstate || 0) / totalAssets) * 100,
        cash: ((categoryTotals.otherAssets || 0) / totalAssets) * 100
    };
}

// Create allocation chart data
function createAllocationChartData(allocation) {
    return {
        labels: ['Equity', 'Fixed Income', 'Gold', 'REITs', 'Cash'],
        datasets: [{
            data: [
                allocation.equity || 0,
                allocation.debt || 0,
                allocation.gold || 0,
                allocation.reits || 0,
                allocation.cash || 0
            ],
            backgroundColor: [
                chartColors.success,
                chartColors.primary,
                chartColors.warning,
                chartColors.purple,
                chartColors.info
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
}

// Get allocation chart options with enhanced legend
function getAllocationChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            const dataset = data.datasets[0];
                            const total = dataset.data.reduce((sum, value) => sum + value, 0);
                            
                            return data.labels.map((label, i) => {
                                const value = dataset.data[i];
                                const percentage = value ? value.toFixed(1) : '0.0';
                                
                                return {
                                    text: `${label}: ${percentage}%`,
                                    fillStyle: dataset.backgroundColor[i],
                                    strokeStyle: dataset.borderColor,
                                    lineWidth: dataset.borderWidth,
                                    hidden: isNaN(value) || chart.getDatasetMeta(0).data[i].hidden,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw.toFixed(1)}%`;
                    }
                }
            }
        }
    };
}

// Create financial timeline chart
function createTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    
    const currentNetWorth = dashboardData.netWorth?.totals?.netWorth || 0;
    const annualExpenses = dashboardData.expenses?.totals?.annualTotal || 0;
    const growthRate = dashboardData.ffScore?.assetGrowthRate || 8;
    const inflationRate = dashboardData.ffScore?.inflationRate || 6;
    
    // If no data available, show message
    if (currentNetWorth === 0 && annualExpenses === 0) {
        const chartContainer = ctx.canvas.parentElement;
        chartContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);"><i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i><p>Complete your financial data to see timeline projection</p></div>';
        return;
    }
    
    // Project net worth over 30 years
    const years = [];
    const projectedNetWorth = [];
    const projectedExpenses = [];
    
    let netWorth = Math.max(currentNetWorth, 100000); // Minimum starting point
    let expenses = Math.max(annualExpenses, 300000); // Minimum expenses assumption
    
    for (let i = 0; i <= 30; i++) {
        years.push(new Date().getFullYear() + i);
        projectedNetWorth.push(netWorth);
        projectedExpenses.push(expenses * 25); // 25x expenses for FI target
        
        netWorth = netWorth * (1 + growthRate / 100);
        expenses = expenses * (1 + inflationRate / 100);
    }
    
    charts.timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Projected Net Worth',
                data: projectedNetWorth,
                borderColor: chartColors.success,
                backgroundColor: chartColors.success + '20',
                fill: true,
                tension: 0.1
            }, {
                label: 'FI Target (25x Expenses)',
                data: projectedExpenses,
                borderColor: chartColors.warning,
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value / 100000).toFixed(0) + 'L';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Generate action items
function generateActionItems() {
    const actionItems = [];
    
    // Based on FF Score
    const ffScore = dashboardData.ffScore.currentScore || 0;
    if (ffScore < 10) {
        actionItems.push({
            priority: 'high',
            icon: '🚨',
            title: 'Build Emergency Fund',
            description: 'Your current savings can only last ' + ffScore + ' years. Focus on building an emergency fund first.',
            category: 'Emergency Planning'
        });
    }
    
    // Based on savings rate
    const annualIncome = dashboardData.income.totals?.annualTotal || 0;
    const annualExpenses = dashboardData.expenses.totals?.annualTotal || 0;
    const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
    
    if (savingsRate < 15) {
        actionItems.push({
            priority: 'high',
            icon: '💰',
            title: 'Increase Savings Rate',
            description: `Your savings rate is ${Math.round(savingsRate)}%. Aim for at least 20% to build wealth effectively.`,
            category: 'Savings Strategy'
        });
    }
    
    // Based on life insurance
    const lifeInsuranceRatio = dashboardData.insurance.analysis?.lifeInsuranceRatio || 0;
    if (lifeInsuranceRatio < 8) {
        actionItems.push({
            priority: 'medium',
            icon: '🛡️',
            title: 'Increase Life Insurance',
            description: `Your life insurance is ${lifeInsuranceRatio.toFixed(1)}x income. Consider increasing to 10-15x.`,
            category: 'Risk Management'
        });
    }
    
    // Based on asset allocation
    const currentAllocation = calculateCurrentAllocation();
    const recommendedAllocation = dashboardData.riskProfile.assetAllocation || {};
    
    if (Math.abs(currentAllocation.equity - (recommendedAllocation.equity || 0)) > 15) {
        actionItems.push({
            priority: 'medium',
            icon: '📊',
            title: 'Rebalance Portfolio',
            description: 'Your current asset allocation differs significantly from your recommended allocation.',
            category: 'Portfolio Management'
        });
    }
    
    // If no issues, provide positive reinforcement
    if (actionItems.length === 0) {
        actionItems.push({
            priority: 'low',
            icon: '✅',
            title: 'Excellent Financial Health!',
            description: 'Your financial situation looks good. Continue monitoring and reviewing regularly.',
            category: 'Maintenance'
        });
    }
    
    // Render action items
    const actionItemsContainer = document.getElementById('actionItems');
    actionItemsContainer.innerHTML = actionItems.map(item => `
        <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${getPriorityColor(item.priority)};">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 0.5rem;">
                            <span style="margin-right: 0.5rem;">${item.icon}</span>
                            ${item.title}
                        </h4>
                        <p style="margin-bottom: 0.5rem; color: var(--text-secondary);">${item.description}</p>
                        <span class="badge" style="background: ${getPriorityColor(item.priority)}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                            ${item.category}
                        </span>
                    </div>
                    <span class="priority-badge" style="background: ${getPriorityColor(item.priority)}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; text-transform: uppercase;">
                        ${item.priority}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Get priority color
function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'var(--danger-color)';
        case 'medium': return 'var(--warning-color)';
        case 'low': return 'var(--success-color)';
        default: return 'var(--info-color)';
    }
}

// Format category name
function formatCategoryName(category) {
    const names = {
        // Asset categories
        realEstate: 'Real Estate',
        cash: 'Cash & Bank',
        equity: 'Equity',
        fixedIncome: 'Fixed Income',
        otherAssets: 'Other Assets',
        gold: 'Gold',
        crypto: 'Cryptocurrency',
        // Liability categories
        home: 'Home Loan',
        car: 'Car Loan',
        personal: 'Personal Loan',
        credit: 'Credit Card',
        business: 'Business Loan',
        other: 'Other',
        // Income categories
        salary: 'Salary & Pension',
        rental: 'Rental Income',
        dividend: 'Dividend Income',
        interest: 'Interest Income',
        otherIncome: 'Other Income',
        // Expense categories
        monthlyRecurring: 'Monthly Recurring',
        annualRecurring: 'Annual Recurring',
        bigExpenses: 'Big Expenses'
    };
    return names[category] || category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

// Download report functionality - Beautiful PDF with all data
async function downloadReport() {
    try {
        showStatus('Generating comprehensive financial report...', 'info');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Get all data using correct keys
        const allData = {
            personalInfo: Storage.get('personalInfo', {}),
            netWorth: Storage.get('netWorthData', {}),
            income: Storage.get('incomeData', {}),
            expenses: Storage.get('expenseData', {}),
            ffScore: Storage.get('ffScoreData', {}),
            insurance: Storage.get('insuranceData', {}),
            riskProfile: Storage.get('riskProfileData', {})
        };
        
        const user = firebase.auth().currentUser;
        const currentDate = new Date().toLocaleDateString('en-IN');
        const currentTime = new Date().toLocaleTimeString('en-IN');
        
        // Page dimensions
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 15;
        const contentWidth = pageWidth - (2 * margin);
        
        let yPosition = margin;
        
        // Modern Header with gradient effect
        pdf.setFillColor(37, 99, 235); // Primary blue
        pdf.rect(0, 0, pageWidth, 50, 'F');
        
        // Add subtle gradient effect with lighter blue
        pdf.setFillColor(59, 130, 246);
        pdf.rect(0, 35, pageWidth, 15, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.text('NIVEZO', margin, 25);
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Personal Financial Report', margin, 40);
        
        // Add report metadata in header
        pdf.setFontSize(10);
        pdf.text(`Generated: ${currentDate} at ${currentTime}`, pageWidth - margin - 60, 25);
        pdf.text(`For: ${user?.email || 'User'}`, pageWidth - margin - 60, 35);
        
        yPosition = 65;
        
        // Personal Information Card
        pdf.setFillColor(248, 250, 252); // Light gray background
        pdf.rect(margin, yPosition, contentWidth, 35, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(margin, yPosition, contentWidth, 35, 'S');
        
        yPosition += 8;
        pdf.setTextColor(37, 99, 235);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('👤 Personal Information', margin + 5, yPosition);
        
        yPosition += 8;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const personalName = allData.personalInfo.firstName ? 
            `${allData.personalInfo.firstName} ${allData.personalInfo.lastName || ''}`.trim() : 
            'Not provided';
        const personalAge = allData.personalInfo.age || calculateAge(allData.personalInfo.dateOfBirth) || 'Not provided';
        const dependentsCount = allData.personalInfo.dependents ? allData.personalInfo.dependents.length : 0;
        
        pdf.text(`Name: ${personalName}`, margin + 5, yPosition);
        pdf.text(`Age: ${personalAge} years`, margin + 100, yPosition);
        yPosition += 5;
        pdf.text(`Email: ${user?.email || 'Not provided'}`, margin + 5, yPosition);
        pdf.text(`Dependents: ${dependentsCount}`, margin + 100, yPosition);
        yPosition += 5;
        pdf.text(`Marital Status: ${allData.personalInfo.maritalStatus || 'Not provided'}`, margin + 5, yPosition);
        
        yPosition += 15;
        
        // Executive Summary with better formatting
        pdf.setFillColor(37, 99, 235);
        pdf.rect(margin, yPosition, contentWidth, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📊 FINANCIAL OVERVIEW', margin + 5, yPosition + 6);
        
        yPosition += 15;
        
        // Key metrics in a professional table format
        const netWorth = allData.netWorth.totals?.netWorth || 0;
        const annualIncome = allData.income.totals?.annualTotal || 0;
        const annualExpenses = allData.expenses.totals?.annualTotal || 0;
        const ffScore = allData.ffScore.currentScore || allData.ffScore.score || 0;
        const riskProfile = allData.riskProfile.riskProfile || allData.riskProfile.category || 'Not Assessed';
        const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome * 100).toFixed(1) : 0;
        
        // Create professional summary cards
        const summaryCards = [
            { label: 'Net Worth', value: formatCurrency(netWorth), icon: '💰', color: [34, 197, 94] },
            { label: 'Annual Income', value: formatCurrency(annualIncome), icon: '📈', color: [59, 130, 246] },
            { label: 'Annual Expenses', value: formatCurrency(annualExpenses), icon: '💸', color: [239, 68, 68] },
            { label: 'Savings Rate', value: `${savingsRate}%`, icon: '🎯', color: [168, 85, 247] },
            { label: 'FF Score', value: `${ffScore} years`, icon: '🏆', color: [245, 158, 11] },
            { label: 'Risk Profile', value: riskProfile, icon: '⚖️', color: [107, 114, 128] }
        ];
        
        let cardX = margin;
        let cardY = yPosition;
        const cardWidth = (contentWidth - 10) / 2;
        const cardHeight = 20;
        
        summaryCards.forEach((card, index) => {
            if (index % 2 === 0 && index > 0) {
                cardY += cardHeight + 5;
                cardX = margin;
            } else if (index % 2 === 1) {
                cardX = margin + cardWidth + 5;
            }
            
            // Card background
            pdf.setFillColor(card.color[0], card.color[1], card.color[2]);
            pdf.rect(cardX, cardY, cardWidth, cardHeight, 'F');
            
            // Card content
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${card.icon} ${card.label}`, cardX + 3, cardY + 8);
            pdf.setFont('helvetica', 'normal');
            pdf.text(card.value, cardX + 3, cardY + 15);
        });
        
        yPosition = cardY + cardHeight + 20;
        
        // Personal Information Section
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('1. Personal Information', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        const personalData = [
            ['Full Name', allData.personalInfo.fullName || 'Not provided'],
            ['Email', allData.personalInfo.email || user?.email || 'Not provided'],
            ['Phone', allData.personalInfo.phone || 'Not provided'],
            ['Date of Birth', allData.personalInfo.dateOfBirth || 'Not provided'],
            ['Age', `${allData.personalInfo.age || 'Not provided'} years`],
            ['Marital Status', allData.personalInfo.maritalStatus || 'Not provided'],
            ['Dependents', allData.personalInfo.dependents || 'Not provided'],
            ['Occupation', allData.personalInfo.occupation || 'Not provided'],
            ['Annual Income', formatCurrency(allData.personalInfo.annualIncome || 0)],
            ['City', allData.personalInfo.city || 'Not provided'],
            ['Financial Goals', allData.personalInfo.financialGoals || 'Not provided']
        ];
        
        personalData.forEach(([label, value]) => {
            if (yPosition > 270) {
                pdf.addPage();
                yPosition = margin;
            }
            pdf.setFont('helvetica', 'bold');
            pdf.text(label + ':', margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value.toString(), margin + 50, yPosition);
            yPosition += 6;
        });
        
        // Net Worth Section
        yPosition += 10;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('2. Net Worth Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        // Assets breakdown
        pdf.setFont('helvetica', 'bold');
        pdf.text('Assets:', margin, yPosition);
        yPosition += 8;
        
        if (allData.netWorth.assets) {
            Object.keys(allData.netWorth.assets).forEach(category => {
                const assets = allData.netWorth.assets[category];
                if (Array.isArray(assets) && assets.length > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`  ${formatCategoryName(category)}:`, margin + 5, yPosition);
                    yPosition += 6;
                    
                    assets.forEach(asset => {
                        if (yPosition > 280) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`    • ${asset.description || 'Asset'}: ${formatCurrency(asset.value || 0)}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                    yPosition += 3;
                }
            });
        }
        
        // Liabilities breakdown
        yPosition += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Liabilities:', margin, yPosition);
        yPosition += 8;
        
        if (allData.netWorth.liabilities) {
            Object.keys(allData.netWorth.liabilities).forEach(category => {
                const liabilities = allData.netWorth.liabilities[category];
                if (Array.isArray(liabilities) && liabilities.length > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`  ${formatCategoryName(category)}:`, margin + 5, yPosition);
                    yPosition += 6;
                    
                    liabilities.forEach(liability => {
                        if (yPosition > 280) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`    • ${liability.description || 'Liability'}: ${formatCurrency(liability.value || 0)}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                    yPosition += 3;
                }
            });
        }
        
        // Income Section
        yPosition += 10;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('3. Income Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        
        if (allData.income.sources) {
            Object.keys(allData.income.sources).forEach(category => {
                const sources = allData.income.sources[category];
                if (Array.isArray(sources) && sources.length > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`${formatCategoryName(category)}:`, margin, yPosition);
                    yPosition += 8;
                    
                    sources.forEach(source => {
                        if (yPosition > 280) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`  • ${source.description || 'Income'}: ${formatCurrency(source.monthlyAmount || 0)}/month`, margin + 5, yPosition);
                        yPosition += 5;
                    });
                    yPosition += 5;
                }
            });
        }
        
        // Expenses Section
        yPosition += 10;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('4. Expense Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        
        if (allData.expenses.categories) {
            Object.keys(allData.expenses.categories).forEach(category => {
                const expenses = allData.expenses.categories[category];
                if (Array.isArray(expenses) && expenses.length > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`${formatCategoryName(category)}:`, margin, yPosition);
                    yPosition += 8;
                    
                    expenses.forEach(expense => {
                        if (yPosition > 280) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`  • ${expense.description || 'Expense'}: ${formatCurrency(expense.monthlyAmount || 0)}/month`, margin + 5, yPosition);
                        yPosition += 5;
                    });
                    yPosition += 5;
                }
            });
        }
        
        // Financial Health Analytics Section
        yPosition += 10;
        if (yPosition > 200) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFillColor(34, 197, 94);
        pdf.rect(margin, yPosition, contentWidth, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('💚 FINANCIAL HEALTH ANALYTICS', margin + 5, yPosition + 6);
        
        yPosition += 20;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        
        // Calculate health metrics
        const monthlyIncome = annualIncome / 12;
        const monthlyExpenses = annualExpenses / 12;
        const emergencyFund = calculateCategoryTotal('cash');
        const emergencyFundMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
        const totalLiabilities = allData.netWorth.totals?.totalLiabilities || 0;
        const debtToIncomeRatio = annualIncome > 0 ? (totalLiabilities / annualIncome) * 100 : 0;
        const investmentRate = calculateTotalRecurringInvestments();
        const investmentRatePercent = monthlyIncome > 0 ? (investmentRate / monthlyIncome) * 100 : 0;
        
        const healthMetrics = [
            { label: 'Savings Rate', value: `${savingsRate}%`, status: savingsRate >= 20 ? 'Excellent' : savingsRate >= 15 ? 'Good' : 'Needs Improvement' },
            { label: 'Emergency Fund', value: `${emergencyFundMonths.toFixed(1)} months`, status: emergencyFundMonths >= 6 ? 'Excellent' : emergencyFundMonths >= 3 ? 'Good' : 'Needs Improvement' },
            { label: 'Debt-to-Income Ratio', value: `${debtToIncomeRatio.toFixed(1)}%`, status: debtToIncomeRatio <= 20 ? 'Excellent' : debtToIncomeRatio <= 40 ? 'Good' : 'Needs Improvement' },
            { label: 'Investment Rate', value: `${investmentRatePercent.toFixed(1)}%`, status: investmentRatePercent >= 25 ? 'Excellent' : investmentRatePercent >= 15 ? 'Good' : 'Needs Improvement' }
        ];
        
        healthMetrics.forEach(metric => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${metric.label}:`, margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(metric.value, margin + 60, yPosition);
            
            // Status color coding
            const statusColor = metric.status === 'Excellent' ? [34, 197, 94] : 
                               metric.status === 'Good' ? [245, 158, 11] : [239, 68, 68];
            pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
            pdf.text(`(${metric.status})`, margin + 100, yPosition);
            pdf.setTextColor(0, 0, 0);
            
            yPosition += 8;
        });
        
        // Insurance Analysis
        yPosition += 15;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFillColor(168, 85, 247);
        pdf.rect(margin, yPosition, contentWidth, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🛡️ INSURANCE ANALYSIS', margin + 5, yPosition + 6);
        
        yPosition += 20;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        
        const lifeInsurance = allData.insurance.totalLifeInsurance || 0;
        const healthInsurance = allData.insurance.totalHealthInsurance || 0;
        const lifeInsuranceRatio = annualIncome > 0 ? lifeInsurance / annualIncome : 0;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Life Insurance Coverage: ${formatCurrency(lifeInsurance)} (${lifeInsuranceRatio.toFixed(1)}x income)`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Health Insurance Coverage: ${formatCurrency(healthInsurance)}`, margin, yPosition);
        yPosition += 6;
        
        const insuranceStatus = lifeInsuranceRatio >= 10 ? 'Excellent' : lifeInsuranceRatio >= 5 ? 'Good' : 'Needs Improvement';
        const insuranceColor = insuranceStatus === 'Excellent' ? [34, 197, 94] : 
                              insuranceStatus === 'Good' ? [245, 158, 11] : [239, 68, 68];
        pdf.setTextColor(insuranceColor[0], insuranceColor[1], insuranceColor[2]);
        pdf.text(`Insurance Status: ${insuranceStatus}`, margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        
        // Footer
        yPosition += 30;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPosition, contentWidth, 25, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(margin, yPosition, contentWidth, 25, 'S');
        
        yPosition += 8;
        pdf.setTextColor(37, 99, 235);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📋 Report Summary', margin + 5, yPosition);
        
        yPosition += 8;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`This comprehensive financial report was generated on ${currentDate} at ${currentTime}.`, margin + 5, yPosition);
        yPosition += 4;
        pdf.text(`All data is based on information provided by the user and current market assumptions.`, margin + 5, yPosition);
        yPosition += 4;
        pdf.text(`For personalized financial advice, please consult with a qualified financial advisor.`, margin + 5, yPosition);
        
        // Save the PDF
        const fileName = `Nivezo_Financial_Report_${currentDate.replace(/\//g, '-')}.pdf`;
        pdf.save(fileName);
        
        showStatus('Financial report downloaded successfully!', 'success');
        
         } catch (error) {
         console.error('Error generating report:', error);
         showStatus('Error generating report. Please try again.', 'error');
     }
 }
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('4. Expense Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        
        if (allData.expenses.categories) {
            Object.keys(allData.expenses.categories).forEach(category => {
                const expenses = allData.expenses.categories[category];
                if (Array.isArray(expenses) && expenses.length > 0) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`${formatCategoryName(category)}:`, margin, yPosition);
                    yPosition += 8;
                    
                    expenses.forEach(expense => {
                        if (yPosition > 280) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`  • ${expense.description || 'Expense'}: ${formatCurrency(expense.monthlyAmount || 0)}/month`, margin + 5, yPosition);
                        yPosition += 5;
                    });
                    yPosition += 5;
                }
            });
        }
        
        // FF Score Section
        yPosition += 5;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('5. Financial Freedom Score Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        const ffData = [
            ['Current FF Score', `${ffScore} years`],
            ['Asset Growth Rate', `${allData.ffScore.assetGrowthRate || 8}% per annum`],
            ['Inflation Rate', `${allData.ffScore.inflationRate || 6}% per annum`],
            ['Monthly Surplus', formatCurrency((annualIncome - annualExpenses) / 12)],
            ['Years to Financial Freedom', `${allData.ffScore.yearsToFI || 'Not calculated'} years`]
        ];
        
        ffData.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label + ':', margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 60, yPosition);
            yPosition += 8;
        });
        
        // Insurance Section
        yPosition += 10;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('6. Insurance Analysis', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        const insuranceData = [
            ['Life Insurance Coverage', formatCurrency(allData.insurance.lifeInsurance?.coverageAmount || 0)],
            ['Life Insurance Premium', formatCurrency(allData.insurance.lifeInsurance?.annualPremium || 0)],
            ['Health Insurance Coverage', formatCurrency(allData.insurance.healthInsurance?.coverageAmount || 0)],
            ['Health Insurance Premium', formatCurrency(allData.insurance.healthInsurance?.annualPremium || 0)],
            ['Life Insurance Ratio', `${(allData.insurance.analysis?.lifeInsuranceRatio || 0).toFixed(1)}x of annual income`],
            ['Total Annual Premium', formatCurrency((allData.insurance.lifeInsurance?.annualPremium || 0) + (allData.insurance.healthInsurance?.annualPremium || 0))]
        ];
        
        insuranceData.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label + ':', margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 60, yPosition);
            yPosition += 8;
        });
        
        // Risk Profile Section
        yPosition += 10;
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = margin;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text('7. Risk Profile Assessment', margin, yPosition);
        yPosition += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        const riskData = [
            ['Risk Score', `${allData.riskProfile.totalScore || 0}/32`],
            ['Risk Profile', riskProfile],
            ['Investment Horizon', 'Based on questionnaire responses'],
            ['Risk Tolerance', 'Assessed through 8-question survey']
        ];
        
        riskData.forEach(([label, value]) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(label + ':', margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 60, yPosition);
            yPosition += 8;
        });
        
        // Asset Allocation Recommendations
        if (allData.riskProfile.assetAllocation) {
            yPosition += 5;
            pdf.setFont('helvetica', 'bold');
            pdf.text('Recommended Asset Allocation:', margin, yPosition);
            yPosition += 8;
            
            Object.keys(allData.riskProfile.assetAllocation).forEach(asset => {
                pdf.setFont('helvetica', 'normal');
                pdf.text(`  • ${formatCategoryName(asset)}: ${allData.riskProfile.assetAllocation[asset]}%`, margin + 5, yPosition);
                yPosition += 6;
            });
        }
        
        // Footer
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
            pdf.text('Generated by Nivezo - Your Financial Journey Partner', margin, pageHeight - 10);
        }
        
        // Save the PDF
        const filename = `Nivezo_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);
        
        showStatus('Comprehensive financial report downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF report:', error);
        showStatus('Error generating report. Please try again.', 'error');
    }
}

// Navigation functions
function goBack() {
    window.location.href = 'risk-profile.html';
}

function goNext() {
    window.location.href = 'advisor.html';
}

// ===== CHART DESTRUCTION =====
// Clean up charts when navigating away
window.addEventListener('beforeunload', () => {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
});

// Display investment insights from risk profile
function displayInvestmentInsights() {
    const riskData = dashboardData.riskProfile || {};
    const insightsContainer = document.getElementById('investmentInsights');
    
    if (!riskData.riskProfile || !riskData.responses) {
        insightsContainer.innerHTML = `
            <div class="card" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                <h4>Complete Risk Assessment</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Complete your risk profile assessment to see personalized investment insights and recommendations.
                </p>
                <a href="risk-profile.html" class="btn btn-primary">
                    <i class="fas fa-balance-scale"></i> Take Risk Assessment
                </a>
            </div>
        `;
        return;
    }
    
    const insights = generateInvestmentInsights(riskData);
    
    insightsContainer.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div class="card" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: none;">
                <div class="card-body" style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${getRiskProfileEmoji(riskData.riskProfile)}</div>
                    <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Risk Profile: ${riskData.riskProfile}</h3>
                    <p style="color: var(--text-secondary);">Score: ${riskData.totalScore}/32</p>
                </div>
            </div>
        </div>
        
        ${insights.map(insight => `
            <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${getInsightColor(insight.type)};">
                <div class="card-body">
                    <h4 style="margin-bottom: 0.5rem;">
                        <span style="margin-right: 0.5rem;">${insight.icon}</span>
                        ${insight.title}
                    </h4>
                    <p style="margin-bottom: 0; color: var(--text-secondary);">${insight.description}</p>
                </div>
            </div>
        `).join('')}
    `;
}

// Generate investment insights based on risk profile
function generateInvestmentInsights(riskData) {
    const insights = [];
    const responses = riskData.responses || {};
    const riskProfile = riskData.riskProfile;
    
    // Age-based insights
    if (responses.age <= 2) {
        insights.push({
            icon: '⏰',
            title: 'Age Consideration',
            description: 'Given your age, consider shifting towards more conservative investments to preserve capital for retirement.',
            type: 'info'
        });
    } else if (responses.age >= 4) {
        insights.push({
            icon: '🚀',
            title: 'Young Investor Advantage',
            description: 'You have time on your side. Consider higher equity allocation for long-term wealth creation through compounding.',
            type: 'success'
        });
    }
    
    // Emergency fund insights
    if (responses.emergency <= 2) {
        insights.push({
            icon: '🚨',
            title: 'Build Emergency Fund First',
            description: 'Before investing in risky assets, ensure you have 6+ months of expenses in an emergency fund.',
            type: 'warning'
        });
    }
    
    // Investment horizon insights
    if (responses.horizon >= 3) {
        insights.push({
            icon: '📈',
            title: 'Long-term Investment Horizon',
            description: 'Your long investment horizon allows you to ride out market volatility and benefit from the power of compounding.',
            type: 'success'
        });
    }
    
    // Knowledge-based insights
    if (responses.knowledge <= 2) {
        insights.push({
            icon: '📚',
            title: 'Investment Education',
            description: 'Consider learning more about investing or consulting a financial advisor before making complex investment decisions.',
            type: 'info'
        });
    }
    
    // Risk-specific recommendations
    if (riskProfile === 'Conservative') {
        insights.push({
            icon: '🔒',
            title: 'Conservative Strategy',
            description: 'Focus on capital preservation with high-grade bonds, FDs, and blue-chip dividend-paying stocks.',
            type: 'info'
        });
    } else if (riskProfile === 'Aggressive') {
        insights.push({
            icon: '⚡',
            title: 'Aggressive Strategy',
            description: 'Consider growth stocks, small-cap funds, and emerging market investments, but ensure proper diversification.',
            type: 'warning'
        });
    } else if (riskProfile === 'Balanced') {
        insights.push({
            icon: '⚖️',
            title: 'Balanced Strategy',
            description: 'Mix growth and income investments. Consider systematic investment plans (SIPs) for regular equity investment.',
            type: 'success'
        });
    }
    
    // Income stability insights
    if (responses.income <= 2) {
        insights.push({
            icon: '💼',
            title: 'Income Stability',
            description: 'With variable income, maintain a larger emergency fund and avoid highly leveraged investments.',
            type: 'warning'
        });
    }
    
    // Asset allocation recommendation
    if (riskData.assetAllocation) {
        const allocation = riskData.assetAllocation;
        insights.push({
            icon: '📊',
            title: 'Recommended Asset Mix',
            description: `Based on your profile: ${allocation.equity}% Equity, ${allocation.debt}% Fixed Income, ${allocation.gold}% Gold, ${allocation.reits}% REITs, ${allocation.cash}% Cash.`,
            type: 'success'
        });
    }
    
    return insights;
}

// Get risk profile emoji
function getRiskProfileEmoji(riskProfile) {
    const emojis = {
        'Conservative': '🔒',
        'Risk Averse': '🛡️',
        'Balanced': '⚖️',
        'Aggressive': '🚀'
    };
    return emojis[riskProfile] || '📊';
}

// Get insight color based on type
function getInsightColor(type) {
    switch (type) {
        case 'success': return 'var(--success-color)';
        case 'warning': return 'var(--warning-color)';
        case 'info': return 'var(--info-color)';
        default: return 'var(--primary-color)';
    }
}

// ===== HISTORICAL SNAPSHOTS FUNCTIONALITY =====

// Initialize historical functionality
function initHistorical() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('snapshotDate').value = today;
    
    // Load and display existing snapshots
    loadHistoricalSnapshots();
}

// Save current financial snapshot
function saveSnapshot() {
    const date = document.getElementById('snapshotDate').value;
    const label = document.getElementById('snapshotLabel').value;
    
    if (!date) {
        showStatus('Please select a date for the snapshot', 'error');
        return;
    }
    
    // Collect current data
    const snapshot = {
        date: date,
        label: label || `Snapshot ${date}`,
        timestamp: Date.now(),
        data: {
            netWorth: dashboardData.netWorth?.totals?.netWorth || 0,
            totalAssets: dashboardData.netWorth?.totals?.totalAssets || 0,
            totalLiabilities: dashboardData.netWorth?.totals?.totalLiabilities || 0,
            liquidNetWorth: dashboardData.netWorth?.totals?.liquidNetWorth || 0,
            totalRecurringSavings: calculateTotalRecurringInvestments(),
            annualIncome: dashboardData.income?.totals?.annualTotal || 0,
            annualExpenses: dashboardData.expenses?.totals?.annualTotal || 0,
            ffScore: dashboardData.ffScore?.currentScore || dashboardData.ffScore?.score || 0,
            savingsRate: calculateCurrentSavingsRate(),
            // Asset breakdown
            assets: {
                realEstate: calculateCategoryTotal('realEstate'),
                equity: calculateCategoryTotal('equity'),  
                fixedIncome: calculateCategoryTotal('fixedIncome'),
                cash: calculateCategoryTotal('cash'),
                otherAssets: calculateCategoryTotal('otherAssets')
            },
            // Recurring investments breakdown
            recurringInvestments: {
                totalSIP: getTotalRecurringByCategory('sip'),
                totalRD: getTotalRecurringByCategory('rd'),
                totalOtherSavings: getTotalRecurringByCategory('otherSavings')
            }
        }
    };
    
    // Save to localStorage
    let snapshots = JSON.parse(localStorage.getItem('historicalSnapshots') || '[]');
    snapshots.push(snapshot);
    
    // Keep only last 20 snapshots to avoid storage issues
    if (snapshots.length > 20) {
        snapshots = snapshots.slice(-20);
    }
    
    localStorage.setItem('historicalSnapshots', JSON.stringify(snapshots));
    
    // Clear form
    document.getElementById('snapshotLabel').value = '';
    
    // Reload display
    loadHistoricalSnapshots();
    
    showStatus('Financial snapshot saved successfully!', 'success');
}

// Load and display historical snapshots
function loadHistoricalSnapshots() {
    const snapshots = JSON.parse(localStorage.getItem('historicalSnapshots') || '[]');
    const container = document.getElementById('historicalSnapshots');
    
    if (snapshots.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📈</div>
                <h4>No Historical Data Yet</h4>
                <p>Save your first financial snapshot to start tracking your progress over time.</p>
            </div>
        `;
        document.getElementById('comparisonCharts').style.display = 'none';
        return;
    }
    
    // Sort snapshots by date
    snapshots.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    container.innerHTML = `
        <h3 style="margin-bottom: 1rem;">Saved Snapshots (${snapshots.length})</h3>
        <div class="grid-3">
            ${snapshots.map((snapshot, index) => `
                <div class="card" style="position: relative;">
                    <button onclick="deleteSnapshot(${index})" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; cursor: pointer;" title="Delete snapshot">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="card-body">
                        <h4 style="margin-bottom: 0.5rem;">${snapshot.label}</h4>
                        <small style="color: var(--text-secondary);">${new Date(snapshot.date).toLocaleDateString()}</small>
                        <div style="margin-top: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span>Net Worth:</span>
                                <strong>₹${snapshot.data.netWorth.toLocaleString('en-IN')}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span>Income:</span>
                                <strong>₹${snapshot.data.annualIncome.toLocaleString('en-IN')}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span>Expenses:</span>
                                <strong>₹${snapshot.data.annualExpenses.toLocaleString('en-IN')}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span>Monthly SIP:</span>
                                <strong>₹${snapshot.data.totalRecurringSavings.toLocaleString('en-IN')}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>FF Score:</span>
                                <strong>${snapshot.data.ffScore} years</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${snapshots.length >= 2 ? `
            <div style="margin-top: 2rem;">
                <h4>Year-over-Year Comparison</h4>
                ${generateComparisonTable(snapshots)}
            </div>
        ` : ''}
    `;
    
    // Show comparison charts if we have multiple snapshots
    if (snapshots.length >= 2) {
        createComparisonCharts(snapshots);
        document.getElementById('comparisonCharts').style.display = 'block';
    }
}

// Generate comparison table
function generateComparisonTable(snapshots) {
    if (snapshots.length < 2) return '';
    
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    
    const comparisons = [
        {
            metric: 'Net Worth',
            current: latest.data.netWorth,
            previous: previous.data.netWorth,
            format: 'currency'
        },
        {
            metric: 'Annual Income',
            current: latest.data.annualIncome,
            previous: previous.data.annualIncome,
            format: 'currency'
        },
        {
            metric: 'Annual Expenses',
            current: latest.data.annualExpenses,
            previous: previous.data.annualExpenses,
            format: 'currency'
        },
        {
            metric: 'Monthly Recurring Savings',
            current: latest.data.totalRecurringSavings,
            previous: previous.data.totalRecurringSavings,
            format: 'currency'
        },
        {
            metric: 'FF Score',
            current: latest.data.ffScore,
            previous: previous.data.ffScore,
            format: 'number'
        }
    ];
    
    return `
        <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding: 1rem; text-align: left;">Metric</th>
                        <th style="padding: 1rem; text-align: right;">Previous (${new Date(previous.date).toLocaleDateString()})</th>
                        <th style="padding: 1rem; text-align: right;">Current (${new Date(latest.date).toLocaleDateString()})</th>
                        <th style="padding: 1rem; text-align: right;">Change</th>
                        <th style="padding: 1rem; text-align: right;">% Change</th>
                    </tr>
                </thead>
                <tbody>
                    ${comparisons.map(comp => {
                        const change = comp.current - comp.previous;
                        const percentChange = comp.previous !== 0 ? (change / comp.previous) * 100 : 0;
                        const isPositive = change > 0;
                        const changeColor = isPositive ? 'var(--success-color)' : 'var(--error-color)';
                        
                        return `
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 1rem; font-weight: 500;">${comp.metric}</td>
                                <td style="padding: 1rem; text-align: right;">
                                    ${comp.format === 'currency' ? '₹' + comp.previous.toLocaleString('en-IN') : comp.previous}
                                </td>
                                <td style="padding: 1rem; text-align: right;">
                                    ${comp.format === 'currency' ? '₹' + comp.current.toLocaleString('en-IN') : comp.current}
                                </td>
                                <td style="padding: 1rem; text-align: right; color: ${changeColor};">
                                    ${isPositive ? '+' : ''}${comp.format === 'currency' ? '₹' + change.toLocaleString('en-IN') : change}
                                </td>
                                <td style="padding: 1rem; text-align: right; color: ${changeColor};">
                                    ${isPositive ? '+' : ''}${percentChange.toFixed(1)}%
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Helper functions for calculating category totals
function calculateCategoryTotal(category) {
    const netWorthData = dashboardData.netWorth || {};
    const assets = netWorthData.assets || {};
    const categoryAssets = assets[category] || [];
    return categoryAssets.reduce((total, asset) => total + (asset.value || 0), 0);
}

function getTotalRecurringByCategory(category) {
    const netWorthData = dashboardData.netWorth || {};
    const recurringInvestments = netWorthData.recurringInvestments || {};
    const categoryInvestments = recurringInvestments[category] || [];
    
    return categoryInvestments.reduce((total, investment) => {
        const amount = investment.amount || 0;
        const frequency = investment.frequency || 'monthly';
        return total + convertToMonthly(amount, frequency);
    }, 0);
}

// Calculate total recurring investments
function calculateTotalRecurringInvestments() {
    const recurringInvestments = dashboardData.netWorth?.recurringInvestments || {};
    let total = 0;
    
    if (recurringInvestments.sip) {
        total += recurringInvestments.sip.reduce((sum, inv) => sum + convertToMonthly(inv.amount || 0, inv.frequency || 'monthly'), 0);
    }
    if (recurringInvestments.rd) {
        total += recurringInvestments.rd.reduce((sum, inv) => sum + convertToMonthly(inv.amount || 0, inv.frequency || 'monthly'), 0);
    }
    if (recurringInvestments.otherSavings) {
        total += recurringInvestments.otherSavings.reduce((sum, inv) => sum + convertToMonthly(inv.amount || 0, inv.frequency || 'monthly'), 0);
    }
    
    return total;
}

// Calculate current savings rate
function calculateCurrentSavingsRate() {
    const annualIncome = dashboardData.income?.totals?.annualTotal || 0;
    const annualExpenses = dashboardData.expenses?.totals?.annualTotal || 0;
    return annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0;
}

function convertToMonthly(amount, frequency) {
    switch(frequency) {
        case 'monthly': return amount;
        case 'quarterly': return amount / 3;
        case 'semi-annually': return amount / 6;
        case 'annually': return amount / 12;
        default: return amount;
    }
}

// Delete a snapshot
function deleteSnapshot(index) {
    if (confirm('Are you sure you want to delete this snapshot?')) {
        let snapshots = JSON.parse(localStorage.getItem('historicalSnapshots') || '[]');
        snapshots.splice(index, 1);
        localStorage.setItem('historicalSnapshots', JSON.stringify(snapshots));
        loadHistoricalSnapshots();
        showStatus('Snapshot deleted successfully', 'success');
    }
}

// Create comparison charts
function createComparisonCharts(snapshots) {
    // Net Worth Trend Chart
    const netWorthCtx = document.getElementById('netWorthTrendChart');
    if (netWorthCtx) {
        if (charts.netWorthTrendChart) {
            charts.netWorthTrendChart.destroy();
        }
        
        charts.netWorthTrendChart = new Chart(netWorthCtx, {
            type: 'line',
            data: {
                labels: snapshots.map(s => new Date(s.date).toLocaleDateString()),
                datasets: [{
                    label: 'Net Worth',
                    data: snapshots.map(s => s.data.netWorth),
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Income vs Expenses Trend Chart
    const incomeExpenseCtx = document.getElementById('incomeExpenseTrendChart');
    if (incomeExpenseCtx) {
        if (charts.incomeExpenseTrendChart) {
            charts.incomeExpenseTrendChart.destroy();
        }
        
        charts.incomeExpenseTrendChart = new Chart(incomeExpenseCtx, {
            type: 'line',
            data: {
                labels: snapshots.map(s => new Date(s.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Income',
                        data: snapshots.map(s => s.data.annualIncome),
                        borderColor: 'var(--success-color)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: snapshots.map(s => s.data.annualExpenses),
                        borderColor: 'var(--error-color)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
    }
} 
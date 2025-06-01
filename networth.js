document.addEventListener('DOMContentLoaded', function() {
    // Load saved values
    const savedValues = getFromLocalStorage('networthValues') || {};
    
    // Initialize custom assets and liabilities
    initCustomFields('customAssetsList', 'asset', savedValues.customAssets || []);
    initCustomFields('customLiabilitiesList', 'liability', savedValues.customLiabilities || []);
    
    // Set input values from saved data
    const inputs = {
        buildings: savedValues.buildings || '',
        buildingsYield: savedValues.buildingsYield || '',
        plots: savedValues.plots || '',
        plotsYield: savedValues.plotsYield || '',
        land: savedValues.land || '',
        landYield: savedValues.landYield || '',
        directEquity: savedValues.directEquity || '',
        directEquityYield: savedValues.directEquityYield || '',
        equityMF: savedValues.equityMF || '',
        equityMFYield: savedValues.equityMFYield || '',
        debtMF: savedValues.debtMF || '',
        debtMFYield: savedValues.debtMFYield || '',
        fixedDeposits: savedValues.fixedDeposits || '',
        fixedDepositsYield: savedValues.fixedDepositsYield || '',
        otherFixedIncome: savedValues.otherFixedIncome || '',
        otherFixedIncomeYield: savedValues.otherFixedIncomeYield || '',
        gold: savedValues.gold || '',
        commodity: savedValues.commodity || '',
        cash: savedValues.cash || '',
        homeLoan: savedValues.homeLoan || '',
        carLoan: savedValues.carLoan || '',
        creditCard: savedValues.creditCard || '',
        educationLoan: savedValues.educationLoan || ''
    };
    
    // Set values to input fields
    Object.keys(inputs).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = inputs[id];
        }
    });
    
    // Add event listeners to all input fields for auto-update
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateNetWorth);
    });
    
    // Add event listeners for buttons
    document.getElementById('addAsset').addEventListener('click', () => {
        addCustomField('customAssetsList', 'asset');
    });
    
    document.getElementById('addLiability').addEventListener('click', () => {
        addCustomField('customLiabilitiesList', 'liability');
    });

    // Add save button event listener
    document.getElementById('saveDataBtn').addEventListener('click', () => {
        saveNetWorthValues();
        // Show feedback to user
        const btn = document.getElementById('saveDataBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        btn.style.background = '#27ae60';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    });
    
    // Calculate net worth on load
    calculateNetWorth();
});

function initCustomFields(containerId, type, savedItems = []) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (savedItems && savedItems.length > 0) {
        savedItems.forEach(item => {
            addCustomField(containerId, type, item);
        });
    }
}

function addCustomField(containerId, type, item = { name: '', value: '' }) {
    const container = document.getElementById(containerId);
    const fieldId = `custom-${type}-${Date.now()}`;
    
    const fieldHTML = `
        <div class="custom-item" id="${fieldId}">
            <input type="text" placeholder="${type === 'asset' ? 'Asset Name' : 'Liability Name'}" 
                   value="${item.name || ''}" class="custom-name">
            <input type="number" placeholder="Amount (₹)" 
                   value="${item.value || ''}" class="custom-value">
            <button class="remove-btn" onclick="document.getElementById('${fieldId}').remove(); calculateNetWorth();">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', fieldHTML);
}

function calculateNetWorth() {
    // Calculate totals
    const totalAssets = calculateTotalAssets();
    const totalLiabilities = calculateTotalLiabilities();
    const netWorth = totalAssets - totalLiabilities;
    
    // Update display
    document.getElementById('totalAssets').textContent = formatCurrency(totalAssets);
    document.getElementById('totalLiabilities').textContent = formatCurrency(totalLiabilities);
    document.getElementById('netWorth').textContent = formatCurrency(netWorth);
    
    // Calculate category totals
    calculateCategoryTotals();
    
    // Calculate and update income data
    const incomeData = {
        annual: {
            rental: calculateRentalIncome(),
            dividend: calculateDividendIncome(),
            interest: calculateInterestIncome()
        }
    };
    
    // Convert annual to monthly
    incomeData.monthly = {
        rental: Math.round(incomeData.annual.rental / 12),
        dividend: Math.round(incomeData.annual.dividend / 12),
        interest: Math.round(incomeData.annual.interest / 12)
    };
    
    // Calculate totals
    incomeData.totals = {
        annual: Object.values(incomeData.annual).reduce((sum, val) => sum + val, 0),
        monthly: Object.values(incomeData.monthly).reduce((sum, val) => sum + val, 0)
    };
    
    // Add detailed breakdown for income page
    incomeData.breakdown = {
        rental: {
            total: incomeData.annual.rental,
            sources: {
                buildings: (parseFloat(document.getElementById('buildings').value || 0) * parseFloat(document.getElementById('buildingsYield').value || 0) / 100),
                plots: (parseFloat(document.getElementById('plots').value || 0) * parseFloat(document.getElementById('plotsYield').value || 0) / 100),
                land: (parseFloat(document.getElementById('land').value || 0) * parseFloat(document.getElementById('landYield').value || 0) / 100)
            }
        },
        dividend: {
            total: incomeData.annual.dividend,
            sources: {
                directEquity: (parseFloat(document.getElementById('directEquity').value || 0) * parseFloat(document.getElementById('directEquityYield').value || 0) / 100),
                equityMF: (parseFloat(document.getElementById('equityMF').value || 0) * parseFloat(document.getElementById('equityMFYield').value || 0) / 100)
            }
        },
        interest: {
            total: incomeData.annual.interest,
            sources: {
                debtMF: (parseFloat(document.getElementById('debtMF').value || 0) * parseFloat(document.getElementById('debtMFYield').value || 0) / 100),
                fixedDeposits: (parseFloat(document.getElementById('fixedDeposits').value || 0) * parseFloat(document.getElementById('fixedDepositsYield').value || 0) / 100),
                otherFixedIncome: (parseFloat(document.getElementById('otherFixedIncome').value || 0) * parseFloat(document.getElementById('otherFixedIncomeYield').value || 0) / 100)
            }
        }
    };
    
    // Save income data
    saveToLocalStorage('incomeData', incomeData);
    
    // Save net worth data
    const networthData = {
        // Save all input values
        buildings: document.getElementById('buildings').value,
        buildingsYield: document.getElementById('buildingsYield').value,
        plots: document.getElementById('plots').value,
        plotsYield: document.getElementById('plotsYield').value,
        land: document.getElementById('land').value,
        landYield: document.getElementById('landYield').value,
        directEquity: document.getElementById('directEquity').value,
        directEquityYield: document.getElementById('directEquityYield').value,
        equityMF: document.getElementById('equityMF').value,
        equityMFYield: document.getElementById('equityMFYield').value,
        debtMF: document.getElementById('debtMF').value,
        debtMFYield: document.getElementById('debtMFYield').value,
        fixedDeposits: document.getElementById('fixedDeposits').value,
        fixedDepositsYield: document.getElementById('fixedDepositsYield').value,
        otherFixedIncome: document.getElementById('otherFixedIncome').value,
        otherFixedIncomeYield: document.getElementById('otherFixedIncomeYield').value,
        gold: document.getElementById('gold').value,
        commodity: document.getElementById('commodity').value,
        cash: document.getElementById('cash').value,
        homeLoan: document.getElementById('homeLoan').value,
        carLoan: document.getElementById('carLoan').value,
        creditCard: document.getElementById('creditCard').value,
        educationLoan: document.getElementById('educationLoan').value,
        
        // Save custom fields
        customAssets: Array.from(document.querySelectorAll('#customAssetsList .custom-item')).map(item => ({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        })),
        customLiabilities: Array.from(document.querySelectorAll('#customLiabilitiesList .custom-item')).map(item => ({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        })),
        
        // Save calculated totals
        totalAssets,
        totalLiabilities,
        netWorth,
        lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    saveToLocalStorage('networthValues', networthData);
    
    // Dispatch events to notify other pages
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('localStorageUpdated'));
}

function calculateRentalIncome() {
    return (parseFloat(document.getElementById('buildings').value || 0) * parseFloat(document.getElementById('buildingsYield').value || 0) / 100) +
           (parseFloat(document.getElementById('plots').value || 0) * parseFloat(document.getElementById('plotsYield').value || 0) / 100) +
           (parseFloat(document.getElementById('land').value || 0) * parseFloat(document.getElementById('landYield').value || 0) / 100);
}

function calculateDividendIncome() {
    return (parseFloat(document.getElementById('directEquity').value || 0) * parseFloat(document.getElementById('directEquityYield').value || 0) / 100) +
           (parseFloat(document.getElementById('equityMF').value || 0) * parseFloat(document.getElementById('equityMFYield').value || 0) / 100);
}

function calculateInterestIncome() {
    return (parseFloat(document.getElementById('debtMF').value || 0) * parseFloat(document.getElementById('debtMFYield').value || 0) / 100) +
           (parseFloat(document.getElementById('fixedDeposits').value || 0) * parseFloat(document.getElementById('fixedDepositsYield').value || 0) / 100) +
           (parseFloat(document.getElementById('otherFixedIncome').value || 0) * parseFloat(document.getElementById('otherFixedIncomeYield').value || 0) / 100);
}

function calculateTotalAssets() {
    let totalAssets = 0;
    
    // Real Estate
    totalAssets += parseFloat(document.getElementById('buildings').value) || 0;
    totalAssets += parseFloat(document.getElementById('plots').value) || 0;
    totalAssets += parseFloat(document.getElementById('land').value) || 0;
    
    // Investments
    totalAssets += parseFloat(document.getElementById('directEquity').value) || 0;
    totalAssets += parseFloat(document.getElementById('equityMF').value) || 0;
    totalAssets += parseFloat(document.getElementById('debtMF').value) || 0;
    
    // Fixed Income
    totalAssets += parseFloat(document.getElementById('fixedDeposits').value) || 0;
    totalAssets += parseFloat(document.getElementById('otherFixedIncome').value) || 0;
    
    // Other Assets
    totalAssets += parseFloat(document.getElementById('gold').value) || 0;
    totalAssets += parseFloat(document.getElementById('commodity').value) || 0;
    totalAssets += parseFloat(document.getElementById('cash').value) || 0;
    
    // Custom assets
    document.querySelectorAll('#customAssetsList .custom-value').forEach(input => {
        totalAssets += parseFloat(input.value) || 0;
    });
    
    return totalAssets;
}

function calculateTotalLiabilities() {
    let totalLiabilities = 0;
    
    // Predefined liabilities
    totalLiabilities += parseFloat(document.getElementById('homeLoan').value) || 0;
    totalLiabilities += parseFloat(document.getElementById('carLoan').value) || 0;
    totalLiabilities += parseFloat(document.getElementById('creditCard').value) || 0;
    totalLiabilities += parseFloat(document.getElementById('educationLoan').value) || 0;
    
    // Custom liabilities
    document.querySelectorAll('#customLiabilitiesList .custom-value').forEach(input => {
        totalLiabilities += parseFloat(input.value) || 0;
    });
    
    return totalLiabilities;
}

function calculateCategoryTotals() {
    // Real Estate Total
    const realEstateTotal = 
        (parseFloat(document.getElementById('buildings').value) || 0) +
        (parseFloat(document.getElementById('plots').value) || 0) +
        (parseFloat(document.getElementById('land').value) || 0);
    document.getElementById('totalRealEstate').textContent = formatCurrency(realEstateTotal);
    
    // Monthly Rental Income
    const monthlyRentalIncome = 
        ((parseFloat(document.getElementById('buildings').value) || 0) * (parseFloat(document.getElementById('buildingsYield').value) || 0) / 1200) +
        ((parseFloat(document.getElementById('plots').value) || 0) * (parseFloat(document.getElementById('plotsYield').value) || 0) / 1200) +
        ((parseFloat(document.getElementById('land').value) || 0) * (parseFloat(document.getElementById('landYield').value) || 0) / 1200);
    document.getElementById('monthlyRentalIncome').textContent = formatCurrency(monthlyRentalIncome);
    
    // Investments Total
    const investmentsTotal = 
        (parseFloat(document.getElementById('directEquity').value) || 0) +
        (parseFloat(document.getElementById('equityMF').value) || 0) +
        (parseFloat(document.getElementById('debtMF').value) || 0);
    document.getElementById('totalInvestments').textContent = formatCurrency(investmentsTotal);
    
    // Fixed Income Total
    const fixedIncomeTotal = 
        (parseFloat(document.getElementById('fixedDeposits').value) || 0) +
        (parseFloat(document.getElementById('otherFixedIncome').value) || 0);
    document.getElementById('totalFixedIncome').textContent = formatCurrency(fixedIncomeTotal);
    
    // Commodity Total
    const commodityTotal = 
        (parseFloat(document.getElementById('gold').value) || 0) +
        (parseFloat(document.getElementById('commodity').value) || 0);
    document.getElementById('totalCommodity').textContent = formatCurrency(commodityTotal);
    
    // Cash Total
    const cashTotal = parseFloat(document.getElementById('cash').value) || 0;
    document.getElementById('totalCash').textContent = formatCurrency(cashTotal);
    
    // Other Assets Total
    let otherAssetsTotal = 0;
    document.querySelectorAll('#customAssetsList .custom-value').forEach(input => {
        otherAssetsTotal += parseFloat(input.value) || 0;
    });
    document.getElementById('totalOtherAssets').textContent = formatCurrency(otherAssetsTotal);
}

function saveNetWorthValues() {
    const networthValues = {
        // Real Estate
        buildings: document.getElementById('buildings').value,
        buildingsYield: document.getElementById('buildingsYield').value,
        plots: document.getElementById('plots').value,
        plotsYield: document.getElementById('plotsYield').value,
        land: document.getElementById('land').value,
        landYield: document.getElementById('landYield').value,
        
        // Investments
        directEquity: document.getElementById('directEquity').value,
        directEquityYield: document.getElementById('directEquityYield').value,
        equityMF: document.getElementById('equityMF').value,
        equityMFYield: document.getElementById('equityMFYield').value,
        debtMF: document.getElementById('debtMF').value,
        debtMFYield: document.getElementById('debtMFYield').value,
        
        // Fixed Income
        fixedDeposits: document.getElementById('fixedDeposits').value,
        fixedDepositsYield: document.getElementById('fixedDepositsYield').value,
        otherFixedIncome: document.getElementById('otherFixedIncome').value,
        otherFixedIncomeYield: document.getElementById('otherFixedIncomeYield').value,
        
        // Other Assets
        gold: document.getElementById('gold').value,
        commodity: document.getElementById('commodity').value,
        cash: document.getElementById('cash').value,
        
        // Liabilities
        homeLoan: document.getElementById('homeLoan').value,
        carLoan: document.getElementById('carLoan').value,
        creditCard: document.getElementById('creditCard').value,
        educationLoan: document.getElementById('educationLoan').value,
        
        // Custom fields
        customAssets: [],
        customLiabilities: []
    };
    
    // Save custom assets
    document.querySelectorAll('#customAssetsList .custom-item').forEach(item => {
        networthValues.customAssets.push({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        });
    });
    
    // Save custom liabilities
    document.querySelectorAll('#customLiabilitiesList .custom-item').forEach(item => {
        networthValues.customLiabilities.push({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        });
    });
    
    // Save to localStorage with timestamp
    networthValues.lastUpdated = new Date().toISOString();
    saveToLocalStorage('networthValues', networthValues);
}

function updateNumberInWords(inputId) {
    const input = document.getElementById(inputId);
    const wordsSpan = document.getElementById(inputId + 'Words');
    if (input && wordsSpan) {
        const value = parseFloat(input.value) || 0;
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

// Remove the updateFFBtn event listener since we're using automatic updates
const updateFFBtn = document.getElementById('updateFFBtn');
if (updateFFBtn) {
    updateFFBtn.style.display = 'none';
}
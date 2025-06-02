/**
 * Net Worth Module
 * Handles calculation and management of assets, liabilities, and overall net worth.
 * This module follows the Profile page and leads to the Income page.
 */

// Constants and Configuration
const ASSET_CATEGORIES = {
    REAL_ESTATE: {
        title: 'Real Estate',
        fields: [
            { id: 'buildings', label: 'Buildings', hasYield: true, yieldType: 'rental' },
            { id: 'plots', label: 'Plots', hasYield: true, yieldType: 'rental' },
            { id: 'land', label: 'Land', hasYield: true, yieldType: 'rental' }
        ]
    },
    EQUITY: {
        title: 'Equity Investments',
        fields: [
            { id: 'directEquity', label: 'Direct Equity', hasYield: true, yieldType: 'dividend' },
            { id: 'equityMF', label: 'Equity Mutual Funds', hasYield: true, yieldType: 'dividend' }
        ]
    },
    FIXED_INCOME: {
        title: 'Fixed Income',
        fields: [
            { id: 'fixedDeposits', label: 'Fixed Deposits', hasYield: true, yieldType: 'interest' },
            { id: 'otherFixedIncome', label: 'Other Fixed Income', hasYield: true, yieldType: 'interest' }
        ]
    },
    COMMODITIES: {
        title: 'Commodities',
        fields: [
            { id: 'gold', label: 'Gold', hasYield: false },
            { id: 'otherCommodities', label: 'Other Commodities', hasYield: false }
        ]
    },
    CASH: {
        title: 'Cash & Equivalents',
        fields: [
            { id: 'cashInHand', label: 'Cash in Hand', hasYield: false },
            { id: 'cashAtBank', label: 'Cash at Bank', hasYield: false }
        ]
    }
};

const LIABILITY_CATEGORIES = [
    { id: 'homeLoan', label: 'Home Loan' },
    { id: 'carLoan', label: 'Car Loan' },
    { id: 'educationLoan', label: 'Education Loan' },
    { id: 'personalLoan', label: 'Personal Loan' },
    { id: 'creditCard', label: 'Credit Card' },
    { id: 'businessLoan', label: 'Business Loan' }
];

// Main Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Net Worth page initialization started');
    initializeNetWorthPage();
});

function initializeNetWorthPage() {
    setupInstructions();
    setupAssetCategories();
    setupLiabilityCategories();
    setupEventListeners();
    loadSavedData();
}

// Setup Functions
function setupInstructions() {
    const yieldInstructions = document.getElementById('yieldInstructions');
    if (yieldInstructions) {
        yieldInstructions.innerHTML = `
            <div class="alert alert-info">
                <strong>Understanding Yield:</strong>
                <p>Yield percentage (%) represents the annual income you generate or expect to generate from an asset, 
                excluding asset appreciation. For example:</p>
                <ul>
                    <li>For Real Estate: Annual rental income as a percentage of property value</li>
                    <li>For Equity: Annual dividend income as a percentage of investment value</li>
                    <li>For Fixed Income: Annual interest rate</li>
                </ul>
            </div>
        `;
    }
    
    const liabilityInstructions = document.getElementById('liabilityInstructions');
    if (liabilityInstructions) {
        liabilityInstructions.innerHTML = `
            <div class="alert alert-warning">
                <strong>Important:</strong>
                <p>Please enter only the remaining principal amount for all loans. Do not include future interest payments.</p>
            </div>
        `;
    }
}

function setupAssetCategories() {
    Object.entries(ASSET_CATEGORIES).forEach(([key, category]) => {
        const container = document.getElementById(`${key.toLowerCase()}Container`);
        if (!container) return;
        
        category.fields.forEach(field => {
            const fieldHtml = createAssetFieldHTML(field);
            container.insertAdjacentHTML('beforeend', fieldHtml);
        });
        
        // Add category total display
        container.insertAdjacentHTML('beforeend', createCategoryTotalHTML(category.title));
    });
    
    // Setup custom asset section
    setupCustomAssetSection();
}

function setupLiabilityCategories() {
    const container = document.getElementById('liabilitiesContainer');
    if (!container) return;
    
    LIABILITY_CATEGORIES.forEach(liability => {
        const fieldHtml = createLiabilityFieldHTML(liability);
        container.insertAdjacentHTML('beforeend', fieldHtml);
    });
    
    // Setup custom liability section
    setupCustomLiabilitySection();
}

function setupEventListeners() {
    // Asset input listeners
    document.querySelectorAll('.asset-input, .yield-input').forEach(input => {
        input.addEventListener('input', handleInputChange);
        input.addEventListener('change', validatePositiveNumber);
    });
    
    // Liability input listeners
    document.querySelectorAll('.liability-input').forEach(input => {
        input.addEventListener('input', handleInputChange);
        input.addEventListener('change', validatePositiveNumber);
    });
    
    // Custom field buttons
    document.getElementById('addCustomAsset')?.addEventListener('click', () => addCustomAsset());
    document.getElementById('addCustomLiability')?.addEventListener('click', () => addCustomLiability());
    
    // Save button
    document.getElementById('saveDataBtn')?.addEventListener('click', handleSaveClick);
    
    // Navigation buttons
    document.getElementById('toIncomeBtn')?.addEventListener('click', () => window.location.href = 'income.html');
}

// Event Handlers
function handleInputChange(event) {
    const input = event.target;
    if (input.value === '') {
        input.placeholder = '₹0';
    }
    updateNumberInWords(input.id);
    calculateNetWorth();
}

function validatePositiveNumber(event) {
    const input = event.target;
    const value = parseFloat(input.value);
    if (isNaN(value) || value < 0) {
        input.value = '';
        input.placeholder = '₹0';
        updateNumberInWords(input.id);
    }
}

function handleSaveClick() {
    saveNetWorthData();
    showSaveConfirmation();
}

// Calculation Functions
function calculateNetWorth() {
    const assetTotals = calculateAssetTotals();
    const liabilityTotal = calculateLiabilityTotal();
    const netWorth = assetTotals.total - liabilityTotal;
    
    // Update displays
    updateDisplay('totalAssets', assetTotals.total);
    updateWordsDisplay('totalAssetsWords', assetTotals.total);
    
    updateDisplay('totalLiabilities', liabilityTotal);
    updateWordsDisplay('totalLiabilitiesWords', liabilityTotal);
    
    updateDisplay('netWorth', netWorth);
    updateWordsDisplay('netWorthWords', netWorth);
    
    // Update income summaries
    updateDisplay('totalRentalIncome', assetTotals.rentalIncome);
    updateWordsDisplay('totalRentalIncomeWords', assetTotals.rentalIncome);
    
    updateDisplay('totalDividendIncome', assetTotals.dividendIncome);
    updateWordsDisplay('totalDividendIncomeWords', assetTotals.dividendIncome);
    
    updateDisplay('totalInterestIncome', assetTotals.interestIncome);
    updateWordsDisplay('totalInterestIncomeWords', assetTotals.interestIncome);
    
    // Save data
    saveNetWorthData();
}

function calculateAssetTotals() {
    let total = 0;
    let rentalIncome = 0;
    let dividendIncome = 0;
    let interestIncome = 0;
    
    // Calculate standard assets
    Object.values(ASSET_CATEGORIES).forEach(category => {
        category.fields.forEach(field => {
            const value = getNumericValue(field.id);
            const yieldValue = field.hasYield ? getNumericValue(field.id + 'Yield') : 0;
            
            total += value;
            
            if (field.hasYield) {
                const annualIncome = (value * yieldValue) / 100;
                switch (field.yieldType) {
                    case 'rental':
                        rentalIncome += annualIncome;
                        break;
                    case 'dividend':
                        dividendIncome += annualIncome;
                        break;
                    case 'interest':
                        interestIncome += annualIncome;
                        break;
                }
            }
        });
    });
    
    // Add custom assets
    const customAssets = getCustomAssets();
    customAssets.forEach(asset => {
        total += asset.value;
        const annualIncome = (asset.value * asset.yield) / 100;
        switch (asset.yieldType) {
            case 'rental':
                rentalIncome += annualIncome;
                break;
            case 'dividend':
                dividendIncome += annualIncome;
                break;
            case 'interest':
                interestIncome += annualIncome;
                break;
        }
    });
    
    return {
        total,
        rentalIncome,
        dividendIncome,
        interestIncome
    };
}

function calculateLiabilityTotal() {
    let total = 0;
    
    // Standard liabilities
    LIABILITY_CATEGORIES.forEach(liability => {
        total += getNumericValue(liability.id);
    });
    
    // Custom liabilities
    const customLiabilities = getCustomLiabilities();
    customLiabilities.forEach(liability => {
        total += liability.value;
    });
    
    return total;
}

// Custom Fields Management
function addCustomAsset() {
    const container = document.getElementById('customAssetsContainer');
    if (!container) return;
    
    const assetId = 'customAsset_' + Date.now();
    const html = `
        <div class="custom-asset" id="${assetId}">
            <div class="row">
                <div class="col">
                    <input type="text" class="form-control custom-name" placeholder="Asset Name">
                </div>
                <div class="col">
                    <input type="number" class="form-control custom-value asset-input" placeholder="₹0">
                    <div class="number-words"></div>
                </div>
                <div class="col">
                    <input type="number" class="form-control custom-yield yield-input" placeholder="0%">
                </div>
                <div class="col">
                    <select class="form-control custom-yield-type">
                        <option value="rental">Rental</option>
                        <option value="dividend">Dividend</option>
                        <option value="interest">Interest</option>
                    </select>
                </div>
                <div class="col-auto">
                    <button class="btn btn-danger" onclick="removeCustomField('${assetId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    
    // Add event listeners
    const newAsset = document.getElementById(assetId);
    newAsset.querySelector('.asset-input').addEventListener('input', handleInputChange);
    newAsset.querySelector('.asset-input').addEventListener('change', validatePositiveNumber);
    newAsset.querySelector('.yield-input').addEventListener('input', handleInputChange);
    newAsset.querySelector('.yield-input').addEventListener('change', validatePositiveNumber);
}

function addCustomLiability() {
    const container = document.getElementById('customLiabilitiesContainer');
    if (!container) return;
    
    const liabilityId = 'customLiability_' + Date.now();
    const html = `
        <div class="custom-liability" id="${liabilityId}">
            <div class="row">
                <div class="col">
                    <input type="text" class="form-control custom-name" placeholder="Liability Name">
                </div>
                <div class="col">
                    <input type="number" class="form-control custom-value liability-input" placeholder="₹0">
                    <div class="number-words"></div>
                </div>
                <div class="col-auto">
                    <button class="btn btn-danger" onclick="removeCustomField('${liabilityId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    
    // Add event listeners
    const newLiability = document.getElementById(liabilityId);
    newLiability.querySelector('.liability-input').addEventListener('input', handleInputChange);
    newLiability.querySelector('.liability-input').addEventListener('change', validatePositiveNumber);
}

function removeCustomField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.remove();
        calculateNetWorth();
    }
}

// Data Management Functions
function loadSavedData() {
    const savedData = getFromLocalStorage('networthValues');
    if (!savedData) return;
    
    // Load standard assets
    Object.values(ASSET_CATEGORIES).forEach(category => {
        category.fields.forEach(field => {
            setFieldValue(field.id, savedData[field.id]);
            if (field.hasYield) {
                setFieldValue(field.id + 'Yield', savedData[field.id + 'Yield']);
            }
        });
    });
    
    // Load custom assets
    if (savedData.customAssets) {
        savedData.customAssets.forEach(asset => addCustomAsset(asset));
    }
    
    // Load standard liabilities
    LIABILITY_CATEGORIES.forEach(liability => {
        setFieldValue(liability.id, savedData[liability.id]);
    });
    
    // Load custom liabilities
    if (savedData.customLiabilities) {
        savedData.customLiabilities.forEach(liability => addCustomLiability(liability));
    }
    
    calculateNetWorth();
}

function saveNetWorthData() {
    const data = {
        // Save standard assets
        ...collectStandardAssets(),
        
        // Save custom assets
        customAssets: getCustomAssets(),
        
        // Save standard liabilities
        ...collectStandardLiabilities(),
        
        // Save custom liabilities
        customLiabilities: getCustomLiabilities(),
        
        // Save timestamp
        lastUpdated: new Date().toISOString()
    };
    
    saveToLocalStorage('networthValues', data);
    notifyUpdate();
}

// Helper Functions
function getNumericValue(inputId) {
    const element = document.getElementById(inputId);
    return parseFloat(element?.value || 0) || 0;
}

function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    if (value && !isNaN(value)) {
        field.value = value;
    } else {
        field.value = '';
        field.placeholder = field.classList.contains('yield-input') ? '0%' : '₹0';
    }
    
    updateNumberInWords(fieldId);
}

function updateDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = formatCurrency(value);
    }
}

function updateWordsDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `₹${numberToWords(value)}`;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
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

// Storage Functions
function getFromLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function notifyUpdate() {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('localStorageUpdated'));
}

// HTML Generation Functions
function createAssetFieldHTML(field) {
    return `
        <div class="form-group row">
            <label class="col-sm-3 col-form-label">${field.label}</label>
            <div class="col-sm-5">
                <input type="number" id="${field.id}" class="form-control asset-input" placeholder="₹0">
                <div class="number-words" id="${field.id}Words"></div>
            </div>
            ${field.hasYield ? `
                <div class="col-sm-4">
                    <div class="input-group">
                        <input type="number" id="${field.id}Yield" class="form-control yield-input" placeholder="0">
                        <div class="input-group-append">
                            <span class="input-group-text">%</span>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function createLiabilityFieldHTML(liability) {
    return `
        <div class="form-group row">
            <label class="col-sm-3 col-form-label">${liability.label}</label>
            <div class="col-sm-9">
                <input type="number" id="${liability.id}" class="form-control liability-input" placeholder="₹0">
                <div class="number-words" id="${liability.id}Words"></div>
            </div>
        </div>
    `;
}

function createCategoryTotalHTML(categoryTitle) {
    return `
        <div class="category-total">
            <hr>
            <div class="row">
                <div class="col-sm-3">
                    <strong>Total ${categoryTitle}</strong>
                </div>
                <div class="col-sm-9">
                    <span class="total-amount"></span>
                    <div class="number-words"></div>
                </div>
            </div>
        </div>
    `;
}

function showSaveConfirmation() {
    const btn = document.getElementById('saveDataBtn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    btn.style.background = '#27ae60';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 2000);
} 
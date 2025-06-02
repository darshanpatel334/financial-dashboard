// Constants and Configuration
const ASSET_CATEGORIES = {
    REAL_ESTATE: ['buildings', 'plots', 'land'],
    INVESTMENTS: ['directEquity', 'equityMF', 'debtMF'],
    FIXED_INCOME: ['fixedDeposits', 'otherFixedIncome'],
    COMMODITIES: ['gold', 'commodity'],
    CASH: ['cashAtBank', 'cashInHand']
};

const LIABILITY_CATEGORIES = ['homeLoan', 'carLoan', 'creditCard', 'educationLoan'];

// Main Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeNetWorthPage();
});

function initializeNetWorthPage() {
    setupYieldInstructions();
    setupEventListeners();
    loadSavedValues();
    calculateNetWorth();
}

// Setup Functions
function setupYieldInstructions() {
    const yieldInputs = document.querySelectorAll('input[id$="Yield"]');
    yieldInputs.forEach(input => {
        const instructionDiv = createYieldInstruction();
        input.title = "Enter the annual income percentage (excluding appreciation)";
        input.parentNode.appendChild(instructionDiv);
    });
}

function createYieldInstruction() {
    const div = document.createElement('div');
    div.className = 'yield-instruction';
    div.textContent = '% yield represents annual income excluding appreciation';
    div.style.fontSize = '0.8em';
    div.style.color = '#666';
    return div;
}

function setupEventListeners() {
    // Input field listeners
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', handleInputChange);
        input.addEventListener('blur', handleInputBlur);
    });

    // Button listeners
    document.getElementById('addAsset')?.addEventListener('click', () => addCustomField('customAssetsList', 'asset'));
    document.getElementById('addLiability')?.addEventListener('click', () => addCustomField('customLiabilitiesList', 'liability'));
    document.getElementById('saveDataBtn')?.addEventListener('click', handleSaveClick);
}

// Event Handlers
function handleInputChange(event) {
    const input = event.target;
    validateInput(input);
    if (!input.id.includes('Yield')) {
        updateNumberInWords(input.id);
    }
    calculateNetWorth();
}

function handleInputBlur(event) {
    validateInput(event.target);
    calculateNetWorth();
}

function handleSaveClick() {
    saveNetWorthValues();
    showSaveConfirmation();
}

// Validation Functions
function validateInput(input) {
    const value = parseFloat(input.value);
    if (isNaN(value) || value < 0) {
        input.value = '';
        input.placeholder = '₹0';
        return false;
    }
    return true;
}

// Calculation Functions
function calculateNetWorth() {
    const totalAssets = calculateTotalAssets();
    const totalLiabilities = calculateTotalLiabilities();
    const netWorth = totalAssets - totalLiabilities;

    updateDisplayValues(totalAssets, totalLiabilities, netWorth);
    calculateCategoryTotals();
    
    const incomeData = calculateIncomeData();
    saveToLocalStorage('incomeData', incomeData);
    saveNetWorthData(totalAssets, totalLiabilities, netWorth);
}

function calculateTotalAssets() {
    let total = 0;
    
    // Calculate for each category
    Object.values(ASSET_CATEGORIES).forEach(category => {
        category.forEach(id => {
            total += parseFloat(document.getElementById(id)?.value || 0);
        });
    });
    
    // Add custom assets
    document.querySelectorAll('#customAssetsList .custom-value').forEach(input => {
        total += parseFloat(input.value || 0);
    });
    
    return total;
}

function calculateTotalLiabilities() {
    let total = 0;
    
    // Calculate standard liabilities
    LIABILITY_CATEGORIES.forEach(id => {
        total += parseFloat(document.getElementById(id)?.value || 0);
    });
    
    // Add custom liabilities
    document.querySelectorAll('#customLiabilitiesList .custom-value').forEach(input => {
        total += parseFloat(input.value || 0);
    });
    
    return total;
}

function calculateCategoryTotals() {
    // Real Estate Total
    const realEstateTotal = calculateRealEstateTotal();
    const monthlyRentalIncome = calculateMonthlyRentalIncome();
    
    // Update category totals
    updateCategoryDisplay('totalRealEstate', realEstateTotal);
    updateCategoryDisplay('monthlyRentalIncome', monthlyRentalIncome);
    updateCategoryDisplay('totalInvestments', calculateCategoryTotal(ASSET_CATEGORIES.INVESTMENTS));
    updateCategoryDisplay('totalFixedIncome', calculateCategoryTotal(ASSET_CATEGORIES.FIXED_INCOME));
    updateCategoryDisplay('totalCommodity', calculateCategoryTotal(ASSET_CATEGORIES.COMMODITIES));
    updateCategoryDisplay('totalCash', calculateCategoryTotal(ASSET_CATEGORIES.CASH));
    updateCategoryDisplay('totalOtherAssets', calculateCustomAssetsTotal());
}

function calculateRealEstateTotal() {
    return ASSET_CATEGORIES.REAL_ESTATE.reduce((total, id) => {
        return total + (parseFloat(document.getElementById(id)?.value) || 0);
    }, 0);
}

function calculateMonthlyRentalIncome() {
    return ASSET_CATEGORIES.REAL_ESTATE.reduce((total, id) => {
        const value = parseFloat(document.getElementById(id)?.value) || 0;
        const yield = parseFloat(document.getElementById(id + 'Yield')?.value) || 0;
        return total + (value * yield / 12); // Annual yield to monthly
    }, 0);
}

function calculateCategoryTotal(categoryIds) {
    return categoryIds.reduce((total, id) => {
        return total + (parseFloat(document.getElementById(id)?.value) || 0);
    }, 0);
}

function calculateCustomAssetsTotal() {
    let total = 0;
    document.querySelectorAll('#customAssetsList .custom-value').forEach(input => {
        total += parseFloat(input.value || 0);
    });
    return total;
}

// Display Update Functions
function updateDisplayValues(totalAssets, totalLiabilities, netWorth) {
    updateAmountDisplay('totalAssets', totalAssets);
    updateAmountDisplay('totalLiabilities', totalLiabilities);
    updateAmountDisplay('netWorth', netWorth);
}

function updateAmountDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = formatCurrency(value);
        const wordsElement = document.getElementById(elementId + 'Words');
        if (wordsElement) {
            wordsElement.textContent = `₹${numberToWords(value)}`;
        }
    }
}

function updateCategoryDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = formatCurrency(value);
    }
}

// Custom Fields Management
function addCustomField(containerId, type, item = { name: '', value: '' }) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const fieldId = `custom-${type}-${Date.now()}`;
    const fieldHTML = createCustomFieldHTML(fieldId, type, item);
    container.insertAdjacentHTML('beforeend', fieldHTML);
    
    // Add event listeners to new field
    const newField = document.getElementById(fieldId);
    if (newField) {
        const valueInput = newField.querySelector('.custom-value');
        if (valueInput) {
            valueInput.addEventListener('input', handleInputChange);
            valueInput.addEventListener('blur', handleInputBlur);
        }
    }
}

function createCustomFieldHTML(fieldId, type, item) {
    return `
        <div class="custom-item" id="${fieldId}">
            <input type="text" 
                   placeholder="${type === 'asset' ? 'Asset Name' : 'Liability Name'}" 
                   value="${item.name || ''}" 
                   class="custom-name">
            <input type="number" 
                   placeholder="Amount (₹)" 
                   value="${item.value || ''}" 
                   class="custom-value">
            <button class="remove-btn" onclick="removeCustomField('${fieldId}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

function removeCustomField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.remove();
        calculateNetWorth();
    }
}

// Data Management Functions
function loadSavedValues() {
    const savedValues = getFromLocalStorage('networthValues') || {};
    
    // Load standard fields
    Object.entries(savedValues).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            element.value = value;
            if (!id.includes('Yield')) {
                updateNumberInWords(id);
            }
        }
    });
    
    // Load custom fields
    loadCustomFields('customAssetsList', 'asset', savedValues.customAssets);
    loadCustomFields('customLiabilitiesList', 'liability', savedValues.customLiabilities);
}

function loadCustomFields(containerId, type, items = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    items.forEach(item => addCustomField(containerId, type, item));
}

function saveNetWorthData(totalAssets, totalLiabilities, netWorth) {
    const data = collectFormData();
    data.totalAssets = totalAssets;
    data.totalLiabilities = totalLiabilities;
    data.netWorth = netWorth;
    data.lastUpdated = new Date().toISOString();
    
    saveToLocalStorage('networthValues', data);
    notifyOtherPages();
}

function collectFormData() {
    const data = {};
    
    // Collect standard fields
    [...ASSET_CATEGORIES.REAL_ESTATE, ...ASSET_CATEGORIES.INVESTMENTS, 
     ...ASSET_CATEGORIES.FIXED_INCOME, ...ASSET_CATEGORIES.COMMODITIES, 
     ...ASSET_CATEGORIES.CASH, ...LIABILITY_CATEGORIES].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            data[id] = element.value;
            const yieldElement = document.getElementById(id + 'Yield');
            if (yieldElement) {
                data[id + 'Yield'] = yieldElement.value;
            }
        }
    });
    
    // Collect custom fields
    data.customAssets = Array.from(document.querySelectorAll('#customAssetsList .custom-item'))
        .map(item => ({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        }));
        
    data.customLiabilities = Array.from(document.querySelectorAll('#customLiabilitiesList .custom-item'))
        .map(item => ({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        }));
        
    return data;
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
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

function notifyOtherPages() {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('localStorageUpdated'));
}

// Remove the updateFFBtn since we're using automatic updates
const updateFFBtn = document.getElementById('updateFFBtn');
if (updateFFBtn) {
    updateFFBtn.style.display = 'none';
}
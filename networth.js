document.addEventListener('DOMContentLoaded', function() {
    // Load saved values
    const savedValues = getFromLocalStorage('networthValues');
    
    // Initialize custom assets and liabilities
    initCustomFields('custom-assets', 'asset', savedValues.assets);
    initCustomFields('custom-liabilities', 'liability', savedValues.liabilities);
    
    // Set input values and update words
    const inputs = ['realEstate', 'gold', 'cash', 'savings', 'investments', 'homeLoan', 'carLoan', 'creditCard', 'educationLoan'];
    inputs.forEach(id => {
        if (savedValues[id]) document.getElementById(id).value = savedValues[id];
        updateNumberInWords(id);
    });
    
    // Add event listeners to all input fields for auto-update
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            if (input.type === 'number') {
                updateNumberInWords(input.id);
            }
            calculateNetWorth();
        });
    });
    
    // Calculate net worth on load
    calculateNetWorth();
    
    // Event listeners
    document.getElementById('addAssetBtn').addEventListener('click', () => {
        addCustomField('custom-assets', 'asset');
    });
    
    document.getElementById('addLiabilityBtn').addEventListener('click', () => {
        addCustomField('custom-liabilities', 'liability');
    });
    
    document.getElementById('calculateAssetsBtn').addEventListener('click', calculateNetWorth);
    document.getElementById('calculateLiabilitiesBtn').addEventListener('click', calculateNetWorth);
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
    // Calculate total assets
    let totalAssets = calculateTotalAssets();
    document.getElementById('totalAssets').textContent = formatCurrency(totalAssets);
    
    // Calculate total liabilities
    let totalLiabilities = calculateTotalLiabilities();
    document.getElementById('totalLiabilities').textContent = formatCurrency(totalLiabilities);
    
    // Calculate net worth
    let netWorth = totalAssets - totalLiabilities;
    document.getElementById('netWorthResult').textContent = formatCurrency(netWorth);
    
    // Automatically save to localStorage
    localStorage.setItem('savedNetWorth', netWorth);
}

function calculateTotalAssets() {
    let totalAssets = 0;
    
    // Predefined assets
    totalAssets += parseFloat(document.getElementById('realEstate').value) || 0;
    totalAssets += parseFloat(document.getElementById('gold').value) || 0;
    totalAssets += parseFloat(document.getElementById('cash').value) || 0;
    totalAssets += parseFloat(document.getElementById('savings').value) || 0;
    totalAssets += parseFloat(document.getElementById('investments').value) || 0;
    
    // Custom assets
    document.querySelectorAll('#custom-assets .custom-value').forEach(input => {
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
    document.querySelectorAll('#custom-liabilities .custom-value').forEach(input => {
        totalLiabilities += parseFloat(input.value) || 0;
    });
    
    return totalLiabilities;
}

function saveNetWorthValues() {
    const networthValues = {
        realEstate: document.getElementById('realEstate').value,
        gold: document.getElementById('gold').value,
        cash: document.getElementById('cash').value,
        savings: document.getElementById('savings').value,
        investments: document.getElementById('investments').value,
        homeLoan: document.getElementById('homeLoan').value,
        carLoan: document.getElementById('carLoan').value,
        creditCard: document.getElementById('creditCard').value,
        educationLoan: document.getElementById('educationLoan').value,
        assets: [],
        liabilities: []
    };
    
    // Save custom assets
    document.querySelectorAll('#custom-assets .custom-item').forEach(item => {
        networthValues.assets.push({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        });
    });
    
    // Save custom liabilities
    document.querySelectorAll('#custom-liabilities .custom-item').forEach(item => {
        networthValues.liabilities.push({
            name: item.querySelector('.custom-name').value,
            value: item.querySelector('.custom-value').value
        });
    });
    
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
// Asset subcategories mapping
const assetSubcategories = {
    realEstate: [
        { value: 'buildings', label: 'Buildings' },
        { value: 'plots', label: 'Plots' },
        { value: 'land', label: 'Land' },
        { value: 'custom', label: 'Other' }
    ],
    equity: [
        { value: 'directEquity', label: 'Direct Equity' },
        { value: 'privateBusinessInvestment', label: 'Private Business Investment' },
        { value: 'equityMutualFunds', label: 'Equity Mutual Funds' },
        { value: 'custom', label: 'Other' }
    ],
    fixedIncome: [
        { value: 'fixedDeposits', label: 'Fixed Deposits' },
        { value: 'savingSchemes', label: 'Saving Schemes' },
        { value: 'savingAccount', label: 'Saving Account' },
        { value: 'custom', label: 'Other' }
    ],
    commodities: [
        { value: 'gold', label: 'Gold' },
        { value: 'otherCommodities', label: 'Other Commodities' },
        { value: 'custom', label: 'Other' }
    ],
    others: [
        { value: 'cashInHand', label: 'Cash in Hand' },
        { value: 'ornamentsAndOwnHouse', label: 'Ornaments and Own House' },
        { value: 'custom', label: 'Other' }
    ]
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateNetWorthSummary();
    renderAssets();
    renderLiabilities();
    initializeNetWorthChart();
});

// Update summary values
function updateNetWorthSummary() {
    const { summary } = AppState.netWorth;
    
    document.getElementById('total-assets').textContent = utils.formatCurrency(summary.totalAssets);
    document.getElementById('total-assets-words').textContent = utils.numberToWords(summary.totalAssets);
    
    document.getElementById('total-liabilities').textContent = utils.formatCurrency(summary.totalLiabilities);
    document.getElementById('total-liabilities-words').textContent = utils.numberToWords(summary.totalLiabilities);
    
    document.getElementById('net-worth').textContent = utils.formatCurrency(summary.netWorth);
    document.getElementById('net-worth-words').textContent = utils.numberToWords(summary.netWorth);
    
    document.getElementById('expected-return').textContent = utils.formatCurrency(summary.expectedAnnualReturn);
}

// Initialize Net Worth Chart
function initializeNetWorthChart() {
    const ctx = document.getElementById('networth-chart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Assets', 'Liabilities'],
            datasets: [{
                data: [
                    AppState.netWorth.summary.totalAssets,
                    AppState.netWorth.summary.totalLiabilities
                ],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Net Worth Composition'
                }
            }
        }
    });
}

// Render Assets
function renderAssets() {
    const { assets } = AppState.netWorth;
    
    // Render each asset category
    Object.entries(assets).forEach(([category, items]) => {
        const container = document.getElementById(`${category.toLowerCase()}-assets`);
        if (!container) return;

        let html = '<div class="grid-list">';
        
        // Render predefined assets
        Object.entries(items).forEach(([key, asset]) => {
            if (key !== 'custom') {
                html += createAssetCard(category, key, asset);
            }
        });
        
        // Render custom assets
        if (items.custom && items.custom.length > 0) {
            items.custom.forEach((asset, index) => {
                html += createAssetCard(category, `custom-${index}`, asset, true);
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    });
}

// Create Asset Card HTML
function createAssetCard(category, key, asset, isCustom = false) {
    const value = isCustom ? asset.value : asset.value || 0;
    const yield = isCustom ? asset.yield : asset.yield || 0;
    const name = isCustom ? asset.name : key.replace(/([A-Z])/g, ' $1').trim();
    
    return `
        <div class="card" style="margin-bottom: 1rem;">
            <h4>${name}</h4>
            <p>Value: ${utils.formatCurrency(value)}</p>
            ${yield ? `<p>Expected Yield: ${yield}%</p>` : ''}
            <button class="btn btn-danger" onclick="deleteAsset('${category}', '${key}', ${isCustom})">Delete</button>
        </div>
    `;
}

// Render Liabilities
function renderLiabilities() {
    const { liabilities } = AppState.netWorth;
    const container = document.getElementById('liabilities-list');
    
    let html = '<div class="grid-list">';
    
    // Render predefined liabilities
    Object.entries(liabilities).forEach(([key, liability]) => {
        if (key !== 'custom') {
            html += createLiabilityCard(key, liability);
        }
    });
    
    // Render custom liabilities
    if (liabilities.custom && liabilities.custom.length > 0) {
        liabilities.custom.forEach((liability, index) => {
            html += createLiabilityCard(`custom-${index}`, liability, true);
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Create Liability Card HTML
function createLiabilityCard(key, liability, isCustom = false) {
    const amount = liability.amount || 0;
    const tenure = liability.tenure || 0;
    const name = isCustom ? liability.name : key.replace(/([A-Z])/g, ' $1').trim();
    
    return `
        <div class="card" style="margin-bottom: 1rem;">
            <h4>${name}</h4>
            <p>Amount: ${utils.formatCurrency(amount)}</p>
            <p>Remaining Tenure: ${tenure} months</p>
            <button class="btn btn-danger" onclick="deleteLiability('${key}', ${isCustom})">Delete</button>
        </div>
    `;
}

// Asset Modal Functions
function showAssetModal() {
    document.getElementById('asset-modal').style.display = 'block';
}

function closeAssetModal() {
    document.getElementById('asset-modal').style.display = 'none';
    document.getElementById('asset-form').reset();
}

function updateAssetSubcategories() {
    const category = document.getElementById('asset-category').value;
    const subcategorySelect = document.getElementById('asset-subcategory');
    const yieldGroup = document.getElementById('yield-group');
    
    // Clear existing options
    subcategorySelect.innerHTML = '<option value="">Select Type</option>';
    
    // Add new options
    if (category && assetSubcategories[category]) {
        assetSubcategories[category].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.value;
            option.textContent = sub.label;
            subcategorySelect.appendChild(option);
        });
    }
    
    // Show/hide yield field based on category
    yieldGroup.style.display = ['realEstate', 'equity', 'fixedIncome'].includes(category) ? 'block' : 'none';
}

// Save Asset
function saveAsset(event) {
    event.preventDefault();
    
    const category = document.getElementById('asset-category').value;
    const subcategory = document.getElementById('asset-subcategory').value;
    const name = document.getElementById('asset-name').value.trim();
    const value = parseFloat(document.getElementById('asset-value').value);
    const yield = parseFloat(document.getElementById('asset-yield').value) || 0;
    
    const asset = { value, yield };
    if (subcategory === 'custom') {
        asset.name = name;
        // Initialize custom array if it doesn't exist
        if (!AppState.netWorth.assets[category].custom) {
            AppState.netWorth.assets[category].custom = [];
        }
        AppState.netWorth.assets[category].custom.push(asset);
    } else {
        if (!AppState.netWorth.assets[category][subcategory]) {
            AppState.netWorth.assets[category][subcategory] = { value: 0, yield: 0 };
        }
        AppState.netWorth.assets[category][subcategory] = asset;
    }
    
    // Save state
    AppState.save();
    
    // Update summary
    calculateNetWorthSummary();
    
    // Refresh UI
    closeAssetModal();
    renderAssets();
    updateNetWorthSummary();
    initializeNetWorthChart();
    
    return false;
}

// Delete Asset
function deleteAsset(category, key, isCustom) {
    if (isCustom) {
        const index = parseInt(key.split('-')[1]);
        AppState.netWorth.assets[category].custom.splice(index, 1);
    } else {
        AppState.netWorth.assets[category][key] = { value: 0, yield: 0 };
    }
    
    // Update summary
    calculateNetWorthSummary();
    
    // Refresh UI
    renderAssets();
    updateNetWorthSummary();
    initializeNetWorthChart();
}

// Liability Modal Functions
function showLiabilityModal() {
    document.getElementById('liability-modal').style.display = 'block';
}

function closeLiabilityModal() {
    document.getElementById('liability-modal').style.display = 'none';
    document.getElementById('liability-form').reset();
}

// Save Liability
function saveLiability(event) {
    event.preventDefault();
    
    const type = document.getElementById('liability-type').value;
    const amount = parseFloat(document.getElementById('liability-amount').value);
    const tenure = parseInt(document.getElementById('liability-tenure').value);
    
    const liability = { amount, tenure };
    
    if (type === 'custom') {
        const name = document.getElementById('liability-name').value.trim();
        liability.name = name;
        AppState.netWorth.liabilities.custom.push(liability);
    } else {
        AppState.netWorth.liabilities[type] = liability;
    }
    
    // Update summary
    calculateNetWorthSummary();
    
    // Refresh UI
    closeLiabilityModal();
    renderLiabilities();
    updateNetWorthSummary();
    initializeNetWorthChart();
    
    return false;
}

// Delete Liability
function deleteLiability(key, isCustom) {
    if (isCustom) {
        const index = parseInt(key.split('-')[1]);
        AppState.netWorth.liabilities.custom.splice(index, 1);
    } else {
        AppState.netWorth.liabilities[key] = { amount: 0, tenure: 0 };
    }
    
    // Update summary
    calculateNetWorthSummary();
    
    // Refresh UI
    renderLiabilities();
    updateNetWorthSummary();
    initializeNetWorthChart();
}

// Calculate Net Worth Summary
function calculateNetWorthSummary() {
    const { assets, liabilities } = AppState.netWorth;
    let totalAssets = 0;
    let expectedAnnualReturn = 0;
    
    // Calculate total assets and expected returns
    Object.values(assets).forEach(category => {
        Object.entries(category).forEach(([key, items]) => {
            if (key === 'custom') {
                items.forEach(item => {
                    totalAssets += item.value;
                    if (item.yield) {
                        expectedAnnualReturn += (item.value * item.yield / 100);
                    }
                });
            } else {
                totalAssets += items.value;
                if (items.yield) {
                    expectedAnnualReturn += (items.value * items.yield / 100);
                }
            }
        });
    });
    
    // Calculate total liabilities
    let totalLiabilities = 0;
    Object.entries(liabilities).forEach(([key, items]) => {
        if (key === 'custom') {
            items.forEach(item => {
                totalLiabilities += item.amount;
            });
        } else {
            totalLiabilities += items.amount;
        }
    });
    
    // Update summary in state
    AppState.netWorth.summary = {
        totalAssets,
        totalLiabilities,
        netWorth: totalAssets - totalLiabilities,
        expectedAnnualReturn
    };
    
    // Save state
    AppState.save();
}

// Add event listener for liability type change
document.getElementById('liability-type')?.addEventListener('change', function(e) {
    const nameGroup = document.getElementById('liability-name-group');
    nameGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
}); 
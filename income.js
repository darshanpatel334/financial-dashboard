document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadSavedIncomeData();

    // Add income source button
    document.getElementById('addIncomeBtn').addEventListener('click', () => {
        addCustomIncomeSource();
    });

    // Add event listeners to all inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateTotalIncome);
    });

    // Add save button event listener
    document.getElementById('saveDataBtn').addEventListener('click', () => {
        saveIncomeData();
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

    // Initial calculation
    calculateTotalIncome();
});

function loadSavedIncomeData() {
    const incomeData = getFromLocalStorage('incomeData') || {};
    const savedValues = getFromLocalStorage('incomeValues') || {};

    // Set values from assets calculations
    if (incomeData.breakdown) {
        document.getElementById('rental').value = Math.round(incomeData.breakdown.rental.total / 12) || 0;
        document.getElementById('dividend').value = Math.round(incomeData.breakdown.dividend.total / 12) || 0;
        document.getElementById('interest').value = Math.round(incomeData.breakdown.interest.total / 12) || 0;
    }

    // Set other saved values
    if (savedValues.salary) document.getElementById('salary').value = savedValues.salary;
    if (savedValues.fixed) document.getElementById('fixed').value = savedValues.fixed;

    // Load custom income sources
    if (savedValues.customSources) {
        savedValues.customSources.forEach(source => {
            addCustomIncomeSource(source.name, source.amount);
        });
    }
}

function calculateTotalIncome() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const rental = parseFloat(document.getElementById('rental').value) || 0;
    const dividend = parseFloat(document.getElementById('dividend').value) || 0;
    const interest = parseFloat(document.getElementById('interest').value) || 0;
    const fixed = parseFloat(document.getElementById('fixed').value) || 0;

    // Calculate custom income
    let customTotal = 0;
    const customSources = [];
    document.querySelectorAll('.custom-income-row').forEach(row => {
        const amount = parseFloat(row.querySelector('.custom-amount').value) || 0;
        const name = row.querySelector('.custom-source').value;
        customTotal += amount;
        if (name || amount) {
            customSources.push({ name, amount });
        }
    });

    const regularIncome = salary + rental + dividend + interest;
    const additionalIncome = fixed + customTotal;
    const totalIncome = regularIncome + additionalIncome;

    // Update displays
    document.getElementById('regularIncome').textContent = formatCurrency(regularIncome);
    document.getElementById('additionalIncome').textContent = formatCurrency(additionalIncome);
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);

    // Save values automatically
    const incomeValues = {
        salary,
        rental,
        dividend,
        interest,
        fixed,
        customSources,
        regularIncome,
        additionalIncome,
        totalIncome,
        lastUpdated: new Date().toISOString()
    };
    saveToLocalStorage('incomeValues', incomeValues);
}

function addCustomIncomeSource(name = '', amount = '') {
    const customIncomeDiv = document.getElementById('custom-income');
    const newRow = document.createElement('div');
    newRow.className = 'form-group custom-income-row';
    newRow.innerHTML = `
        <div class="custom-income-inputs">
            <input type="text" placeholder="Income Source" value="${name}" class="custom-source">
            <input type="number" placeholder="Amount (₹)" value="${amount}" class="custom-amount no-spinner">
        </div>
        <button type="button" class="remove-income">
            <i class="fas fa-trash"></i>
        </button>
    `;

    // Add event listeners
    newRow.querySelector('.remove-income').addEventListener('click', function() {
        newRow.remove();
        calculateTotalIncome();
    });

    newRow.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateTotalIncome);
    });

    customIncomeDiv.appendChild(newRow);
    calculateTotalIncome(); // Calculate totals after adding new row
}

function saveIncomeData() {
    const incomeValues = {
        salary: document.getElementById('salary').value,
        rental: document.getElementById('rental').value,
        dividend: document.getElementById('dividend').value,
        interest: document.getElementById('interest').value,
        fixed: document.getElementById('fixed').value,
        customSources: [],
        lastUpdated: new Date().toISOString()
    };

    // Save custom income sources
    document.querySelectorAll('.custom-income-row').forEach(row => {
        incomeValues.customSources.push({
            name: row.querySelector('.custom-source').value,
            amount: row.querySelector('.custom-amount').value
        });
    });

    // Calculate totals
    const regularIncome = parseFloat(incomeValues.salary) + parseFloat(incomeValues.rental) + 
                         parseFloat(incomeValues.dividend) + parseFloat(incomeValues.interest);
    const additionalIncome = parseFloat(incomeValues.fixed) + 
                            incomeValues.customSources.reduce((sum, source) => sum + (parseFloat(source.amount) || 0), 0);
    
    incomeValues.regularIncome = regularIncome;
    incomeValues.additionalIncome = additionalIncome;
    incomeValues.totalIncome = regularIncome + additionalIncome;

    // Save to localStorage
    saveToLocalStorage('incomeValues', incomeValues);
} 
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
        const amount = parseFloat(row.querySelector('input[type="number"]').value) || 0;
        const name = row.querySelector('input[type="text"]').value;
        customTotal += amount;
        customSources.push({ name, amount });
    });

    const regularIncome = salary + rental + dividend + interest;
    const additionalIncome = fixed + customTotal;
    const totalIncome = regularIncome + additionalIncome;

    // Update displays
    document.getElementById('regularIncome').textContent = formatCurrency(regularIncome);
    document.getElementById('additionalIncome').textContent = formatCurrency(additionalIncome);
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);

    // Save values
    const incomeValues = {
        salary,
        rental,
        dividend,
        interest,
        fixed,
        customSources,
        total: totalIncome
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
            <input type="number" placeholder="Amount (₹)" value="${amount}" class="custom-amount">
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
} 
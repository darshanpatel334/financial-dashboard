document.addEventListener('DOMContentLoaded', function() {
    const incomeForm = document.getElementById('incomeForm');
    const totalIncomeResult = document.getElementById('totalIncomeResult');
    const annualIncomeResult = document.getElementById('annualIncomeResult');

    incomeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get all income values
        const salary = parseFloat(document.getElementById('salary').value) || 0;
        const business = parseFloat(document.getElementById('business').value) || 0;
        const rental = parseFloat(document.getElementById('rental').value) || 0;
        const investments = parseFloat(document.getElementById('investments').value) || 0;
        const additional = parseFloat(document.getElementById('additional').value) || 0;

        // Calculate total monthly income
        const totalMonthlyIncome = salary + business + rental + investments + additional;
        
        // Calculate annual income
        const totalAnnualIncome = totalMonthlyIncome * 12;

        // Format the results with Indian currency format
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });

        // Display the results
        totalIncomeResult.textContent = formatter.format(totalMonthlyIncome);
        annualIncomeResult.textContent = formatter.format(totalAnnualIncome);

        // Save to localStorage for future reference
        const incomeData = {
            monthly: {
                salary,
                business,
                rental,
                investments,
                additional,
                total: totalMonthlyIncome
            },
            annual: totalAnnualIncome,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('incomeData', JSON.stringify(incomeData));
    });

    // Load previous data if available
    const savedData = localStorage.getItem('incomeData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('salary').value = data.monthly.salary;
        document.getElementById('business').value = data.monthly.business;
        document.getElementById('rental').value = data.monthly.rental;
        document.getElementById('investments').value = data.monthly.investments;
        document.getElementById('additional').value = data.monthly.additional;
        
        totalIncomeResult.textContent = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(data.monthly.total);
        
        annualIncomeResult.textContent = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(data.annual);
    }
}); 
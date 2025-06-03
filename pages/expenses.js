document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('expenseForm');
    const totalExpensesResult = document.getElementById('totalExpensesResult');
    const essentialExpensesResult = document.getElementById('essentialExpensesResult');
    const lifestyleExpensesResult = document.getElementById('lifestyleExpensesResult');

    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get essential expenses
        const housing = parseFloat(document.getElementById('housing').value) || 0;
        const utilities = parseFloat(document.getElementById('utilities').value) || 0;
        const groceries = parseFloat(document.getElementById('groceries').value) || 0;

        // Get lifestyle expenses
        const entertainment = parseFloat(document.getElementById('entertainment').value) || 0;
        const dining = parseFloat(document.getElementById('dining').value) || 0;
        const shopping = parseFloat(document.getElementById('shopping').value) || 0;

        // Get other expenses
        const transport = parseFloat(document.getElementById('transport').value) || 0;
        const healthcare = parseFloat(document.getElementById('healthcare').value) || 0;
        const miscellaneous = parseFloat(document.getElementById('miscellaneous').value) || 0;

        // Calculate totals
        const essentialExpenses = housing + utilities + groceries;
        const lifestyleExpenses = entertainment + dining + shopping;
        const otherExpenses = transport + healthcare + miscellaneous;
        const totalExpenses = essentialExpenses + lifestyleExpenses + otherExpenses;

        // Format the results with Indian currency format
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });

        // Display the results
        totalExpensesResult.textContent = formatter.format(totalExpenses);
        essentialExpensesResult.textContent = formatter.format(essentialExpenses);
        lifestyleExpensesResult.textContent = formatter.format(lifestyleExpenses);

        // Save to localStorage for future reference
        const expenseData = {
            essential: {
                housing,
                utilities,
                groceries,
                total: essentialExpenses
            },
            lifestyle: {
                entertainment,
                dining,
                shopping,
                total: lifestyleExpenses
            },
            other: {
                transport,
                healthcare,
                miscellaneous,
                total: otherExpenses
            },
            totalExpenses,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('expenseData', JSON.stringify(expenseData));
    });

    // Load previous data if available
    const savedData = localStorage.getItem('expenseData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Load essential expenses
        document.getElementById('housing').value = data.essential.housing;
        document.getElementById('utilities').value = data.essential.utilities;
        document.getElementById('groceries').value = data.essential.groceries;

        // Load lifestyle expenses
        document.getElementById('entertainment').value = data.lifestyle.entertainment;
        document.getElementById('dining').value = data.lifestyle.dining;
        document.getElementById('shopping').value = data.lifestyle.shopping;

        // Load other expenses
        document.getElementById('transport').value = data.other.transport;
        document.getElementById('healthcare').value = data.other.healthcare;
        document.getElementById('miscellaneous').value = data.other.miscellaneous;

        // Format and display saved results
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });

        totalExpensesResult.textContent = formatter.format(data.totalExpenses);
        essentialExpensesResult.textContent = formatter.format(data.essential.total);
        lifestyleExpensesResult.textContent = formatter.format(data.lifestyle.total);
    }
}); 
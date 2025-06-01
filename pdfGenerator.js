// PDF Generation functionality
class PDFGenerator {
    constructor() {
        if (typeof window.jspdf === 'undefined') {
            window.jspdf = window.jsPDF;
        }
        this.pdf = new window.jspdf.jsPDF('p', 'pt', 'a4');
        this.pageWidth = this.pdf.internal.pageSize.width;
        this.pageHeight = this.pdf.internal.pageSize.height;
        this.margin = 40;
        this.yPos = this.margin;
        this.lineHeight = 25;
    }

    async generateFullReport() {
        try {
            // Add logo and header
            await this.addHeader();
            
            // Add personal information section
            this.addPersonalInfoSection();
            
            // Add summary section
            this.addSummarySection();
            
            // Add Net Worth details
            await this.addNetWorthSection();
            
            // Add Income details
            await this.addIncomeSection();
            
            // Add Expenses details
            await this.addExpensesSection();
            
            // Add FF Score section
            await this.addFFScoreSection();
            
            // Add footer
            this.addFooter();
            
            // Save the PDF
            this.pdf.save('NiveshMatrix-Financial-Report.pdf');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    }

    async addHeader() {
        // Add logo
        const logo = document.querySelector('.logo img');
        if (logo) {
            await this.addImage(logo, this.margin, this.yPos, 40, 40);
        }
        
        // Add title
        this.pdf.setFontSize(24);
        this.pdf.setTextColor(44, 62, 80);
        this.pdf.text('NiveshMatrix Financial Report', this.margin + 50, this.yPos + 25);
        
        // Add date
        this.pdf.setFontSize(12);
        this.pdf.setTextColor(100);
        this.pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, this.margin, this.yPos + 60);
        
        this.yPos += 80;
        this.addDivider();
    }

    addPersonalInfoSection() {
        this.addSectionTitle('Personal Information');
        
        const personalInfo = getFromLocalStorage('personalInfo') || {};
        const data = [
            ['Full Name', personalInfo.fullName || 'Not provided'],
            ['Email', personalInfo.email || 'Not provided'],
            ['Age', personalInfo.age ? `${personalInfo.age} years` : 'Not provided'],
            ['Last Updated', personalInfo.lastUpdated ? new Date(personalInfo.lastUpdated).toLocaleDateString() : 'Not provided']
        ];
        
        this.addTable(data, ['Field', 'Value'], [200, 250]);
        this.yPos += 20;
    }

    addSummarySection() {
        // Add summary title
        this.addSectionTitle('Financial Summary');
        
        // Get summary data
        const netWorth = document.getElementById('netWorth')?.textContent || '₹0';
        const totalIncome = document.getElementById('totalIncome')?.textContent || '₹0';
        const totalExpenses = document.getElementById('totalExpenses')?.textContent || '₹0';
        const ffScore = document.getElementById('ffScore')?.textContent || 'N/A';
        
        // Create summary table
        const summaryData = [
            ['Net Worth', netWorth],
            ['Monthly Income', totalIncome],
            ['Monthly Expenses', totalExpenses],
            ['Financial Freedom Score', ffScore]
        ];
        
        this.addTable(summaryData, ['Metric', 'Value'], [200, 150]);
        this.yPos += 20;
    }

    async addNetWorthSection() {
        this.addSectionTitle('Net Worth Breakdown');
        
        // Assets
        this.pdf.setFontSize(14);
        this.pdf.setTextColor(39, 174, 96);
        this.pdf.text('Assets', this.margin, this.yPos);
        this.yPos += this.lineHeight;
        
        const assetData = [
            ['Real Estate', document.getElementById('totalRealEstate')?.textContent || '₹0'],
            ['Investments', document.getElementById('totalInvestments')?.textContent || '₹0'],
            ['Fixed Income', document.getElementById('totalFixedIncome')?.textContent || '₹0'],
            ['Commodities', document.getElementById('totalCommodity')?.textContent || '₹0'],
            ['Cash', document.getElementById('totalCash')?.textContent || '₹0'],
            ['Other Assets', document.getElementById('totalOtherAssets')?.textContent || '₹0']
        ];
        
        this.addTable(assetData, ['Category', 'Amount'], [200, 150]);
        
        // Liabilities
        this.yPos += 20;
        this.pdf.setTextColor(231, 76, 60);
        this.pdf.text('Liabilities', this.margin, this.yPos);
        this.yPos += this.lineHeight;
        
        const liabilityData = [
            ['Home Loan', formatCurrency(document.getElementById('homeLoan')?.value || 0)],
            ['Car Loan', formatCurrency(document.getElementById('carLoan')?.value || 0)],
            ['Credit Card', formatCurrency(document.getElementById('creditCard')?.value || 0)],
            ['Education Loan', formatCurrency(document.getElementById('educationLoan')?.value || 0)]
        ];
        
        this.addTable(liabilityData, ['Category', 'Amount'], [200, 150]);
        this.yPos += 20;
    }

    async addIncomeSection() {
        this.checkAndAddNewPage();
        this.addSectionTitle('Income Sources');
        
        const incomeData = [
            ['Regular Income', document.getElementById('regularIncome')?.textContent || '₹0'],
            ['Additional Income', document.getElementById('additionalIncome')?.textContent || '₹0']
        ];
        
        this.addTable(incomeData, ['Category', 'Monthly Amount'], [200, 150]);
        
        // Add custom income sources if any
        const customSources = document.querySelectorAll('.custom-income-row');
        if (customSources.length > 0) {
            this.yPos += 20;
            this.pdf.setFontSize(14);
            this.pdf.text('Custom Income Sources', this.margin, this.yPos);
            this.yPos += this.lineHeight;
            
            const customData = Array.from(customSources).map(row => [
                row.querySelector('.custom-source').value,
                formatCurrency(row.querySelector('.custom-amount').value || 0)
            ]);
            
            this.addTable(customData, ['Source', 'Amount'], [200, 150]);
        }
        this.yPos += 20;
    }

    async addExpensesSection() {
        this.checkAndAddNewPage();
        this.addSectionTitle('Expense Breakdown');
        
        const monthlyExpenses = [
            ['Groceries', formatCurrency(document.getElementById('groceries')?.value || 0)],
            ['Utilities', formatCurrency(document.getElementById('utilities')?.value || 0)],
            ['Subscriptions', formatCurrency(document.getElementById('subscriptions')?.value || 0)],
            ['Shopping', formatCurrency(document.getElementById('shopping')?.value || 0)],
            ['Dining', formatCurrency(document.getElementById('dining')?.value || 0)]
        ];
        
        this.pdf.setFontSize(14);
        this.pdf.text('Monthly Expenses', this.margin, this.yPos);
        this.yPos += this.lineHeight;
        this.addTable(monthlyExpenses, ['Category', 'Amount'], [200, 150]);
        
        // Add big expenses
        this.yPos += 20;
        this.pdf.text('Big Expenses', this.margin, this.yPos);
        this.yPos += this.lineHeight;
        
        const bigExpenses = [
            ['Car EMI', formatCurrency(document.getElementById('carEMI')?.value || 0)],
            ['Home EMI', formatCurrency(document.getElementById('homeEMI')?.value || 0)],
            ['Electronics', formatCurrency(document.getElementById('electronics')?.value || 0)],
            ['Vacations', formatCurrency(document.getElementById('vacations')?.value || 0)]
        ];
        
        this.addTable(bigExpenses, ['Category', 'Amount'], [200, 150]);
        this.yPos += 20;
    }

    async addFFScoreSection() {
        this.checkAndAddNewPage();
        this.addSectionTitle('Financial Freedom Score');
        
        const ffScore = document.getElementById('ffScore')?.textContent || 'N/A';
        this.pdf.setFontSize(16);
        this.pdf.setTextColor(44, 62, 80);
        this.pdf.text(`Your Financial Freedom Score: ${ffScore}`, this.margin, this.yPos);
        
        this.yPos += 40;
        this.pdf.setFontSize(12);
        this.pdf.setTextColor(100);
        this.pdf.text('This score indicates the number of years your net worth', this.margin, this.yPos);
        this.yPos += 20;
        this.pdf.text('can sustain your current lifestyle without additional income.', this.margin, this.yPos);
        
        this.yPos += 40;
    }

    addFooter() {
        this.pdf.setFontSize(10);
        this.pdf.setTextColor(100);
        const footerText = '© 2024 NiveshMatrix | This report is generated based on the data you provided';
        const footerWidth = this.pdf.getStringUnitWidth(footerText) * 10;
        const footerX = (this.pageWidth - footerWidth) / 2;
        this.pdf.text(footerText, footerX, this.pageHeight - 20);
    }

    // Helper methods
    async addImage(imgElement, x, y, width, height) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(imgElement, 0, 0, width, height);
            
            const imgData = canvas.toDataURL('image/png');
            this.pdf.addImage(imgData, 'PNG', x, y, width, height);
            resolve();
        });
    }

    addSectionTitle(title) {
        this.pdf.setFontSize(18);
        this.pdf.setTextColor(44, 62, 80);
        this.pdf.text(title, this.margin, this.yPos);
        this.yPos += this.lineHeight;
        this.addDivider();
    }

    addDivider() {
        this.pdf.setDrawColor(200);
        this.pdf.line(this.margin, this.yPos, this.pageWidth - this.margin, this.yPos);
        this.yPos += this.lineHeight;
    }

    addTable(data, headers, columnWidths) {
        this.pdf.setFontSize(12);
        this.pdf.setTextColor(60);
        
        // Add headers
        headers.forEach((header, i) => {
            this.pdf.setFont(undefined, 'bold');
            this.pdf.text(header, this.margin + (i * columnWidths[i]), this.yPos);
        });
        this.yPos += this.lineHeight;
        
        // Add data
        data.forEach(row => {
            this.pdf.setFont(undefined, 'normal');
            row.forEach((cell, i) => {
                this.pdf.text(cell.toString(), this.margin + (i * columnWidths[i]), this.yPos);
            });
            this.yPos += 20;
        });
    }

    checkAndAddNewPage() {
        if (this.yPos > this.pageHeight - 100) {
            this.pdf.addPage();
            this.yPos = this.margin;
        }
    }
}

// Initialize PDF functionality on dashboard and FF pages
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadPDFBtn');
    if (downloadBtn) {
        downloadBtn.style.background = '#e74c3c';
        downloadBtn.style.marginTop = '20px';
        
        downloadBtn.addEventListener('click', async () => {
            downloadBtn.disabled = true;
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
            
            try {
                const generator = new PDFGenerator();
                await generator.generateFullReport();
            } finally {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = originalText;
            }
        });
    }
}); 
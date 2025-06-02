// State Management System
const AppState = {
    // Personal Information
    personalInfo: {
        fullName: '',
        email: '',
        birthdate: '',
        age: null,
        lastUpdated: null
    },

    // Net Worth Module
    netWorth: {
        assets: {
            realEstate: {
                buildings: { value: 0, yield: 0 },
                plots: { value: 0, yield: 0 },
                land: { value: 0, yield: 0 },
                custom: []
            },
            equity: {
                directEquity: { value: 0, yield: 0 },
                privateBusinessInvestment: { value: 0, yield: 0 },
                equityMutualFunds: { value: 0, yield: 0 },
                custom: []
            },
            fixedIncome: {
                fixedDeposits: { value: 0, yield: 0 },
                savingSchemes: { value: 0, yield: 0 },
                savingAccount: { value: 0, yield: 0 },
                custom: []
            },
            commodities: {
                gold: { value: 0 },
                otherCommodities: { value: 0 },
                custom: []
            },
            others: {
                cashInHand: { value: 0 },
                ornamentsAndOwnHouse: { value: 0 },
                custom: []
            }
        },
        liabilities: {
            homeLoan: { amount: 0, tenure: 0 },
            carLoan: { amount: 0, tenure: 0 },
            educationLoan: { amount: 0, tenure: 0 },
            personalLoan: { amount: 0, tenure: 0 },
            creditCards: { amount: 0, tenure: 0 },
            businessLoan: { amount: 0, tenure: 0 },
            custom: []
        },
        summary: {
            totalAssets: 0,
            totalLiabilities: 0,
            netWorth: 0,
            expectedAnnualReturn: 0
        }
    },

    // Income Module
    income: {
        regular: {
            salaryPension: 0
        },
        passive: {
            rental: 0,
            dividend: 0,
            interest: 0
        },
        additional: {
            fixed: [],
            custom: []
        },
        summary: {
            monthlyIncome: 0,
            annualIncome: 0
        }
    },

    // Expenses Module
    expenses: {
        monthlyRecurring: {
            houseRent: 0,
            officeRent: 0,
            carFuel: 0,
            clothing: 0,
            groceries: 0,
            outing: 0,
            food: 0,
            subscriptions: 0,
            gas: 0,
            electricity: 0,
            mobileRecharge: 0,
            custom: []
        },
        annualRecurring: {
            lifeInsurance: 0,
            medicalInsurance: 0,
            gymFee: 0,
            annualSubscriptions: 0,
            carMaintenance: 0,
            traveling: 0,
            societyMaintenance: 0,
            taxes: 0,
            otherAnnualMaintenance: 0,
            membershipFees: 0,
            custom: []
        },
        bigExpenses: {
            appliances: [],
            house: {
                value: 0,
                rentalYield: 0
            },
            custom: []
        },
        summary: {
            totalMonthlyRecurring: 0,
            totalAnnualRecurring: 0,
            totalBigExpenses: 0,
            totalMonthlyExpenses: 0,
            totalAnnualExpenses: 0,
            expectedInflation: 0
        }
    },

    // FF Score
    ffScore: {
        inputs: {
            netWorth: 0,
            annualExpenses: 0,
            assetGrowthRate: 0,
            inflationRate: 0
        },
        results: {
            yearsOfSustainability: 0,
            score: 0,
            level: ''
        }
    },

    // Risk Profile
    riskProfile: {
        answers: [],
        totalScore: 0,
        profile: '',
        recommendedAllocation: {
            equity: 0,
            debt: 0,
            liquid: 0
        }
    },

    // Insurance
    insurance: {
        life: {
            sumAssured: 0,
            annualPremium: 0,
            type: '' // 'term' or 'endowment'
        },
        medical: {
            sumAssured: 0,
            annualPremium: 0,
            roomRentLimit: 0,
            hasCoPay: false
        }
    },

    // Initialize state from localStorage
    init() {
        const savedState = utils.getFromLocalStorage('appState');
        if (savedState) {
            Object.assign(this, savedState);
        }
    },

    // Save state to localStorage
    save() {
        utils.saveToLocalStorage('appState', this);
    },

    // Reset state
    reset() {
        Object.keys(this).forEach(key => {
            if (typeof this[key] !== 'function') {
                this[key] = JSON.parse(JSON.stringify(this[key]));
            }
        });
        this.save();
    },

    // Update state
    update(module, data) {
        if (this[module]) {
            Object.assign(this[module], data);
            this.save();
            return true;
        }
        return false;
    }
};

// Initialize state when the script loads
AppState.init();

// Make state available globally
window.AppState = AppState; 
// Firestore Service for Financial Dashboard
import { auth, db } from './firebase.js';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    onSnapshot,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';

// Supported pages for form data storage
const SUPPORTED_PAGES = [
    'personal_info',
    'networth', 
    'income',
    'expenses',
    'insurance',
    'risk_profile',
    'ff_score',
    'dashboard',
    'analytics'
];

// Default/blank values for each page
const DEFAULT_VALUES = {
    personal_info: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    },
    networth: {
        assets: {},
        liabilities: {},
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0
    },
    income: {
        salaryIncome: 0,
        businessIncome: 0,
        rentalIncome: 0,
        investmentIncome: 0,
        otherIncome: 0,
        totalIncome: 0
    },
    expenses: {
        housing: 0,
        transportation: 0,
        food: 0,
        utilities: 0,
        healthcare: 0,
        entertainment: 0,
        shopping: 0,
        otherExpenses: 0,
        totalExpenses: 0
    },
    insurance: {
        lifeInsurance: {},
        healthInsurance: {},
        vehicleInsurance: {},
        homeInsurance: {},
        totalPremiums: 0
    },
    risk_profile: {
        riskScore: 0,
        riskCategory: '',
        responses: {},
        investmentHorizon: '',
        riskTolerance: ''
    },
    ff_score: {
        score: 0,
        category: '',
        components: {},
        recommendations: []
    },
    dashboard: {
        lastUpdated: null,
        preferences: {},
        widgets: []
    },
    analytics: {
        insights: {},
        trends: {},
        reports: []
    }
};

/**
 * Get the current authenticated user's UID
 * @returns {string|null} User UID or null if not authenticated
 */
function getCurrentUserUid() {
    const user = auth.currentUser;
    return user ? user.uid : null;
}

/**
 * Wait for authentication state to be determined
 * @returns {Promise<string|null>} Promise resolving to user UID or null
 */
function waitForAuth() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user ? user.uid : null);
        });
    });
}

/**
 * Validate page name
 * @param {string} pageName - The page name to validate
 * @returns {boolean} True if valid page name
 */
function isValidPageName(pageName) {
    return SUPPORTED_PAGES.includes(pageName);
}

/**
 * Get document reference for user's page data
 * @param {string} uid - User UID
 * @param {string} pageName - Page name
 * @returns {DocumentReference} Firestore document reference
 */
function getDocumentRef(uid, pageName) {
    return doc(db, 'users', uid, pageName, 'form_data');
}

/**
 * Save form data for a specific page
 * @param {string} pageName - The page name (e.g., 'personal_info', 'networth')
 * @param {Object} formData - The form data to save
 * @returns {Promise<void>} Promise that resolves when data is saved
 */
export async function saveFormData(pageName, formData) {
    try {
        // Validate inputs
        if (!isValidPageName(pageName)) {
            throw new Error(`Invalid page name: ${pageName}. Supported pages: ${SUPPORTED_PAGES.join(', ')}`);
        }

        if (!formData || typeof formData !== 'object') {
            throw new Error('Form data must be a valid object');
        }

        // Get current user UID
        let uid = getCurrentUserUid();
        if (!uid) {
            // Wait for auth state if not immediately available
            uid = await waitForAuth();
            if (!uid) {
                throw new Error('User must be authenticated to save data');
            }
        }

        // Prepare data with metadata
        const dataToSave = {
            ...formData,
            lastUpdated: serverTimestamp(),
            page: pageName,
            version: '1.0'
        };

        // Get document reference and save data
        const docRef = getDocumentRef(uid, pageName);
        await setDoc(docRef, dataToSave, { merge: true });

        console.log(`Form data saved successfully for page: ${pageName}`);
        return true;

    } catch (error) {
        console.error(`Error saving form data for page ${pageName}:`, error);
        throw error;
    }
}

/**
 * Fetch form data for a specific page
 * @param {string} pageName - The page name to fetch data for
 * @returns {Promise<Object>} Promise resolving to the form data or default values
 */
export async function fetchFormData(pageName) {
    try {
        // Validate page name
        if (!isValidPageName(pageName)) {
            throw new Error(`Invalid page name: ${pageName}. Supported pages: ${SUPPORTED_PAGES.join(', ')}`);
        }

        // Get current user UID
        let uid = getCurrentUserUid();
        if (!uid) {
            // Wait for auth state if not immediately available
            uid = await waitForAuth();
            if (!uid) {
                console.log(`No authenticated user, returning default values for ${pageName}`);
                return DEFAULT_VALUES[pageName] || {};
            }
        }

        // Get document reference and fetch data
        const docRef = getDocumentRef(uid, pageName);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log(`Form data fetched successfully for page: ${pageName}`);
            
            // Remove metadata fields before returning
            const { lastUpdated, page, version, ...formData } = data;
            return formData;
        } else {
            console.log(`No saved data found for page: ${pageName}, returning default values`);
            return DEFAULT_VALUES[pageName] || {};
        }

    } catch (error) {
        console.error(`Error fetching form data for page ${pageName}:`, error);
        // Return default values on error to prevent page breaks
        return DEFAULT_VALUES[pageName] || {};
    }
}

/**
 * Update specific fields in form data without overwriting the entire document
 * @param {string} pageName - The page name
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<void>} Promise that resolves when data is updated
 */
export async function updateFormData(pageName, updates) {
    try {
        // Validate inputs
        if (!isValidPageName(pageName)) {
            throw new Error(`Invalid page name: ${pageName}. Supported pages: ${SUPPORTED_PAGES.join(', ')}`);
        }

        if (!updates || typeof updates !== 'object') {
            throw new Error('Updates must be a valid object');
        }

        // Get current user UID
        let uid = getCurrentUserUid();
        if (!uid) {
            uid = await waitForAuth();
            if (!uid) {
                throw new Error('User must be authenticated to update data');
            }
        }

        // Prepare updates with metadata
        const updatesToApply = {
            ...updates,
            lastUpdated: serverTimestamp()
        };

        // Get document reference and update
        const docRef = getDocumentRef(uid, pageName);
        await updateDoc(docRef, updatesToApply);

        console.log(`Form data updated successfully for page: ${pageName}`);
        return true;

    } catch (error) {
        console.error(`Error updating form data for page ${pageName}:`, error);
        throw error;
    }
}

/**
 * Listen to real-time changes in form data for a specific page
 * @param {string} pageName - The page name to listen to
 * @param {Function} callback - Callback function to handle data changes
 * @returns {Function} Unsubscribe function to stop listening
 */
export function listenToFormData(pageName, callback) {
    try {
        // Validate inputs
        if (!isValidPageName(pageName)) {
            throw new Error(`Invalid page name: ${pageName}. Supported pages: ${SUPPORTED_PAGES.join(', ')}`);
        }

        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        // Get current user UID
        const uid = getCurrentUserUid();
        if (!uid) {
            console.log('No authenticated user for real-time listener');
            // Return empty unsubscribe function
            return () => {};
        }

        // Set up real-time listener
        const docRef = getDocumentRef(uid, pageName);
        
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Remove metadata fields before calling callback
                const { lastUpdated, page, version, ...formData } = data;
                callback(formData);
            } else {
                // Call callback with default values if no data exists
                callback(DEFAULT_VALUES[pageName] || {});
            }
        }, (error) => {
            console.error(`Error in real-time listener for page ${pageName}:`, error);
            // Call callback with default values on error
            callback(DEFAULT_VALUES[pageName] || {});
        });

    } catch (error) {
        console.error(`Error setting up real-time listener for page ${pageName}:`, error);
        // Return empty unsubscribe function
        return () => {};
    }
}

/**
 * Fetch form data for all pages for the current user
 * @returns {Promise<Object>} Promise resolving to an object with all page data
 */
export async function fetchAllFormData() {
    try {
        // Get current user UID
        let uid = getCurrentUserUid();
        if (!uid) {
            uid = await waitForAuth();
            if (!uid) {
                console.log('No authenticated user, returning default values for all pages');
                return DEFAULT_VALUES;
            }
        }

        const allData = {};
        
        // Fetch data for all supported pages
        const fetchPromises = SUPPORTED_PAGES.map(async (pageName) => {
            try {
                const data = await fetchFormData(pageName);
                allData[pageName] = data;
            } catch (error) {
                console.error(`Error fetching data for page ${pageName}:`, error);
                allData[pageName] = DEFAULT_VALUES[pageName] || {};
            }
        });

        await Promise.all(fetchPromises);
        return allData;

    } catch (error) {
        console.error('Error fetching all form data:', error);
        return DEFAULT_VALUES;
    }
}

/**
 * Delete form data for a specific page
 * @param {string} pageName - The page name to delete data for
 * @returns {Promise<void>} Promise that resolves when data is deleted
 */
export async function deleteFormData(pageName) {
    try {
        // Validate page name
        if (!isValidPageName(pageName)) {
            throw new Error(`Invalid page name: ${pageName}. Supported pages: ${SUPPORTED_PAGES.join(', ')}`);
        }

        // Get current user UID
        let uid = getCurrentUserUid();
        if (!uid) {
            uid = await waitForAuth();
            if (!uid) {
                throw new Error('User must be authenticated to delete data');
            }
        }

        // Delete document by setting it to default values
        const docRef = getDocumentRef(uid, pageName);
        const defaultData = {
            ...DEFAULT_VALUES[pageName],
            lastUpdated: serverTimestamp(),
            page: pageName,
            version: '1.0'
        };
        
        await setDoc(docRef, defaultData);
        console.log(`Form data reset to defaults for page: ${pageName}`);
        return true;

    } catch (error) {
        console.error(`Error deleting form data for page ${pageName}:`, error);
        throw error;
    }
}

/**
 * Check if user has any saved data
 * @returns {Promise<boolean>} Promise resolving to true if user has saved data
 */
export async function hasUserData() {
    try {
        // Get current user UID
        let uid = getCurrentUserUid();
        if (!uid) {
            uid = await waitForAuth();
            if (!uid) {
                return false;
            }
        }

        // Check if any page has saved data
        for (const pageName of SUPPORTED_PAGES) {
            const docRef = getDocumentRef(uid, pageName);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return true;
            }
        }

        return false;

    } catch (error) {
        console.error('Error checking for user data:', error);
        return false;
    }
}

// Export supported pages and default values for external use
export { SUPPORTED_PAGES, DEFAULT_VALUES }; 
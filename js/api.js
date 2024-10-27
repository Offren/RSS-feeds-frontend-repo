const API_URL = '/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

async function getVisitorIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting IP:', error);
        return null;
    }
}

async function createSession(username, platform, followers) {
    return fetchWithRetry(`${API_URL}/session.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            platform,
            followers
        })
    });
}

async function fetchOffers() {
    return fetchWithRetry(`${API_URL}/offers.php`);
}

async function checkStatus() {
    return fetchWithRetry(`${API_URL}/status.php`);
}

async function recordClick(offerId, link) {
    return fetchWithRetry(`${API_URL}/click.php?offer_id=${offerId}&link=${encodeURIComponent(link)}`);
}

export { 
    getVisitorIP, 
    createSession, 
    fetchOffers, 
    checkStatus, 
    recordClick 
};

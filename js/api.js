const API_URL = '/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Content-Type': 'application/json'
            }
        });
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

async function createSession(username, platform, followers) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('platform', platform);
    formData.append('followers', followers);

    return fetchWithRetry(`${API_URL}/session.php`, {
        method: 'POST',
        body: formData
    });
}

async function fetchOffers() {
    return fetchWithRetry(`${API_URL}/offers.php`);
}

async function checkStatus() {
    return fetchWithRetry(`${API_URL}/status.php`);
}

async function recordClick(offerId, link) {
    const params = new URLSearchParams({
        offer_id: offerId,
        link: encodeURIComponent(link)
    });
    
    return fetchWithRetry(`${API_URL}/click.php?${params}`);
}

export { 
    createSession, 
    fetchOffers, 
    checkStatus, 
    recordClick 
};

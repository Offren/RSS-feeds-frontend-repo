const API_KEY = '28214|UGpxaZZBhUKU2Uj25K74u2D1zH0aNdWpGInhePiZf1d8dff8';
const API_URL = 'https://unlockcontent.net/api/v2';
const MAX_OFFERS = 5;
const FEED_REPO = 'https://raw.githubusercontent.com/Offren/feed-generator-repo/tree/main/public/feeds';

const OFFER_TYPES = {
    CPI: 1,
    CPA: 2,
    PIN: 4,
    VID: 8
};

const ALL_OFFER_TYPES = Object.values(OFFER_TYPES).reduce((a, b) => a + b, 0);

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

function parseEPC(epc) {
    const parsed = parseFloat(epc);
    return isNaN(parsed) ? 0 : parsed;
}

function sortOffersByEPC(offers) {
    return offers.sort((a, b) => {
        const epcA = parseEPC(a.epc);
        const epcB = parseEPC(b.epc);
        return epcB - epcA;
    }).slice(0, MAX_OFFERS);
}

async function fetchFeeds() {
    try {
        const feedFiles = [
            'gamerpower_games.xml',
            'gamerpower_loot.xml',
            'itchio_games.xml',
            'ivy_league.xml',
            'scraped_xml_feed.xml'
        ];
        
        const feeds = await Promise.all(
            feedFiles.map(async (file) => {
                const response = await fetch(`${FEED_REPO}/${file}`);
                if (!response.ok) {
                    console.warn(`Feed ${file} not found, skipping...`);
                    return null;
                }
                return response.text();
            })
        );

        return feeds.filter(feed => feed !== null);
    } catch (error) {
        console.error('Error fetching feeds:', error);
        return [];
    }
}

async function fetchOffers() {
    try {
        const ip = await getVisitorIP();
        if (!ip) {
            console.error('Could not determine visitor IP');
            return [];
        }

        const params = new URLSearchParams({
            ip: ip,
            user_agent: navigator.userAgent,
            ctype: ALL_OFFER_TYPES.toString()
        });

        const requestUrl = `${API_URL}?${params}`;
        console.log('Fetching offers from:', requestUrl);

        const response = await fetch(requestUrl, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('API Response status:', response.status);
        const responseText = await response.text();
        console.log('API Response body:', responseText);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} - ${responseText}`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse API response:', e);
            return [];
        }

        if (!data.success) {
            console.error('API request was not successful:', data.error || 'Unknown error');
            return [];
        }

        if (!Array.isArray(data.offers)) {
            console.error('Invalid offers data received:', data);
            return [];
        }

        return sortOffersByEPC(data.offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        return [];
    }
}

function checkOfferCompletion() {
    const targetUrl = localStorage.getItem('targetUrl');
    if (targetUrl) {
        localStorage.removeItem('targetUrl');
        window.location.href = targetUrl;
    }
}

export { fetchOffers, checkOfferCompletion, fetchFeeds }

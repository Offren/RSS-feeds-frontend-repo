import { fetchOffers, recordClick, checkStatus } from './api.js';

async function renderOffers() {
    const container = document.getElementById('offers-container');
    if (!container) return;

    try {
        const response = await fetchOffers();
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch offers');
        }

        const offers = response.data;
        container.innerHTML = '';

        if (!offers.length) {
            container.innerHTML = '<div class="text-white">No offers available at this time.</div>';
            return;
        }

        for (const offer of offers) {
            const offerElement = document.createElement('div');
            offerElement.className = 'app';
            offerElement.onclick = async () => {
                try {
                    await recordClick(offer.id, offer.url);
                    window.open(offer.url, '_blank');
                } catch (error) {
                    console.error('Error recording click:', error);
                }
            };

            offerElement.innerHTML = `
                <div class="offer-type-badge offer-type-${offer.type.toLowerCase()}">${offer.type}</div>
                <div class="incentive">${offer.payout}</div>
                <div class="d-flex gap-3">
                    <img src="${offer.icon}" alt="${offer.name}" class="offer-image">
                    <div>
                        <h3 class="fs-5 fw-semibold text-white mb-2">${offer.name}</h3>
                        <p class="fs-6 text-white text-opacity-75 mb-0">${offer.description}</p>
                    </div>
                </div>
            `;

            container.appendChild(offerElement);
        }
    } catch (error) {
        console.error('Error rendering offers:', error);
        container.innerHTML = '<div class="text-white">Failed to load offers. Please try again later.</div>';
    }
}

async function updateStatus() {
    try {
        const response = await checkStatus();
        const completionElement = document.getElementById('conversions-complete');
        
        if (response.success) {
            completionElement.textContent = '1';
            // Redirect if target URL exists
            const targetUrl = localStorage.getItem('targetUrl');
            if (targetUrl) {
                window.location.href = targetUrl;
            }
        }
    } catch (error) {
        console.error('Error checking status:', error);
    }
}

// Check status every 30 seconds
setInterval(updateStatus, 30000);

export { renderOffers, updateStatus };

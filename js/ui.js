// URL parameter handling
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        class: params.get('class'),
        hash: params.get('hash')
    };
}

// RSS Feed handling
async function renderFeeds(feeds) {
    const parser = new DOMParser();
    let allItems = [];
    
    for (const feedContent of feeds) {
        try {
            const xml = parser.parseFromString(feedContent, "text/xml");
            const items = xml.getElementsByTagName("item");
            
            for (const item of items) {
                const description = item.getElementsByTagName("description")[0]?.textContent;
                if (!description) continue;
                
                const classMatch = description.match(/<class>(.*?)<\/class>/);
                const hashMatch = description.match(/<hash>(.*?)<\/hash>/);
                
                if (classMatch && hashMatch) {
                    allItems.push({
                        title: item.getElementsByTagName("title")[0].textContent,
                        link: item.getElementsByTagName("link")[0].textContent,
                        class: classMatch[1],
                        hash: hashMatch[1],
                        description: description.replace(/<class>.*?<\/class>\n<hash>.*?<\/hash>\n/, ''),
                        image: item.getElementsByTagName("enclosure")[0]?.getAttribute("url") || null
                    });
                }
            }
        } catch (error) {
            console.error('Error parsing feed:', error);
        }
    }
    
    return allItems;
}

async function renderOffers(offers) {
    const container = document.getElementById('offers-container');
    if (!container) return;

    container.innerHTML = '';

    if (!offers.length) {
        container.innerHTML = '<div class="text-white">No offers available at this time.</div>';
        return;
    }

    for (const offer of offers) {
        const offerElement = document.createElement('div');
        offerElement.className = 'app';
        offerElement.onclick = () => window.open(offer.url, '_blank');

        const offerType = Object.keys(OFFER_TYPES).find(key => 
            OFFER_TYPES[key] === parseInt(offer.type)
        )?.toLowerCase() || 'unknown';

        offerElement.innerHTML = `
            <div class="offer-type-badge offer-type-${offerType}">${offerType}</div>
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
}

export { renderOffers, renderFeeds }
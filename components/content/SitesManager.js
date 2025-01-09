import i18nManager from '../common/i18n.js';

export class SitesManager {
    constructor() {
        this.sites = null;
        this.pinnedSites = [];
        this.loadPinnedSites();
        this.iconCache = new Map();
        this.loadIconCache();
        this.defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk5OSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==';
    }

    async initialize() {
        try {
            const response = await fetch(chrome.runtime.getURL('data/sites.json'));
            if (!response.ok) {
                throw new Error('Failed to load sites data');
            }
            this.sites = await response.json();
            return true;
        } catch (error) {
            console.error('Error loading sites:', error);
            return false;
        }
    }

    loadPinnedSites() {
        try {
            const saved = localStorage.getItem('pinnedSites');
            if (saved) {
                this.pinnedSites = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading pinned sites:', error);
            this.pinnedSites = [];
        }
    }

    savePinnedSites() {
        try {
            localStorage.setItem('pinnedSites', JSON.stringify(this.pinnedSites));
        } catch (error) {
            console.error('Error saving pinned sites:', error);
        }
    }

    getAllCategories() {
        return this.sites?.categories || [];
    }

    getSitesByCategory(categoryId) {
        const category = this.sites?.categories.find(c => c.id === categoryId);
        return category?.sites || [];
    }

    getPinnedSites() {
        return this.pinnedSites;
    }

    pinSite(site) {
        if (!this.isSitePinned(site.url)) {
            this.pinnedSites.push(site);
            this.savePinnedSites();
            return true;
        }
        return false;
    }

    unpinSite(url) {
        const index = this.pinnedSites.findIndex(site => site.url === url);
        if (index !== -1) {
            this.pinnedSites.splice(index, 1);
            this.savePinnedSites();
            return true;
        }
        return false;
    }

    searchSites(query) {
        if (!query || !this.sites) return [];
        
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        this.sites.categories.forEach(category => {
            const isCategoryMatch = Object.values(category.name).some(name => 
                name.toLowerCase().includes(lowerQuery)
            ) || category.id.toLowerCase().includes(lowerQuery);
            
            category.sites.forEach(site => {
                const isTitleMatch = Object.values(site.title).some(title => 
                    title.toLowerCase().includes(lowerQuery)
                );
                const isDescMatch = Object.values(site.description).some(desc => 
                    desc && desc.toLowerCase().includes(lowerQuery)
                );
                const isUrlMatch = site.url.toLowerCase().includes(lowerQuery);
                
                if (isCategoryMatch || isTitleMatch || isDescMatch || isUrlMatch) {
                    results.push({
                        ...site,
                        category: Object.values(category.name)[0]
                    });
                }
            });
        });
        
        return results;
    }

    isSitePinned(url) {
        return this.pinnedSites.some(site => site.url === url);
    }

    async getIconFromCache(url) {
        try {
            const cache = localStorage.getItem('iconCache');
            if (cache) {
                const iconCache = JSON.parse(cache);
                return iconCache[url];
            }
            return null;
        } catch (error) {
            console.error('Error loading icon from cache:', error);
            return null;
        }
    }

    async saveIconToCache(url, iconUrl) {
        try {
            const cache = localStorage.getItem('iconCache');
            const iconCache = cache ? JSON.parse(cache) : {};
            iconCache[url] = iconUrl;
            localStorage.setItem('iconCache', JSON.stringify(iconCache));
        } catch (error) {
            console.error('Error saving icon to cache:', error);
        }
    }

    loadIconCache() {
        try {
            const cache = localStorage.getItem('iconCache');
            if (cache) {
                const iconCache = JSON.parse(cache);
                Object.entries(iconCache).forEach(([url, iconUrl]) => {
                    this.iconCache.set(url, iconUrl);
                });
            }
        } catch (error) {
            console.error('Error loading icon cache:', error);
            this.iconCache.clear();
        }
    }

    async getIconUrl(url) {
        try {
            const cachedIcon = await this.getIconFromCache(url);
            if (cachedIcon) {
                return cachedIcon;
            }

            const hostname = new URL(url).hostname;
            const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
            
            const isIconValid = await this.checkImageExists(googleFaviconUrl);
            if (isIconValid) {
                await this.saveIconToCache(url, googleFaviconUrl);
                return googleFaviconUrl;
            }

            const directFaviconUrl = `https://${hostname}/favicon.ico`;
            const isDirectIconValid = await this.checkImageExists(directFaviconUrl);
            if (isDirectIconValid) {
                await this.saveIconToCache(url, directFaviconUrl);
                return directFaviconUrl;
            }

            return this.getDefaultIcon(url);
        } catch (error) {
            console.error('Error getting icon:', error);
            return this.getDefaultIcon(url);
        }
    }

    async checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    getDefaultIcon(url) {
        const hostname = new URL(url).hostname;
        const letter = hostname.charAt(0).toUpperCase();
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                <rect width="40" height="40" fill="#98c379"/>
                <text x="50%" y="50%" dy=".35em" fill="white" 
                    font-family="Arial" font-size="20" font-weight="bold" 
                    text-anchor="middle">${letter}</text>
            </svg>
        `)}`;
    }

    reorderPinnedSites(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        if (fromIndex < 0 || toIndex < 0 || 
            fromIndex >= this.pinnedSites.length || 
            toIndex >= this.pinnedSites.length) {
            return;
        }
        
        const [movedSite] = this.pinnedSites.splice(fromIndex, 1);
        this.pinnedSites.splice(toIndex, 0, movedSite);
        this.savePinnedSites();
        
        window.dispatchEvent(new CustomEvent('pinnedSitesReordered'));
    }
} 
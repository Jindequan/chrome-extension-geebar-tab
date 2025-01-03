import i18nManager from '../common/i18n.js';

export class CryptoWidget {
    constructor() {
        this.title = i18nManager.t('crypto.title');
        this.updateInterval = 60000; // 1分钟更新一次
        this.timer = null;
        this.coins = [
            { id: 'bitcoin', symbol: 'BTC', icon: '₿' },
            { id: 'ethereum', symbol: 'ETH', icon: 'Ξ' },
            { id: 'dogecoin', symbol: 'DOGE', icon: 'Ð' },
            { id: 'binancecoin', symbol: 'BNB', icon: 'BNB' },
            { id: 'ripple', symbol: 'XRP', icon: 'XRP' }
        ];
    }

    initialize(container) {
        this.container = container;
        this.render();
        this.loadCryptoData();
        this.startAutoUpdate();
    }

    render() {
        this.container.innerHTML = `
            <div class="crypto-widget market-widget">
                <div class="market-loading">${i18nManager.t('crypto.loading')}</div>
                
                <div class="market-content" style="display: none;">
                    <div class="market-list"></div>
                </div>

                <div class="market-error" style="display: none">
                    <div class="error-message">${i18nManager.t('crypto.error')}</div>
                    <button class="retry-button">${i18nManager.t('crypto.retry')}</button>
                </div>
            </div>
        `;

        this.loadingEl = this.container.querySelector('.market-loading');
        this.contentEl = this.container.querySelector('.market-content');
        this.listEl = this.container.querySelector('.market-list');
        this.errorEl = this.container.querySelector('.market-error');

        this.container.querySelector('.retry-button').addEventListener('click', () => {
            this.loadCryptoData();
        });
    }

    async loadCryptoData() {
        try {
            this.showLoading();
            const data = await this.fetchCryptoData();
            this.updateCryptoDisplay(data);
            this.showContent();
        } catch (error) {
            console.error('Failed to load crypto data:', error);
            this.showError();
        }
    }

    async fetchCryptoData() {
        const ids = this.coins.map(coin => coin.id).join(',');
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24h_change=true&include_24h_vol=true&include_market_cap=true`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Crypto API request failed');
        }
        return await response.json();
    }

    updateCryptoDisplay(data) {
        this.listEl.innerHTML = this.coins.map(coin => {
            const coinData = data[coin.id];
            if (!coinData) return '';

            const price = Number(coinData.usd) || 0;
            const change = Number(coinData.usd_24h_change) || 0;
            const volume = Number(coinData.usd_24h_vol) || 0;
            const marketCap = Number(coinData.usd_market_cap) || 0;

            return `
                <div class="market-item">
                    <div class="market-header">
                        <div class="market-symbol">
                            <span class="icon">${coin.icon}</span>
                            <span class="code">${coin.symbol}</span>
                        </div>
                        <div class="market-price">
                            <div class="current">$${price.toFixed(2)}</div>
                            <div class="change ${change >= 0 ? 'up' : 'down'}">
                                ${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                    <div class="market-details">
                        <div class="market-detail-item">
                            <span class="label">${i18nManager.t('crypto.volume')}</span>
                            <span class="value">$${this.formatNumber(volume, true)}</span>
                        </div>
                        <div class="market-detail-item">
                            <span class="label">${i18nManager.t('crypto.marketCap')}</span>
                            <span class="value">$${this.formatNumber(marketCap, true)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatNumber(number, compact = false) {
        if (typeof number !== 'number' || isNaN(number)) return '0';
        
        if (compact) {
            if (number >= 1000000000) {
                return (number / 1000000000).toFixed(2) + 'B';
            } else if (number >= 1000000) {
                return (number / 1000000).toFixed(2) + 'M';
            } else if (number >= 1000) {
                return (number / 1000).toFixed(2) + 'K';
            }
        }
        
        return number.toLocaleString('en-US');
    }

    showLoading() {
        this.loadingEl.style.display = 'block';
        this.contentEl.style.display = 'none';
        this.errorEl.style.display = 'none';
    }

    showContent() {
        this.loadingEl.style.display = 'none';
        this.contentEl.style.display = 'block';
        this.errorEl.style.display = 'none';
    }

    showError() {
        this.loadingEl.style.display = 'none';
        this.contentEl.style.display = 'none';
        this.errorEl.style.display = 'block';
    }

    startAutoUpdate() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
            this.loadCryptoData();
        }, this.updateInterval);
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateContent(container) {
        this.container = container;
        this.render();
        this.loadCryptoData();
    }
} 
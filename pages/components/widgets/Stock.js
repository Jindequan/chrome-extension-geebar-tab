import i18nManager from '../common/i18n.js';

export class StockWidget {
    constructor() {
        console.log('StockWidget constructor called');
        this.title = i18nManager.t('stock.title');
        this.stocks = [
            { code: '000001', name: '上证指数', isDefault: true },
            { code: '399001', name: '深证成指', isDefault: true },
            { code: '399006', name: '创业板指', isDefault: true }
        ];
        this.updateInterval = 10000;
        this.timer = null;

        // 监听语言变更
        window.addEventListener('languagechange', () => {
            this.title = i18nManager.t('stock.title');
            this.render();
            this.loadStockData();
        });
    }

    initialize(container) {
        console.log('StockWidget initializing...');
        if (!container) {
            console.error('Container is required for StockWidget');
            return;
        }
        this.container = container;
        this.loadSavedStocks();
        this.render();
        this.loadStockData();
        this.startAutoUpdate();
    }

    render() {
        this.container.innerHTML = `
            <div class="stock-widget market-widget">
                <div class="market-loading">${i18nManager.t('stock.loading')}</div>
                
                <div class="market-content" style="display: none;">
                    <div class="market-list"></div>
                    <div class="market-footer">
                        <button class="add-stock">${i18nManager.t('stock.addStock')}</button>
                    </div>
                </div>

                <div class="market-error" style="display: none">
                    <div class="error-message">${i18nManager.t('stock.error')}</div>
                    <button class="retry-button">${i18nManager.t('stock.retry')}</button>
                </div>
            </div>
        `;

        this.loadingEl = this.container.querySelector('.market-loading');
        this.contentEl = this.container.querySelector('.market-content');
        this.listEl = this.contentEl.querySelector('.market-list');
        this.errorEl = this.container.querySelector('.market-error');
        
        // 添加重试按钮事件
        const retryButton = this.container.querySelector('.retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.loadStockData();
            });
        }

        // 添加自选股按钮事件
        const addButton = this.contentEl.querySelector('.add-stock');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.showAddStockDialog();
            });
        }
    }

    async loadStockData() {
        try {
            this.showLoading();
            const data = await this.fetchMockData(); // 临时使用模拟数据
            this.updateStockList(data);
            this.showContent();
        } catch (error) {
            console.error('Failed to load stock data:', error);
            this.showError();
        }
    }

    // 临时使用模拟数据
    async fetchMockData() {
        return this.stocks.map(stock => ({
            code: stock.code,
            name: stock.name,
            price: (Math.random() * 1000 + 2000).toFixed(2),
            change: (Math.random() * 100 - 50).toFixed(2),
            changePercent: (Math.random() * 10 - 5).toFixed(2),
            isUp: Math.random() > 0.5,
            volume: Math.floor(Math.random() * 1000000),
            high: (Math.random() * 1000 + 2100).toFixed(2),
            low: (Math.random() * 1000 + 1900).toFixed(2),
            marketCap: Math.floor(Math.random() * 1000000000)
        }));
    }

    updateStockList(stocks) {
        this.listEl.innerHTML = stocks.map(stock => `
            <div class="market-item">
                <div class="market-header">
                    <div class="market-symbol">
                        <span class="code">${stock.code}</span>
                        <span class="name">${stock.name}</span>
                    </div>
                    <div class="market-price">
                        <div class="current">${stock.price}</div>
                        <div class="change ${stock.isUp ? 'up' : 'down'}">
                            ${stock.change} (${stock.changePercent}%)
                        </div>
                    </div>
                </div>
                <div class="market-details">
                    <div class="market-detail-item">
                        <span class="label">${i18nManager.t('stock.volume')}</span>
                        <span class="value">${this.formatNumber(stock.volume || 0)}</span>
                    </div>
                    <div class="market-detail-item">
                        <span class="label">${i18nManager.t('stock.high')}</span>
                        <span class="value">${stock.high}</span>
                    </div>
                    <div class="market-detail-item">
                        <span class="label">${i18nManager.t('stock.low')}</span>
                        <span class="value">${stock.low}</span>
                    </div>
                    <div class="market-detail-item">
                        <span class="label">${i18nManager.t('stock.market')}</span>
                        <span class="value">${this.formatNumber(stock.marketCap || 0)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    isDefaultStock(code) {
        return this.stocks.some(s => s.code === code && s.isDefault);
    }

    showAddStockDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'stock-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h4>${i18nManager.t('stock.addStockTitle')}</h4>
                <div class="stock-input-group">
                    <input type="text" placeholder="${i18nManager.t('stock.inputPlaceholder')}" />
                    <div class="stock-name-preview"></div>
                </div>
                <div class="dialog-buttons">
                    <button class="cancel">${i18nManager.t('stock.cancel')}</button>
                    <button class="confirm" disabled>${i18nManager.t('stock.confirm')}</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const input = dialog.querySelector('input');
        const preview = dialog.querySelector('.stock-name-preview');
        const confirm = dialog.querySelector('.confirm');
        const cancel = dialog.querySelector('.cancel');

        // 添加输入事件监听
        let searchTimeout;
        input.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const code = input.value.trim();
            
            if (code.length >= 6) {
                preview.textContent = i18nManager.t('stock.searching');
                searchTimeout = setTimeout(() => {
                    this.searchStock(code).then(stockInfo => {
                        if (stockInfo) {
                            preview.textContent = stockInfo.name;
                            preview.style.color = 'var(--text-primary)';
                            confirm.disabled = false;
                            input.dataset.stockName = stockInfo.name;
                        } else {
                            preview.textContent = i18nManager.t('stock.notFound');
                            preview.style.color = '#e06c75';
                            confirm.disabled = true;
                            delete input.dataset.stockName;
                        }
                    });
                }, 500);
            } else {
                preview.textContent = '';
                confirm.disabled = true;
                delete input.dataset.stockName;
            }
        });

        confirm.addEventListener('click', () => {
            const code = input.value.trim();
            const name = input.dataset.stockName;
            if (code && name) {
                this.addStock(code, name);
            }
            document.body.removeChild(dialog);
        });

        cancel.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        input.focus();
    }

    async searchStock(code) {
        try {
            // 这里使用模拟数据，实际应该调用股票查询接口
            // 示例数据格式
            const mockStockNames = {
                '600000': '浦发银行',
                '600036': '招商银行',
                '601318': '中国平安',
                // ... 更多股票数据
            };

            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 300));

            if (mockStockNames[code]) {
                return {
                    code: code,
                    name: mockStockNames[code]
                };
            }
            return null;
        } catch (error) {
            console.error('Failed to search stock:', error);
            return null;
        }
    }

    addStock(code, name) {
        if (!this.stocks.find(s => s.code === code)) {
            this.stocks.push({ code, name });
            this.saveStocks();
            this.loadStockData();
        }
    }

    removeStock(code) {
        this.stocks = this.stocks.filter(s => s.code !== code);
        this.saveStocks();
        this.loadStockData();
    }

    saveStocks() {
        try {
            localStorage.setItem('stockList', JSON.stringify(this.stocks));
        } catch (e) {
            console.error('Failed to save stocks:', e);
        }
    }

    loadSavedStocks() {
        const saved = localStorage.getItem('stockList');
        if (saved) {
            try {
                const savedStocks = JSON.parse(saved);
                // 合并默认股票和保存的股票，确保不重复
                const defaultCodes = this.stocks.map(s => s.code);
                const savedUnique = savedStocks.filter(s => !defaultCodes.includes(s.code));
                this.stocks = [...this.stocks, ...savedUnique];
            } catch (e) {
                console.error('Failed to load saved stocks:', e);
            }
        }
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
            this.loadStockData();
        }, this.updateInterval);
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateContent(container) {
        // 保存当前状态
        const stocks = this.stocks;
        
        // 重新渲染股票组件
        this.container = container;
        this.render();
        
        // 恢复状态并更新数据
        this.stocks = stocks;
        this.loadStockData();
    }

    formatNumber(value) {
        if (typeof value !== 'number') return '0';
        if (value >= 100000000) {
            return (value / 100000000).toFixed(2) + '亿';
        } else if (value >= 10000) {
            return (value / 10000).toFixed(2) + '万';
        }
        return value.toLocaleString();
    }
} 
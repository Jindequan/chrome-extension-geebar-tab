import { SitesManager } from './SitesManager.js';
import { PinnedSites } from './PinnedSites.js';

export class ContentManager {
    constructor() {
        this.sitesManager = new SitesManager();
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        // 语言代码映射
        this.languageMap = {
            'zh': 'zh-CN',
            'en': 'en-US',
            'ja': 'ja-JP'
        };
        
        // 监听语言变更事件
        window.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.updateContent();
        });
    }

    // 获取映射后的语言代码
    getMappedLanguage() {
        return this.languageMap[this.currentLanguage] || 'zh-CN';
    }

    async initialize(container) {
        if (!container) {
            console.error('Content container is required');
            return;
        }

        this.container = container;
        
        // 创建固定站点容器
        const pinnedSitesContainer = document.createElement('div');
        pinnedSitesContainer.className = 'pinned-sites-container';
        this.container.appendChild(pinnedSitesContainer);

        // 创建分类网站容器
        const categoriesContainer = document.createElement('div');
        categoriesContainer.className = 'categories-container';
        this.container.appendChild(categoriesContainer);

        // 初始化站点管理器
        await this.sitesManager.initialize();

        // 初始化固定站点
        this.pinnedSites = new PinnedSites(pinnedSitesContainer, this.sitesManager);

        // 渲染分类网站
        this.renderCategories(categoriesContainer);

        // 监听固定站点变化
        window.addEventListener('pinnedSitesChanged', () => {
            this.renderCategories(categoriesContainer);
        });
    }

    updateContent() {
        if (this.container) {
            // 重新渲染分类网站
            const categoriesContainer = this.container.querySelector('.categories-container');
            if (categoriesContainer) {
                this.renderCategories(categoriesContainer);
            }

            // 重新渲染固定站点
            if (this.pinnedSites) {
                this.pinnedSites.render();
            }
        }
    }

    async renderSiteCard(site) {
        const isPinned = this.sitesManager.isSitePinned(site.url);
        const iconUrl = await this.sitesManager.getIconUrl(site.url);
        const mappedLang = this.getMappedLanguage();
        const siteTitle = site.title[mappedLang] || site.title['zh-CN'];
        const siteDesc = site.description[mappedLang] || site.description['zh-CN'];
        
        const card = document.createElement('div');
        card.className = 'site-card';
        card.dataset.url = site.url;
        
        card.innerHTML = `
            <div class="site-icon">
                <img src="${iconUrl}" alt="${siteTitle}" onerror="this.src='${this.getDefaultIcon(siteTitle)}'" />
            </div>
            <div class="site-info">
                <div class="site-title">${siteTitle}</div>
                <div class="site-description">${siteDesc || ''}</div>
            </div>
            <div class="site-actions">
                <button class="pin-button" title="${isPinned ? '取消固定' : '固定'}">
                    ${isPinned ? '📌' : '📍'}
                </button>
            </div>
        `;

        // 添加点击事件
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.site-actions')) {
                window.location.href = site.url;
            }
        });

        // 添加固定/取消固定按钮事件
        const pinButton = card.querySelector('.pin-button');
        pinButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (isPinned) {
                this.sitesManager.unpinSite(site.url);
            } else {
                this.sitesManager.pinSite(site);
            }
            
            // 重新渲染固定站点区域
            await this.pinnedSites.render();
            
            // 重新渲染分类区域
            await this.renderCategories(this.container.querySelector('.categories-container'));
        });

        return card;
    }

    formatSiteCount(count) {
        // 根据当前语言返回不同的格式
        switch (this.currentLanguage) {
            case 'zh':
                return `(${count} 个网站)`;
            case 'ja':
                return `(${count} サイト)`;
            case 'en':
            default:
                return count === 1 ? '(1 site)' : `(${count} sites)`;
        }
    }

    async renderCategories(container) {
        container.innerHTML = '';
        const categories = this.sitesManager.getAllCategories();
        const mappedLang = this.getMappedLanguage();

        for (const category of categories) {
            const sites = this.sitesManager.getSitesByCategory(category.id);
            if (sites.length === 0) continue;

            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            
            // 使用分类对象中的多语言名称
            const categoryName = category.name[mappedLang] || category.name['zh-CN'];
            
            // 添加分类标题和站点数量
            const categoryTitle = document.createElement('div');
            categoryTitle.className = 'category-title';
            categoryTitle.innerHTML = `
                <span>${categoryName}</span>
                <span class="site-count">${this.formatSiteCount(sites.length)}</span>
            `;
            categorySection.appendChild(categoryTitle);

            // 添加网站网格
            const sitesGrid = document.createElement('div');
            sitesGrid.className = 'sites-grid';
            categorySection.appendChild(sitesGrid);
            
            // 异步渲染所有网站卡片
            const siteCards = await Promise.all(sites.map(site => this.renderSiteCard(site)));
            siteCards.forEach(card => sitesGrid.appendChild(card));

            container.appendChild(categorySection);
        }
    }

    updateTranslations() {
        // 更新内容区域标题
        const areaTitle = this.container.querySelector('.area-title');
        if (areaTitle) {
            areaTitle.textContent = this.i18n.t('content.contentArea');
        }

        // 更新分类标题和站点数量
        const currentLocale = this.i18n.getLocale();
        const categories = this.sitesManager.getAllCategories();
        const categoryTitles = this.container.querySelectorAll('.category-title');
        
        categoryTitles.forEach((titleElement, index) => {
            const category = categories[index];
            if (category) {
                const categoryName = category.name[currentLocale] || category.name['zh-CN'];
                const sites = this.sitesManager.getSitesByCategory(category.id);
                
                titleElement.querySelector('span').textContent = categoryName;
                titleElement.querySelector('.site-count').textContent = this.formatSiteCount(sites.length, currentLocale);
            }
        });

        // 更新固定/取消固定按钮的提示文本
        const pinButtons = this.container.querySelectorAll('.pin-button');
        pinButtons.forEach(button => {
            const isPinned = button.textContent.trim() === '📌';
            button.title = isPinned ? this.i18n.t('content.unpin') : this.i18n.t('content.pin');
        });

        // 重新渲染固定站点区域
        if (this.pinnedSites) {
            this.pinnedSites.render();
        }
    }

    getDefaultIcon(title) {
        // 确保 title 是字符串
        const titleStr = String(title);
        const letter = titleStr.charAt(0).toUpperCase();
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                <rect width="40" height="40" fill="#98c379"/>
                <text x="50%" y="50%" dy=".35em" fill="white" 
                    font-family="Arial" font-size="20" font-weight="bold" 
                    text-anchor="middle">${letter}</text>
            </svg>
        `)}`;
    }
} 
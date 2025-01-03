export class PinnedSites {
    constructor(container, sitesManager) {
        this.container = container;
        this.sitesManager = sitesManager;
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        // 语言代码映射
        this.languageMap = {
            'zh': 'zh-CN',
            'en': 'en-US',
            'ja': 'ja-JP'
        };
        this.setupDragAndDrop();

        // 监听语言变更事件
        window.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.render();
        });

        // 初始渲染
        this.render();
    }

    // 获取映射后的语言代码
    getMappedLanguage() {
        return this.languageMap[this.currentLanguage] || 'zh-CN';
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

    async render() {
        this.container.innerHTML = '';
        const pinnedSites = this.sitesManager.getPinnedSites() || [];
        const mappedLang = this.getMappedLanguage();

        // 创建固定站点区域标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'area-title';
        
        // 根据当前语言显示标题
        const title = this.currentLanguage === 'ja' ? 'ピン留めサイト' : 
                     this.currentLanguage === 'en' ? 'Pinned Sites' : 
                     '固定网站';
        
        titleDiv.innerHTML = `
            <span>${title}</span>
            <span class="site-count">${this.formatSiteCount(pinnedSites.length)}</span>
        `;
        this.container.appendChild(titleDiv);

        // 创建网站网格容器（即使为空也创建，以保持布局一致）
        const sitesGrid = document.createElement('div');
        sitesGrid.className = 'sites-grid';
        sitesGrid.setAttribute('data-draggable', 'true');
        this.container.appendChild(sitesGrid);

        if (pinnedSites.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-message';
            // 根据当前语言显示空状态提示
            emptyDiv.textContent = this.currentLanguage === 'ja' ? 'ピン留めされたサイトはありません' :
                                 this.currentLanguage === 'en' ? 'No pinned sites' :
                                 '暂无固定网站';
            sitesGrid.appendChild(emptyDiv);
            return;
        }

        // 渲染每个固定站点
        for (const site of pinnedSites) {
            const iconUrl = await this.sitesManager.getIconUrl(site.url);
            const siteTitle = site.title[mappedLang] || site.title['zh-CN'];
            const siteDesc = site.description[mappedLang] || site.description['zh-CN'];

            const card = document.createElement('div');
            card.className = 'site-card';
            card.dataset.url = site.url;
            card.setAttribute('draggable', 'true');

            // 根据当前语言设置取消固定按钮的提示文本
            const unpinText = this.currentLanguage === 'ja' ? 'ピン留めを解除' :
                            this.currentLanguage === 'en' ? 'Unpin' :
                            '取消固定';

            card.innerHTML = `
                <div class="site-icon">
                    <img src="${iconUrl}" alt="${siteTitle}" onerror="this.src='${this.getDefaultIcon(siteTitle)}'" />
                </div>
                <div class="site-info">
                    <div class="site-title">${siteTitle}</div>
                    <div class="site-description">${siteDesc || ''}</div>
                </div>
                <div class="site-actions">
                    <button class="pin-button" title="${unpinText}">📌</button>
                </div>
            `;

            // 添加点击事件
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.site-actions')) {
                    window.location.href = site.url;
                }
            });

            // 添加取消固定按钮事件
            const pinButton = card.querySelector('.pin-button');
            pinButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sitesManager.unpinSite(site.url);
                this.render();
                // 触发事件通知其他组件更新
                window.dispatchEvent(new CustomEvent('pinnedSitesChanged'));
            });

            sitesGrid.appendChild(card);
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

    setupDragAndDrop() {
        this.container.addEventListener('dragstart', (e) => {
            const card = e.target.closest('.site-card');
            if (card) {
                e.dataTransfer.setData('text/plain', card.dataset.url);
                card.classList.add('dragging');
            }
        });

        this.container.addEventListener('dragend', (e) => {
            const card = e.target.closest('.site-card');
            if (card) {
                card.classList.remove('dragging');
            }
        });

        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const card = e.target.closest('.site-card');
            if (!card) return;

            const draggingCard = this.container.querySelector('.dragging');
            if (!draggingCard || draggingCard === card) return;

            const cards = [...this.container.querySelectorAll('.site-card')];
            const draggedIndex = cards.indexOf(draggingCard);
            const dropIndex = cards.indexOf(card);

            if (draggedIndex !== -1 && dropIndex !== -1) {
                this.sitesManager.reorderPinnedSites(draggedIndex, dropIndex);
                this.render();
            }
        });
    }
} 
import { BookmarkManager } from '../components/bookmarks/BookmarkManager.js';
import { WidgetManager } from '../components/widgets/WidgetManager.js';
import i18nManager from '../components/common/i18n.js';
import { ContentManager } from '../components/content/ContentManager.js';

class TabNavigator {
    constructor() {
        this.contentManager = new ContentManager();
        this.bookmarkManager = new BookmarkManager();
        this.widgetManager = new WidgetManager();
        
        // 确保 DOM 完全加载后再初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        try {
            // 初始化国际化
            await i18nManager.initialize();
            
            // 初始化版权声明
            initializeCopyright();
            
            // 初始化书签管理器
            const bookmarksContainer = document.querySelector('.bookmarks-tree');
            if (bookmarksContainer) {
                await this.bookmarkManager.initialize();
                this.bookmarkManager.renderFolderTree(bookmarksContainer);
            } else {
                console.error('Bookmarks container not found');
            }
            
            // 初始化小组件
            const widgetContainer = document.querySelector('.widgets-container');
            if (widgetContainer) {
                await this.widgetManager.initialize(widgetContainer);
            } else {
                console.error('Widget container not found');
            }

            // 初始化其他组件
            this.initializeContentArea();
            this.initializeLanguageSelector();
            this.initializeSearch();

        } catch (error) {
            console.error('App initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    initializeSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        // 设置搜索框占位符
        searchInput.placeholder = i18nManager.t('common.search');

        // 处理搜索提交
        searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                e.preventDefault();
                const searchText = searchInput.value.trim();
                
                // 先搜索书签
                const bookmarkResults = await this.bookmarkManager.searchBookmarks(searchText);
                
                // 搜索推荐网站
                const siteResults = this.contentManager.sitesManager.searchSites(searchText);
                
                // 合并搜索结果
                const allResults = [...bookmarkResults];
                
                // 添加推荐网站结果（避免重复）
                siteResults.forEach(site => {
                    if (!allResults.some(result => result.url === site.url)) {
                        allResults.push({
                            title: site.title,
                            url: site.url,
                            type: 'site'
                        });
                    }
                });

                if (allResults.length > 0) {
                    // 如果找到结果，打开第一个结果
                    const firstResult = allResults[0];
                    chrome.tabs.create({ url: firstResult.url });
                } else {
                    // 如果没有找到结果，使用搜索引擎
                    try {
                        await chrome.search.query({
                            text: searchText,
                            disposition: 'NEW_TAB'
                        });
                    } catch (error) {
                        console.error('Search failed:', error);
                        // 如果 Chrome 搜索 API 失败，使用备用方案
                        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
                        chrome.tabs.create({ url: searchUrl });
                    }
                }

                // 清空搜索框
                searchInput.value = '';
            }
        });

        // 添加输入事件监听，实时显示搜索建议
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const searchText = e.target.value.trim();
                if (searchText.length < 2) {
                    this.hideSearchSuggestions();
                    return;
                }

                // 搜索书签和推荐网站
                const bookmarkResults = await this.bookmarkManager.searchBookmarks(searchText);
                const siteResults = this.contentManager.sitesManager.searchSites(searchText);
                
                // 合并结果并去重
                const allResults = [...bookmarkResults];
                siteResults.forEach(site => {
                    if (!allResults.some(result => result.url === site.url)) {
                        allResults.push({
                            title: site.title,
                            url: site.url,
                            type: 'site',
                            description: site.description,
                            category: site.category
                        });
                    }
                });

                this.showSearchSuggestions(allResults);
            }, 300); // 300ms 防抖
        });

        // 点击其他地方时隐藏搜索建议
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchSuggestions();
            }
        });
    }

    async showSearchSuggestions(results) {
        const container = document.querySelector('.search-suggestions');
        if (!container) return;

        container.innerHTML = '';
        
        if (results.length === 0) {
            container.style.display = 'none';
            return;
        }

        const currentLocale = i18nManager.getCurrentLanguage() === 'zh' ? 'zh-CN' : 
                            i18nManager.getCurrentLanguage() === 'en' ? 'en-US' : 
                            i18nManager.getCurrentLanguage() === 'ja' ? 'ja-JP' : 'zh-CN';

        for (const result of results) {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            
            const favicon = document.createElement('img');
            // 先设置一个默认图标
            favicon.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk5OSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==';
            favicon.className = 'suggestion-favicon';
            favicon.width = 16;
            favicon.height = 16;
            
            // 异步加载实际图标
            if (result.type === 'site') {
                const iconUrl = await this.contentManager.sitesManager.getIconUrl(result.url);
                if (iconUrl) {
                    favicon.src = iconUrl;
                }
            } else {
                favicon.src = this.bookmarkManager.getFaviconUrl(result.url);
            }
            
            const title = document.createElement('span');
            title.className = 'suggestion-title';
            title.textContent = result.type === 'site' 
                ? (result.title[currentLocale] || result.title['zh-CN'])
                : result.title;
            
            const url = document.createElement('span');
            url.className = 'suggestion-url';
            url.textContent = result.type === 'site' 
                ? `${result.category} - ${result.url}`
                : result.url;
            
            item.appendChild(favicon);
            item.appendChild(title);
            item.appendChild(url);
            
            item.addEventListener('click', () => {
                chrome.tabs.create({ url: result.url });
                this.hideSearchSuggestions();
                document.querySelector('.search-input').value = '';
            });
            
            container.appendChild(item);
        }

        container.style.display = 'block';
    }

    hideSearchSuggestions() {
        const container = document.querySelector('.search-suggestions');
        if (container) {
            container.style.display = 'none';
        }
    }

    handleInitializationError(error) {
        // 创建错误容器
        const errorContainer = document.createElement('div');
        errorContainer.className = 'initialization-error';
        
        // 创建错误消息
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        
        // 创建标题
        const title = document.createElement('h3');
        title.textContent = '初始化失败';
        
        // 创建描述
        const description = document.createElement('p');
        description.textContent = '应用加载时遇到问题。请尝试刷新页面或检查扩展权限。';
        
        // 创建重新加载按钮
        const reloadButton = document.createElement('button');
        reloadButton.textContent = '重新加载';
        reloadButton.addEventListener('click', () => {
            window.location.reload();
        });
        
        // 组装错误消息
        errorMessage.appendChild(title);
        errorMessage.appendChild(description);
        errorMessage.appendChild(reloadButton);
        errorContainer.appendChild(errorMessage);
        
        // 添加到页面
        document.body.appendChild(errorContainer);
    }

    initializeContentArea() {
        const contentContainer = document.querySelector('.content-sites');
        if (!contentContainer) {
            console.error('Content container not found');
            return;
        }

        // 初始化内容管理器
        this.contentManager = new ContentManager();
        this.contentManager.initialize(contentContainer);
    }

    initializeLanguageSelector() {
        const selector = document.querySelector('.language-selector');
        const currentLang = selector.querySelector('.current-lang');
        const dropdown = selector.querySelector('.lang-dropdown');
        
        // 初始化当前语言显示
        currentLang.innerHTML = `
            <button class="current-lang-btn" aria-label="切换语言">
                <span class="lang-text">${i18nManager.getCurrentLanguageName()}</span>
                <span class="arrow">▼</span>
            </button>
        `;
        
        // 初始化语言按钮文本
        selector.querySelectorAll('.lang-dropdown button').forEach(button => {
            const lang = button.dataset.lang;
            button.textContent = i18nManager.getLanguageName(lang);
        });
        
        // 点击切换下拉菜单
        currentLang.querySelector('.current-lang-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            selector.classList.toggle('active');
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', () => {
            selector.classList.remove('active');
        });
        
        // 防止点击下拉菜单时关闭
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 语言切换事件
        selector.querySelectorAll('.lang-dropdown button').forEach(button => {
            button.addEventListener('click', () => {
                const lang = button.dataset.lang;
                // 先关闭下拉菜单
                selector.classList.remove('active');
                // 设置新语言
                i18nManager.setLanguage(lang);
                // 重新加载页面
                window.location.reload();
            });
        });
    }

    updateAllComponents() {
        // 更新小组件
        if (this.widgetManager) {
            this.widgetManager.updateWidgets();
        }
        
        // 更新书签管理器
        if (this.bookmarkManager) {
            this.bookmarkManager.updateUI();
        }
    }
}

// 初始化版权声明
function initializeCopyright() {
    const copyrightElement = document.getElementById('copyright');
    const author = 'Devin';
    const copyrightText = i18nManager.t('content.copyright', { author });
    copyrightElement.textContent = copyrightText;

    // 监听语言变化，更新版权声明
    window.addEventListener('languageChanged', () => {
        const updatedText = i18nManager.t('content.copyright', { author });
        copyrightElement.textContent = updatedText;
    });
}

// 创建应用实例
new TabNavigator(); 
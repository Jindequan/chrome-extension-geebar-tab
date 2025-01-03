import { BookmarkManager } from '/components/bookmarks/BookmarkManager.js';
import { WidgetManager } from '/components/widgets/WidgetManager.js';
import i18nManager from '/components/common/i18n.js';
import { ContentManager } from '/components/content/ContentManager.js';
import { SearchManager } from '/components/search/SearchManager.js';

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

            // 初始化搜索管理器
            this.searchManager = new SearchManager(this.bookmarkManager, this.widgetManager);
            
            // 初始化其他组件
            this.initializeEventListeners();
            this.initializeContentArea();
            this.initializeLanguageSelector();

                    } catch (error) {
            console.error('App initialization failed:', error);
            this.handleInitializationError(error);
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

    initializeEventListeners() {
        // 搜索输入监听
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // 模式切换监听
        document.querySelectorAll('.search-modes button').forEach(button => {
            button.addEventListener('click', () => {
                this.switchMode(button.dataset.mode);
            });
        });
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

    handleSearch(query) {
        // 根据当前模式和查询词进行搜索
        switch(this.currentMode) {
            case 'bookmarks':
                this.searchBookmarks(query);
                break;
            case 'history':
                this.searchHistory(query);
                break;
            // ... 其他模式的搜索处理
        }
    }

    searchBookmarks(query) {
        if (!query) {
            // 如果查询为空，重新渲染完整书签树
            const bookmarksContainer = document.querySelector('.bookmarks-tree');
            this.bookmarkManager.renderFolderTree(bookmarksContainer);
            return;
        }
        // TODO: 实现书签搜索逻辑
    }

    switchMode(mode) {
        this.currentMode = mode;
        // 更新 UI 和搜索结果
        document.querySelectorAll('.search-modes button').forEach(button => {
            button.classList.toggle('active', button.dataset.mode === mode);
        });
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
        // 更新搜索框
        this.updateSearchPlaceholder();
        
        // 更新模式按钮
        this.updateModesText();
        
        // 更新小组件
        if (this.widgetManager) {
            this.widgetManager.updateWidgets();
        }
        
        // 更新书签管理器
        if (this.bookmarkManager) {
            this.bookmarkManager.updateUI();
        }
    }

    updateSearchPlaceholder() {
        const searchInput = document.getElementById('searchInput');
        searchInput.placeholder = i18nManager.t('common.search');
    }

    updateModesText() {
        document.querySelectorAll('.search-modes button').forEach(button => {
            const mode = button.dataset.mode;
            button.textContent = i18nManager.t(`modes.${mode}`);
        });
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
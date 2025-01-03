import i18nManager from '../common/i18n.js';

export class SearchManager {
    constructor(bookmarkManager, widgetManager) {
        if (!bookmarkManager) {
            console.error('BookmarkManager is required');
            return;
        }
        if (!widgetManager) {
            console.error('WidgetManager is required');
            return;
        }

        this.bookmarkManager = bookmarkManager;
        this.widgetManager = widgetManager;
        
        // 获取 DOM 元素
        this.searchInput = document.querySelector('.search-input');
        this.suggestionsContainer = document.querySelector('.search-suggestions');
        
        if (!this.searchInput) {
            console.error('Search input element not found');
            return;
        }
        if (!this.suggestionsContainer) {
            console.error('Suggestions container element not found');
            return;
        }

        this.searchEngine = 'https://www.google.com/search?q=';
        this.selectedIndex = -1;
        this.debounceTimeout = null;
        
        // 初始化事件监听器
        this.initialize();
    }

    initialize() {
        // 使用防抖处理输入事件
        this.searchInput.addEventListener('input', () => {
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }
            this.debounceTimeout = setTimeout(() => {
                this.handleInput();
            }, 300);
        });

        // 键盘事件处理
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // 点击外部关闭建议列表
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    handleInput() {
        const query = this.searchInput.value.trim();
        
        // 清除之前的搜索结果
        this.hideSuggestions();
        
        // 空查询直接返回
        if (query.length === 0) {
            return;
        }
        
        // 限制查询长度
        if (query.length > 50) {
            return;
        }

        // 获取搜索建议
        const suggestions = this.getSuggestions(query);
        if (suggestions && suggestions.length > 0) {
            this.showSuggestions(suggestions);
        }
    }

    getSuggestions(query) {
        if (!query || typeof query !== 'string') return [];
        
        const suggestions = [];
        const maxSuggestions = 10;
        
        // 搜索书签
        const bookmarks = this.bookmarkManager.searchBookmarks(query);
        if (Array.isArray(bookmarks)) {
            for (const bookmark of bookmarks) {
                if (suggestions.length >= maxSuggestions) break;
                
                if (bookmark && bookmark.title && bookmark.url) {
                    suggestions.push({
                        type: 'bookmark',
                        title: bookmark.title,
                        url: bookmark.url,
                        icon: this.bookmarkManager.getFaviconUrl(bookmark.url)
                    });
                }
            }
        }

        // 搜索小组件
        if (suggestions.length < maxSuggestions) {
            const widgets = this.widgetManager.getAvailableWidgets()
                .filter(widget => {
                    return i18nManager.t(`widgets.${widget}.title`)
                        .toLowerCase()
                        .includes(query.toLowerCase());
                })
                .slice(0, maxSuggestions - suggestions.length);

            for (const widget of widgets) {
                suggestions.push({
                    type: 'widget',
                    title: i18nManager.t(`widgets.${widget}.title`),
                    widget: widget,
                    icon: `/icons/widgets/${widget}.png`
                });
            }
        }

        return suggestions;
    }

    showSuggestions(suggestions) {
        this.suggestionsContainer.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        suggestions.forEach((suggestion, index) => {
            const element = document.createElement('div');
            element.className = 'suggestion';
            
            // 创建图标元素
            const img = document.createElement('img');
            img.src = suggestion.icon || '/icons/default-favicon.png';
            img.onerror = () => {
                img.src = '/icons/default-favicon.png';
            };
            
            // 创建标题元素
            const title = document.createElement('span');
            title.className = 'suggestion-title';
            title.textContent = suggestion.title;
            
            // 创建URL/类型元素
            const subtitle = document.createElement('span');
            subtitle.className = 'suggestion-subtitle';
            subtitle.textContent = suggestion.url || suggestion.type;
            
            // 组装建议项
            element.appendChild(img);
            const textContainer = document.createElement('div');
            textContainer.className = 'suggestion-text';
            textContainer.appendChild(title);
            textContainer.appendChild(subtitle);
            element.appendChild(textContainer);
            
            // 添加点击事件
            element.addEventListener('click', () => {
                if (suggestion.type === 'bookmark') {
                    window.open(suggestion.url, '_blank');
                } else if (suggestion.type === 'widget') {
                    this.widgetManager.addWidget(suggestion.widget);
                }
                this.searchInput.value = '';
                this.hideSuggestions();
            });
            
            fragment.appendChild(element);
        });

        this.suggestionsContainer.appendChild(fragment);
        this.suggestionsContainer.style.display = 'block';
        this.selectedIndex = -1;
    }

    handleKeydown(e) {
        const suggestions = this.suggestionsContainer.querySelectorAll('.suggestion');
        
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowUp':
                e.preventDefault();
                this.navigateSuggestions(e.key === 'ArrowDown' ? 1 : -1, suggestions);
                break;
                
            case 'Enter':
                if (this.selectedIndex >= 0 && this.selectedIndex < suggestions.length) {
                    suggestions[this.selectedIndex].click();
                } else if (this.searchInput.value.trim()) {
                    window.open(this.searchEngine + encodeURIComponent(this.searchInput.value.trim()), '_blank');
                    this.searchInput.value = '';
                    this.hideSuggestions();
                }
                break;
                
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }

    navigateSuggestions(direction, suggestions) {
        if (suggestions.length === 0) return;

        // 移除当前选中项的样式
        suggestions[this.selectedIndex]?.classList.remove('selected');

        // 更新选中索引
        this.selectedIndex = (this.selectedIndex + direction + suggestions.length) % suggestions.length;

        // 添加新选中项的样式
        suggestions[this.selectedIndex].classList.add('selected');
        
        // 确保选中项可见
        suggestions[this.selectedIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }

    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
        this.suggestionsContainer.innerHTML = '';
        this.selectedIndex = -1;
    }
} 
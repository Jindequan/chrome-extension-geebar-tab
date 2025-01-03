export class I18nManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.translations = {
            'zh': {
                'common': {
                    'search': '搜索...'
                },
                'modes': {
                    'web': '网页',
                    'image': '图片',
                    'video': '视频',
                    'news': '新闻'
                },
                'content': {
                    'copyright': '© {author} 版权所有',
                    'pinnedSites': '固定网站',
                    'pin': '固定',
                    'unpin': '取消固定'
                },
                'bookmarks': {
                    'noBookmarks': '暂无书签',
                    'addFolder': '新建文件夹',
                    'addBookmark': '添加书签',
                    'edit': '编辑',
                    'delete': '删除'
                },
                'widgets': {
                    'collapse': '折叠',
                    'remove': '移除',
                    'title': '小组件',
                    'addWidget': '添加小组件',
                    'noWidgets': '暂无小组件',
                    'confirmRemove': '确定要移除此小组件吗？',
                    'calculator': { 'title': '计算器' },
                    'todo': { 'title': '待办事项' },
                    'clock': { 'title': '时钟' },
                    'weather': { 
                        'title': '天气',
                        'changeLocation': '更改位置',
                        'pressure': '气压',
                        'visibility': '能见度',
                        'loading': '加载中...',
                        'error': '加载失败',
                        'retry': '重试',
                        'location': '位置',
                        'temperature': '温度',
                        'humidity': '湿度',
                        'wind': '风速',
                        'high': '最高',
                        'low': '最低',
                        'feelsLike': '体感温度',
                        'sunrise': '日出',
                        'sunset': '日落',
                        'updateTime': '更新时间',
                        'searchPlaceholder': '输入城市名称'
                    },
                    'stock': { 'title': '股票' },
                    'crypto': { 
                        'title': '加密货币',
                        'loading': '加载中...',
                        'error': '加载失败',
                        'retry': '重试',
                        'price': '价格',
                        'change': '涨跌幅',
                        'volume': '成交量',
                        'marketCap': '市值',
                        'high24h': '24h最高',
                        'low24h': '24h最低',
                        'addCrypto': '添加加密货币',
                        'searchPlaceholder': '输入加密货币名称或代码',
                        'noResults': '未找到结果'
                    }
                },
                'todo': {
                    'title': '待办事项',
                    'noTodos': '暂无待办事项',
                    'clickToEdit': '点击编辑',
                    'addPlaceholder': '添加新的待办事项',
                    'itemsLeft': '项待办',
                    'all': '全部',
                    'active': '进行中',
                    'completed': '已完成'
                },
                'clock': {
                    'title': '时钟',
                    'weekdays': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
                },
                'dialog': {
                    'cancel': '取消'
                },
                'stock': {
                    'title': '股票',
                    'loading': '加载中...',
                    'error': '加载失败',
                    'retry': '重试',
                    'addStock': '添加自选股',
                    'addStockTitle': '添加股票',
                    'inputPlaceholder': '输入股票代码',
                    'searching': '搜索中...',
                    'notFound': '未找到股票',
                    'cancel': '取消',
                    'confirm': '确认',
                    'volume': '成交量',
                    'high': '最高',
                    'low': '最低',
                    'market': '市值'
                },
                'calculator': {
                    'title': '计算器',
                    'clear': '清除',
                    'delete': '删除',
                    'divide': '除',
                    'multiply': '乘',
                    'subtract': '减',
                    'add': '加',
                    'equals': '等于',
                    'decimal': '小数点'
                }
            },
            'en': {
                'common': {
                    'search': 'Search...'
                },
                'modes': {
                    'web': 'Web',
                    'image': 'Images',
                    'video': 'Videos',
                    'news': 'News'
                },
                'content': {
                    'copyright': '© {author} All rights reserved',
                    'pinnedSites': 'Pinned Sites',
                    'pin': 'Pin',
                    'unpin': 'Unpin'
                },
                'bookmarks': {
                    'noBookmarks': 'No bookmarks',
                    'addFolder': 'New Folder',
                    'addBookmark': 'Add Bookmark',
                    'edit': 'Edit',
                    'delete': 'Delete'
                },
                'widgets': {
                    'collapse': 'Collapse',
                    'remove': 'Remove',
                    'title': 'Widgets',
                    'addWidget': 'Add Widget',
                    'noWidgets': 'No widgets available',
                    'confirmRemove': 'Are you sure you want to remove this widget?',
                    'calculator': { 'title': 'Calculator' },
                    'todo': { 'title': 'Todo List' },
                    'clock': { 'title': 'Clock' },
                    'weather': { 
                        'title': 'Weather',
                        'changeLocation': 'Change Location',
                        'pressure': 'Pressure',
                        'visibility': 'Visibility',
                        'loading': 'Loading...',
                        'error': 'Failed to load',
                        'retry': 'Retry',
                        'location': 'Location',
                        'temperature': 'Temperature',
                        'humidity': 'Humidity',
                        'wind': 'Wind',
                        'high': 'High',
                        'low': 'Low',
                        'feelsLike': 'Feels like',
                        'sunrise': 'Sunrise',
                        'sunset': 'Sunset',
                        'updateTime': 'Updated',
                        'searchPlaceholder': 'Enter city name'
                    },
                    'stock': { 'title': 'Stocks' },
                    'crypto': { 
                        'title': 'Cryptocurrency',
                        'loading': 'Loading...',
                        'error': 'Failed to load',
                        'retry': 'Retry',
                        'price': 'Price',
                        'change': 'Change',
                        'volume': 'Volume',
                        'marketCap': 'Market Cap',
                        'high24h': '24h High',
                        'low24h': '24h Low',
                        'addCrypto': 'Add Cryptocurrency',
                        'searchPlaceholder': 'Enter crypto name or symbol',
                        'noResults': 'No results found'
                    }
                },
                'todo': {
                    'title': 'Todo List',
                    'noTodos': 'No todos',
                    'clickToEdit': 'Click to edit',
                    'addPlaceholder': 'Add a new todo',
                    'itemsLeft': 'items left',
                    'all': 'All',
                    'active': 'Active',
                    'completed': 'Completed'
                },
                'clock': {
                    'title': 'Clock',
                    'weekdays': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                },
                'dialog': {
                    'cancel': 'Cancel'
                },
                'stock': {
                    'title': 'Stocks',
                    'loading': 'Loading...',
                    'error': 'Failed to load',
                    'retry': 'Retry',
                    'addStock': 'Add Stock',
                    'addStockTitle': 'Add Stock',
                    'inputPlaceholder': 'Enter stock code',
                    'searching': 'Searching...',
                    'notFound': 'Stock not found',
                    'cancel': 'Cancel',
                    'confirm': 'Confirm',
                    'volume': 'Volume',
                    'high': 'High',
                    'low': 'Low',
                    'market': 'Market Cap'
                },
                'calculator': {
                    'title': 'Calculator',
                    'clear': 'Clear',
                    'delete': 'Delete',
                    'divide': '÷',
                    'multiply': '×',
                    'subtract': '-',
                    'add': '+',
                    'equals': '=',
                    'decimal': '.'
                }
            },
            'ja': {
                'common': {
                    'search': '検索...'
                },
                'modes': {
                    'web': 'ウェブ',
                    'image': '画像',
                    'video': '動画',
                    'news': 'ニュース'
                },
                'content': {
                    'copyright': '© {author} 全著作権所有',
                    'pinnedSites': 'ピン留めサイト',
                    'pin': 'ピン留め',
                    'unpin': 'ピン留めを解除'
                },
                'bookmarks': {
                    'noBookmarks': 'ブックマークなし',
                    'addFolder': '新規フォルダ',
                    'addBookmark': 'ブックマークを追加',
                    'edit': '編集',
                    'delete': '削除'
                },
                'widgets': {
                    'collapse': '折りたたむ',
                    'remove': '削除',
                    'title': 'ウィジェット',
                    'addWidget': 'ウィジェットを追加',
                    'noWidgets': 'ウィジェットなし',
                    'confirmRemove': 'このウィジェットを削除してもよろしいですか？',
                    'calculator': { 'title': '電卓' },
                    'todo': { 'title': 'タスク' },
                    'clock': { 'title': '時計' },
                    'weather': { 
                        'title': '天気',
                        'changeLocation': '場所を変更',
                        'pressure': '気圧',
                        'visibility': '視界',
                        'loading': '読み込み中...',
                        'error': '読み込み失敗',
                        'retry': '再試行',
                        'location': '場所',
                        'temperature': '気温',
                        'humidity': '湿度',
                        'wind': '風速',
                        'high': '最高',
                        'low': '最低',
                        'feelsLike': '体感温度',
                        'sunrise': '日の出',
                        'sunset': '日の入り',
                        'updateTime': '更新時刻',
                        'searchPlaceholder': '都市名を入力'
                    },
                    'stock': { 'title': '株価' },
                    'crypto': { 
                        'title': '暗号通貨',
                        'loading': '読み込み中...',
                        'error': '読み込み失敗',
                        'retry': '再試行',
                        'price': '価格',
                        'change': '変動率',
                        'volume': '取引高',
                        'marketCap': '時価総額',
                        'high24h': '24時間最高',
                        'low24h': '24時間最低',
                        'addCrypto': '暗号通貨を追加',
                        'searchPlaceholder': '暗号通貨名またはシンボルを入力',
                        'noResults': '結果が見つかりません'
                    }
                },
                'todo': {
                    'title': 'タスク',
                    'noTodos': 'タスクなし',
                    'clickToEdit': 'クリックして編集',
                    'addPlaceholder': '新しいタスクを追加',
                    'itemsLeft': '件のタスク',
                    'all': 'すべて',
                    'active': '進行中',
                    'completed': '完了'
                },
                'clock': {
                    'title': '時計',
                    'weekdays': ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
                },
                'dialog': {
                    'cancel': 'キャンセル'
                },
                'stock': {
                    'title': '株式',
                    'loading': '読み込み中...',
                    'error': '読み込み失敗',
                    'retry': '再試行',
                    'addStock': '株式を追加',
                    'addStockTitle': '株式を追加',
                    'inputPlaceholder': '銘柄コードを入力',
                    'searching': '検索中...',
                    'notFound': '株式が見つかりません',
                    'cancel': 'キャンセル',
                    'confirm': '確認',
                    'volume': '出来高',
                    'high': '高値',
                    'low': '安値',
                    'market': '時価総額'
                },
                'calculator': {
                    'title': '電卓',
                    'clear': 'クリア',
                    'delete': '削除',
                    'divide': '÷',
                    'multiply': '×',
                    'subtract': '-',
                    'add': '+',
                    'equals': '=',
                    'decimal': '.'
                }
            }
        };
        this.languageNames = {
            'zh': '中文',
            'en': 'English',
            'ja': '日本語'
        };
    }

    async initialize() {
        try {
            // 加载所有语言文件
            const languages = ['zh', 'en', 'ja'];
            await Promise.all(
                languages.map(async (lang) => {
                    try {
                        const response = await fetch(`/locales/${lang}.json`);
                        if (response.ok) {
                            const newTranslations = await response.json();
                            // 合并翻译，而不是完全覆盖
                            this.translations[lang] = {
                                ...this.translations[lang],
                                ...newTranslations
                            };
                        }
                    } catch (error) {
                        console.warn(`Failed to load ${lang} translations:`, error);
                    }
                })
            );
            // 触发初始化完成事件
            window.dispatchEvent(new CustomEvent('i18nInitialized'));
        } catch (error) {
            console.error('Failed to load translations:', error);
        }

    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            // 触发语言改变事件
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        }
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (!value || typeof value !== 'object') {
                console.warn(`Translation not found for key: ${key}`);
                return key;
            }
            value = value[k];
        }
        
        if (typeof value === 'string') {
            // 替换参数
            return value.replace(/\{(\w+)\}/g, (match, param) => {
                return params[param] !== undefined ? params[param] : match;
            });
        }
        
        if (value === undefined) {
            console.warn(`Translation not found for key: ${key}`);
            return key;
        }
        
        return value;
    }

    getLanguageName(lang) {
        return this.languageNames[lang] || lang;
    }

    getCurrentLanguageName() {
        return this.getLanguageName(this.currentLanguage);
    }

    getSupportedLanguages() {
        return Object.keys(this.languageNames);
    }
}

const i18nManager = new I18nManager();
export default i18nManager; 
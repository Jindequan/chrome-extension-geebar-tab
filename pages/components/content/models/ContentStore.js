export class ContentStore {
    constructor() {
        this.data = {
            recent: [],
            frequent: [],
            searchHistory: []
        };
    }

    async initialize() {
        await this.loadData();
        this.startAutoSync();
    }

    async loadData() {
        // 从 chrome.storage 加载数据
    }
} 
export class TabNavigator {
    constructor() {
        this.contentManager = new ContentManager();
        // ... 其他初始化代码 ...
    }

    async initializeContentArea() {
        const contentArea = document.querySelector('.content-sites');
        if (contentArea) {
            await this.contentManager.initialize(contentArea);
        }
    }

    async initializeApp() {
        try {
            await this.initializeContentArea();
            // ... 其他初始化代码 ...
        } catch (error) {
            console.error('App initialization failed:', error);
        }
    }
} 
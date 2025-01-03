export class SearchView {
    constructor() {
        this.searchTypes = ['web', 'bookmarks', 'history'];
        this.currentType = 'web';
    }

    render(container) {
        return `
            <div class="search-view">
                <div class="search-filters">
                    ${this.renderFilters()}
                </div>
                <div class="search-results"></div>
            </div>
        `;
    }
} 
export class BaseWidget {
    constructor() {
        this.isExpanded = false;
        this.expandedView = null;
        this.title = '';
        this.container = null;
    }

    initialize(container) {
        this.container = container;
        this.render();
        this.attachEventListeners();
    }

    render() {
        // 子类必须实现
        throw new Error('render() must be implemented');
    }

    attachEventListeners() {
        // 子类可以覆盖
    }

    updateContent(container) {
        this.container = container;
        this.render();
        this.attachEventListeners();
    }

    // 切换展开/收起状态
    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        if (this.isExpanded) {
            this.showExpandedView();
        } else {
            this.hideExpandedView();
        }
    }

    // 创建展开视图
    createExpandedView() {
        const view = document.createElement('div');
        view.className = 'widget-expanded-view';
        return view;
    }

    // 处理拖拽开始
    handleDragStart(e) {
        e.dataTransfer.setData('widget/type', this.type);
        e.dataTransfer.setData('widget/id', this.id);
        e.dataTransfer.effectAllowed = 'move';
    }

    showExpandedView() {
        if (!this.expandedView) {
            this.expandedView = this.createExpandedView();
            document.body.appendChild(this.expandedView);
        }
        this.expandedView.innerHTML = this.renderExpandedView();
    }

    hideExpandedView() {
        if (this.expandedView) {
            this.expandedView.remove();
            this.expandedView = null;
        }
    }

    renderExpandedView() {
        // 子类必须实现
        throw new Error('renderExpandedView() must be implemented');
    }
} 
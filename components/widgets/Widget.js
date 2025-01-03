class Widget {
    constructor(type) {
        this.type = type;
        this.element = null;
    }

    renderHeader() {
        const header = document.createElement('div');
        header.className = 'widget-header';
        
        const title = document.createElement('h3');
        title.textContent = i18nManager.t(`widgets.${this.type}.title`);
        
        const controls = document.createElement('div');
        controls.className = 'widget-controls';
        
        // 添加展开按钮
        const expandBtn = document.createElement('button');
        expandBtn.innerHTML = '⤢';
        expandBtn.title = '展开';
        expandBtn.addEventListener('click', () => this.expand());
        
        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.title = '关闭';
        closeBtn.addEventListener('click', () => this.close());
        
        controls.appendChild(expandBtn);
        controls.appendChild(closeBtn);
        
        header.appendChild(title);
        header.appendChild(controls);
        
        return header;
    }
}

export default Widget; 
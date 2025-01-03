import { ClockWidget } from './Clock.js';
import { WeatherWidget } from './Weather.js';
import { StockWidget } from './Stock.js';
import { CryptoWidget } from './Crypto.js';
import { TodoWidget } from './Todo.js';
import { CalculatorWidget } from './Calculator.js';
import i18nManager from '../common/i18n.js';

export class WidgetManager {
    constructor() {
        this.widgets = new Map();
        this.widgetStates = this.loadWidgetStates();
    }

    async initialize(container) {
        if (!container) {
            console.error('WidgetManager: container is required');
            return;
        }
        this.container = container;
        
        try {
            // 注册默认小组件
            await this.registerDefaultWidgets();
            
            // 初始化拖放功能
            this.initializeDragAndDrop();
            
            // 渲染小组件
            this.renderWidgets();
            
            // 初始化小组件控制
            this.initializeWidgetControls();

                    } catch (error) {
            console.error('WidgetManager initialization failed:', error);
            throw error;
        }
    }

    loadWidgetStates() {
        try {
            const saved = localStorage.getItem('widgetStates');
            const states = saved ? JSON.parse(saved) : null;
            
            // 如果没有保存的状态或状态为空，使用默认值
            if (!states || !states.enabled || !states.enabled.length) {
                return {
                    enabled: ['clock', 'weather'],
                    order: ['clock', 'weather'],
                    collapsed: {}
                };
            }
            
            return states;
        } catch (error) {
            console.error('Failed to load widget states:', error);
            return {
                enabled: ['clock', 'weather'],
                order: ['clock', 'weather'],
                collapsed: {}
            };
        }
    }

    saveWidgetStates() {
        try {
            localStorage.setItem('widgetStates', JSON.stringify(this.widgetStates));
        } catch (error) {
            console.error('Failed to save widget states:', error);
        }
    }

    async registerDefaultWidgets() {
                try {
            // 按优先级顺序注册小组件
            const widgets = [
                { name: 'clock', widget: new ClockWidget() },
                { name: 'todo', widget: new TodoWidget() },
                { name: 'weather', widget: new WeatherWidget() },
                { name: 'calculator', widget: new CalculatorWidget() },
                { name: 'stock', widget: new StockWidget() },
                { name: 'crypto', widget: new CryptoWidget() }
            ];

            // 注册每个小组件
            for (const { name, widget } of widgets) {
                                this.registerWidget(name, widget);
            }
            
                    } catch (error) {
            console.error('Failed to register widgets:', error);
            throw error;
        }
    }

    registerWidget(name, widget) {
        this.widgets.set(name, widget);
    }

    renderWidgets() {
                                        
        if (!this.container) {
            console.error('错误：容器不存在');
            return;
        }
        
        this.container.innerHTML = '';
        
        this.widgetStates.order.forEach(name => {
                        if (this.widgetStates.enabled.includes(name)) {
                const widget = this.widgets.get(name);
                if (widget) {
                                        const widgetEl = this.createWidgetElement(name, widget);
                    this.container.appendChild(widgetEl);
                                        
                    // 初始化小组件
                    try {
                        const contentEl = widgetEl.querySelector('.widget-content');
                        if (contentEl && widget.initialize) {
                                                        widget.initialize(contentEl);
                                                    }
                    } catch (error) {
                        console.error(`初始化小组件 ${name} 时出错:`, error);
                    }
                } else {
                    console.warn(`未找到小组件: ${name}`);
                }
            } else {
                            }
        });
        
            }

    createWidgetElement(name, widget) {
                const widgetEl = document.createElement('div');
        widgetEl.className = 'widget';
        widgetEl.dataset.widget = name;
        widgetEl.draggable = true;

        // 创建小组件的 HTML 结构，移除内联事件处理程序
        widgetEl.innerHTML = `
            <div class="widget-header">
                <h3>${widget.title || name}</h3>
                <div class="widget-controls">
                    <button class="collapse-widget" aria-label="${i18nManager.t('widgets.collapse')}">▲</button>
                    <button class="remove-widget" aria-label="${i18nManager.t('widgets.remove')}">×</button>
                </div>
            </div>
            <div class="widget-content"></div>
        `;

        
        // 添加拖动事件监听器
        widgetEl.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', name);
        });

        const collapseBtn = widgetEl.querySelector('.collapse-widget');
        const removeBtn = widgetEl.querySelector('.remove-widget');
        const content = widgetEl.querySelector('.widget-content');

        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                                this.toggleWidget(name);
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                                this.removeWidget(name);
            });
        }

        // 设置初始折叠状态
        if (this.widgetStates.collapsed[name]) {
                        content.style.display = 'none';
            collapseBtn.innerHTML = '▼';
        }

                return widgetEl;
    }

    toggleWidget(name) {
        const container = this.container.querySelector(`[data-widget="${name}"]`);
        if (container) {
            const content = container.querySelector('.widget-content');
            const collapseBtn = container.querySelector('.widget-controls button');
            
            this.widgetStates.collapsed[name] = !this.widgetStates.collapsed[name];
            content.style.display = this.widgetStates.collapsed[name] ? 'none' : 'block';
            collapseBtn.innerHTML = this.widgetStates.collapsed[name] ? '▼' : '▲';
            
            this.saveWidgetStates();
        }
    }

    async updateWidgets() {
                try {
            // 遍历所有小组件，更新它们的标题和内容
            for (const name of this.widgetStates.order) {
                if (this.widgetStates.enabled.includes(name)) {
                    const widget = this.widgets.get(name);
                    if (widget) {
                        const widgetEl = this.container.querySelector(`[data-widget="${name}"]`);
                        if (widgetEl) {
                            // 更新标题
                            const titleEl = widgetEl.querySelector('.widget-header h3');
                            if (titleEl) {
                                titleEl.textContent = widget.title;
                            }
                            
                            // 更新内容
                            const contentEl = widgetEl.querySelector('.widget-content');
                            if (contentEl && widget.updateContent) {
                                await widget.updateContent(contentEl);
                            }
                        }
                    }
                }
            }
                    } catch (error) {
            console.error('Error updating widgets:', error);
        }
    }

    initializeDragAndDrop() {
        this.container.addEventListener('dragstart', (e) => {
            const widget = e.target.closest('.widget');
            if (widget) {
                widget.classList.add('dragging');
                e.dataTransfer.setData('text/plain', widget.dataset.widget);
            }
        });

        this.container.addEventListener('dragend', (e) => {
            const widget = e.target.closest('.widget');
            if (widget) {
                widget.classList.remove('dragging');
            }
        });

        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingWidget = this.container.querySelector('.dragging');
            if (!draggingWidget) return;

            const afterElement = this.getDragAfterElement(e.clientY);
            if (afterElement) {
                this.container.insertBefore(draggingWidget, afterElement);
            } else {
                this.container.appendChild(draggingWidget);
            }
            this.updateWidgetOrder();
        });
    }

    getDragAfterElement(y) {
        const widgets = [...this.container.querySelectorAll('.widget:not(.dragging)')];
        return widgets.reduce((closest, widget) => {
            const box = widget.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: widget };
            }
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    initializeWidgetControls() {
        // 添加小组件管理按钮
        const header = document.createElement('div');
        header.className = 'widgets-header';
        header.innerHTML = `
            <h3>${i18nManager.t('widgets.title')}</h3>
            <button class="add-widget">+</button>
        `;
        this.container.parentNode.insertBefore(header, this.container);

        // 添加小组件按钮点击事件
        header.querySelector('.add-widget').addEventListener('click', () => {
            this.showWidgetSelector();
        });
    }

    showWidgetSelector() {
        const dialog = document.createElement('div');
        dialog.className = 'widget-selector-dialog';
        
        // 获取可用的小组件列表
        const availableWidgets = [
            { id: 'clock', name: i18nManager.t('clock.title'), icon: '🕐' },
            { id: 'todo', name: i18nManager.t('todo.title'), icon: '📝' },
            { id: 'weather', name: i18nManager.t('weather.title'), icon: '🌤️' },
            { id: 'calculator', name: i18nManager.t('calculator.title'), icon: '🧮' },
            { id: 'stock', name: i18nManager.t('stock.title'), icon: '📈' },
            { id: 'crypto', name: i18nManager.t('crypto.title'), icon: '₿' }
        ].filter(widget => !this.widgetStates.enabled.includes(widget.id));

        // 创建对话框内容，移除内联事件处理程序
        const dialogContent = document.createElement('div');
        dialogContent.className = 'dialog-content';

        const dialogHeader = document.createElement('div');
        dialogHeader.className = 'dialog-header';
        dialogHeader.innerHTML = `
            <h4>${i18nManager.t('widgets.addWidget')}</h4>
            <button class="dialog-close" aria-label="关闭">×</button>
        `;

        const widgetList = document.createElement('div');
        widgetList.className = 'widget-list';

        if (availableWidgets.length) {
            availableWidgets.forEach(widget => {
                const widgetItem = document.createElement('div');
                widgetItem.className = 'widget-item';
                widgetItem.dataset.widget = widget.id;
                widgetItem.innerHTML = `
                    <span class="widget-icon">${widget.icon}</span>
                    <span class="widget-name">${widget.name}</span>
                `;
                
                // 添加点击事件监听器
                widgetItem.addEventListener('click', () => {
                    this.addWidget(widget.id);
                    dialog.remove();
                });

                widgetList.appendChild(widgetItem);
            });
        } else {
            widgetList.innerHTML = `
                <div class="no-widgets">
                    ${i18nManager.t('widgets.noWidgets')}
                </div>
            `;
        }

        dialogContent.appendChild(dialogHeader);
        dialogContent.appendChild(widgetList);
        dialog.appendChild(dialogContent);

        // 添加事件监听器
        const closeBtn = dialogHeader.querySelector('.dialog-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                dialog.remove();
            });
        }

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });

        document.body.appendChild(dialog);
    }

    addWidget(widgetId) {
                                        
        if (!this.widgetStates.enabled.includes(widgetId)) {
            this.widgetStates.enabled.push(widgetId);
            this.widgetStates.order.push(widgetId);
                                    
            this.saveWidgetStates();
                        
            this.renderWidgets();
                    } else {
                    }
    }

    removeWidget(widgetId) {
        const confirmMessage = i18nManager.t('widgets.confirmRemove');
        if (window.confirm(confirmMessage)) {
            this.widgetStates.enabled = this.widgetStates.enabled.filter(id => id !== widgetId);
            this.widgetStates.order = this.widgetStates.order.filter(id => id !== widgetId);
            this.saveWidgetStates();
            this.renderWidgets();
        }
    }

    updateWidgetOrder() {
        const newOrder = [...this.container.querySelectorAll('.widget')].map(
            widget => widget.dataset.widget
        );
        this.widgetStates.order = newOrder;
        this.saveWidgetStates();
    }

    isDefaultWidget(name) {
        // 所有小组件都可以删除
        return false;
    }

    getAllWidgets() {
        return [
            { id: 'clock', name: i18nManager.t('clock.title'), icon: '🕐' },
            { id: 'calculator', name: i18nManager.t('calculator.title'), icon: '🧮' },
            { id: 'stock', name: i18nManager.t('stock.title'), icon: '📈' },
            { id: 'weather', name: i18nManager.t('weather.title'), icon: '🌤️' },
            { id: 'crypto', name: i18nManager.t('crypto.title'), icon: '₿' },
            { id: 'todo', name: i18nManager.t('todo.title'), icon: '📅' },
            // ... 可以添加更多小组件
        ];
    }

    // 获取所有可用的小组件
    getAvailableWidgets() {
        return [
            'clock',
            'weather',
            'stock',
            'crypto',
            'todo',
            'calculator'
        ];
    }
} 
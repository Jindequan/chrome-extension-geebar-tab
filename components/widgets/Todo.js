import i18nManager from '../common/i18n.js';
import { BaseWidget } from './BaseWidget.js';

export class TodoWidget extends BaseWidget {
    constructor() {
        super();
        this.type = 'todo';
        this.title = i18nManager.t('todo.title');
        this.todos = [];
        this.filter = 'all';
        this.editingId = null;
        this.loadTodos();
    }

    loadTodos() {
        try {
            const savedTodos = localStorage.getItem('todos');
            this.todos = savedTodos ? JSON.parse(savedTodos) : [];
        } catch (error) {
            console.error('加载 todos 失败:', error);
            this.todos = [];
        }
    }

    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('保存 todos 失败:', error);
        }
    }

    addTodo(text) {
        if (!text.trim()) return;
        
        const todo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }

    getFilteredTodos() {
        switch (this.filter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    setFilter(filter) {
        this.filter = filter;
        this.render();
    }

    getActiveCount() {
        return this.todos.filter(todo => !todo.completed).length;
    }

    startEditing(id) {
        this.editingId = id;
        this.render();
    }

    saveEdit(id, newText) {
        if (!newText.trim()) return;
        
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText.trim();
            this.saveTodos();
        }
        this.editingId = null;
        this.render();
    }

    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    renderTodoList() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            return `<div class="todo-empty">${i18nManager.t('todo.noTodos')}</div>`;
        }

        return filteredTodos.map(todo => {
            if (this.editingId === todo.id) {
                return `
                    <div class="todo-item editing" data-id="${todo.id}">
                        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"
                             role="checkbox"
                             aria-checked="${todo.completed}"
                             tabindex="0"></div>
                        <form class="todo-edit-form">
                            <input type="text" 
                                   class="todo-edit-input" 
                                   value="${todo.text}"
                                   autocomplete="off">
                        </form>
                        <button class="todo-delete" aria-label="删除">×</button>
                    </div>
                `;
            }
            return `
                <div class="todo-item" data-id="${todo.id}">
                    <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"
                         role="checkbox"
                         aria-checked="${todo.completed}"
                         tabindex="0"></div>
                    <div class="todo-text ${todo.completed ? 'completed' : ''}"
                         tabindex="0"
                         title="${i18nManager.t('todo.clickToEdit')}">${todo.text}</div>
                    <button class="todo-delete" aria-label="删除">×</button>
                </div>
            `;
        }).join('');
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="todo-widget">
                <div class="todo-header">
                    <form class="todo-form">
                        <input type="text" 
                               class="todo-input" 
                               placeholder="${i18nManager.t('todo.addPlaceholder')}"
                               autocomplete="off">
                    </form>
                </div>
                
                <div class="todo-list">
                    ${this.renderTodoList()}
                </div>
                
                <div class="todo-footer">
                    <div class="todo-count">
                        ${this.getActiveCount()} ${i18nManager.t('todo.itemsLeft')}
                    </div>
                    <div class="todo-filters">
                        <button class="filter-btn ${this.filter === 'all' ? 'active' : ''}" 
                                data-filter="all">
                            ${i18nManager.t('todo.all')}
                        </button>
                        <button class="filter-btn ${this.filter === 'active' ? 'active' : ''}" 
                                data-filter="active">
                            ${i18nManager.t('todo.active')}
                        </button>
                        <button class="filter-btn ${this.filter === 'completed' ? 'active' : ''}" 
                                data-filter="completed">
                            ${i18nManager.t('todo.completed')}
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        if (!this.container) return;

        // 表单提交事件（添加新的 todo）
        const form = this.container.querySelector('.todo-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = form.querySelector('.todo-input');
                if (input && input.value.trim()) {
                    this.addTodo(input.value);
                    input.value = '';
                }
            });
        }

        // 使用事件委托处理 todo 项的点击事件
        const todoList = this.container.querySelector('.todo-list');
        if (todoList) {
            todoList.addEventListener('click', (e) => {
                const todoItem = e.target.closest('.todo-item');
                if (!todoItem) return;

                const id = parseInt(todoItem.dataset.id);

                if (e.target.classList.contains('todo-checkbox')) {
                    this.toggleTodo(id);
                } else if (e.target.classList.contains('todo-delete')) {
                    this.deleteTodo(id);
                } else if (e.target.classList.contains('todo-text')) {
                    this.startEditing(id);
                }
            });

            // 处理编辑表单的提交
            todoList.addEventListener('submit', (e) => {
                if (e.target.classList.contains('todo-edit-form')) {
                    e.preventDefault();
                    const todoItem = e.target.closest('.todo-item');
                    const input = e.target.querySelector('.todo-edit-input');
                    if (todoItem && input) {
                        const id = parseInt(todoItem.dataset.id);
                        this.saveEdit(id, input.value);
                    }
                }
            });

            // 处理编辑输入框的按键事件
            todoList.addEventListener('keydown', (e) => {
                if (e.target.classList.contains('todo-edit-input')) {
                    if (e.key === 'Escape') {
                        this.cancelEdit();
                    }
                }
            });

            // 处理编辑输入框失去焦点事件
            todoList.addEventListener('focusout', (e) => {
                if (e.target.classList.contains('todo-edit-input')) {
                    const todoItem = e.target.closest('.todo-item');
                    if (todoItem) {
                        const id = parseInt(todoItem.dataset.id);
                        this.saveEdit(id, e.target.value);
                    }
                }
            });
        }

        // 过滤器按钮点击事件
        const filterButtons = this.container.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                if (filter) {
                    this.setFilter(filter);
                }
            });
        });
    }
} 
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.filter = 'all';
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.applyTheme();
        this.render();
    }

    cacheDOM() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.itemCount = document.getElementById('itemCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.themeToggle = document.getElementById('themeToggle');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filter = e.target.dataset.filter;
                this.updateFilterButtons();
                this.render();
            });
        });

        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompleted();
        });

        this.todoList.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            if (!todoItem) return;

            const id = parseInt(todoItem.dataset.id);

            if (e.target.classList.contains('todo-checkbox')) {
                this.toggleTodo(id);
            } else if (e.target.classList.contains('delete-btn')) {
                this.deleteTodo(id);
            }
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) {
            this.shakeInput();
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.save();
        this.render();
        this.showNotification('待办事项已添加');
    }

    shakeInput() {
        this.todoInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            this.todoInput.style.animation = '';
        }, 500);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.save();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.save();
        this.render();
    }

    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.save();
        this.render();
    }

    updateFilterButtons() {
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === this.filter) {
                btn.classList.add('active');
            }
        });
    }

    getFilteredTodos() {
        switch (this.filter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        this.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = `
                <li class="empty-state">
                    ${this.todos.length === 0 ? '还没有待办事项，添加一个吧！' : '没有符合条件的项目'}
                </li>
            `;
        } else {
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                li.dataset.id = todo.id;
                li.innerHTML = `
                    <input
                        type="checkbox"
                        class="todo-checkbox"
                        ${todo.completed ? 'checked' : ''}
                    >
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <button class="delete-btn">删除</button>
                `;
                this.todoList.appendChild(li);
            });
        }

        this.updateStats();
    }

    updateStats() {
        const activeCount = this.todos.filter(t => !t.completed).length;
        this.itemCount.textContent = `${activeCount} 个未完成项目`;
    }

    save() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleTheme() {
        this.darkMode = !this.darkMode;
        this.applyTheme();
        localStorage.setItem('darkMode', this.darkMode);
    }

    applyTheme() {
        document.body.classList.toggle('dark-mode', this.darkMode);
        this.themeToggle.textContent = this.darkMode ? '☀️' : '🌙';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

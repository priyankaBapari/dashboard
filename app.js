/**
 * Smart Personal Dashboard - Main Application
 * A fully functional personal dashboard with tasks, notes, clock, and dark/light mode
 */

// ========================================
// State Management
// ========================================

const state = {
    tasks: [],
    notes: [],
    currentSection: 'overview',
    currentTaskFilter: 'all',
    editingTaskId: null,
    editingNoteId: null,
    viewingNoteId: null,
    theme: 'light',
    searchQuery: '',
    tagSuggestions: new Set()
};

// ========================================
// DOM Elements Cache
// ========================================

const elements = {
    // Layout
    sidebar: document.getElementById('sidebar'),
    mainContent: document.getElementById('mainContent'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),

    // Navigation
    navLinks: document.querySelectorAll('.nav-link[data-section]'),
    contentSections: document.querySelectorAll('.content-section[data-section]'),

    // Theme
    themeToggle: document.getElementById('themeToggle'),

    // Clock
    timeEl: document.getElementById('time'),
    dateEl: document.getElementById('date'),

    // Overview Stats
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    pendingTasks: document.getElementById('pendingTasks'),
    totalNotes: document.getElementById('totalNotes'),
    recentTasks: document.getElementById('recentTasks'),
    recentNotes: document.getElementById('recentNotes'),
    taskBadge: document.getElementById('taskBadge'),

    // Quick Actions
    quickActionBtns: document.querySelectorAll('.action-btn[data-action]'),

    // Tasks
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    filterBtns: document.querySelectorAll('.filter-btn[data-filter]'),
    taskList: document.getElementById('taskList'),
    taskSummary: document.getElementById('taskSummary'),
    clearCompletedBtn: document.getElementById('clearCompleted'),

    // Notes
    newNoteBtn: document.getElementById('newNoteBtn'),
    noteSearch: document.getElementById('noteSearch'),
    notesGrid: document.getElementById('notesGrid'),

    // Task Modal
    taskModal: document.getElementById('taskModal'),
    taskModalTitle: document.getElementById('taskModalTitle'),
    closeTaskModal: document.getElementById('closeTaskModal'),
    cancelTaskBtn: document.getElementById('cancelTaskBtn'),
    taskForm: document.getElementById('taskForm'),
    taskId: document.getElementById('taskId'),
    modalTaskInput: document.getElementById('modalTaskInput'),
    taskPriority: document.getElementById('taskPriority'),
    taskDueDate: document.getElementById('taskDueDate'),
    saveTaskBtn: document.getElementById('saveTaskBtn'),

    // Note Modal
    noteModal: document.getElementById('noteModal'),
    noteModalTitle: document.getElementById('noteModalTitle'),
    closeNoteModal: document.getElementById('closeNoteModal'),
    cancelNoteBtn: document.getElementById('cancelNoteBtn'),
    noteForm: document.getElementById('noteForm'),
    noteId: document.getElementById('noteId'),
    noteTitle: document.getElementById('noteTitle'),
    noteContent: document.getElementById('noteContent'),
    noteTags: document.getElementById('noteTags'),
    tagSuggestions: document.getElementById('tagSuggestions'),
    saveNoteBtn: document.getElementById('saveNoteBtn'),

    // View Note Modal
    viewNoteModal: document.getElementById('viewNoteModal'),
    viewNoteTitle: document.getElementById('viewNoteTitle'),
    closeViewNoteModal: document.getElementById('closeViewNoteModal'),
    editNoteBtn: document.getElementById('editNoteBtn'),
    deleteNoteBtn: document.getElementById('deleteNoteBtn'),
    viewNoteDate: document.getElementById('viewNoteDate'),
    viewNoteTags: document.getElementById('viewNoteTags'),
    viewNoteContent: document.getElementById('viewNoteContent'),

    // Toast
    toastContainer: document.getElementById('toastContainer'),

    // Refresh
    refreshBtn: document.getElementById('refreshBtn')
};

// ========================================
// Utility Functions
// ========================================

const utils = {
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
    },

    // Format date for display
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format date for input (YYYY-MM-DD)
    formatDateInput(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    },

    // Check if date is overdue
    isOverdue(dateStr) {
        if (!dateStr) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dateStr);
        due.setHours(0, 0, 0, 0);
        return due < today;
    },

    // Debounce function
    debounce(fn, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Truncate text
    truncate(text, length) {
        if (text.length <= length) return text;
        return text.slice(0, length) + '...';
    },

    // Get priority label
    getPriorityLabel(priority) {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
};

// ========================================
// Storage Service
// ========================================

const storage = {
    KEYS: {
        TASKS: 'smartdash_tasks',
        NOTES: 'smartdash_notes',
        THEME: 'smartdash_theme'
    },

    load() {
        try {
            const tasks = JSON.parse(localStorage.getItem(this.KEYS.TASKS) || '[]');
            const notes = JSON.parse(localStorage.getItem(this.KEYS.NOTES) || '[]');
            const theme = localStorage.getItem(this.KEYS.THEME) || 'light';

            state.tasks = tasks.map(t => ({
                ...t,
                createdAt: new Date(t.createdAt),
                updatedAt: new Date(t.updatedAt),
                dueDate: t.dueDate ? new Date(t.dueDate) : null
            }));

            state.notes = notes.map(n => ({
                ...n,
                createdAt: new Date(n.createdAt),
                updatedAt: new Date(n.updatedAt)
            }));

            state.theme = theme;
            this.applyTheme(theme);

            // Build tag suggestions from notes
            notes.forEach(note => {
                if (note.tags) {
                    note.tags.forEach(tag => state.tagSuggestions.add(tag));
                }
            });
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
            ui.showToast('Failed to load saved data', 'error');
        }
    },

    saveTasks() {
        try {
            localStorage.setItem(this.KEYS.TASKS, JSON.stringify(state.tasks));
        } catch (error) {
            console.error('Failed to save tasks:', error);
            ui.showToast('Failed to save tasks', 'error');
        }
    },

    saveNotes() {
        try {
            localStorage.setItem(this.KEYS.NOTES, JSON.stringify(state.notes));
        } catch (error) {
            console.error('Failed to save notes:', error);
            ui.showToast('Failed to save notes', 'error');
        }
    },

    saveTheme(theme) {
        try {
            localStorage.setItem(this.KEYS.THEME, theme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        state.theme = theme;
    },

    showToast(message, type = 'info') {
        ui.showToast(message, type);
    }
};

// ========================================
// UI Controller
// ========================================

const ui = {
    // Initialize UI
    init() {
        this.bindEvents();
        this.updateClock();
        this.startClock();
        this.renderAll();
    },

    // Event Bindings
    bindEvents() {
        // Navigation
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
            });
        });

        // Mobile menu
        elements.mobileMenuBtn.addEventListener('click', () => this.toggleSidebar());
        elements.sidebarToggle.addEventListener('click', () => this.toggleSidebar());

        // Close sidebar on overlay click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                elements.sidebar.classList.contains('open') &&
                !elements.sidebar.contains(e.target) &&
                !elements.mobileMenuBtn.contains(e.target)) {
                this.closeSidebar();
            }
        });

        // Theme toggle
        elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Quick actions
        elements.quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleQuickAction(btn.dataset.action));
        });

        // Tasks
        elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && elements.taskInput.value.trim()) {
                this.addTask(elements.taskInput.value.trim());
            }
        });
        elements.addTaskBtn.addEventListener('click', () => {
            const value = elements.taskInput.value.trim();
            if (value) this.addTask(value);
        });

        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setTaskFilter(btn.dataset.filter));
        });

        elements.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());

        // Task Modal
        elements.closeTaskModal.addEventListener('click', () => this.closeTaskModal());
        elements.cancelTaskBtn.addEventListener('click', () => this.closeTaskModal());
        elements.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        elements.taskModal.addEventListener('click', (e) => {
            if (e.target === elements.taskModal) this.closeTaskModal();
        });

        // Notes
        elements.newNoteBtn.addEventListener('click', () => this.openNoteModal());
        elements.noteSearch.addEventListener('input', utils.debounce((e) => {
            state.searchQuery = e.target.value.toLowerCase();
            this.renderNotes();
        }, 150));

        // Note Modal
        elements.closeNoteModal.addEventListener('click', () => this.closeNoteModal());
        elements.cancelNoteBtn.addEventListener('click', () => this.closeNoteModal());
        elements.noteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNote();
        });
        elements.noteModal.addEventListener('click', (e) => {
            if (e.target === elements.noteModal) this.closeNoteModal();
        });

        // Tag input
        elements.noteTags.addEventListener('input', (e) => this.updateTagSuggestions(e.target.value));
        elements.noteTags.addEventListener('focus', (e) => this.updateTagSuggestions(e.target.value));
        elements.noteTags.addEventListener('blur', () => {
            setTimeout(() => this.hideTagSuggestions(), 200);
        });

        // Tag suggestions delegation
        elements.tagSuggestions.addEventListener('click', (e) => {
            const tag = e.target.closest('.tag-suggestion');
            if (tag) this.addTag(tag.textContent);
        });

        // View Note Modal
        elements.closeViewNoteModal.addEventListener('click', () => this.closeViewNoteModal());
        elements.editNoteBtn.addEventListener('click', () => this.editViewingNote());
        elements.deleteNoteBtn.addEventListener('click', () => this.deleteViewingNote());
        elements.viewNoteModal.addEventListener('click', (e) => {
            if (e.target === elements.viewNoteModal) this.closeViewNoteModal();
        });

        // Refresh button
        elements.refreshBtn.addEventListener('click', () => {
            this.renderAll();
            this.showToast('Refreshed', 'info');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Close modals on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (elements.taskModal.classList.contains('active')) this.closeTaskModal();
                if (elements.noteModal.classList.contains('active')) this.closeNoteModal();
                if (elements.viewNoteModal.classList.contains('active')) this.closeViewNoteModal();
            }
        });
    },

    // Keyboard shortcuts
    handleKeyboard(e) {
        // Ctrl/Cmd + N: New note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.openNoteModal();
        }
        // Ctrl/Cmd + T: New task
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            this.openTaskModal();
        }
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            elements.noteSearch.focus();
        }
        // Slash: Focus task input (when in tasks section)
        if (e.key === '/' && document.activeElement === document.body) {
            if (state.currentSection === 'tasks') {
                e.preventDefault();
                elements.taskInput.focus();
            }
        }
    },

    // Clock
    updateClock() {
        const now = new Date();
        elements.timeEl.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        elements.dateEl.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    startClock() {
        setInterval(() => this.updateClock(), 1000);
    },

    // Theme
    toggleTheme() {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        storage.applyTheme(newTheme);
        storage.saveTheme(newTheme);
        this.showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`, 'info');
    },

    // Sidebar
    toggleSidebar() {
        elements.sidebar.classList.toggle('open');
        // Create overlay if needed
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', () => this.closeSidebar());
        }
        overlay.classList.toggle('active');
    },

    closeSidebar() {
        elements.sidebar.classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    // Section Navigation
    switchSection(sectionName) {
        // Update nav links
        elements.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionName);
        });

        // Update content sections
        elements.contentSections.forEach(section => {
            section.classList.toggle('active', section.dataset.section === sectionName);
        });

        state.currentSection = sectionName;
        this.closeSidebar();

        // Focus management
        if (sectionName === 'tasks') {
            setTimeout(() => elements.taskInput.focus(), 100);
        } else if (sectionName === 'notes') {
            setTimeout(() => elements.noteSearch.focus(), 100);
        }
    },

    // Quick Actions
    handleQuickAction(action) {
        switch (action) {
            case 'addTask':
                this.openTaskModal();
                break;
            case 'addNote':
                this.openNoteModal();
                break;
        }
    },

    // ========================================
    // Task Management
    // ========================================

    addTask(text) {
        const task = {
            id: utils.generateId(),
            text: text,
            completed: false,
            priority: 'medium',
            dueDate: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        state.tasks.unshift(task);
        storage.saveTasks();
        elements.taskInput.value = '';
        this.renderTasks();
        this.renderOverview();
        this.showToast('Task added', 'success');
    },

    openTaskModal(task = null) {
        state.editingTaskId = task?.id || null;

        if (task) {
            elements.taskModalTitle.textContent = 'Edit Task';
            elements.taskId.value = task.id;
            elements.modalTaskInput.value = task.text;
            elements.taskPriority.value = task.priority;
            elements.taskDueDate.value = task.dueDate ? utils.formatDateInput(task.dueDate) : '';
        } else {
            elements.taskModalTitle.textContent = 'Add New Task';
            elements.taskForm.reset();
            elements.taskId.value = '';
            elements.modalTaskInput.value = '';
            elements.taskPriority.value = 'medium';
            elements.taskDueDate.value = '';
        }

        elements.taskModal.classList.add('active');
        setTimeout(() => elements.modalTaskInput.focus(), 100);
    },

    closeTaskModal() {
        elements.taskModal.classList.remove('active');
        state.editingTaskId = null;
    },

    saveTask() {
        const text = elements.modalTaskInput.value.trim();
        if (!text) {
            this.showToast('Task text is required', 'error');
            return;
        }

        const priority = elements.taskPriority.value;
        const dueDate = elements.taskDueDate.value ? new Date(elements.taskDueDate.value) : null;

        if (state.editingTaskId) {
            // Update existing
            const task = state.tasks.find(t => t.id === state.editingTaskId);
            if (task) {
                task.text = text;
                task.priority = priority;
                task.dueDate = dueDate;
                task.updatedAt = new Date();
                this.showToast('Task updated', 'success');
            }
        } else {
            // Create new
            const task = {
                id: utils.generateId(),
                text,
                completed: false,
                priority,
                dueDate,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            state.tasks.unshift(task);
            this.showToast('Task added', 'success');
        }

        storage.saveTasks();
        this.renderTasks();
        this.renderOverview();
        this.closeTaskModal();
    },

    toggleTaskComplete(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.updatedAt = new Date();
            storage.saveTasks();
            this.renderTasks();
            this.renderOverview();
            this.showToast(task.completed ? 'Task completed' : 'Task marked active', 'success');
        }
    },

    deleteTask(taskId) {
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        storage.saveTasks();
        this.renderTasks();
        this.renderOverview();
        this.showToast('Task deleted', 'info');
    },

    editTask(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) this.openTaskModal(task);
    },

    setTaskFilter(filter) {
        state.currentTaskFilter = filter;
        elements.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.renderTasks();
    },

    clearCompletedTasks() {
        const completedCount = state.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showToast('No completed tasks to clear', 'info');
            return;
        }
        state.tasks = state.tasks.filter(t => !t.completed);
        storage.saveTasks();
        this.renderTasks();
        this.renderOverview();
        this.showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`, 'success');
    },

    getFilteredTasks() {
        switch (state.currentTaskFilter) {
            case 'active':
                return state.tasks.filter(t => !t.completed);
            case 'completed':
                return state.tasks.filter(t => t.completed);
            default:
                return state.tasks;
        }
    },

    renderTasks() {
        const tasks = this.getFilteredTasks();

        if (tasks.length === 0) {
            let message = 'No tasks yet. Add a task to get started!';
            if (state.currentTaskFilter === 'active') message = 'No active tasks. Great job!';
            if (state.currentTaskFilter === 'completed') message = 'No completed tasks yet.';

            elements.taskList.innerHTML = `<li class="empty-state">${utils.escapeHtml(message)}</li>`;
            elements.taskSummary.textContent = this.getTaskSummaryText();
            return;
        }

        elements.taskList.innerHTML = tasks.map(task => this.createTaskElement(task)).join('');
        elements.taskSummary.textContent = this.getTaskSummaryText();

        // Bind events for new elements
        elements.taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', () => this.toggleTaskComplete(checkbox.dataset.taskId));
        });
        elements.taskList.querySelectorAll('.task-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => this.editTask(btn.dataset.taskId));
        });
        elements.taskList.querySelectorAll('.task-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => this.deleteTask(btn.dataset.taskId));
        });
    },

    createTaskElement(task) {
        const isOverdue = task.dueDate && utils.isOverdue(task.dueDate) && !task.completed;
        const dueDateStr = task.dueDate ? utils.formatDate(task.dueDate) : null;

        return `
            <li class="task-item${task.completed ? ' completed' : ''}" data-task-id="${task.id}">
                <button class="task-checkbox${task.completed ? ' completed' : ''}" data-task-id="${task.id}" aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                    ${task.completed ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                </button>
                <div class="task-content">
                    <div class="task-text">${utils.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">${utils.getPriorityLabel(task.priority)}</span>
                        ${dueDateStr ? `<span class="task-due-date${isOverdue ? ' overdue' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${dueDateStr}${isOverdue ? ' (Overdue)' : ''}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit" data-task-id="${task.id}" aria-label="Edit task">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="task-action-btn delete" data-task-id="${task.id}" aria-label="Delete task">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </li>
        `;
    },

    getTaskSummaryText() {
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => t.completed).length;
        const active = total - completed;
        return `${total} task${total !== 1 ? 's' : ''} total, ${active} active, ${completed} completed`;
    },

    // ========================================
    // Note Management
    // ========================================

    openNoteModal(note = null) {
        state.editingNoteId = note?.id || null;

        if (note) {
            elements.noteModalTitle.textContent = 'Edit Note';
            elements.noteId.value = note.id;
            elements.noteTitle.value = note.title;
            elements.noteContent.value = note.content;
            elements.noteTags.value = note.tags?.join(', ') || '';
        } else {
            elements.noteModalTitle.textContent = 'New Note';
            elements.noteForm.reset();
            elements.noteId.value = '';
        }

        elements.noteModal.classList.add('active');
        setTimeout(() => elements.noteTitle.focus(), 100);
    },

    closeNoteModal() {
        elements.noteModal.classList.remove('active');
        state.editingNoteId = null;
    },

    saveNote() {
        const title = elements.noteTitle.value.trim();
        const content = elements.noteContent.value.trim();

        if (!title) {
            this.showToast('Note title is required', 'error');
            return;
        }
        if (!content) {
            this.showToast('Note content is required', 'error');
            return;
        }

        const tags = elements.noteTags.value
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        // Update tag suggestions
        tags.forEach(tag => state.tagSuggestions.add(tag));

        const now = new Date();

        if (state.editingNoteId) {
            const note = state.notes.find(n => n.id === state.editingNoteId);
            if (note) {
                note.title = title;
                note.content = content;
                note.tags = tags;
                note.updatedAt = now;
                this.showToast('Note updated', 'success');
            }
        } else {
            const note = {
                id: utils.generateId(),
                title,
                content,
                tags,
                createdAt: now,
                updatedAt: now
            };
            state.notes.unshift(note);
            this.showToast('Note created', 'success');
        }

        storage.saveNotes();
        this.renderNotes();
        this.renderOverview();
        this.closeNoteModal();
    },

    openViewNoteModal(noteId) {
        const note = state.notes.find(n => n.id === noteId);
        if (!note) return;

        state.viewingNoteId = noteId;
        elements.viewNoteTitle.textContent = note.title;
        elements.viewNoteDate.textContent = `Updated ${utils.formatDate(note.updatedAt)}${note.createdAt.getTime() !== note.updatedAt.getTime() ? ` • Created ${utils.formatDate(note.createdAt)}` : ''}`;
        elements.viewNoteTags.innerHTML = note.tags?.map(tag =>
            `<span class="note-tag">${utils.escapeHtml(tag)}</span>`
        ).join('') || '';
        elements.viewNoteContent.textContent = note.content;

        elements.viewNoteModal.classList.add('active');
    },

    closeViewNoteModal() {
        elements.viewNoteModal.classList.remove('active');
        state.viewingNoteId = null;
    },

    editViewingNote() {
        const note = state.notes.find(n => n.id === state.viewingNoteId);
        if (note) {
            this.closeViewNoteModal();
            this.openNoteModal(note);
        }
    },

    deleteViewingNote() {
        if (confirm('Are you sure you want to delete this note?')) {
            this.deleteNote(state.viewingNoteId);
            this.closeViewNoteModal();
        }
    },

    deleteNote(noteId) {
        state.notes = state.notes.filter(n => n.id !== noteId);
        storage.saveNotes();
        this.renderNotes();
        this.renderOverview();
        this.showToast('Note deleted', 'info');
    },

    updateTagSuggestions(value) {
        // Split by comma and get all complete tags (those followed by comma or at end with content)
        const parts = value.split(',');
        const completeTags = parts.slice(0, -1).map(t => t.trim()).filter(t => t.length > 0);
        const lastTag = parts[parts.length - 1]?.trim() || '';
        const inputValue = lastTag.toLowerCase();

        if (inputValue.length === 0) {
            this.hideTagSuggestions();
            return;
        }

        const suggestions = Array.from(state.tagSuggestions)
            .filter(tag => tag.toLowerCase().includes(inputValue) && !completeTags.includes(tag))
            .slice(0, 8);

        if (suggestions.length === 0) {
            this.hideTagSuggestions();
            return;
        }

        elements.tagSuggestions.innerHTML = suggestions.map(tag =>
            `<button type="button" class="tag-suggestion">${utils.escapeHtml(tag)}</button>`
        ).join('');
        elements.tagSuggestions.classList.add('active');
    },

    hideTagSuggestions() {
        elements.tagSuggestions.classList.remove('active');
    },

    addTag(tag) {
        const currentTags = elements.noteTags.value
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        if (!currentTags.includes(tag)) {
            currentTags.push(tag);
            elements.noteTags.value = currentTags.join(', ') + ', ';
            elements.noteTags.focus();
        }
        this.hideTagSuggestions();
    },

    getFilteredNotes() {
        if (!state.searchQuery) return state.notes;

        return state.notes.filter(note =>
            note.title.toLowerCase().includes(state.searchQuery) ||
            note.content.toLowerCase().includes(state.searchQuery) ||
            note.tags?.some(tag => tag.toLowerCase().includes(state.searchQuery))
        );
    },

    renderNotes() {
        const notes = this.getFilteredNotes();

        if (notes.length === 0) {
            const message = state.searchQuery
                ? `No notes found for "${utils.escapeHtml(state.searchQuery)}"`
                : 'No notes yet. Click "New Note" to create your first note';
            elements.notesGrid.innerHTML = `
                <div class="empty-state-card" style="grid-column: 1 / -1;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <line x1="10" y1="9" x2="8" y2="9"/>
                    </svg>
                    <h3>${state.searchQuery ? 'No matches found' : 'No notes yet'}</h3>
                    <p>${utils.escapeHtml(message)}</p>
                </div>
            `;
            return;
        }

        elements.notesGrid.innerHTML = notes.map(note => this.createNoteElement(note)).join('');

        // Bind events
        elements.notesGrid.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.note-menu-btn')) {
                    this.openViewNoteModal(card.dataset.noteId);
                }
            });
        });

        elements.notesGrid.querySelectorAll('.note-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showNoteMenu(e.target.closest('.note-card'), btn);
            });
        });
    },

    createNoteElement(note) {
        const tagsHtml = note.tags?.slice(0, 3).map(tag =>
            `<span class="note-tag">${utils.escapeHtml(tag)}</span>`
        ).join('') || '';

        const moreTags = note.tags && note.tags.length > 3
            ? `<span class="note-tag">+${note.tags.length - 3}</span>`
            : '';

        return `
            <article class="note-card" data-note-id="${note.id}">
                <div class="note-card-header">
                    <h3 class="note-card-title">${utils.escapeHtml(note.title)}</h3>
                    <button class="note-menu-btn" aria-label="Note options">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="19" cy="12" r="1"/>
                            <circle cx="5" cy="12" r="1"/>
                        </svg>
                    </button>
                </div>
                <div class="note-card-content">${utils.escapeHtml(utils.truncate(note.content, 200))}</div>
                <div class="note-card-footer">
                    <div class="note-card-tags">${tagsHtml}${moreTags}</div>
                    <span class="note-card-date">${utils.formatDate(note.updatedAt)}</span>
                </div>
            </article>
        `;
    },

    showNoteMenu(card, button) {
        const noteId = card.dataset.noteId;
        const note = state.notes.find(n => n.id === noteId);
        if (!note) return;

        // Create dropdown menu
        const menu = document.createElement('div');
        menu.className = 'note-dropdown-menu';
        menu.innerHTML = `
            <button class="dropdown-item edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
            <button class="dropdown-item delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete</button>
        `;

        // Position menu
        const rect = button.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 4}px`;
        menu.style.left = `${rect.left}px`;
        menu.style.zIndex = '1001';

        // Add styles
        if (!document.querySelector('#dropdown-styles')) {
            const style = document.createElement('style');
            style.id = 'dropdown-styles';
            style.textContent = `
                .note-dropdown-menu {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    min-width: 140px;
                    overflow: hidden;
                    animation: fadeIn 0.15s ease;
                }
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.625rem 1rem;
                    background: none;
                    border: none;
                    color: var(--text-primary);
                    font-size: var(--font-size-sm);
                    font-family: inherit;
                    cursor: pointer;
                    text-align: left;
                }
                .dropdown-item:hover { background: var(--bg-tertiary); }
                .dropdown-item.delete { color: var(--accent-danger); }
                .dropdown-item.delete:hover { background: var(--accent-danger-light); }
                .dropdown-item svg { width: 16px; height: 16px; flex-shrink: 0; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(menu);

        // Handle clicks
        menu.querySelector('.edit').addEventListener('click', () => {
            document.body.removeChild(menu);
            this.openNoteModal(note);
        });
        menu.querySelector('.delete').addEventListener('click', () => {
            document.body.removeChild(menu);
            if (confirm('Are you sure you want to delete this note?')) {
                this.deleteNote(noteId);
            }
        });

        // Close on outside click
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    },

    // ========================================
    // Overview / Stats
    // ========================================

    renderOverview() {
        // Stats
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const notesCount = state.notes.length;

        elements.totalTasks.textContent = total;
        elements.completedTasks.textContent = completed;
        elements.pendingTasks.textContent = pending;
        elements.totalNotes.textContent = notesCount;
        elements.taskBadge.textContent = pending;

        // Recent tasks (last 5)
        const recentTasks = state.tasks.slice(0, 5);
        if (recentTasks.length === 0) {
            elements.recentTasks.innerHTML = '<li class="empty-state">No tasks yet. Add your first task!</li>';
        } else {
            elements.recentTasks.innerHTML = recentTasks.map(task => `
                <li class="task-preview-item${task.completed ? ' completed' : ''}">
                    <button class="task-preview-checkbox${task.completed ? ' completed' : ''}" data-task-id="${task.id}">
                        ${task.completed ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </button>
                    <span class="task-preview-text${task.completed ? ' completed' : ''}">${utils.escapeHtml(task.text)}</span>
                    <span class="task-preview-priority ${task.priority}"></span>
                </li>
            `).join('');

            elements.recentTasks.querySelectorAll('.task-preview-checkbox').forEach(cb => {
                cb.addEventListener('click', () => this.toggleTaskComplete(cb.dataset.taskId));
            });
        }

        // Recent notes (last 3)
        const recentNotes = state.notes.slice(0, 3);
        if (recentNotes.length === 0) {
            elements.recentNotes.innerHTML = '<p class="empty-state">No notes yet. Create your first note!</p>';
        } else {
            elements.recentNotes.innerHTML = recentNotes.map(note => `
                <div class="note-preview-item">
                    <div class="note-preview-title">${utils.escapeHtml(note.title)}</div>
                    <div class="note-preview-content">${utils.escapeHtml(utils.truncate(note.content, 100))}</div>
                    <div class="note-preview-meta">
                        <span>${utils.formatDate(note.updatedAt)}</span>
                        ${note.tags?.slice(0, 2).map(tag => `<span class="note-tag">${utils.escapeHtml(tag)}</span>`).join('') || ''}
                    </div>
                </div>
            `).join('');
        }
    },

    // ========================================
    // Render All
    // ========================================

    renderAll() {
        this.renderTasks();
        this.renderNotes();
        this.renderOverview();
    },

    // ========================================
    // Toast Notifications
    // ========================================

    showToast(message, type = 'info') {
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${utils.escapeHtml(message)}</span>
            <button class="toast-close" aria-label="Dismiss">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;

        elements.toastContainer.appendChild(toast);

        toast.querySelector('.toast-close').addEventListener('click', () => this.removeToast(toast));

        // Auto remove after 4 seconds
        setTimeout(() => this.removeToast(toast), 4000);
    },

    removeToast(toast) {
        if (toast.parentNode) {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }
    }
};

// ========================================
// Initialize Application
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    storage.load();
    ui.init();
});

// Handle visibility change to update clock immediately
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        ui.updateClock();
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const allTasksCount = document.getElementById('allTasksCount');
    const activeTasksCount = document.getElementById('activeTasksCount');
    const completedTasksCount = document.getElementById('completedTasksCount');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const emptyState = document.getElementById('emptyState');
    const firstTaskBtn = document.getElementById('firstTaskBtn');
    const themeToggle = document.getElementById('themeToggle');
    
    // App state
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
        renderTasks();
        updateTaskCounts();
        setupEventListeners();
        enableDragAndDrop();
        updateCopyrightYear();
        setupThemeToggle();
        
        // Focus input on first task button click
        firstTaskBtn.addEventListener('click', () => {
            taskInput.focus();
        });
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
    }
    
    // Theme toggle functionality
    function setupThemeToggle() {
        
        // Check localStorage for preference
        const savedMode = localStorage.getItem('nightMode');
        
       
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('night-mode');
            
            if (document.body.classList.contains('night-mode')) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Day Mode</span>';
                localStorage.setItem('nightMode', 'enabled');
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Night Mode</span>';
                localStorage.setItem('nightMode', 'disabled');
            }
        });
    }
    
    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'medium'
            };
            tasks.push(newTask);
            saveTasks();
            taskInput.value = '';
            renderTasks();
            updateTaskCounts();
            animateTaskAdd(newTask.id);
            taskInput.focus();
        }
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
            filteredTasks.forEach(task => {
                const taskItem = createTaskElement(task);
                taskList.appendChild(taskItem);
            });
        }
    }
    
    // Create task DOM element
    function createTaskElement(task) {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        taskItem.draggable = true;
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
        
        // Task text with priority tag
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        if (task.completed) {
            taskText.classList.add('completed');
        }
        
        const priorityTag = document.createElement('span');
        priorityTag.className = `priority-tag priority-${task.priority}`;
        priorityTag.textContent = task.priority;
        taskText.appendChild(priorityTag);
        
        // Task actions
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        
        const priorityBtn = document.createElement('button');
        priorityBtn.className = 'priority-btn';
        priorityBtn.innerHTML = '<i class="fas fa-flag"></i>';
        priorityBtn.title = 'Change priority';
        priorityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeTaskPriority(task.id);
        });
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit task';
        editBtn.addEventListener('click', () => enableEditMode(task.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskActions.appendChild(priorityBtn);
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(taskActions);
        
        return taskItem;
    }
    
    // Toggle task completion status
    function toggleTaskComplete(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
        updateTaskCounts();
    }
    
    // Delete a task
    function deleteTask(taskId) {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('fade-out');
            
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTasks();
                updateTaskCounts();
            }, 300);
        }
    }
    
    // Enable edit mode for a task
    function enableEditMode(taskId) {
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        const task = tasks.find(t => t.id === taskId);
        const currentText = task.text;
        
        taskItem.innerHTML = '';
        
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = currentText;
        editInput.style.flex = '1';
        editInput.style.marginRight = '10px';
        editInput.style.padding = '10px';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        saveBtn.style.padding = '10px 15px';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
        cancelBtn.style.marginLeft = '10px';
        cancelBtn.style.padding = '10px 15px';
        
        taskItem.appendChild(editInput);
        taskItem.appendChild(saveBtn);
        taskItem.appendChild(cancelBtn);
        
        editInput.focus();
        
        saveBtn.addEventListener('click', () => saveEditedTask(taskId, editInput.value.trim()));
        cancelBtn.addEventListener('click', () => renderTasks());
        editInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveEditedTask(taskId, editInput.value.trim());
            }
        });
    }
    
    // Save edited task
    function saveEditedTask(taskId, newText) {
        if (newText) {
            tasks = tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, text: newText };
                }
                return task;
            });
            saveTasks();
        }
        renderTasks();
    }
    
    // Change task priority
    function changeTaskPriority(taskId) {
        const task = tasks.find(t => t.id === taskId);
        const priorities = ['high', 'medium', 'low'];
        const currentIndex = priorities.indexOf(task.priority);
        const nextIndex = (currentIndex + 1) % priorities.length;
        
        tasks = tasks.map(t => {
            if (t.id === taskId) {
                return { ...t, priority: priorities[nextIndex] };
            }
            return t;
        });
        
        saveTasks();
        renderTasks();
    }
    
    // Update all task counters
    function updateTaskCounts() {
        const allCount = tasks.length;
        const activeCount = tasks.filter(task => !task.completed).length;
        const completedCount = tasks.filter(task => task.completed).length;
        
        allTasksCount.textContent = allCount;
        activeTasksCount.textContent = activeCount;
        completedTasksCount.textContent = completedCount;
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Enable drag and drop sorting
    function enableDragAndDrop() {
        new Sortable(taskList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: function(evt) {
                const taskItems = Array.from(taskList.children);
                const newOrder = taskItems.map(item => parseInt(item.dataset.id));
                
                tasks = newOrder.map(id => tasks.find(task => task.id === id));
                saveTasks();
            }
        });
    }
    
    // Animate task when added
    function animateTaskAdd(taskId) {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.opacity = '0';
            taskElement.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                taskElement.style.transition = 'opacity 0.3s, transform 0.3s';
                taskElement.style.opacity = '1';
                taskElement.style.transform = 'translateY(0)';
            }, 10);
        }
    }
    
    // Update copyright year
    function updateCopyrightYear() {
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }
    
    // Initialize the app
    init();
});

let tasks = [];
let notes = [];
let habits = [];
let timeLeft = 1500;
let timerInterval = null;
let profileImage = '';
let dailyGoal = '';
let focusSessions = 0;

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    loadData();
    fetchWeather();
    fetchQuote();
    document.getElementById('profileUpload').addEventListener('change', uploadProfile);
    document.getElementById('themeSwitcher').addEventListener('click', toggleTheme);
});

function checkLogin() {
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = 'login.html';
    } else {
        document.getElementById('userName').textContent = `Welcome, ${username}`;
        applyTheme();
    }
}

function applyTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeSwitcher').innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('themeSwitcher').innerHTML = isDark 
        ? '<i class="fas fa-sun"></i> Light Mode' 
        : '<i class="fas fa-moon"></i> Dark Mode';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        window.location.href = 'login.html';
    }
}

function loadData() {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    notes = JSON.parse(localStorage.getItem('notes')) || [];
    habits = JSON.parse(localStorage.getItem('habits')) || [];
    profileImage = localStorage.getItem('profileImage') || 'https://via.placeholder.com/150';
    dailyGoal = localStorage.getItem('dailyGoal') || '';
    focusSessions = parseInt(localStorage.getItem('focusSessions')) || 0;

    document.getElementById('profileImg').src = profileImage;
    document.getElementById('dailyGoal').textContent = dailyGoal || 'No goal set for today.';
    renderTasks();
    renderNotes();
    renderHabits();
    updateProgress();
    updateStats();
}

function saveData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('profileImage', profileImage);
    localStorage.setItem('dailyGoal', dailyGoal);
    localStorage.setItem('focusSessions', focusSessions);
}

/* Tasks, Notes, Habits, Timer, etc. – all functions same as before */
function addTask() {
    const text = document.getElementById('taskInput').value.trim();
    const priority = document.getElementById('taskPriority').value;
    if (text) {
        tasks.push({ text, completed: false, priority });
        document.getElementById('taskInput').value = '';
        renderTasks();
        saveData();
        updateProgress();
        updateStats();
    }
}

function toggleTask(i) {
    tasks[i].completed = !tasks[i].completed;
    renderTasks();
    saveData();
    updateProgress();
    updateStats();
}

function deleteTask(i) {
    tasks.splice(i, 1);
    renderTasks();
    saveData();
    updateProgress();
    updateStats();
}

function renderTasks(filter = tasks) {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    filter.forEach((task, i) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <label>
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${i})">
                <span class="${task.completed ? 'completed' : ''} priority-${task.priority}">
                    ${task.text} <small>(${task.priority})</small>
                </span>
            </label>
            <button onclick="deleteTask(${i})"><i class="fas fa-trash"></i></button>
        `;
        list.appendChild(li);
    });
}

function searchTasks() {
    const query = document.getElementById('taskSearch').value.toLowerCase();
    const filtered = tasks.filter(t => t.text.toLowerCase().includes(query));
    renderTasks(filtered);
}

/* Repeat similar pattern for notes and habits */
function addNote() {
    const text = document.getElementById('noteInput').value.trim();
    if (text) {
        notes.push(text);
        document.getElementById('noteInput').value = '';
        renderNotes();
        saveData();
    }
}

function deleteNote(i) {
    notes.splice(i, 1);
    renderNotes();
    saveData();
}

function renderNotes(filter = notes) {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    filter.forEach((note, i) => {
        const li = document.createElement('li');
        li.className = 'note-item';
        li.innerHTML = `<span>${note}</span><button onclick="deleteNote(${i})"><i class="fas fa-trash"></i></button>`;
        list.appendChild(li);
    });
}

function searchNotes() {
    const query = document.getElementById('noteSearch').value.toLowerCase();
    const filtered = notes.filter(n => n.toLowerCase().includes(query));
    renderNotes(filtered);
}

function addHabit() {
    const text = document.getElementById('habitInput').value.trim();
    if (text) {
        habits.push({ text, completed: false });
        document.getElementById('habitInput').value = '';
        renderHabits();
        saveData();
        updateStats();
    }
}

function toggleHabit(i) {
    habits[i].completed = !habits[i].completed;
    renderHabits();
    saveData();
    updateStats();
}

function deleteHabit(i) {
    habits.splice(i, 1);
    renderHabits();
    saveData();
    updateStats();
}

function renderHabits() {
    const list = document.getElementById('habitList');
    list.innerHTML = '';
    habits.forEach((habit, i) => {
        const li = document.createElement('li');
        li.className = 'habit-item';
        li.innerHTML = `
            <label>
                <input type="checkbox" ${habit.completed ? 'checked' : ''} onchange="toggleHabit(${i})">
                <span class="${habit.completed ? 'completed' : ''}">${habit.text}</span>
            </label>
            <button onclick="deleteHabit(${i})"><i class="fas fa-trash"></i></button>
        `;
        list.appendChild(li);
    });
}

function uploadProfile(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            profileImage = ev.target.result;
            document.getElementById('profileImg').src = profileImage;
            saveData();
        };
        reader.readAsDataURL(file);
    }
}

async function fetchWeather() {
    // Optional – replace YOUR_API_KEY
    document.getElementById('weatherInfo').innerHTML = '<i class="fas fa-globe"></i> Weather feature (add API key)';
}

async function fetchQuote() {
    try {
        const res = await fetch('https://api.quotable.io/random');
        const data = await res.json();
        document.getElementById('dailyQuote').textContent = `"${data.content}" — ${data.author}`;
    } catch {
        document.getElementById('dailyQuote').textContent = "Stay focused and keep going!";
    }
}

function toggleTimer() {
    const btn = document.getElementById('startTimer');
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        btn.textContent = 'Start';
    } else {
        timerInterval = setInterval(() => {
            timeLeft--;
            const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
            const s = String(timeLeft % 60).padStart(2, '0');
            document.getElementById('timerDisplay').textContent = `${m}:${s}`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                btn.textContent = 'Start';
                alert('Focus session complete!');
                focusSessions++;
                saveData();
                updateStats();
                timeLeft = 1500;
                document.getElementById('timerDisplay').textContent = '25:00';
            }
        }, 1000);
        btn.textContent = 'Pause';
    }
}

document.getElementById('startTimer').addEventListener('click', toggleTimer);
document.getElementById('resetTimer').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 1500;
    document.getElementById('timerDisplay').textContent = '25:00';
    document.getElementById('startTimer').textContent = 'Start';
});

function setGoal() {
    const date = document.getElementById('calendarDate').value;
    if (!date) return alert('Select a date');
    const goal = prompt('Enter your goal:');
    if (goal) {
        dailyGoal = `${new Date(date).toLocaleDateString()}: ${goal}`;
        document.getElementById('dailyGoal').textContent = dailyGoal;
        saveData();
    }
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = percent + '% Complete';
}

function updateStats() {
    document.getElementById('taskStats').textContent = `Tasks: ${tasks.filter(t=>t.completed).length} / ${tasks.length}`;
    document.getElementById('habitStats').textContent = `Habits: ${habits.filter(h=>h.completed).length} / ${habits.length}`;
    document.getElementById('focusStats').textContent = `Focus sessions: ${focusSessions}`;
}

function exportData() {
    let csv = "Type,Content,Completed\n";
    tasks.forEach(t => csv += `Task,"${t.text}",${t.completed}\n`);
    notes.forEach(n => csv += `Note,"${n}",false\n`);
    habits.forEach(h => csv += `Habit,"${h.text}",${h.completed}\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productivity_data.csv';
    a.click();
}
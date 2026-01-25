// App State
let timerInterval = null;
let timerSeconds = 60;
let currentTimerSeconds = 60;
let isTimerRunning = false;

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeNavigation();
    initializeAchievementFilters();
    initializeThemeCustomization();
    initializeAvatarCustomization();
    initializeWorkoutTimer();
    initializeRouteFilters();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColorTheme = localStorage.getItem('colorTheme') || 'default';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    if (savedColorTheme !== 'default') {
        document.body.classList.add(`theme-${savedColorTheme}`);
    }
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Navigation
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Achievement Filters
function initializeAchievementFilters() {
    const filterButtons = document.querySelectorAll('.achievement-filter .filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            filterAchievements(filter);
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function filterAchievements(filter) {
    const achievements = document.querySelectorAll('.achievement-card');
    
    achievements.forEach(card => {
        if (filter === 'all') {
            card.classList.remove('hidden');
        } else {
            const category = card.getAttribute('data-category');
            if (category === filter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        }
    });
}

// Theme Customization
function initializeThemeCustomization() {
    const themeOptions = document.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            applyColorTheme(theme);
            
            // Update active button
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
}

function applyColorTheme(theme) {
    const body = document.body;
    
    // Remove all theme classes
    body.classList.remove('theme-ocean', 'theme-sunset', 'theme-forest', 'theme-purple', 'theme-neon');
    
    // Apply new theme if not default
    if (theme !== 'default') {
        body.classList.add(`theme-${theme}`);
    }
    
    // Save to localStorage
    localStorage.setItem('colorTheme', theme);
}

// Avatar Customization
function initializeAvatarCustomization() {
    const savedAvatar = localStorage.getItem('avatar') || '😊';
    updateAvatar(savedAvatar);
    
    const avatarOptions = document.querySelectorAll('.avatar-option');
    
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            const avatar = option.getAttribute('data-avatar');
            updateAvatar(avatar);
            
            // Update active button
            avatarOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Save to localStorage
            localStorage.setItem('avatar', avatar);
        });
    });
}

function updateAvatar(emoji) {
    const avatarEmoji = document.querySelector('.avatar-emoji');
    if (avatarEmoji) {
        avatarEmoji.textContent = emoji;
    }
}

// Workout Timer
function initializeWorkoutTimer() {
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const resetBtn = document.getElementById('reset-timer');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const customTimerBtn = document.getElementById('set-custom-timer');
    
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const seconds = parseInt(button.getAttribute('data-seconds'));
            setTimer(seconds);
            
            // Update active button
            presetButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    customTimerBtn.addEventListener('click', setCustomTimer);
    
    // Initialize display
    updateTimerDisplay();
}

function setTimer(seconds) {
    timerSeconds = seconds;
    currentTimerSeconds = seconds;
    updateTimerDisplay();
    
    if (isTimerRunning) {
        pauseTimer();
    }
}

function setCustomTimer() {
    const minutes = parseInt(document.getElementById('custom-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('custom-seconds').value) || 0;
    const totalSeconds = minutes * 60 + seconds;
    
    if (totalSeconds > 0) {
        setTimer(totalSeconds);
    }
}

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        const timerCircle = document.querySelector('.timer-circle');
        timerCircle.classList.add('active');
        
        timerInterval = setInterval(() => {
            if (currentTimerSeconds > 0) {
                currentTimerSeconds--;
                updateTimerDisplay();
            } else {
                timerComplete();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (isTimerRunning) {
        isTimerRunning = false;
        const timerCircle = document.querySelector('.timer-circle');
        timerCircle.classList.remove('active');
        
        clearInterval(timerInterval);
    }
}

function resetTimer() {
    pauseTimer();
    currentTimerSeconds = timerSeconds;
    updateTimerDisplay();
}

function timerComplete() {
    pauseTimer();
    
    // Check if sound alert is enabled
    const soundAlert = document.getElementById('sound-alert');
    if (soundAlert && soundAlert.checked) {
        // Play a simple beep sound (browser default)
        try {
            const audio = new AudioContext();
            const oscillator = audio.createOscillator();
            const gainNode = audio.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audio.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audio.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5);
            
            oscillator.start(audio.currentTime);
            oscillator.stop(audio.currentTime + 0.5);
        } catch (error) {
            // Audio context may fail if no user gesture has occurred yet
            console.warn('Unable to play sound alert:', error);
        }
    }
    
    // Show completion message
    const timerValue = document.getElementById('timer-value');
    timerValue.textContent = 'Done!';
    
    setTimeout(() => {
        // Check if auto-start is enabled
        const autoStart = document.getElementById('auto-start');
        if (autoStart && autoStart.checked) {
            resetTimer();
            startTimer();
        } else {
            resetTimer();
        }
    }, 2000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(currentTimerSeconds / 60);
    const seconds = currentTimerSeconds % 60;
    
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const timerValue = document.getElementById('timer-value');
    
    if (timerValue) {
        timerValue.textContent = display;
    }
}

// Route Filters
function initializeRouteFilters() {
    const filterButtons = document.querySelectorAll('.route-filters .filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');
            filterRoutes(type);
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function filterRoutes(type) {
    const routes = document.querySelectorAll('.route-card');
    
    routes.forEach(card => {
        if (type === 'all') {
            card.classList.remove('hidden');
        } else {
            const routeType = card.getAttribute('data-route-type');
            if (routeType === type) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        }
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: var(--primary-color);
        color: white;
        border-radius: var(--radius-md);
        box-shadow: 0 4px 12px var(--shadow-hover);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Save user preferences
function saveUserPreferences() {
    const preferences = {
        theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light',
        colorTheme: localStorage.getItem('colorTheme') || 'default',
        avatar: localStorage.getItem('avatar') || '😊',
        timerDuration: timerSeconds,
        autoStart: document.getElementById('auto-start')?.checked || false,
        soundAlert: document.getElementById('sound-alert')?.checked || false
    };
    
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// Load user preferences
function loadUserPreferences() {
    const preferencesStr = localStorage.getItem('userPreferences');
    if (preferencesStr) {
        try {
            const preferences = JSON.parse(preferencesStr);
            
            // Apply saved preferences
            if (preferences.timerDuration) {
                setTimer(preferences.timerDuration);
            }
            
            if (preferences.autoStart !== undefined) {
                const autoStartCheckbox = document.getElementById('auto-start');
                if (autoStartCheckbox) {
                    autoStartCheckbox.checked = preferences.autoStart;
                }
            }
            
            if (preferences.soundAlert !== undefined) {
                const soundAlertCheckbox = document.getElementById('sound-alert');
                if (soundAlertCheckbox) {
                    soundAlertCheckbox.checked = preferences.soundAlert;
                }
            }
        } catch (error) {
            console.error('Error loading user preferences from localStorage:', error.message);
        }
    }
}

// Auto-save preferences when they change
document.addEventListener('change', (e) => {
    if (e.target.id === 'auto-start' || e.target.id === 'sound-alert') {
        saveUserPreferences();
    }
});

// Load preferences on startup
window.addEventListener('load', loadUserPreferences);

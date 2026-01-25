// App State
let appState = {
    currency: 1250,
    isLocked: false,
    timerInterval: null,
    elapsedTime: 0,
    currentActivity: 'running',
    dailyExerciseTime: 0,
    reachedMilestones: [],
    contacts: [
        { id: 'mom', name: 'Mom', number: '+1 555-0123' },
        { id: 'emergency', name: 'Emergency Services', number: '911' },
        { id: 'friend', name: 'Best Friend', number: '+1 555-0456' }
    ],
    settings: {
        blockNotifications: true,
        dailyGoal: 30,
        weeklyGoal: 5,
        soundEffects: true,
        vibration: true,
        leaderboardVisible: true
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeLockSystem();
    initializeSettings();
    initializeRewards();
    initializeLeaderboard();
    updateCurrencyDisplay();
    initializeGoalsProgress();
    
    // Initialize new features
    initializeThemeToggle();
    initializeRestTimer();
    initializeRoutesFilter();
    initializeProfileCustomization();
});

// Tab Navigation
function initializeTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Remove active class from all tabs and contents
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// Lock System
function initializeLockSystem() {
    const startLockBtn = document.getElementById('start-lock-btn');
    const stopLockBtn = document.getElementById('stop-lock-btn');
    const activityType = document.getElementById('activity-type');

    startLockBtn.addEventListener('click', startLockSession);
    stopLockBtn.addEventListener('click', completeLockSession);
    activityType.addEventListener('change', (e) => {
        appState.currentActivity = e.target.value;
    });
}

function startLockSession() {
    if (appState.isLocked) return;

    appState.isLocked = true;
    appState.elapsedTime = 0;

    // Update UI
    const lockStatus = document.getElementById('lock-status');
    const statusIcon = lockStatus.querySelector('.status-icon');
    const statusText = lockStatus.querySelector('.status-text');

    statusIcon.textContent = '🔒';
    statusIcon.classList.remove('unlocked');
    statusIcon.classList.add('locked');
    statusText.textContent = 'Phone Locked - Exercise Mode';

    // Show/hide buttons
    document.getElementById('start-lock-btn').style.display = 'none';
    document.getElementById('stop-lock-btn').style.display = 'block';

    // Start timer
    startTimer();

    // Show notification
    showNotification('Exercise session started! Your phone is now locked. 🏃');
}

function completeLockSession() {
    if (!appState.isLocked) return;

    appState.isLocked = false;

    // Stop timer
    stopTimer();

    // Calculate rewards
    const minutes = Math.floor(appState.elapsedTime / 60);
    const coinsEarned = Math.max(50, minutes * 10); // Min 50 coins, +10 per minute
    appState.currency += coinsEarned;

    // Update UI
    const lockStatus = document.getElementById('lock-status');
    const statusIcon = lockStatus.querySelector('.status-icon');
    const statusText = lockStatus.querySelector('.status-text');

    statusIcon.textContent = '🔓';
    statusIcon.classList.remove('locked');
    statusIcon.classList.add('unlocked');
    statusText.textContent = 'Phone Unlocked';

    // Show/hide buttons
    document.getElementById('start-lock-btn').style.display = 'block';
    document.getElementById('stop-lock-btn').style.display = 'none';

    // Update currency display
    updateCurrencyDisplay();

    // Show notification
    showNotification(`🎉 Exercise complete! You earned ${coinsEarned} coins!`);

    // Reset timer display and progress
    setTimeout(() => {
        updateTimerDisplay(0);
        resetGoalsProgress();
    }, 2000);
}

function startTimer() {
    appState.timerInterval = setInterval(() => {
        appState.elapsedTime++;
        appState.dailyExerciseTime++;
        updateTimerDisplay(appState.elapsedTime);
        updateGoalsProgress();
    }, 1000);
}

function stopTimer() {
    if (appState.timerInterval) {
        clearInterval(appState.timerInterval);
        appState.timerInterval = null;
    }
}

function updateTimerDisplay(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.querySelector('.timer').textContent = timeString;
}

function updateCurrencyDisplay() {
    document.getElementById('currency-amount').textContent = appState.currency;
}

// Settings
function initializeSettings() {
    // Notification blocking toggle
    const blockNotifications = document.getElementById('block-notifications');
    const contactsSection = document.getElementById('contacts-section');

    blockNotifications.addEventListener('change', (e) => {
        appState.settings.blockNotifications = e.target.checked;
        contactsSection.style.opacity = e.target.checked ? '1' : '0.5';
    });

    // Remove contact buttons
    document.querySelectorAll('.remove-contact').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const contactId = e.target.dataset.contact;
            removeContact(contactId);
        });
    });

    // Add contact button and modal
    const addContactBtn = document.getElementById('add-contact-btn');
    const modal = document.getElementById('add-contact-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelContact = document.getElementById('cancel-contact');
    const saveContact = document.getElementById('save-contact');

    addContactBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        clearContactForm();
    });

    cancelContact.addEventListener('click', () => {
        modal.classList.remove('active');
        clearContactForm();
    });

    saveContact.addEventListener('click', () => {
        const name = document.getElementById('contact-name').value;
        const phone = document.getElementById('contact-phone').value;

        if (name && phone) {
            addContact(name, phone);
            modal.classList.remove('active');
            clearContactForm();
            showNotification('Contact added successfully!');
        }
    });

    // Settings inputs
    document.getElementById('daily-goal').addEventListener('change', (e) => {
        appState.settings.dailyGoal = parseInt(e.target.value);
    });

    document.getElementById('weekly-goal').addEventListener('change', (e) => {
        appState.settings.weeklyGoal = parseInt(e.target.value);
    });

    document.getElementById('sound-effects').addEventListener('change', (e) => {
        appState.settings.soundEffects = e.target.checked;
    });

    document.getElementById('vibration').addEventListener('change', (e) => {
        appState.settings.vibration = e.target.checked;
    });

    document.getElementById('leaderboard-visible').addEventListener('change', (e) => {
        appState.settings.leaderboardVisible = e.target.checked;
    });
}

function removeContact(contactId) {
    const contactButton = document.querySelector(`[data-contact="${contactId}"]`);
    if (!contactButton) return; // Guard against missing element
    
    const contactItem = contactButton.closest('.contact-item');
    contactItem.style.opacity = '0';
    contactItem.style.transform = 'translateX(-20px)';

    setTimeout(() => {
        contactItem.remove();
        appState.contacts = appState.contacts.filter(c => c.id !== contactId);
        showNotification('Contact removed');
    }, 300);
}

function addContact(name, phone) {
    const contactId = `contact-${Date.now()}`;
    const newContact = { id: contactId, name, number: phone };

    appState.contacts.push(newContact);

    const contactList = document.querySelector('.contact-list');
    const contactItem = document.createElement('div');
    contactItem.className = 'contact-item';
    contactItem.style.opacity = '0';
    contactItem.style.transform = 'translateY(-10px)';
    contactItem.innerHTML = `
        <div class="contact-avatar">👤</div>
        <div class="contact-info">
            <div class="contact-name">${name}</div>
            <div class="contact-number">${phone}</div>
        </div>
        <button class="btn-icon remove-contact" data-contact="${contactId}">✕</button>
    `;

    contactList.appendChild(contactItem);

    // Animate in
    setTimeout(() => {
        contactItem.style.opacity = '1';
        contactItem.style.transform = 'translateY(0)';
    }, 10);

    // Add event listener
    contactItem.querySelector('.remove-contact').addEventListener('click', (e) => {
        removeContact(contactId);
    });
}

function clearContactForm() {
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-phone').value = '';
}

// Rewards
function initializeRewards() {
    const unlockButtons = document.querySelectorAll('.unlock-btn');

    unlockButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const price = parseInt(e.target.dataset.price);
            unlockCustomization(e.target, price);
        });
    });
}

function unlockCustomization(button, price) {
    if (appState.currency >= price) {
        appState.currency -= price;
        updateCurrencyDisplay();

        const card = button.closest('.customization-card');
        card.classList.add('owned');

        const customizationInfo = card.querySelector('.customization-info');
        customizationInfo.innerHTML = `
            <div class="customization-name">${card.querySelector('.customization-name').textContent}</div>
            <div class="customization-status owned-badge">Owned</div>
        `;

        button.remove();

        showNotification('Customization unlocked! 🎨');
    } else {
        showNotification('Not enough coins! 😢');
    }
}

// Leaderboard
function initializeLeaderboard() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            // In a real app, this would fetch different data
            showNotification(`Showing ${filter} leaderboard`);
        });
    });
}

// Notification System
function showNotification(message) {
    const toast = document.getElementById('notification-toast');
    const toastMessage = toast.querySelector('.toast-message');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Simulate background activity tracking (for demo purposes)
let activityCheckInterval = setInterval(() => {
    if (appState.isLocked) {
        // Simulate activity verification
        // In a real app, this would use actual sensors/GPS
        console.log('Activity verified:', appState.currentActivity);
    }
}, 5000);

// Clean up interval when page is hidden/closed
document.addEventListener('visibilitychange', () => {
    if (document.hidden && !appState.isLocked) {
        if (activityCheckInterval) {
            clearInterval(activityCheckInterval);
            activityCheckInterval = null;
        }
    } else if (!document.hidden && !activityCheckInterval) {
        activityCheckInterval = setInterval(() => {
            if (appState.isLocked) {
                console.log('Activity verified:', appState.currentActivity);
            }
        }, 5000);
    }
});

// Prevent accidental page close during exercise
window.addEventListener('beforeunload', (e) => {
    if (appState.isLocked) {
        e.preventDefault();
        e.returnValue = '';
        return 'You have an active exercise session. Are you sure you want to leave?';
    }
});

// Demo: Add some visual feedback on interactions
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (appState.settings.vibration && navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Visual feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
});

// Achievement unlock simulation (for demo)
function checkAchievements() {
    // This would be called after completing activities
    // For demo purposes, achievements are pre-set in HTML
}

// Stats update (for demo)
function updateStats() {
    // In a real app, this would update from stored data
    // Stats are currently static in HTML for demo
}

// Helper function to format time
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// Add some fun easter eggs
let tapCount = 0;
document.querySelector('.app-title').addEventListener('click', () => {
    tapCount++;
    if (tapCount >= 5) {
        appState.currency += 100;
        updateCurrencyDisplay();
        showNotification('🎉 Secret bonus! +100 coins!');
        tapCount = 0;
    }
});

// Goals Progress Functions
function initializeGoalsProgress() {
    updateGoalsProgress();
    updateDailyProgress();
}

function updateGoalsProgress() {
    const progressFill = document.getElementById('progress-fill');
    const milestones = document.querySelectorAll('.milestone');
    
    // Update progress bar based on elapsed time
    // Max progress bar is 30 minutes (1800 seconds)
    const maxTime = 1800;
    const progressPercentage = Math.min((appState.elapsedTime / maxTime) * 100, 100);
    
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }
    
    // Check and update milestones
    milestones.forEach(milestone => {
        const targetTime = parseInt(milestone.dataset.time);
        const reward = parseInt(milestone.dataset.reward);
        
        if (appState.elapsedTime >= targetTime) {
            if (!milestone.classList.contains('completed') && !appState.reachedMilestones.includes(targetTime)) {
                // Milestone reached!
                milestone.classList.add('reached');
                
                // Add bonus coins
                appState.currency += reward;
                updateCurrencyDisplay();
                
                // Mark as completed after animation
                setTimeout(() => {
                    milestone.classList.remove('reached');
                    milestone.classList.add('completed');
                    appState.reachedMilestones.push(targetTime);
                }, 500);
                
                // Show notification
                const minutes = targetTime / 60;
                showNotification(`🎯 Milestone reached! ${minutes} minutes completed. +${reward} coins!`);
            } else if (!milestone.classList.contains('completed')) {
                milestone.classList.add('completed');
            }
        }
    });
    
    updateDailyProgress();
}

function updateDailyProgress() {
    const dailyProgressSpan = document.getElementById('daily-progress');
    if (dailyProgressSpan) {
        const minutes = Math.floor(appState.dailyExerciseTime / 60);
        dailyProgressSpan.textContent = minutes;
    }
}

function resetGoalsProgress() {
    appState.reachedMilestones = [];
    const milestones = document.querySelectorAll('.milestone');
    milestones.forEach(milestone => {
        milestone.classList.remove('reached', 'completed');
    });
    
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
}

// Console greeting
console.log('%c🔒 ActiveLock Fitness App', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cStay active, stay motivated!', 'font-size: 14px; color: #8b5cf6;');
console.log('Tip: Click the ActiveLock title 5 times for a bonus! 😉');

// Theme Toggle Functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Set initial theme (default is dark based on CSS)
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggle) {
            themeToggle.checked = false; // Unchecked = light mode
        }
    } else {
        if (themeToggle) {
            themeToggle.checked = true; // Checked = dark mode
        }
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                // Dark mode
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                // Light mode
                document.body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

// Rest Timer Functionality
let restTimerState = {
    interval: null,
    currentSeconds: 60,
    totalSeconds: 60,
    isRunning: false
};

function initializeRestTimer() {
    const startBtn = document.getElementById('start-rest-timer');
    const pauseBtn = document.getElementById('pause-rest-timer');
    const resetBtn = document.getElementById('reset-rest-timer');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const setCustomBtn = document.getElementById('set-custom-rest-timer');
    
    if (startBtn) startBtn.addEventListener('click', startRestTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseRestTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetRestTimer);
    
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const seconds = parseInt(btn.dataset.seconds);
            setRestTimer(seconds);
            
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    if (setCustomBtn) {
        setCustomBtn.addEventListener('click', setCustomRestTimer);
    }
    
    updateRestTimerDisplay();
}

function setRestTimer(seconds) {
    restTimerState.totalSeconds = seconds;
    restTimerState.currentSeconds = seconds;
    updateRestTimerDisplay();
    
    if (restTimerState.isRunning) {
        pauseRestTimer();
    }
}

function setCustomRestTimer() {
    const minutes = parseInt(document.getElementById('custom-rest-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('custom-rest-seconds').value) || 0;
    const totalSeconds = minutes * 60 + seconds;
    
    if (totalSeconds > 0) {
        setRestTimer(totalSeconds);
    }
}

function startRestTimer() {
    if (!restTimerState.isRunning) {
        restTimerState.isRunning = true;
        
        restTimerState.interval = setInterval(() => {
            if (restTimerState.currentSeconds > 0) {
                restTimerState.currentSeconds--;
                updateRestTimerDisplay();
            } else {
                restTimerComplete();
            }
        }, 1000);
    }
}

function pauseRestTimer() {
    if (restTimerState.isRunning) {
        restTimerState.isRunning = false;
        clearInterval(restTimerState.interval);
    }
}

function resetRestTimer() {
    pauseRestTimer();
    restTimerState.currentSeconds = restTimerState.totalSeconds;
    updateRestTimerDisplay();
}

function restTimerComplete() {
    pauseRestTimer();
    
    const soundAlert = document.getElementById('rest-sound-alert');
    if (soundAlert && soundAlert.checked) {
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
            
            // Clean up AudioContext after use
            setTimeout(() => {
                audio.close();
            }, 600);
        } catch (error) {
            console.warn('Unable to play sound alert:', error);
        }
    }
    
    const timerValue = document.getElementById('rest-timer-value');
    if (timerValue) {
        timerValue.textContent = 'Done!';
        
        setTimeout(() => {
            const autoStart = document.getElementById('rest-auto-start');
            if (autoStart && autoStart.checked) {
                resetRestTimer();
                startRestTimer();
            } else {
                resetRestTimer();
            }
        }, 2000);
    }
}

function updateRestTimerDisplay() {
    const minutes = Math.floor(restTimerState.currentSeconds / 60);
    const seconds = restTimerState.currentSeconds % 60;
    
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const timerValue = document.getElementById('rest-timer-value');
    
    if (timerValue) {
        timerValue.textContent = display;
    }
}

// Routes Filtering
function initializeRoutesFilter() {
    const filterBtns = document.querySelectorAll('.route-filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterRoutes(filter);
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function filterRoutes(filter) {
    const routes = document.querySelectorAll('.route-card');
    
    routes.forEach(card => {
        if (filter === 'all') {
            card.classList.remove('hidden');
        } else {
            const routeType = card.dataset.routeType;
            if (routeType === filter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        }
    });
}

// Profile Customization
function initializeProfileCustomization() {
    const avatarPicker = document.querySelectorAll('.avatar-picker-btn');
    const activityPicker = document.querySelectorAll('.activity-picker-btn');
    const profileAvatarDisplay = document.getElementById('profile-avatar-display');
    const usernameInput = document.getElementById('profile-username-input');
    const saveUsernameBtn = document.getElementById('save-username-btn');
    const profileUsername = document.getElementById('profile-username');
    const fitnessGoalSelect = document.getElementById('fitness-goal-select');
    
    // Load saved profile data
    const savedAvatar = localStorage.getItem('profileAvatar') || '😊';
    const savedUsername = localStorage.getItem('profileUsername') || 'Fitness Enthusiast';
    const savedActivity = localStorage.getItem('favoriteActivity') || 'running';
    const savedGoal = localStorage.getItem('fitnessGoal') || 'general';
    
    // Set initial values
    if (profileAvatarDisplay) {
        profileAvatarDisplay.textContent = savedAvatar;
    }
    if (usernameInput) {
        usernameInput.value = savedUsername;
    }
    if (profileUsername) {
        profileUsername.textContent = savedUsername;
    }
    if (fitnessGoalSelect) {
        fitnessGoalSelect.value = savedGoal;
    }
    
    // Set active states
    avatarPicker.forEach(btn => {
        if (btn.dataset.avatar === savedAvatar) {
            btn.classList.add('active');
        }
    });
    
    activityPicker.forEach(btn => {
        if (btn.dataset.activity === savedActivity) {
            btn.classList.add('active');
        }
    });
    
    // Avatar picker
    avatarPicker.forEach(btn => {
        btn.addEventListener('click', () => {
            const avatar = btn.dataset.avatar;
            
            avatarPicker.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (profileAvatarDisplay) {
                profileAvatarDisplay.textContent = avatar;
            }
            
            localStorage.setItem('profileAvatar', avatar);
            showNotification('Avatar updated!');
        });
    });
    
    // Activity picker
    activityPicker.forEach(btn => {
        btn.addEventListener('click', () => {
            activityPicker.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            localStorage.setItem('favoriteActivity', btn.dataset.activity);
            showNotification('Favorite activity updated!');
        });
    });
    
    // Save username
    if (saveUsernameBtn) {
        saveUsernameBtn.addEventListener('click', () => {
            const newUsername = usernameInput.value.trim();
            if (newUsername && newUsername.length > 0) {
                if (profileUsername) {
                    profileUsername.textContent = newUsername;
                }
                localStorage.setItem('profileUsername', newUsername);
                showNotification('Username saved!');
            }
        });
    }
    
    // Fitness goal select
    if (fitnessGoalSelect) {
        fitnessGoalSelect.addEventListener('change', () => {
            localStorage.setItem('fitnessGoal', fitnessGoalSelect.value);
            showNotification('Fitness goal updated!');
        });
    }
}

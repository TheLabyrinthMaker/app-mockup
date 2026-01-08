// App State
let appState = {
    currency: 1250,
    isLocked: false,
    timerInterval: null,
    elapsedTime: 0,
    currentActivity: 'running',
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

    // Reset timer display
    setTimeout(() => {
        updateTimerDisplay(0);
    }, 2000);
}

function startTimer() {
    appState.timerInterval = setInterval(() => {
        appState.elapsedTime++;
        updateTimerDisplay(appState.elapsedTime);
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

// Console greeting
console.log('%c🔒 ActiveLock Fitness App', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cStay active, stay motivated!', 'font-size: 14px; color: #8b5cf6;');
console.log('Tip: Click the ActiveLock title 5 times for a bonus! 😉');

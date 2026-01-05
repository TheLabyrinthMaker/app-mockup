// Screen Management
const screens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('.nav-btn');

// Switch between screens
function switchScreen(screenId) {
    // Hide all screens
    screens.forEach(screen => screen.classList.remove('active'));
    
    // Show selected screen
    const targetScreen = document.getElementById(screenId + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Update navigation
    navButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-screen="${screenId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Add click listeners to navigation buttons
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const screen = btn.getAttribute('data-screen');
        switchScreen(screen);
    });
});

// Activity Tracker
let isSessionActive = false;
let sessionSeconds = 0;
let sessionInterval = null;
let selectedActivity = 'walking';

const startStopBtn = document.getElementById('start-stop-btn');
const sessionTimer = document.getElementById('session-timer');
const sessionStatus = document.getElementById('session-status');

// Activity type selection
const activityTypeBtns = document.querySelectorAll('.activity-type-btn');

activityTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!isSessionActive) {
            activityTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedActivity = btn.getAttribute('data-activity');
        }
    });
});

// Format time as HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Start/Stop session
startStopBtn.addEventListener('click', () => {
    if (!isSessionActive) {
        // Start session
        isSessionActive = true;
        sessionSeconds = 0;
        startStopBtn.textContent = 'Stop Session';
        startStopBtn.classList.add('active');
        sessionStatus.textContent = 'Session in progress...';
        sessionTimer.classList.add('running');
        
        // Disable activity type selection
        activityTypeBtns.forEach(btn => btn.style.opacity = '0.5');
        
        sessionInterval = setInterval(() => {
            sessionSeconds++;
            sessionTimer.textContent = formatTime(sessionSeconds);
        }, 1000);
    } else {
        // Stop session
        isSessionActive = false;
        clearInterval(sessionInterval);
        startStopBtn.textContent = 'Start Session';
        startStopBtn.classList.remove('active');
        sessionTimer.classList.remove('running');
        
        // Calculate points (1 point per minute)
        const pointsEarned = Math.floor(sessionSeconds / 60);
        const minutes = Math.floor(sessionSeconds / 60);
        
        sessionStatus.textContent = `Session completed! ${minutes} minutes • ${pointsEarned} points earned`;
        
        // Enable activity type selection
        activityTypeBtns.forEach(btn => btn.style.opacity = '1');
        
        // Add to recent activities (prepend to list)
        addRecentActivity(selectedActivity, minutes, pointsEarned);
        
        // Update stats on home screen
        updateHomeStats(minutes, pointsEarned);
        
        // Reset timer after 3 seconds
        setTimeout(() => {
            sessionSeconds = 0;
            sessionTimer.textContent = '00:00:00';
            sessionStatus.textContent = 'Ready to start';
        }, 3000);
    }
});

// Add activity to recent activities list
function addRecentActivity(activityType, minutes, points) {
    const activityList = document.querySelector('.activity-list');
    const activityIcons = {
        walking: '🚶',
        running: '🏃',
        hiking: '🥾',
        cycling: '🚴'
    };
    
    const activityNames = {
        walking: 'Walking Session',
        running: 'Running Session',
        hiking: 'Hiking Session',
        cycling: 'Cycling Session'
    };
    
    const newActivity = document.createElement('div');
    newActivity.className = 'activity-item';
    newActivity.innerHTML = `
        <div class="activity-info">
            <span class="activity-icon">${activityIcons[activityType]}</span>
            <div>
                <strong>${activityNames[activityType]}</strong>
                <p>${minutes} minutes • ${points} points</p>
            </div>
        </div>
        <span class="activity-time">Just now</span>
    `;
    
    // Insert at the beginning
    activityList.insertBefore(newActivity, activityList.firstChild);
}

// Update home screen stats
function updateHomeStats(minutes, points) {
    const outdoorTimeValue = document.getElementById('outdoor-time-value');
    const pointsValue = document.getElementById('points-value');
    
    // Parse current values
    const currentOutdoorTime = outdoorTimeValue.textContent;
    const currentHours = parseInt(currentOutdoorTime.split('h')[0]) || 0;
    const currentMinutes = parseInt(currentOutdoorTime.split('h')[1]?.trim().split('m')[0]) || 0;
    
    const totalMinutes = currentHours * 60 + currentMinutes + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    
    outdoorTimeValue.textContent = `${newHours}h ${newMinutes}m`;
    
    // Update points
    const currentPoints = parseInt(pointsValue.textContent) || 0;
    const newPoints = currentPoints + points;
    pointsValue.textContent = newPoints;
    
    // Update points balance on rewards screen
    const balanceValue = document.querySelector('.balance-value');
    if (balanceValue) {
        balanceValue.textContent = newPoints;
    }
    
    // Update progress bars
    updateProgressBars(totalMinutes);
}

// Update progress bars
function updateProgressBars(totalOutdoorMinutes) {
    const goalItems = document.querySelectorAll('.goal-item');
    
    // Update outdoor activity progress (goal: 90 minutes)
    const outdoorProgress = Math.min((totalOutdoorMinutes / 90) * 100, 100);
    const outdoorProgressBar = goalItems[0]?.querySelector('.progress-fill');
    const outdoorPercentage = goalItems[0]?.querySelector('.goal-percentage');
    
    if (outdoorProgressBar) {
        outdoorProgressBar.style.width = `${outdoorProgress}%`;
    }
    if (outdoorPercentage) {
        outdoorPercentage.textContent = `${Math.round(outdoorProgress)}%`;
    }
}

// Leaderboard period switching
const periodBtns = document.querySelectorAll('.period-btn');

periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        periodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // In a real app, this would fetch different data
    });
});

// Rewards redemption
const rewardBtns = document.querySelectorAll('.btn-reward');

rewardBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        if (!this.disabled) {
            const rewardItem = this.closest('.reward-item');
            const rewardName = rewardItem.querySelector('strong').textContent;
            const cost = parseInt(this.querySelector('.reward-cost').textContent);
            
            const balanceValue = document.querySelector('.balance-value');
            const currentPoints = parseInt(balanceValue.textContent) || 0;
            
            if (currentPoints >= cost) {
                // Deduct points
                const newBalance = currentPoints - cost;
                balanceValue.textContent = newBalance;
                
                // Update home screen points
                const pointsValue = document.getElementById('points-value');
                if (pointsValue) {
                    pointsValue.textContent = newBalance;
                }
                
                // Show success message
                alert(`🎉 Success! You've redeemed: ${rewardName}`);
                
                // Update reward availability
                updateRewardAvailability(newBalance);
            } else {
                alert(`❌ Not enough points! You need ${cost - currentPoints} more points.`);
            }
        }
    });
});

// Update reward button availability based on points
function updateRewardAvailability(currentPoints) {
    const rewardItems = document.querySelectorAll('.reward-item');
    
    rewardItems.forEach(item => {
        const btn = item.querySelector('.btn-reward');
        const cost = parseInt(btn.querySelector('.reward-cost').textContent);
        
        if (currentPoints < cost) {
            item.classList.add('disabled');
            btn.disabled = true;
        } else {
            item.classList.remove('disabled');
            btn.disabled = false;
        }
    });
}

// Initialize reward availability on page load
document.addEventListener('DOMContentLoaded', () => {
    const balanceValue = document.querySelector('.balance-value');
    if (balanceValue) {
        const currentPoints = parseInt(balanceValue.textContent) || 0;
        updateRewardAvailability(currentPoints);
    }
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Simulate dynamic stats updates (for demo purposes)
function simulateStatsUpdate() {
    // This would normally come from a backend API
    // For demo, we just ensure the initial state is set
    const balanceValue = document.querySelector('.balance-value');
    const pointsValue = document.getElementById('points-value');
    
    if (balanceValue && pointsValue) {
        const initialPoints = parseInt(pointsValue.textContent) || 450;
        balanceValue.textContent = initialPoints;
        updateRewardAvailability(initialPoints);
    }
}

// Initialize app
simulateStatsUpdate();

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '4') {
        const screens = ['home', 'activity', 'leaderboard', 'rewards'];
        const index = parseInt(e.key) - 1;
        if (screens[index]) {
            switchScreen(screens[index]);
        }
    }
});

// Touch gestures for screen switching (basic swipe detection)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        const screens = ['home', 'activity', 'leaderboard', 'rewards'];
        const currentScreen = document.querySelector('.screen.active')?.id.replace('-screen', '');
        const currentIndex = screens.indexOf(currentScreen);
        
        if (diff > 0 && currentIndex < screens.length - 1) {
            // Swipe left - go to next screen
            switchScreen(screens[currentIndex + 1]);
        } else if (diff < 0 && currentIndex > 0) {
            // Swipe right - go to previous screen
            switchScreen(screens[currentIndex - 1]);
        }
    }
}

console.log('🌳 OutdoorLife App Loaded Successfully!');
console.log('💡 Tip: Use keyboard shortcuts 1-4 to switch between screens');
console.log('📱 Tip: Swipe left/right on mobile to navigate between screens');

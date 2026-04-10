/* ============================================
   NASA SONIC BOOM MISSION - JAVASCRIPT
   All interactive functionality and game logic
   ============================================ */

// ===== PAGE TRACKING & CSV EXPORT =====
function initPageTracking() {
    const currentPage = document.title || 'Dashboard';
    const pageEntry = {
        page: currentPage,
        visitTime: new Date().toISOString(),
        sessionId: getOrCreateSessionId()
    };
    
    // Store page visit
    let pageVisits = JSON.parse(localStorage.getItem('pageVisits') || '[]');
    pageVisits.push(pageEntry);
    localStorage.setItem('pageVisits', JSON.stringify(pageVisits));
    
    // Track time on page
    window.pageStartTime = Date.now();
}

function getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

function recordPageExit() {
    if (window.pageStartTime) {
        const timeSpent = Math.round((Date.now() - window.pageStartTime) / 1000);
        const currentPage = document.title || 'Dashboard';
        const sessionId = sessionStorage.getItem('sessionId');
        
        let pageMetrics = JSON.parse(localStorage.getItem('pageMetrics') || '[]');
        pageMetrics.push({
            page: currentPage,
            timeSpent: timeSpent,
            exitTime: new Date().toISOString(),
            sessionId: sessionId
        });
        localStorage.setItem('pageMetrics', JSON.stringify(pageMetrics));
    }
}

function exportToCSV() {
    const progress = getProgress();
    const pageMetrics = JSON.parse(localStorage.getItem('pageMetrics') || '[]');
    const pageVisits = JSON.parse(localStorage.getItem('pageVisits') || '[]');
    const sessionId = getOrCreateSessionId();
    
    let csvContent = 'Session Report\\n\\n';
    csvContent += 'SESSION ID,' + sessionId + '\\n';
    csvContent += 'EXPORT DATE,' + new Date().toISOString() + '\\n\\n';
    
    csvContent += 'MISSION PROGRESS\\n';
    csvContent += 'Mission,Completed,Score\\n';
    Object.entries(progress.missionScores).forEach(([mission, data]) => {
        csvContent += mission + ',' + (data.completed ? 'Yes' : 'No') + ',' + (data.score || 0) + '\\n';
    });
    
    csvContent += '\\nPAGE METRICS\\n';
    csvContent += 'Page,Time Spent (seconds),Visit Time,Exit Time\\n';
    pageMetrics.forEach(metric => {
        csvContent += metric.page + ',' + metric.timeSpent + ',' + new Date(metric.visitTime || metric.exitTime).toLocaleString() + ',' + new Date(metric.exitTime).toLocaleString() + '\\n';
    });
    
    csvContent += '\\nPAGE VISITS\\n';
    csvContent += 'Page,Visit Time\\n';
    pageVisits.forEach(visit => {
        csvContent += visit.page + ',' + new Date(visit.visitTime).toLocaleString() + '\\n';
    });
    
    return csvContent;
}

// Download CSV file
function downloadProgressCSV() {
    const csvContent = exportToCSV();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', 'nasa-sonic-boom-progress-' + Date.now() + '.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    console.log('✅ CSV exported successfully!');
}

// Make function available in console
window.downloadProgressCSV = downloadProgressCSV;
window.exportToCSV = exportToCSV;

// ===== STARFIELD ANIMATION =====
function createStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;
    
    const starCount = 200;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Random size (1-3px)
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        // Random animation delay
        star.style.animationDelay = Math.random() * 3 + 's';
        
        starfield.appendChild(star);
    }
}

// ===== LANDING PAGE WAVE ANIMATION =====
function initWaveAnimation() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let time = 0;
    
    function drawWaves() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw multiple wave layers
        for (let layer = 0; layer < 3; layer++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 - layer * 0.03})`;
            ctx.lineWidth = 2;
            
            const amplitude = 30 + layer * 10;
            const frequency = 0.01 - layer * 0.002;
            const offset = layer * Math.PI / 3;
            
            for (let x = 0; x < canvas.width; x++) {
                const y = canvas.height / 2 + 
                         amplitude * Math.sin(x * frequency + time + offset);
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        
        time += 0.02;
        requestAnimationFrame(drawWaves);
    }
    
    drawWaves();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ===== LOCAL STORAGE - PROGRESS MANAGEMENT =====

// Initialize progress structure
function initializeProgress() {
    if (!localStorage.getItem('nasaSonicBoomProgress')) {
        const initialProgress = {
            completedMissions: [],
            missionScores: {
                lesson1: { completed: false, score: 0 },
                lesson2: { completed: false, score: 0 },
                lesson3: { completed: false, score: 0 },
                lesson4: { completed: false, score: 0 },
                lesson6: { completed: false, score: 0 }
            },
            startTime: Date.now()
        };
        localStorage.setItem('nasaSonicBoomProgress', JSON.stringify(initialProgress));
    }
}

// Get current progress
function getProgress() {
    initializeProgress();
    return JSON.parse(localStorage.getItem('nasaSonicBoomProgress'));
}

// Save mission progress
function saveProgress(missionId, completed, score = 0) {
    const progress = getProgress();
    
    // Update mission data
    if (!progress.missionScores[missionId]) {
        progress.missionScores[missionId] = { completed: false, score: 0 };
    }
    
    if (!progress.missionScores[missionId].completed && completed) {
        progress.missionScores[missionId].completed = true;
        progress.missionScores[missionId].score = score;
        
        // Add to completed missions
        if (!progress.completedMissions.includes(missionId)) {
            progress.completedMissions.push(missionId);
        }
    }
    
    localStorage.setItem('nasaSonicBoomProgress', JSON.stringify(progress));
    console.log('Progress saved:', progress);
}

// Calculate rank info
function getRankInfo(xp) {
    if (xp >= 120) {
        return {
            title: 'Sound Master',
            icon: '🎖️',
            subtitle: 'You know everything about sound!',
            nextRank: null,
            xpToNext: 0,
            progress: 100
        };
    } else if (xp >= 60) {
        return {
            title: 'Sound Scientist',
            icon: '🔬',
            subtitle: 'You are learning so much!',
            nextRank: 'Sound Master',
            xpToNext: 120 - xp,
            progress: ((xp - 60) / 60) * 100
        };
    } else {
        return {
            title: 'Sound Explorer',
            icon: '⭐',
            subtitle: 'Keep exploring!',
            nextRank: 'Sound Scientist',
            xpToNext: 60 - xp,
            progress: (xp / 60) * 100
        };
    }
}

// ===== DASHBOARD FUNCTIONALITY =====

function updateDashboard() {
    const progress = getProgress();
    
    // Update stats
    const missionsCompleted = document.getElementById('missionsCompleted');
    const totalGames = document.getElementById('totalGames');
    const accuracy = document.getElementById('accuracy');
    
    if (missionsCompleted) {
        missionsCompleted.textContent = progress.completedMissions.length;
    }
    
    if (totalGames) {
        let gameCount = 0;
        Object.keys(progress.missionScores).forEach(key => {
            if (progress.missionScores[key] && progress.missionScores[key].completed) {
                gameCount++;
            }
        });
        totalGames.textContent = gameCount;
    }
    
    if (accuracy) {
        // Calculate average score only from completed missions
        let totalScore = 0;
        let completedCount = 0;
        const quizLessons = ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson6'];
        quizLessons.forEach(lesson => {
            if (progress.missionScores[lesson] && progress.missionScores[lesson].completed) {
                totalScore += progress.missionScores[lesson].score || 0;
                completedCount++;
            }
        });
        const accuracyPercent = completedCount > 0 ? Math.round((totalScore / (completedCount * 3)) * 100) : 0;
        accuracy.textContent = `${accuracyPercent}%`;
    }
    
    // Update BOOM display
    updateBoomDisplay(progress);
}

function updateBoomDisplay(progress) {
    const boomLetters = ['B', 'O', 'O', 'M'];
    const lessonMapping = ['lesson1', 'lesson2', 'lesson3', 'lesson4'];
    
    boomLetters.forEach((letter, index) => {
        const letterElement = document.getElementById(`boomLetter${index + 1}`);
        const lessonId = lessonMapping[index];
        
        if (letterElement) {
            if (progress.missionScores[lessonId] && progress.missionScores[lessonId].completed) {
                letterElement.textContent = letter;
                letterElement.classList.add('revealed');
            } else {
                letterElement.textContent = '?';
                letterElement.classList.remove('revealed');
            }
        }
    });
}

function updateBoomButton(boomComplete) {
    const boomButton = document.getElementById('boomButton');
    const boomSubtitle = document.getElementById('boomSubtitle');
    
    if (!boomButton) return;
    
    if (boomComplete) {
        boomButton.onclick = function() { window.location.href = 'lesson8.html'; return false; };
        boomButton.style.cursor = 'pointer';
        boomButton.style.opacity = '1';
        boomButton.style.filter = 'drop-shadow(0 0 10px #00ff88)';
        boomSubtitle.textContent = '✓ BOOM Complete! Click to start the Paper Airplane Challenge!';
        boomSubtitle.style.color = '#00ff88';
    } else {
        boomButton.onclick = function(e) { if (e) e.preventDefault(); return false; };
        boomButton.style.cursor = 'not-allowed';
        boomButton.style.opacity = '0.6';
        boomButton.style.filter = 'none';
        boomSubtitle.textContent = 'Complete Missions 1-4 to spell BOOM and unlock the final challenge!';
        boomSubtitle.style.color = 'inherit';
    }
}

function updateMissionStatuses() {
    const progress = getProgress();
    const missions = {
        1: 'lesson1',
        2: 'lesson2',
        3: 'lesson3',
        4: 'lesson4'
    };
    
    // Check if BOOM is complete (lessons 1-4 completed)
    const boomComplete = ['lesson1', 'lesson2', 'lesson3', 'lesson4'].every(lesson => 
        progress.missionScores[lesson] && progress.missionScores[lesson].completed
    );
    
    // Update BOOM button
    updateBoomButton(boomComplete);
    
    Object.keys(missions).forEach(missionNum => {
        const missionId = missions[missionNum];
        const statusBadge = document.querySelector(`#status${missionNum} .status-badge`);
        const launchBtn = document.getElementById(`launch${missionNum}`);
        const missionCard = document.querySelector(`[data-mission="${missionNum}"]`);
        
        if (!statusBadge) return;
        
        if (missionNum === '1') {
            if (progress.missionScores[missionId] && progress.missionScores[missionId].completed) {
                statusBadge.textContent = '✓ DONE';
                statusBadge.classList.remove('locked');
                statusBadge.classList.add('completed');
            } else {
                statusBadge.textContent = 'START HERE!';
                statusBadge.classList.remove('locked');
            }
            if (missionCard) missionCard.classList.remove('locked-card');
            return;
        }
        
        
        const prevMissionNum = String(Number(missionNum) - 1);
        const prevMissionId = missions[prevMissionNum];
        const prevCompleted = progress.missionScores[prevMissionId] && progress.missionScores[prevMissionId].completed;
        
        if (prevCompleted) {
            if (progress.missionScores[missionId] && progress.missionScores[missionId].completed) {
                statusBadge.textContent = '✓ DONE';
                statusBadge.classList.remove('locked');
                statusBadge.classList.add('completed');
            } else {
                statusBadge.textContent = 'READY!';
                statusBadge.classList.remove('locked');
            }
            
            if (missionCard) missionCard.classList.remove('locked-card');
            
            if (launchBtn) {
                launchBtn.classList.remove('locked');
                launchBtn.href = `lesson${missionNum}.html`;
                const btnText = launchBtn.querySelector('span:first-child');
                const btnArrow = launchBtn.querySelector('.launch-arrow');
                if (btnText) btnText.textContent = 'START MISSION';
                if (btnArrow) btnArrow.textContent = '→';
            }
        } else {
            statusBadge.textContent = '🔒 LOCKED';
            statusBadge.classList.add('locked');
            statusBadge.classList.remove('completed');
            
            if (missionCard) missionCard.classList.add('locked-card');
            
            if (launchBtn) {
                launchBtn.classList.add('locked');
                launchBtn.href = '#';
                const btnText = launchBtn.querySelector('span:first-child');
                const btnArrow = launchBtn.querySelector('.launch-arrow');
                if (btnText) btnText.textContent = 'LOCKED';
                if (btnArrow) btnArrow.textContent = '🔒';
            }
        }
    });
}

// Mission clock
function startMissionClock() {
    const clockElement = document.getElementById('missionTime');
    if (!clockElement) return;
    
    const progress = getProgress();
    const startTime = progress.startTime;
    
    function updateClock() {
        const now = Date.now();
        const elapsed = now - startTime;
        
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        const formatted = 
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
        
        clockElement.textContent = formatted;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// Display current progress in lesson pages
function displayCurrentXP() {
    const currentXPElement = document.getElementById('currentXP');
    if (!currentXPElement) return;
    
    const progress = getProgress();
    currentXPElement.textContent = progress.completedMissions.length + ' ✓';
}

// ===== RESET PROGRESS =====
function resetProgress() {
    localStorage.removeItem('nasaSonicBoomProgress');
    window.location.reload();
}

// Add reset button to console
console.log('%c NASA SONIC BOOM MISSION ', 'background: #00ffff; color: #0a0a1a; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('To reset progress, type: resetProgress()');
console.log('To export CSV data, type: downloadProgressCSV()');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeProgress();
    initPageTracking();
});

// Track page exit
window.addEventListener('beforeunload', () => {
    recordPageExit();
});

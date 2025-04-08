const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const modeButtons = document.querySelectorAll('.mode-button');

document.addEventListener('DOMContentLoaded', () => {
  updateTimerDisplayFromState();
});

let lastDisplay = { minutes: null, seconds: null, mode: null, isRunning: null };

function updateTimerDisplayFromState() {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
    const { remainingTime, currentMode, isRunning } = response;
    const minutes = String(Math.floor(remainingTime / 60)).padStart(2, '0');
    const seconds = String(remainingTime % 60).padStart(2, '0');

    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
    document.body.className = currentMode; 
    updateActiveModeButton(currentMode);
    startBtn.textContent = isRunning ? 'Pause' : 'Start';
    document.getElementById('pomodoro-count').textContent = response.sessionCount;
  });
}


// Start or Pause
startBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'START_OR_PAUSE_TIMER' });
});

// Reset timer
resetBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
  startBtn.textContent = 'Start'; // optional UI feedback
});

//  Switch modes
modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const mode = button.id === 'short-break' ? 'shortBreak' :
                 button.id === 'long-break' ? 'longBreak' :
                 'pomodoro';

    chrome.runtime.sendMessage({ type: 'SWITCH_MODE', mode });
  });
});

//  Highlight active mode
function updateActiveModeButton(mode) {
  modeButtons.forEach(button => button.classList.remove('active'));
  const modeId = mode === 'shortBreak' ? 'short-break' :
                 mode === 'longBreak' ? 'long-break' :
                 'pomodoro';
  document.getElementById(modeId).classList.add('active');
}

//  Auto-update timer every second
setInterval(updateTimerDisplayFromState, 1000);



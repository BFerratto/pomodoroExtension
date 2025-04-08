let timer = null;
let isRunning = false;
let paused = false;

let currentMode = 'pomodoro';
let sessionCount = 0;
let remainingTime = 25 * 60;

const timerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

function updateStorage() {
  chrome.storage.local.set({
    remainingTime,
    currentMode,
    sessionCount,
    isRunning,
    paused,
  });
}

function notifySessionEnd(nextMode) {
  console.log(`🔔 Notifying for next mode: ${nextMode}`); 
  const messages = {
    shortBreak: "Pomodoro complete! Time for a short break.",
    longBreak: "Nice work! Time for a long break.",
    pomodoro: "Break over! Ready for another Pomodoro?"
  };

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Timer Finished ⏰",
    message: messages[nextMode] || "Session complete.",
    priority: 1
  });
}


function startBackgroundTimer() {
  if (isRunning) return;
  isRunning = true;
  paused = false;
  updateStorage();

  timer = setInterval(() => {
    remainingTime--;
    updateStorage();

    if (remainingTime <= 0) {
      clearInterval(timer);
      isRunning = false;

      // Decide next mode
      let nextMode;
      if (currentMode === 'pomodoro') {
        sessionCount++;
        chrome.storage.local.set({ sessionCount });
        nextMode = (sessionCount % timerSettings.longBreakInterval === 0)
          ? 'longBreak'
          : 'shortBreak';
      } else {
        nextMode = 'pomodoro';
      }

      notifySessionEnd(nextMode);

      currentMode = nextMode;
      remainingTime = timerSettings[currentMode] * 60;
      updateStorage();

    }
  }, 1000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_OR_PAUSE_TIMER') {
    if (isRunning) {
      clearInterval(timer);
      isRunning = false;
      paused = true;
    } else {
      startBackgroundTimer();
    }
    updateStorage();
  }

  if (message.type === 'RESET_TIMER') {
    clearInterval(timer);
    isRunning = false;
    paused = false;
    sessionCount = 0;
    remainingTime = timerSettings[currentMode] * 60;
    updateStorage();
  }

  if (message.type === 'SWITCH_MODE') {
    clearInterval(timer);
    isRunning = false;
    paused = false;
    currentMode = message.mode;
    remainingTime = timerSettings[message.mode] * 60;
    updateStorage();
  }

  if (message.type === 'GET_STATE') {
    sendResponse({
      remainingTime,
      currentMode,
      sessionCount,
      isRunning,
      paused,
    });
  }
});


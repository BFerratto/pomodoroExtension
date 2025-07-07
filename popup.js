import { setState, state } from "./state.js";
import {
  GET_STATE,
  TOOGLE_TIMER,
  AUTOMATIC_CHANGED,
  RESET_TIMER,
  SWITCH_MODE,
  MODES,
  TIMER_STARTED,
  TIMER_STOPPED,
  TIMER_PAUSED,
} from "./types.js";

const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const automaticCheckbox = document.getElementById("isAutomatic");
const modeButtons = document.querySelectorAll(".mode-button");

function onOpen() {
  chrome.runtime.sendMessage({ type: GET_STATE }, (serialized) => {
    setState(serialized);
    updateUIFromState();
    if (state.current.isRunning()) {
      onTimerStart();
    }
  });
}

function onTimerStart() {
  if (state.current.intervalId) {
    clearInterval(state.current.intervalId);
  }
  state.current.intervalId = setInterval(updateTimerDisplayFromState, 1000);
}
function onTimerStop() {
  clearInterval(state.current.intervalId);
  state.current.intervalId = undefined;
  updateUIFromState();
}

const onTimerPause = onTimerStop;

function updateTimerDisplayFromState() {
  const remainingTime = state.current.getRemainingTime();
  console.log(
    `Updating timer display: remainingTime = ${remainingTime}`,
    state.current.serialize()
  );

  const minutes = String(Math.floor(remainingTime / 60)).padStart(2, "0");
  const seconds = String(remainingTime % 60).padStart(2, "0");

  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
}
function updateUIFromState() {
  const classMap = {
    [MODES.WORK]: "pomodoro",
    [MODES.SHORT_BREAK]: "shortBreak",
    [MODES.LONG_BREAK]: "longBreak",
  };
  const { mode } = state.current;
  document.body.className = classMap[mode];
  updateActiveModeButton(mode);
  console.log(`current state: `, state.current);
  startBtn.textContent = state.current.isRunning() ? "Pause" : "Start";
  document.getElementById("pomodoro-count").textContent =
    state.current.cycleCount;
}

// Start or Pause
startBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: TOOGLE_TIMER });
  onTimerStart();
});

automaticCheckbox.addEventListener("change", (e) => {
  const isAutomatic = e.target.checked;
  chrome.runtime.sendMessage({ type: AUTOMATIC_CHANGED, isAutomatic });
});

// Reset timer
resetBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: RESET_TIMER });
  startBtn.textContent = "Start"; // optional UI feedback
});

//  Switch modes
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode =
      button.id === "short-break"
        ? "shortBreak"
        : button.id === "long-break"
        ? "longBreak"
        : "pomodoro";

    chrome.runtime.sendMessage({ type: SWITCH_MODE, mode });
  });
});

//  Highlight active mode
function updateActiveModeButton(mode) {
  modeButtons.forEach((button) => button.classList.remove("active"));
  const idMap = {
    [MODES.SHORT_BREAK]: "short-break",
    [MODES.LONG_BREAK]: "long-break",
    [MODES.WORK]: "pomodoro",
  };
  const modeId = idMap[mode];
  document.getElementById(modeId).classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  onOpen();
});
document.addEventListener("unload", () => {
  console.log(`I am closeddddd `, new Date().getTime());
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case TIMER_STARTED: {
      setState(message.state);
      updateUIFromState();
      onTimerStart();
      break;
    }
    case TIMER_STOPPED: {
      setState(message.state);
      onTimerStop();
      break;
    }
    case TIMER_PAUSED: {
      setState(message.state);
      onTimerPause();
      break;
    }
  }
});

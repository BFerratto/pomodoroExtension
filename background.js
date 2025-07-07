import { resetState, state } from "./state.js";
import {
  AUTOMATIC_CHANGED,
  GET_STATE,
  RESET_TIMER,
  TOOGLE_TIMER,
  SWITCH_MODE,
  messages,
  TIMER_STARTED,
  TIMER_STOPPED,
  TIMER_PAUSED,
  colors,
} from "./types.js";

function updateStorage() {
  chrome.storage.local.set(state.current.serialize());
}

function notifySessionEnd(nextMode) {
  console.log(`🔔 Notifying for next mode: ${nextMode}`);
  chrome.runtime
    .sendMessage({
      type: TIMER_STOPPED,
      state: state.current.serialize(),
    })
    .catch(() => {});
  try {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "./icons/icon128.png",
      title: "Timer Finished ⏰",
      message: messages[nextMode] || "Session complete.",
      priority: 1,
    });
  } catch (err) {
    console.error(err);
  }
  updateStorage();
}

function updateBadge() {
  const { mode } = state.current;
  const remainingTime = state.current.getRemainingTime();
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  const text = minutes
    ? ` ${String(minutes).padStart(2, "0")} m`
    : `${String(seconds).padStart(2, "0")}s`;
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeTextColor({ color: colors[mode] });
}
function startBackgroundTimer() {
  if (state.current.isRunning()) return;
  state.current.start();
  updateStorage();

  state.current.intervalId = setInterval(() => {
    updateBadge();
  }, 1000);

  state.current.timeoutId = setTimeout(() => {
    clearInterval(state.current.intervalId);
    clearTimeout(state.current.timeoutId);
    chrome.action.setBadgeText({ text: `` });
    const nextMode = state.current.onEnd();

    /**
     * @todo blink icon
     */
    // chrome.action.setIcon({
    //   path: {
    //     16: "./icons/16.png",
    //     32: "./icons/16.png",
    //     128: "./icons/128.png",
    //   },
    // });
    notifySessionEnd(nextMode);
    if (state.current.isAutomatic) {
      startBackgroundTimer();
    }
  }, state.current.getRemainingTime() * 1000);
  chrome.runtime
    .sendMessage({
      type: TIMER_STARTED,
      state: state.current.serialize(),
    })
    .catch(() => {});
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case TOOGLE_TIMER: {
      if (state.current.isRunning()) {
        clearInterval(state.current.intervalId);
        clearTimeout(state.current.timeoutId);
        state.current.pause();
        chrome.runtime
          .sendMessage({
            type: TIMER_PAUSED,
            state: state.current.serialize(),
          })
          .catch(() => {});
      } else {
        startBackgroundTimer();
      }
      updateStorage();
      break;
    }
    case RESET_TIMER: {
      clearInterval(state.current.intervalId);
      clearTimeout(state.current.timeoutId);
      resetState();
      updateStorage();
      updateBadge();
      chrome.runtime
        .sendMessage({
          type: TIMER_STOPPED,
          state: state.current.serialize(),
        })
        .catch(() => {});
      break;
    }
    case SWITCH_MODE: {
      clearInterval(state.current.intervalId);
      state.current.stop();
      remainingTime = state.current.getSessionDuration();
      updateStorage();
      break;
    }
    case GET_STATE: {
      sendResponse(state.current.serialize());
      break;
    }
    case AUTOMATIC_CHANGED: {
      state.current.isAutomatic = message.isAutomatic;
      break;
    }
  }
});

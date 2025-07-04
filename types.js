export const WORK_TIME = 25;
export const LONG_TIME = 15;
export const SHORT_TIME = 5;
export const ROUND_COUNT = 4;
export const GET_STATE = 'GET_STATE';
export const TOOGLE_TIMER = 'TOOGLE_TIMER';
export const RESET_TIMER = 'RESET_TIMER';
export const SWITCH_MODE = 'SWITCH_MODE';
export const AUTOMATIC_CHANGED = 'AUTOMATIC_CHANGED';
export const TIMER_STARTED = 'TIMER_STARTED';
export const TIMER_STOPPED = 'TIMER_STOPPED';
/**
 * @todo change remaining time to be in Milliseconds so we can have a brief interval
 */
export const GRACE_PERIOD = 100;
export const MODES = {
    WORK: 'work',
    SHORT_BREAK: 'shortBreak',
    LONG_BREAK: 'longBreak',
}
export const STATUS = {
    RUNNING: 'running',
    PAUSED: 'paused',
    STOPPED: 'stopped',
}
export const TIMES = {
    [MODES.WORK]: WORK_TIME,
    [MODES.LONG_BREAK]: LONG_TIME,
    [MODES.SHORT_BREAK]: SHORT_TIME,
}


export const messages = {
    [MODES.SHORT_BREAK]: "Pomodoro complete! Time for a short break.",
    [MODES.LONG_BREAK]: "Nice work! Time for a long break.",
    [MODES.WORK]: "Break over! Ready for another Pomodoro?"
}
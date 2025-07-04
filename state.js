import { MODES, STATUS, TIMES } from "./types.js"

/**
 * State management for the Pomodoro timer.
 */
const initialState = {
    isAutomatic: true,
    status: STATUS.STOPPED,
    mode: MODES.WORK,
    cycleCount: 0,
    intervalId: null,
    timeoutId: null,
    startDateTime: null,
    elapsedDateTime: null,
    serialize() {

        const { timeoutId, intervalId, ...serialized
        } = this
        return serialized
    },
    getRemainingTime() {
        const duration = this.getSessionDuration()
        if (!this.isRunning()) {
            return duration;
        }

        const totalTime = new Date().getTime() - this.startDateTime + this.elapsedDateTime
        return duration - Math.floor(totalTime / 1000)
    },
    getSessionDuration() {
        return TIMES[this.mode] * 60
    },
    start() {
        const wasPaused = this.isPaused();
        this.status = STATUS.RUNNING
        this.startDateTime = new Date().getTime()
    },
    isRunning() {
        return this.status === STATUS.RUNNING
    },
    isPaused() {
        return this.status === STATUS.PAUSED
    },
    isStopped() {
        return this.status === STATUS.STOPPED
    },
    pause() {
        this.status = STATUS.PAUSED
        this.elapsedDateTime += new Date().getTime() - this.startDateTime
    },
    stop() {
        this.elapsedDateTime = 0
        this.status = STATUS.STOPPED
    },
    setMode(mode) {
        this.mode = mode
    },
    onEnd() {
        this.stop()
        switch (this.mode) {
            case MODES.WORK: {
                this.cycleCount++
                if (this.cycleCount >= 4) {
                    this.mode = MODES.LONG_BREAK
                    this.cycleCount = 0
                } else {
                    this.mode = MODES.SHORT_BREAK
                }
                break
            }
            case MODES.SHORT_BREAK:
            case MODES.LONG_BREAK:
                this.mode = MODES.WORK
                break
        }
        return this.mode
    }
}
export const state = {
    current: {
        ...initialState

    }
}

export const resetState = () => {
    state.current = { ...initialState }
}

export const setState = (serialized) => {
    state.current = { ...initialState, ...serialized }
    console.log(`State set: `, state.current,
        initialState.isRunning() ? 'Running' : 'Not Running',
    )
}
/**
 * Debounces callbacks.
 * The callbacks will be executed in FIFO order.
 *
 * Adding callbacks resets timer.
 */
export class Debouncer {
  protected timeoutId: NodeJS.Timeout | undefined = undefined

  /** pending callbacks. */
  protected callbacks: Array<() => void> = []

  constructor(protected timeoutMs: number = 50) {
    if (timeoutMs < 0) {
      throw new Error('Timeout value cannot be negative.')
    }
    this.timeoutMs = timeoutMs
  }

  public get timeoutms(): number {
    return this.timeoutMs
  }

  protected timeoutHandler = () => {
    this.callbacks.map((callback) => callback())
    this.callbacks = []
    this.timeoutId = undefined
  }

  protected cancelTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  protected resetTimer() {
    this.cancelTimer()
    this.timeoutId = setTimeout(this.timeoutHandler, this.timeoutMs)
  }

  protected isTimerRunning() {
    return !!this.timeoutId
  }

  public setTimeoutMs(newValue: number) {
    if (newValue < 0) throw new Error('Timeout value cannot be negative.')
    this.cancelTimer()
    this.timeoutMs = newValue
    this.timeoutId = setTimeout(this.timeoutHandler, this.timeoutMs)
  }

  public debounce(callback: (typeof this.callbacks)[number]) {
    this.callbacks.push(callback)
    this.resetTimer()
  }
}

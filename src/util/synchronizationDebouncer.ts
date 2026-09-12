import { globalConfig } from '../globalConfig'
import { Debouncer } from '../lib/debouncer'

/**
 * Debounces state synchronization to optimize UI rendering and network performance.
 *
 * Purpose:
 * Group broadcasts belonging to the same UI rendering chain together. This prevents
 * race conditions, redundant network requests, and invalid Apollo Client state.
 *
 * How it works:
 * 1. Track In-Flight GraphQL Requests: Broadcasting while requests are in-flight
 *    can corrupt Apollo Client state or trigger duplicate requests. We actively
 *    track the count of active network requests.
 * 2. Account for UI Rendering: UI components usually rerender immediately after
 *    receiving a GraphQL response. Broadcasting during this render phase causes
 *    similar state invalidation.
 * 3. Debounce Post-Request: Once all in-flight requests drop to zero, we wait for
 *    {@link globalConfig.synchronizationDebounceTimeoutMs} to ensure the UI has completely
 *    finished its rendering cycle before safely executing the broadcast.
 * @see For a detailed visual lifecycle, refer to the  [architecture diagram](assets/sync-debouncer.png)
 * @example
 * // Scenario: Preventing duplicate requests during component mounting
 * //
 * // 1. A cache write triggers a UI rerender, which mounts a new UI component.
 * // 2. The newly mounted component immediately initiates a new GraphQL query.
 * // 3. Without debouncing:
 * //    The cache write broadcasts and syncs before the new network request resolves.
 * //    Other listening browsing contexts receive the broadcast and also trigger
 * //    the same fetch request, resulting in duplicate network traffic across tabs.
 * // 4. With debouncing:
 * //    Broadcasting is delayed until all outstanding fetch requests are fulfilled,
 * //    ensuring a unified and stable state across the application.
 */
export class SynchronizationDebouncer extends Debouncer {
  /**
   * Count of in-flight GraphQL requests.
   */
  protected inFlightReqsCount: number = 0

  /**
   * @param timeoutMs - the debounce timeout in milliseconds.
   *  Used to wait until UI completes getting rendered.
   */
  constructor(
    timeoutMs:
      number | undefined = globalConfig.synchronizationDebounceTimeoutMs
  ) {
    super(timeoutMs)
  }

  /**
   * @returns true if there are any pending broadcast, false otherwise.
   */
  public get isPending(): boolean {
    return this.inFlightReqsCount !== 0 || super.isTimerRunning()
  }

  /**
   * Should be called when making GraphQL request.
   * Used to stop the timer until the corresponding response is received.
   */
  public graphqlRequestStarted(): void {
    this.inFlightReqsCount += 1
    this.cancelTimer()
  }

  /**
   * Should be called when GraphQL response is received.
   */
  public graphqlRequestCompleted(): void {
    if (this.inFlightReqsCount === 0)
      throw new Error(
        `graphqlRequestStarted must had beeen called when starting the request`
      )
    this.inFlightReqsCount -= 1
    if (this.inFlightReqsCount === 0 && this.callbacks.length) this.resetTimer()
  }

  /**
   * Debounces the provided callback function.
   * @param callback - the cb to be debounced.
   */
  public override debounce(callback: (typeof this.callbacks)[number]): void {
    super.debounce(callback)
    if (this.inFlightReqsCount) this.cancelTimer()
  }

  /**
   * Sets the number of milliseconds to debounce synchronization.
   * @param newValue - the new timeout value in milliseconds.
   */
  public override setTimeoutMs(newValue: number) {
    if (newValue < 24)
      throw new Error(
        'Debounce timeout should not be lesser than 24 milliseconds.'
      )
    super.setTimeoutMs(newValue)
  }
}

/** {@inheritDoc SynchronizationDebouncer} */
export const synchronizationDebouncer = new SynchronizationDebouncer()

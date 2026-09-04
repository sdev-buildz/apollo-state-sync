import { globalConfig } from '../globalConfig'
import { Debouncer } from '../lib/debouncer'

/**
 * It is used to debounce state synchronization.
 * It is used to group broadcasts belonging to same UI rendering chain together.
 *
 * Broadcasting when there are any in-flight graphql requests, could result in
 *  redundant network requests and invalid Apollo Client state.
 *  So we track the count of in-flight graphql requests.
 *
 * Broadcasting when the UI is rendering could also result in redundant network requests and invalid Apollo Client state.
 *  UI usually rerenders as soon as any GraphQL response is received.
 *  So when all the in-flight requests get completed, we wait for {@link globalConfig.synhnorizationDebounceTimeoutMs | some time}
 *    until the UI finishes rendering before broadcasting.
 *  @example scenerio
 * ```plaintext
 *  Suppose a cache write causes UI rerender which mounts a new UI component.
 *    The new component makes a gql query request.
 *    If the turn around time of the network request is more than the debounce expiry time,
 *      the state would have got broadcasted and synced before the fetch request is fulfilled.
 *      So, the listening browsing contexts also reinitiate the fetch request causing duplicate network requests.
 *    So, we debounce the broadcasting until all the fetch requests get fulfilled.
 * ```
 * @see excallidraw diagram
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
    timeoutMs: number | undefined = globalConfig.synhnorizationDebounceTimeoutMs
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
   * Called whenever any GraphQL request is made.
   * Used to stop the timer until the corresponding response is received.
   */
  public graphqlRequestStarted(): void {
    this.inFlightReqsCount += 1
    this.cancelTimer()
  }

  /** Called whenever any GraphQL response is received. */
  public graphqlRequestCompleted(): void {
    if (this.inFlightReqsCount === 0)
      throw new Error(
        `graphqlRequestStarted must had beeen called when starting the request`
      )
    this.inFlightReqsCount -= 1
    if (this.inFlightReqsCount === 0 && this.callbacks.length) this.resetTimer()
  }

  public override debounce(callback: (typeof this.callbacks)[number]): void {
    super.debounce(callback)
    if (this.inFlightReqsCount) this.cancelTimer()
  }

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

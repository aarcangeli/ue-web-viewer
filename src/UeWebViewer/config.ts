export const FAKE_LOADING_TIME = 200;

/**
 * A fake wait function to simulate loading time.
 * Use it to simulate long loading operations.
 * @param wait if specified, wait for the given time in milliseconds.
 */
export async function fakeWait(wait = FAKE_LOADING_TIME): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, wait));
}

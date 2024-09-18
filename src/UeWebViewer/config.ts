export const FAKE_LOADING_TIME = 0;

export async function fakeWait(): Promise<void> {
  if (FAKE_LOADING_TIME > 0) {
    await new Promise((resolve) => setTimeout(resolve, FAKE_LOADING_TIME));
  }
}

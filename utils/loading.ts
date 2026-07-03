export const MIN_LOADING_MS = 650;

export async function withMinimumDelay<T>(work: Promise<T>, minMs = MIN_LOADING_MS): Promise<T> {
  const delay = new Promise((resolve) => window.setTimeout(resolve, minMs));

  try {
    const result = await work;
    await delay;
    return result;
  } catch (error) {
    await delay;
    throw error;
  }
}

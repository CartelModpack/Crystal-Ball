/**
 * Recursive helper to execute promise executors in order.
 *
 * @param executors - The list of executors to run.
 * @param index - The current index we are on.
 * @param results - The results from previous executors.
 * @returns A promise that resolves when this executor and all after it are done.
 */
const inOrderPromiseHelper = <T, R = Error>(
  executors: PromiseExecutor<T, R>[],
  index: number,
  results: T[],
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    new Promise<T>(executors[index])
      .then((result) => {
        if (index === executors.length - 1) {
          resolve([...results, result]);
        } else {
          inOrderPromiseHelper(executors, index + 1, [...results, result])
            .then(resolve)
            .catch(reject);
        }
      })
      .catch(reject);
  });
};

Promise.inOrder = <T, R = Error>(executors: PromiseExecutor<T, R>[]) => {
  if (executors.length === 0) {
    return new Promise((resolve) => {
      resolve([]);
    });
  }

  return inOrderPromiseHelper(executors, 0, []);
};

Promise.atOnce = <T, R = Error>(
  executors: PromiseExecutor<T, R>[],
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    if (executors.length === 0) {
      resolve([]);
    } else {
      const promises: Promise<T>[] = [];

      for (const executor of executors) {
        promises.push(new Promise(executor));
      }
      Promise.all(promises).then(resolve).catch(reject);
    }
  });
};

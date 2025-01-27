export {};
declare global {
  /** A promise executor. */
  type PromiseExecutor<ResolveType, RejectType = Error> = (
    resolve: (value: ResolveType | PromiseLike<ResolveType>) => void,
    reject: (reason: RejectType) => void,
  ) => void;

  interface PromiseConstructor {
    /**
     * Execute all "promises" at the same time. Same as Promise.all() but constructs the promises at runtime.
     *
     * @param T - The type that the executors should resolve to if successful.
     * @param executors - The executors (the 1st promise paramater) to run.
     * @returns A promise that resolves when all promises are done, or rejects if an error occurs.
     */
    atOnce: <ResolveType, RejectType = Error>(
      executors: PromiseExecutor<ResolveType, RejectType>[],
    ) => Promise<ResolveType[]>;

    /**
     * Execute all "promises" in order, left to right.
     *
     * @param T - The type that the executors should resolve to if successful.
     * @param executors - The executors (the 1st promise paramater) to run.
     * @returns A promise that resolves when all promises are done, or rejects if an error occurs.
     */
    inOrder: <ResolveType, RejectType = Error>(
      executors: PromiseExecutor<ResolveType, RejectType>[],
    ) => Promise<ResolveType[]>;
  }
}

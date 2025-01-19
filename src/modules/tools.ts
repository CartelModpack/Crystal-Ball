/**
 * Omit properties from an object.
 *
 * @param obj - The object.
 * @param keys - Properties to exclude.
 * @returns The object without any listed properties.
 */
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  const out: Partial<T> = {};

  for (const key of Object.keys(obj)) {
    if (!keys.includes(key as K)) {
      out[key as K] = obj[key as K];
    }
  }

  return out as Omit<T, K>;
};

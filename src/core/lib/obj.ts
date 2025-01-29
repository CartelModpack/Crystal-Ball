/**
 * Stack objects together, with base being on the bottom and replacing varialbes left to right.
 *
 * @param base - The base object.
 * @param objs - Any objects you wish to overlay.
 * @returns An object that contains the values from the objects stacked.
 */
export const stackObjects: <T extends object>(
  base: T,
  ...objs: Partial<T>[]
) => T = <T extends object>(base: T, ...objs: Partial<T>[]) => {
  let out: T = base;

  objs.forEach((obj) => {
    out = { ...out, obj };
  });

  return out;
};

export {};
declare global {
  interface ObjectConstructor {
    /**
     * Stacks objects together from left to right, with base being the bottom.
     *
     * @param base - The base object.
     * @param objs - Any subsequent objects to stack. Top properties will override bottom properties.
     * @returns An object with overwritten properties.
     */
    stack: <T extends object>(base: T, ...objs: Partial<T>[]) => T;
  }
}

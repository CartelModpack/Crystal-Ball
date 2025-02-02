Object.stack = <T extends object>(base: T, ...objs: Partial<T>[]) => {
  let out: T = base;

  objs.forEach((obj) => {
    out = { ...out, ...obj };
  });

  return out;
};

function clone<T extends object | Array<any> | Function>(value: T): T {
  const isObject = typeof value === 'object';
  const cloned = isObject
    ? Array.isArray(value)
      ? [...value]
      : value
      ? { ...value }
      : value
    : typeof value === 'function'
    ? function (...rest) {
        return value.apply(this, ...rest);
      }
    : value;

  cloned && isObject && Object.keys(cloned).forEach(key => (cloned[key] = clone(cloned[key])));

  return cloned as unknown as T;
}

export { clone };

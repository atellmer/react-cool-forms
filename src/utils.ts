function clone<T extends object | Array<any>>(value: T): T {
  const isObject = typeof value === 'object';
  const cloned = isObject ? (Array.isArray(value) ? [...value] : value ? { ...value } : value) : value;

  cloned && isObject && Object.keys(cloned).forEach(key => (cloned[key] = clone(cloned[key])));

  return cloned as unknown as T;
}

export { clone };

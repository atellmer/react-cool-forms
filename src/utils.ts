function clone<T extends object | Array<any>>(value: T): T {
  const isObject = typeof value === 'object';
  const cloned = isObject ? (Array.isArray(value) ? [...value] : value ? { ...value } : value) : value;

  cloned && isObject && Object.keys(cloned).forEach(key => (cloned[key] = clone(cloned[key])));

  return cloned as unknown as T;
}

function detecIsFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export { clone, detecIsFunction };

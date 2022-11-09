const CONTEXT_ERROR = 'Context of Form not found!';
const HAS_REPEATER_VALIDATION_ERROR = 'HAS_REPEATER_VALIDATION_ERROR';

function clone<T extends object | Array<any>>(value: T): T {
  const isObject = typeof value === 'object';
  const cloned = isObject ? (Array.isArray(value) ? [...value] : value ? { ...value } : value) : value;

  cloned && isObject && Object.keys(cloned).forEach(key => (cloned[key] = clone(cloned[key])));

  return cloned as unknown as T;
}

function detecIsFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

function dummy() {}

function removePropertyValues<T extends object>(obj: T, value: any) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === value) {
      delete obj[key];
    }
  });
}

function hasKeys<T extends object>(obj: T): boolean {
  return Object.keys(obj).length > 0;
}

function mergeArrayToObject<S, T extends object>(items: Array<T>, exclude?: string) {
  const obj = {} as Record<string, S>;

  for (const item of items) {
    for (const key of Object.keys(item)) {
      if (exclude && item[key] === exclude) continue;
      obj[key] = item[key];
    }
  }

  return obj;
}

export {
  CONTEXT_ERROR,
  HAS_REPEATER_VALIDATION_ERROR,
  clone,
  detecIsFunction,
  dummy,
  removePropertyValues,
  hasKeys,
  mergeArrayToObject,
};

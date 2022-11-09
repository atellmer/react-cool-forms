const CONTEXT_ERROR = 'Context of Form not found!';
const SOME_REPEATER_VALIDATION_ERROR = 'Some repeater validation error';

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

export { CONTEXT_ERROR, SOME_REPEATER_VALIDATION_ERROR, clone, detecIsFunction, dummy, removePropertyValues, hasKeys };

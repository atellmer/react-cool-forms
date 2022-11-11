import { useMemo, useState, useCallback, useEffect } from 'react';

import { useFormContext } from './context';

function useEvent<T extends (...args) => any>(fn: T) {
  const scope = useMemo(() => ({ fn }), []);

  scope.fn = fn;

  const callback = useCallback((...args) => {
    return scope.fn(...args);
  }, []);

  return callback as unknown as T;
}

function useUpdate() {
  const [_, forceUpdate] = useState(0);
  const update = useCallback(() => forceUpdate(x => x + 1), []);

  return { update };
}

function useFormState<T extends object>() {
  const { state } = useFormContext<T>();
  const { update } = useUpdate();
  const {
    formValue,
    errors,
    inProcess,
    addSubscriber,
    removeSubscriber,
    addValidator,
    removeValidator,
    modify,
    validate: sourceValidate,
    submit,
    reset,
  } = state;
  const validate = useEvent((formValue: T) => sourceValidate(formValue));

  useEffect(() => {
    addSubscriber(update);

    return () => removeSubscriber(update);
  }, []);

  return {
    formValue,
    errors,
    inProcess,
    addSubscriber,
    removeSubscriber,
    addValidator,
    removeValidator,
    modify,
    validate,
    submit,
    reset,
  };
}

export { useEvent, useUpdate, useFormState };

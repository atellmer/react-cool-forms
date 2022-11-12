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

type UseFormStateOptions<T, S> = {
  detectChanges: (formValue: T) => S;
};

function useFormState<T extends object, S = any>(
  options: UseFormStateOptions<T, S> = { detectChanges: x => x as unknown as S },
) {
  const { detectChanges } = options;
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
  const lastValue = detectChanges(formValue);

  const updateWhenChange = useEvent(() => {
    if (detectChanges(state.formValue) !== lastValue) {
      update();
    }
  });

  useEffect(() => {
    addSubscriber(updateWhenChange);

    return () => removeSubscriber(updateWhenChange);
  }, []);

  return {
    formValue,
    errors,
    inProcess,
    addValidator,
    removeValidator,
    modify,
    validate,
    submit,
    reset,
  };
}

export { useEvent, useUpdate, useFormState };

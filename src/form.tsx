import React, { useMemo, useState, useImperativeHandle, useEffect, useLayoutEffect } from 'react';

import { type SyntheticValidator, type Validator } from './types';
import { FormContext, type FormContextValue } from './context';
import {
  ROOT_FORM,
  HAS_REPEATER_VALIDATION_ERROR,
  clone,
  detecIsFunction,
  hasKeys,
  mergeArrayToObject,
  detectIsDeepEqual,
  removePropertyValues,
} from './utils';
import { useEvent, useUpdate } from './hooks';

export type FormProps<T extends object> = {
  name?: string;
  initialFormValue: T;
  connectedRef?: React.Ref<FormRef<T>>;
  interrupt?: boolean;
  validators?: Array<Validator<T, T>>;
  children: (options: FormChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidateOptions<T>) => void;
  onChange?: (options: OnChangeOptions<T>) => void;
  onUnmount?: () => void; // for internal use
  onLift?: (lifted: Lifted) => void; // for internal use
  onSubmit: (options: OnSubmitOptions<T>) => void;
};

function Form<T extends object>(props: FormProps<T>): React.ReactElement {
  const {
    name,
    initialFormValue,
    connectedRef,
    validators: formValidators = [],
    interrupt,
    children,
    onValidate,
    onChange,
    onUnmount,
    onLift,
    onSubmit,
  } = props;
  const { update } = useUpdate();
  const [errors, setErrors] = useState<Record<string, string>>(null);
  const [inProcess, setInProcess] = useState(false);
  const scope = useMemo(() => ({ formValue: clone(initialFormValue) }), []);
  const formValue = scope.formValue;

  useLayoutEffect(() => {
    const validators: Array<SyntheticValidator> = formValidators.map(validator => {
      return {
        ...validator,
        name: name || ROOT_FORM,
        getValue: x => x,
      };
    });

    validators.forEach(x => addValidator(x));

    return () => {
      validators.forEach(x => removeValidator(x));
    };
  }, []);

  useEffect(() => {
    return () => detecIsFunction(onUnmount) && onUnmount();
  }, []);

  const modify = useEvent((formValue: T) => {
    scope.formValue = { ...formValue };

    update();
    onChange({ formValue: scope.formValue });
  });

  const notify = useEvent((formValue: T) => {
    scope.formValue = { ...formValue };
    const isRoot = !onLift;

    onChange({ formValue: scope.formValue });

    if (isRoot) {
      state.formValue = scope.formValue;
      state.subscribers.forEach(fn => fn());
    }
  });

  const reset = useEvent(() => {
    setErrors(null);
    modify(clone(initialFormValue));
    setTimeout(() => {
      state.resetFns.forEach(fn => fn());
    });
  });

  const validate = useEvent((formValue: T, isChild?: boolean): Promise<boolean> => {
    const results: Array<boolean> = [];
    const validators = state.validators;
    let newErrors: Record<string, string> = null;

    setInProcess(true);

    const process = async () => {
      for (const validator of validators) {
        const fieldValue = validator.getValue(formValue);
        const isValid = await validator.method({ formValue, fieldValue });

        results.push(isValid);

        if (detecIsFunction(validator.onValidate)) {
          validator.onValidate({ isValid, fieldValue, nodeRef: validator.nodeRef });
        }

        if (!isValid) {
          if (!newErrors) {
            newErrors = {};
          }
          if (!newErrors[validator.name]) {
            newErrors[validator.name] = validator.message;
          }
          if (interrupt || validator.interrupt) {
            break;
          }
        }
      }

      const isValid = results.every(x => x);

      if (!isValid) {
        newErrors = hasKeys(newErrors) ? newErrors : null;
      }

      if (newErrors !== errors) {
        lift({ from: 'validate', value: newErrors, skipUpdate: true });

        if (isChild) {
          if (!detectIsDeepEqual(newErrors, errors)) {
            setErrors(newErrors);
          }
        } else {
          lift({ from: 'validate' });
        }
      }

      setInProcess(false);
      onValidate({ formValue, errors: newErrors, isValid });

      return isValid;
    };

    return new Promise<boolean>(async resolve => {
      if (isChild) {
        resolve(await process());
      } else {
        requestAnimationFrame(async () => {
          resolve(await process());
        });
      }
    });
  });

  const validateField = useEvent(async (options: ValidateFieldOptions<T>): Promise<boolean> => {
    const { name, formValue, validators } = options;
    let failedValidator: SyntheticValidator = null;
    let newErrors: Record<string, string> = { ...(errors || {}) };
    const fieldErrors: Record<string, string> = { ...(errors || {}) };

    for (const validator of validators) {
      const fieldValue = validator.getValue(formValue);
      const isValid = await validator.method({ formValue, fieldValue });

      fieldErrors[name] = undefined;

      if (!isValid) {
        const { message } = validator;

        failedValidator = validator;
        newErrors[name] = message;
        fieldErrors[name] = message;
        break;
      }
    }

    const isValid = !failedValidator;

    if (isValid) {
      if (newErrors && newErrors[name]) {
        delete newErrors[name];
      }
    }

    newErrors = hasKeys(newErrors) ? newErrors : null;

    if (!detectIsDeepEqual(newErrors, errors)) {
      setErrors(newErrors);
      lift({ from: 'validateField', value: fieldErrors });
    }

    onValidate({ formValue, errors: newErrors, isValid });

    return isValid;
  });

  const lift = useEvent((lifted: Lifted) => {
    if (detecIsFunction(onLift)) {
      onLift(lifted);
    } else {
      const map: Record<Lifted['from'], () => void> = {
        validate: () => {
          const { skipUpdate } = lifted;
          const liftedErrors = lifted.value as Record<string, string>;

          if (skipUpdate) {
            state.accumulatedErrors.push(liftedErrors);
          } else {
            const errors = state.accumulatedErrors.filter(Boolean);
            const mergedErrors = mergeArrayToObject<string, {}>(errors, HAS_REPEATER_VALIDATION_ERROR);
            const newErrors = hasKeys(mergedErrors) ? mergedErrors : null;

            state.accumulatedErrors = [];
            setErrors(newErrors);
          }
        },
        validateField: () => {
          const liftedErrors = lifted.value as Record<string, string | undefined>;
          const keys = Object.keys(liftedErrors);
          let newErrors: Record<string, string> = { ...(errors || {}) };

          for (const key of keys) {
            if (liftedErrors[key] !== HAS_REPEATER_VALIDATION_ERROR) {
              newErrors[key] = liftedErrors[key];
            }
          }

          removePropertyValues(newErrors, undefined);
          newErrors = hasKeys(newErrors) ? newErrors : null;

          if (!detectIsDeepEqual(newErrors, errors)) {
            setErrors(newErrors);
          }
        },
      };

      map[lifted.from] && map[lifted.from]();
    }
  });

  const submit = useEvent(async () => {
    const { formValue } = scope;
    const isValid = await validate(formValue);

    isValid && onSubmit({ formValue });
  });

  const addSubscriber = useEvent((subscriber: () => void) => {
    state.subscribers.push(subscriber);
  });

  const removeSubscriber = useEvent((subscriber: () => void) => {
    const idx = state.subscribers.findIndex(x => x === subscriber);

    if (idx !== -1) {
      state.subscribers.splice(idx, 1);
    }
  });

  const addValidator = useEvent((validator: SyntheticValidator) => {
    state.validators.push(validator);
  });

  const removeValidator = useEvent((validator: SyntheticValidator) => {
    const idx = state.validators.findIndex(x => x === validator);

    if (idx !== -1) {
      state.validators.splice(idx, 1);
    }
  });

  const addResetFn = useEvent((fn: () => void) => {
    state.resetFns.push(fn);
  });

  const removeResetFn = useEvent((fn: () => void) => {
    const idx = state.resetFns.findIndex(x => x === fn);

    if (idx !== -1) {
      state.resetFns.splice(idx, 1);
    }
  });

  const state = useMemo<FormState<T>>(
    () => ({
      formValue,
      errors,
      inProcess,
      modify,
      notify,
      validate,
      validateField,
      submit,
      reset,
      addSubscriber,
      removeSubscriber,
      addValidator,
      removeValidator,
      addResetFn,
      removeResetFn,
      lift,
      subscribers: [],
      validators: [],
      resetFns: [],
      accumulatedErrors: [],
    }),
    [],
  );

  state.formValue = formValue;
  state.errors = errors;
  state.inProcess = inProcess;
  state.modify = modify;
  state.notify = notify;
  state.validate = validate;
  state.validateField = validateField;
  state.submit = submit;
  state.reset = reset;
  state.lift = lift;

  const value = useMemo<FormContextValue<T>>(() => ({ state }), [formValue, errors]);

  useImperativeHandle(connectedRef, () => {
    const ref: FormRef<T> = {
      getFormValue: () => state.formValue,
      modify,
      validate,
      submit,
      reset,
    };

    return ref;
  });

  return (
    <FormContext.Provider value={value}>
      {children({ formValue, errors, inProcess, validate, reset, submit })}
    </FormContext.Provider>
  );
}

const FormComponent: React.FC<FormProps<{}>> = Form;

FormComponent.defaultProps = {
  onValidate: () => {},
  onChange: () => {},
};

export type FormRef<T extends object> = {
  getFormValue: () => T;
  modify: (formValue: T) => void;
  validate: (formValue: T, isChild?: boolean) => Promise<boolean>;
  submit: () => void;
  reset: () => void;
};

export type FormState<T extends object> = {
  formValue: T;
  errors: Record<string, string> | null;
  inProcess: boolean;
  subscribers: Array<() => void>;
  validators: Array<SyntheticValidator>;
  resetFns: Array<() => void>;
  notify: (formValue: T) => void;
  addSubscriber: (subscriber: () => void) => void;
  removeSubscriber: (subscriber: () => void) => void;
  addValidator: (validator: SyntheticValidator) => void;
  removeValidator: (validator: SyntheticValidator) => void;
  addResetFn: (fn: () => void) => void;
  removeResetFn: (fn: () => void) => void;
  validateField: (options: ValidateFieldOptions<T>) => Promise<boolean>;
  lift: (lifted: Lifted) => void;
  accumulatedErrors: Array<Record<string, string>>;
} & Pick<FormRef<T>, 'modify' | 'validate' | 'submit' | 'reset'>;

type ValidateFieldOptions<T extends object> = {
  name: string;
  formValue: T;
  validators: Array<SyntheticValidator>;
};

type SharedCallbackOptions<T extends object> = {
  formValue: T;
};

export type FormChildrenOptions<T extends object> = {
  errors: Record<string, string>;
  inProcess: boolean;
} & SharedCallbackOptions<T> &
  Pick<FormRef<T>, 'validate' | 'submit' | 'reset'>;

export type OnSubmitOptions<T extends object> = {} & SharedCallbackOptions<T>;

export type OnValidateOptions<T extends object> = {
  isValid: boolean;
  errors: Record<string, string> | null;
} & SharedCallbackOptions<T>;

export type OnChangeOptions<T extends object> = {} & SharedCallbackOptions<T>;

type Lifted<T = unknown> = {
  from: 'validateField' | 'validate';
  value?: T;
  skipUpdate?: boolean;
};

export { Form };

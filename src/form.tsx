import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useImperativeHandle,
  useCallback,
  useEffect,
} from 'react';

import {
  CONTEXT_ERROR,
  HAS_REPEATER_VALIDATION_ERROR,
  clone,
  detecIsFunction,
  hasKeys,
  mergeArrayToObject,
  detectIsDeepEqual,
  removePropertyValues,
} from './utils';
import { type SyntheticValidator } from './validators';

export type FormProps<T extends object> = {
  name?: string;
  initialFormValue: T;
  connectedRef?: React.Ref<FormRef<T>>;
  interruptValidation?: boolean;
  children: (options: FormChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidateOptions<T>) => void;
  onChange?: (options: OnChangeOptions<T>) => void;
  onUnmount?: () => void;
  onLift?: (lifted: Lifted) => void;
  onSubmit: (options: OnSubmitOptions<T>) => void;
};

function Form<T extends object>(props: FormProps<T>): React.ReactElement {
  const {
    name,
    initialFormValue,
    connectedRef,
    interruptValidation,
    children,
    onValidate,
    onChange,
    onUnmount,
    onLift,
    onSubmit,
  } = props;
  const [formValue, setFormValue] = useState<T>(clone(initialFormValue));
  const [errors, setErrors] = useState<Record<string, string>>(null);
  const [inProcess, setInProcess] = useState(false);

  useEffect(() => {
    return () => detecIsFunction(onUnmount) && onUnmount();
  }, []);

  const modify = useEvent((formValue: T) => {
    const newFormValue = { ...formValue };

    setFormValue(newFormValue);
    onChange({ formValue: newFormValue });
  });

  const reset = useEvent(() => {
    setErrors(null);
    modify(clone(initialFormValue));
    setTimeout(() => {
      scope.resetFns.forEach(fn => fn());
    });
  });

  const validate = useEvent(async (formValue: T, isChild?: boolean): Promise<boolean> => {
    const results: Array<boolean> = [];
    const validators = scope.validators;
    let newErrors: Record<string, string> = null;

    setInProcess(true);

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
        if (interruptValidation) {
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
            scope.accumulatedErrors.push(liftedErrors);
          } else {
            const errors = scope.accumulatedErrors.filter(Boolean);
            const mergedErrors = mergeArrayToObject<string, {}>(errors, HAS_REPEATER_VALIDATION_ERROR);
            const newErrors = hasKeys(mergedErrors) ? mergedErrors : null;

            scope.accumulatedErrors = [];
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
    const isValid = await validate(formValue);

    isValid && onSubmit({ formValue });
  });

  const addValidator = useEvent((validator: SyntheticValidator) => {
    scope.validators.push(validator);
  });

  const removeValidator = useEvent((validator: SyntheticValidator) => {
    const idx = scope.validators.findIndex(x => x === validator);

    if (idx !== -1) {
      scope.validators.splice(idx, 1);
    }
  });

  const addResetFn = useEvent((fn: () => void) => {
    scope.resetFns.push(fn);
  });

  const removeResetFn = useEvent((fn: () => void) => {
    const idx = scope.resetFns.findIndex(x => x === fn);

    if (idx !== -1) {
      scope.resetFns.splice(idx, 1);
    }
  });

  const scope = useMemo<FormScope<T>>(
    () => ({
      formValue,
      errors,
      inProcess,
      modify,
      validate,
      validateField,
      submit,
      reset,
      addValidator,
      removeValidator,
      addResetFn,
      removeResetFn,
      lift,
      validators: [],
      resetFns: [],
      accumulatedErrors: [],
    }),
    [],
  );

  scope.formValue = formValue;
  scope.errors = errors;
  scope.inProcess = inProcess;
  scope.modify = modify;
  scope.validate = validate;
  scope.validateField = validateField;
  scope.submit = submit;
  scope.reset = reset;
  scope.addValidator = addValidator;
  scope.removeValidator = removeValidator;
  scope.addResetFn = addResetFn;
  scope.removeResetFn = removeResetFn;
  scope.lift = lift;

  const value = useMemo<FormStateContextValue<T>>(() => ({ scope }), [formValue, errors]);

  useImperativeHandle(connectedRef, () => {
    const ref: FormRef<T> = {
      getFormValue: () => formValue,
      modify,
      validate,
      submit,
      reset,
    };

    return ref;
  });

  return (
    <FormStateContext.Provider value={value}>
      {children({ formValue, errors, inProcess, validate, reset, submit })}
    </FormStateContext.Provider>
  );
}

const FormComponent: React.FC<FormProps<{}>> = Form;

FormComponent.defaultProps = {
  onValidate: () => {},
  onChange: () => {},
};

const FormStateContext = createContext<FormStateContextValue>(null);

function useFormContext<T extends object>() {
  const value = useContext<FormStateContextValue<T>>(FormStateContext);

  if (!value) {
    throw new Error(CONTEXT_ERROR);
  }

  return value;
}

function useFormState<T extends object>() {
  const { scope } = useFormContext<T>();
  const {
    formValue,
    errors,
    inProcess,
    addValidator,
    removeValidator,
    modify,
    validate: sourceValidate,
    submit,
    reset,
  } = scope;
  const validate = useEvent((formValue: T) => sourceValidate(formValue));

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

function useEvent<T extends (...args) => any>(fn: T) {
  const scope = useMemo(() => ({ fn }), []);

  scope.fn = fn;

  const callback = useCallback((...args) => {
    return scope.fn(...args);
  }, []);

  return callback as unknown as T;
}

export type FormRef<T extends object> = {
  getFormValue: () => T;
  modify: (formValue: T) => void;
  validate: (formValue: T, isChild?: boolean) => Promise<boolean>;
  submit: () => void;
  reset: () => void;
};

export type FormScope<T extends object> = {
  formValue: T;
  errors: Record<string, string> | null;
  inProcess: boolean;
  validators: Array<SyntheticValidator>;
  resetFns: Array<() => void>;
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

type FormStateContextValue<T extends object = any> = {
  scope: FormScope<T>;
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

export { Form, useFormContext, useFormState, useEvent };

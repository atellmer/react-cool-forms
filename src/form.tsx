import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useImperativeHandle,
  useCallback,
  useEffect,
  memo,
} from 'react';

import {
  CONTEXT_ERROR,
  HAS_REPEATER_VALIDATION_ERROR,
  clone,
  detecIsFunction,
  hasKeys,
  mergeArrayToObject,
} from './utils';
import { type SyntheticValidator } from './validators';

export type FormProps<T extends object> = {
  name?: string;
  initialFormValue: T;
  connectedRef?: React.Ref<FormRef<T>>;
  interruptValidation?: boolean;
  box?: Box;
  children: (options: FormChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidateOptions<T>) => void;
  onChange?: (options: OnChangeOptions<T>) => void;
  onUnmount?: () => void;
  onSubmit: (options: OnSubmitOptions<T>) => void;
};

function Form<T extends object>(props: FormProps<T>): React.ReactElement {
  const {
    initialFormValue,
    box,
    connectedRef,
    interruptValidation,
    children,
    onValidate,
    onChange,
    onUnmount,
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
    let newErrors: Record<string, string> = null;
    let mergedErrors: Record<string, string> = null;
    const results: Array<boolean> = [];
    const validators = scope.validators;

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
      mergedErrors = hasKeys(newErrors) ? newErrors : null;
    }

    if (mergedErrors !== errors) {
      scope.box.errors.push(mergedErrors);

      if (isChild) {
        setErrors(mergedErrors);
      } else {
        const errors = scope.box.errors.filter(Boolean);
        const newErrors = mergeArrayToObject<string, {}>(errors, HAS_REPEATER_VALIDATION_ERROR);
        const mergedErrors = hasKeys(newErrors) ? newErrors : null;

        scope.box.errors = [];
        setErrors(mergedErrors);
      }
    }

    setInProcess(false);
    onValidate({ formValue, errors: mergedErrors, isValid });

    return isValid;
  });

  const validateField = useEvent(async (options: ValidateFieldOptions<T>): Promise<boolean> => {
    const { name, formValue, validators } = options;
    let newErrors: Record<string, string> = null;
    let failedValidator: SyntheticValidator = null;

    for (const validator of validators) {
      const fieldValue = validator.getValue(formValue);
      const isValid = await validator.method({ formValue, fieldValue });

      if (!isValid) {
        failedValidator = validator;
        newErrors = { [name]: failedValidator.message };
        break;
      }
    }

    const isValid = !failedValidator;

    if (isValid) {
      if (errors && errors[name]) {
        delete errors[name];
        newErrors = { ...errors };
      }
    }

    if (newErrors !== errors) {
      setErrors(newErrors);
    }

    onValidate({ formValue, errors: newErrors, isValid });

    return isValid;
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
      validators: [],
      resetFns: [],
      box: box || {
        errors: [],
      },
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

  return { ...scope };
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
  box: Box;
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

type Box = {
  errors: Array<Record<string, string>>;
};

export { Form, useFormContext, useFormState, useEvent };

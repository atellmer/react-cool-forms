import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useImperativeHandle,
  useCallback,
  useEffect,
} from 'react';

import { clone, detecIsFunction, CONTEXT_ERROR } from './utils';
import { type SyntheticValidator } from './validators';

export type FormProps<T extends object> = {
  initialFormValue: T;
  connectedRef?: React.Ref<FormRef<T>>;
  interruptValidation?: boolean;
  children: (options: FormChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidateOptions<T>) => void;
  onChange?: (options: OnChangeOptions<T>) => void;
  onUnmount?: () => void;
  onSubmit: (options: OnSubmitOptions<T>) => void;
};

function Form<T extends object>(props: FormProps<T>): React.ReactElement {
  const { initialFormValue, connectedRef, interruptValidation, children, onValidate, onChange, onSubmit, onUnmount } =
    props;
  const [formValue, setFormValue] = useState<T>(clone(initialFormValue));
  const [errors, setErrors] = useState<Record<string, string>>(null);
  const [inProcess, setInProcess] = useState(false);

  useEffect(() => {
    return () => detecIsFunction(onUnmount) && onUnmount();
  }, []);

  const modify = useCallback(
    (formValue: T) => {
      const newFormValue = { ...formValue };

      setFormValue(newFormValue);
      onChange({ formValue: newFormValue });
    },
    [onChange],
  );

  const reset = useCallback(() => {
    setErrors(null);
    modify(clone(initialFormValue));
    setTimeout(() => {
      scope.resetFns.forEach(fn => fn());
    });
  }, [modify]);

  const validate = useCallback(
    async (formValue: T): Promise<boolean> => {
      let newErrors: Record<string, string> = null;
      const validationResults: Array<boolean> = [];
      const validators = scope.validators;

      setInProcess(true);

      for (const validator of validators) {
        const fieldValue = validator.getValue(formValue);
        const isValid = await validator.method({ formValue, fieldValue });

        validationResults.push(isValid);

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

      const isValid = validationResults.every(x => x);

      if (isValid) {
        errors && setErrors(null);
      } else {
        setErrors({ ...newErrors });
      }

      setInProcess(false);
      onValidate({ formValue, errors: newErrors, isValid });

      return isValid;
    },
    [errors, onValidate],
  );

  const validateField = useCallback(
    async (options: ValidateFieldOptions<T>): Promise<boolean> => {
      const { name, formValue, validators } = options;
      let brokenValidator: SyntheticValidator = null;

      for (const validator of validators) {
        const fieldValue = validator.getValue(formValue);
        const isValid = await validator.method({ formValue, fieldValue });

        if (!isValid) {
          brokenValidator = validator;
          break;
        }
      }

      const isValid = !brokenValidator;

      if (isValid) {
        if (errors && errors[name]) {
          delete errors[name];
          setErrors({ ...errors });
        }
      } else {
        setErrors({ ...errors, [name]: brokenValidator.message });
      }

      return isValid;
    },
    [errors],
  );

  const submit = useCallback(() => {
    validate(formValue).then(isValid => {
      isValid && onSubmit({ formValue });
    });
  }, [formValue, validate, onSubmit]);

  const addValidator = useCallback((validator: SyntheticValidator) => {
    scope.validators.push(validator);
  }, []);

  const removeValidator = useCallback((validator: SyntheticValidator) => {
    const idx = scope.validators.findIndex(x => x === validator);

    if (idx !== -1) {
      scope.validators.splice(idx, 1);
    }
  }, []);

  const addResetFn = useCallback((fn: () => void) => {
    scope.resetFns.push(fn);
  }, []);

  const removeResetFn = useCallback((fn: () => void) => {
    const idx = scope.resetFns.findIndex(x => x === fn);

    if (idx !== -1) {
      scope.resetFns.splice(idx, 1);
    }
  }, []);

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

  useImperativeHandle(connectedRef, () => ({
    getFormValue: () => formValue,
    modify,
    validate,
    submit,
    reset,
  }));

  return (
    <FormStateContext.Provider value={value}>
      {children({ formValue, errors, inProcess, reset, submit })}
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

export type FormRef<T extends object> = {
  getFormValue: () => T;
  modify: (formValue: T) => void;
  validate: (formValue: T) => Promise<boolean>;
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
  Pick<FormRef<T>, 'submit' | 'reset'>;

export type OnSubmitOptions<T extends object> = {} & SharedCallbackOptions<T>;

export type OnValidateOptions<T extends object> = {
  isValid: boolean;
  errors: Record<string, string> | null;
} & SharedCallbackOptions<T>;

export type OnChangeOptions<T extends object> = {} & SharedCallbackOptions<T>;

export { Form, useFormContext, useFormState };

import React, { createContext, useContext, useMemo, useState, useImperativeHandle, useCallback } from 'react';

import { clone, detecIsFunction } from './utils';
import { type SyntheticValidator } from './validators';

export type FormProps<T extends object = any> = {
  initialFormValue: T;
  connectedRef?: React.RefObject<FormRef<T>>;
  interruptValidation?: boolean;
  children: (options: FormChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidateOptions<T>) => void;
  onChange?: (options: OnChangeOptions<T>) => void;
  onSubmit: (options: OnSubmitOptions<T>) => void;
};

function Form<T extends object>(props: FormProps<T>): React.ReactElement {
  const { initialFormValue, connectedRef, interruptValidation, children, onValidate, onChange, onSubmit } = props;
  const [formValue, setFormValue] = useState<T>(clone(initialFormValue));
  const [errors, setErrors] = useState<Record<string, string>>(null);
  const [inProcess, setInProcess] = useState(false);

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
  }, [modify]);

  const validate = useCallback(
    (formValue: T): Promise<boolean> => {
      return new Promise(async resolve => {
        let newErrors: Record<string, string> = null;
        const validationResults: Array<boolean> = [];
        const validators = scope.validators;

        if (validators.length === 0) {
          newErrors && setErrors(null);
          onValidate({ formValue, errors: null, isValid: true });

          return resolve(true);
        }

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

        onValidate({ formValue, errors: newErrors, isValid });
        resolve(isValid);
      });
    },
    [errors, onValidate],
  );

  const validateField = useCallback(
    (options: ValidateFieldOptions<T>): Promise<boolean> => {
      return new Promise(async resolve => {
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

        resolve(isValid);
      });
    },
    [errors],
  );

  const submit = useCallback(() => {
    setInProcess(true);
    validate(formValue).then(isValid => {
      isValid && onSubmit({ formValue });
      setInProcess(false);
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

  const scope = useMemo<FormScope<T>>(
    () => ({
      formValue,
      errors,
      inProcess: inProcess,
      modify,
      validate,
      validateField,
      submit,
      reset,
      addValidator,
      removeValidator,
      validators: [],
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

const FormComponent: React.FC<FormProps> = Form;

FormComponent.defaultProps = {
  onValidate: () => {},
  onChange: () => {},
};

const FormStateContext = createContext<FormStateContextValue>(null);

function useFormScope<T extends object>() {
  const value = useContext<FormStateContextValue<T>>(FormStateContext);

  return value;
}

function useFormState<T extends object>() {
  const { scope } = useContext<FormStateContextValue<T>>(FormStateContext);

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
  validators: Array<SyntheticValidator>;
  inProcess: boolean;
  addValidator: (validator: SyntheticValidator) => void;
  removeValidator: (validator: SyntheticValidator) => void;
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

export { Form, useFormScope, useFormState };

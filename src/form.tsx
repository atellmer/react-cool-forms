import React, { createContext, useContext, useMemo, useState, useImperativeHandle, useCallback } from 'react';

import { clone } from './utils';
import { type SyntheticValidator } from './validators';

export type FormProps<T extends object = any> = {
  initialValue: T;
  connectedRef?: React.RefObject<FormRef<T>>;
  interruptValidation?: boolean;
  children: (options: FormChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidationOptions<T>) => void;
  onChange?: (options: OnChangeOptions<T>) => void;
  onSubmit: (options: OnSubmitOptions<T>) => void;
};

function Form<T extends object>(props: FormProps<T>): React.ReactElement {
  const { initialValue, connectedRef, interruptValidation, children, onValidate, onChange, onSubmit } = props;
  const [formValue, setFormValue] = useState<T>(clone(initialValue));
  const [errors, setErrors] = useState<Record<string, string>>(null);
  const [isSubmiting, setIsSubmiting] = useState(false);

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
    modify(clone(initialValue));
  }, [onChange]);

  const validate = useCallback(
    (formValue: T): Promise<boolean> => {
      return new Promise(async resolve => {
        let errors: Record<string, string> = null;
        const validationResults: Array<boolean> = [];

        if (scope.validators.length === 0) {
          errors && setErrors(null);
          onValidate({ formValue, errors: null, isValid: true });

          return resolve(true);
        }

        for (const validator of scope.validators) {
          const isValid = await validator.fn({ formValue, value: validator.getValue(formValue) });

          validationResults.push(isValid);

          if (!isValid) {
            if (!errors) {
              errors = {};
            }
            errors[validator.name] = validator.message;
            if (interruptValidation) {
              break;
            }
          }
        }

        const isValid = validationResults.every(x => x);

        if (isValid) {
          errors && setErrors(null);
        } else {
          setErrors({ ...errors });
        }

        onValidate({ formValue, errors, isValid });
        resolve(isValid);
      });
    },
    [errors, onValidate],
  );

  const submit = useCallback(() => {
    setIsSubmiting(true);
    validate(formValue).then(isValid => {
      isValid && onSubmit({ formValue });
      setIsSubmiting(false);
    });
  }, [formValue]);

  const scope = useMemo<FormScope<T>>(
    () => ({ formValue, errors, isSubmiting, modify, validate, submit, reset, validators: [] }),
    [],
  );

  scope.formValue = formValue;
  scope.errors = errors;
  scope.isSubmiting = isSubmiting;
  scope.modify = modify;
  scope.validate = validate;
  scope.submit = submit;
  scope.reset = reset;

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
      {children({ formValue, errors, isSubmiting, reset, submit })}
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
  isSubmiting: boolean;
} & Pick<FormRef<T>, 'modify' | 'validate' | 'submit' | 'reset'>;

type FormStateContextValue<T extends object = any> = {
  scope: FormScope<T>;
};

type SharedCallbackOptions<T extends object> = {
  formValue: T;
};

type FormChildrenOptions<T extends object> = {
  errors: Record<string, string>;
  isSubmiting: boolean;
} & SharedCallbackOptions<T> &
  Pick<FormRef<T>, 'submit' | 'reset'>;

type OnSubmitOptions<T extends object> = {} & SharedCallbackOptions<T>;

type OnValidationOptions<T extends object> = {
  isValid: boolean;
  errors: Record<string, string> | null;
} & SharedCallbackOptions<T>;

type OnChangeOptions<T extends object> = {} & SharedCallbackOptions<T>;

export { Form, useFormScope, useFormState };

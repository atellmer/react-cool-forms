import React, { createContext, useContext, useMemo, useState, useImperativeHandle, useCallback } from 'react';

import { clone } from './utils';

export type FormProps<T extends object = any> = {
  initialValue: T;
  innerRef?: React.RefObject<FormRef<T>>;
  children: (options: FormChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidationOptions<T>) => void;
  onChange?: (options: OnChangeOptions<T>) => void;
  onSubmit: (options: OnSubmitOptions<T>) => void;
};

function Form<T extends object>(props: FormProps<T>): React.ReactElement {
  const { initialValue, innerRef, children, onValidate, onChange, onSubmit } = props;
  const [formValue, setFormValue] = useState<T>(clone(initialValue));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modify = useCallback(
    (formValue: T) => {
      const newFormValue = { ...formValue };

      setFormValue(newFormValue);
      onChange({ formValue: newFormValue });
    },
    [onChange],
  );

  const reset = useCallback(() => {
    modify(clone(initialValue));
  }, [onChange]);

  const validate = useCallback(
    (formValue: T): Promise<boolean> => {
      return new Promise(resolve => {
        const isValid = true;

        onValidate({ formValue, isValid });
        resolve(isValid);
      });
    },
    [onValidate],
  );

  const submit = useCallback(() => {
    validate(formValue).then(isValid => isValid && onSubmit({ formValue }));
  }, [formValue]);

  const scope = useMemo(() => ({ formValue, errors, modify, validate, submit, reset }), []);

  scope.formValue = formValue;
  scope.errors = errors;
  scope.modify = modify;
  scope.validate = validate;
  scope.submit = submit;
  scope.reset = reset;

  const value = useMemo<FormStateContextValue<T>>(() => ({ scope }), [formValue, errors]);

  useImperativeHandle(innerRef, () => ({
    getFormValue: () => formValue,
    modify,
    validate,
    submit,
    reset,
  }));

  return (
    <FormStateContext.Provider value={value}>
      {children({ formValue, errors, reset, submit })}
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
  validate: (formValue: T) => void;
  submit: () => void;
  reset: () => void;
};

export type FormScope<T extends object> = {
  formValue: T;
  errors: Record<string, string>;
} & Pick<FormRef<T>, 'modify' | 'validate' | 'submit' | 'reset'>;

type FormStateContextValue<T extends object = any> = {
  scope: FormScope<T>;
};

type SharedCallbackOptions<T extends object> = {
  formValue: T;
};

type FormChildrenOptions<T extends object> = {
  errors: Record<string, string>;
} & SharedCallbackOptions<T> &
  Pick<FormRef<T>, 'submit' | 'reset'>;

type OnSubmitOptions<T extends object> = {} & SharedCallbackOptions<T>;

type OnValidationOptions<T extends object> = {
  isValid: boolean;
} & SharedCallbackOptions<T>;

type OnChangeOptions<T extends object> = {} & SharedCallbackOptions<T>;

export { Form, useFormScope, useFormState };

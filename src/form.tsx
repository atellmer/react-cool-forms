import React, { createContext, useContext, useMemo, useState, useImperativeHandle, useCallback } from 'react';

export type FormProps<T extends object = any> = {
  initialValue: T;
  innerRef?: React.RefObject<FormRef>;
  children: (options: FormChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidationOptions<T>) => void;
  onChange?: (options: OnChangeOptions<T>) => void;
  onSubmit: (options: OnSubmitOptions<T>) => void;
};

export type FormRef = {};

function Form<T extends object>(props: FormProps<T>): React.ReactElement {
  const { initialValue, innerRef, children, onValidate, onChange, onSubmit } = props;
  const [formValue, setFormValue] = useState<T>(initialValue);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useImperativeHandle(innerRef, () => ({}));

  const modify = useCallback(
    (formValue: T) => {
      setFormValue(formValue);
      onChange({ formValue });
    },
    [onChange],
  );

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

  const value = useMemo<FormStateContextValue<T>>(
    () => ({
      formValue,
      errors,
      modify,
      validate,
      submit,
    }),
    [formValue, errors],
  );

  return <FormStateContext.Provider value={value}>{children({ formValue, modify, submit })}</FormStateContext.Provider>;
}

const FormComponent: React.FC<FormProps> = Form;

FormComponent.defaultProps = {
  onValidate: () => {},
  onChange: () => {},
};

const FormStateContext = createContext<FormStateContextValue>(null);

function useFormState<T extends object>() {
  const value = useContext<FormStateContextValue<T>>(FormStateContext);

  return value;
}

export type FormStateContextValue<T extends object = any> = {
  formValue: T;
  errors: Record<string, string>;
  modify: (formValue: T) => void;
  validate: (formValue: T) => void;
  submit: () => void;
};

type FormChildrenOptions<T> = {
  formValue: T;
  modify: (formValue: T) => void;
  submit: () => void;
};

type OnSubmitOptions<T> = {
  formValue: T;
};

type OnValidationOptions<T> = {
  formValue: T;
  isValid: boolean;
};

type OnChangeOptions<T> = {
  formValue: T;
};

export { Form, useFormState };

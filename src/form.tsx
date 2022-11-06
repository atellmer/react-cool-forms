import React, { createContext, useContext, useMemo, useState } from 'react';

export type FormProps<T extends object> = {
  initialValue: T;
  children: (options: FormChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidation) => void;
  onSubmit: (options: OnSubmitOptions<T>) => void;
};

function Form<T extends object>(props: FormProps<T>): React.ReactElement {
  const { initialValue, children } = props;
  const [formValue, setFormValue] = useState<T>(initialValue);
  const value = useMemo<FormStateContextValue<T>>(
    () => ({
      formValue,
    }),
    [formValue],
  );

  return <FormStateContext.Provider value={value}>{children({ formValue })}</FormStateContext.Provider>;
}

const FormStateContext = createContext<FormStateContextValue>(null);

function useFormState<T extends object>() {
  const value = useContext<FormStateContextValue<T>>(FormStateContext);

  return value;
}

type FormStateContextValue<T extends object = any> = {
  formValue: T;
};

type FormChildrenOptions<T> = {
  formValue: T;
};

type OnSubmitOptions<T> = {
  formValue: T;
};

type OnValidation = {
  isValid: boolean;
};

export { Form, useFormState };

import React, { useCallback, memo } from 'react';

import { useFormScope, FormScope } from './form';

export type FieldProps<T = unknown, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => T;
  setValue: (formValue: S, fieldValue: T) => void;
  children: (options: FieldChildrenOptions<T>) => React.ReactElement;
};

function Field<T, S extends object>(props: FieldProps<T, S>): React.ReactElement {
  const { name, getValue, setValue } = props;
  const { scope: formScope } = useFormScope<S>();
  const { formValue, errors } = formScope;
  const value = getValue(formValue);
  const error = errors[name] || null;
  const updatingKey = `${value}:${error}`;

  const handleChange = useCallback((value: T) => {
    const { formValue, modify } = formScope;

    setValue(formValue, value);
    modify(formValue);
  }, []);

  return (
    <FieldInner
      {...props}
      updatingKey={updatingKey}
      value={value}
      error={error}
      formScope={formScope}
      onChange={handleChange}
    />
  );
}

export type FieldInnerProps<T = unknown, S extends object = any> = {
  updatingKey: string;
  formScope: FormScope<S>;
} & FieldProps<T, S> &
  FieldChildrenOptions<T>;

const FieldInner = memo(
  function <T, S extends object>(props: FieldInnerProps<T, S>): React.ReactElement {
    const { value, error, formScope, children, onChange } = props;

    return children({ value, error, onChange });
  },
  (prevProps, nextProps) => prevProps.updatingKey === nextProps.updatingKey,
);

type FieldChildrenOptions<T = unknown> = {
  value: T;
  error: string | null;
  onChange: (value: T) => void;
};

export { Field };

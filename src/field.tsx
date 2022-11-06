import React, { useMemo, useCallback, memo } from 'react';

import { useFormState, FormStateContextValue } from './form';

export type FieldProps<T = unknown, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => T;
  setValue: (formValue: S, fieldValue: T) => void;
  children: (options: FieldChildrenOptions<T>) => React.ReactElement;
};

function Field<T, S extends object>(props: FieldProps<T, S>): React.ReactElement {
  const { name, getValue, setValue } = props;
  const formState = useFormState<S>();
  const { formValue, errors, modify } = formState;
  const value = useMemo(() => getValue(formValue), [formValue, getValue]);
  const error = errors[name] || null;
  const updatingKey = `${value}:${error}`;

  const handleChange = useCallback(
    (value: T) => {
      setValue(formValue, value);
      modify({ ...formValue });
    },
    [formValue, setValue],
  );

  return (
    <FieldInner
      {...props}
      updatingKey={updatingKey}
      value={value}
      error={error}
      formState={formState}
      onChange={handleChange}
    />
  );
}

export type FieldInnerProps<T = unknown, S extends object = any> = {
  updatingKey: string;
  formState: FormStateContextValue;
} & FieldProps<T, S> &
  FieldChildrenOptions<T>;

const FieldInner = memo(
  function <T, S extends object>(props: FieldInnerProps<T, S>): React.ReactElement {
    const { value, error, formState, children, onChange } = props;

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

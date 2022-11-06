import React, { useCallback, memo, useEffect, useMemo } from 'react';

import { useFormScope } from './form';
import { type FormValidator, type SyntheticFormValidator } from './validators';

export type FieldProps<T = any, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => T;
  setValue: (formValue: S, fieldValue: T) => void;
  validators?: Array<FormValidator<T, S>>;
  updatingKey?: string | number;
  children: (options: FieldChildrenOptions<T>) => React.ReactElement;
};

function Field<T, S extends object>(props: FieldProps<T, S>): React.ReactElement {
  const { name, getValue, setValue, validators = [], updatingKey: externalUpdatingKey = '' } = props;
  const { scope: formScope } = useFormScope<S>();
  const { formValue, errors, isSubmiting } = formScope;
  const value = getValue(formValue);
  const error = errors ? errors[name] || null : null;
  const valueID = useMemo(() => getNextValueID(), [value]);
  const updatingKey = `${externalUpdatingKey}:${valueID}:${error}:${isSubmiting}`;

  useEffect(() => {
    const syntheticValidators = validators.map(x => {
      const validator: SyntheticFormValidator = {
        ...x,
        name,
        getValue,
      };

      return validator;
    });
    formScope.validators.push(...syntheticValidators);

    return () => {
      const [validator] = syntheticValidators;
      const idx = formScope.validators.findIndex(x => x === validator);

      if (idx !== -1) {
        formScope.validators.splice(idx, validators.length);
      }
    };
  }, []);

  const handleChange = useCallback((value: T) => {
    const { formValue, modify } = formScope;

    setValue(formValue, value);
    modify(formValue);
  }, []);

  return <FieldInner {...props} updatingKey={updatingKey} value={value} error={error} onChange={handleChange} />;
}

export type FieldInnerProps<T = unknown, S extends object = any> = {
  updatingKey: string;
} & FieldProps<T, S> &
  FieldChildrenOptions<T>;

const FieldInner = memo(
  function <T, S extends object>(props: FieldInnerProps<T, S>): React.ReactElement {
    const { value, error, children, onChange } = props;

    return children({ value, error, onChange });
  },
  (prevProps, nextProps) => prevProps.updatingKey === nextProps.updatingKey,
);

type FieldChildrenOptions<T = unknown> = {
  value: T;
  error: string | null;
  onChange: (value: T) => void;
};

let nextValueID = 0;

const getNextValueID = () => ++nextValueID;

export { Field };

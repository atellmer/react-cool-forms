import React, { useCallback, memo, useEffect, useMemo, useRef } from 'react';

import { useFormScope } from './form';
import { type Validator, type SyntheticValidator, type OnValidateFieldOptions } from './validators';

export type FieldProps<T = unknown, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => T;
  setValue: (formValue: S, fieldValue: T) => void;
  validators?: Array<Validator<T, S>>;
  updatingKey?: string | number;
  children: (options: FieldChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidateFieldOptions) => void;
};

function Field<T, S extends object>(props: FieldProps<T, S>): React.ReactElement {
  const {
    name,
    getValue,
    setValue,
    validators: sourceValidators = [],
    updatingKey: externalUpdatingKey = '',
    onValidate,
  } = props;
  const { scope: formScope } = useFormScope<S>();
  const { formValue, errors, inProcess: isSubmiting, addValidator, removeValidator } = formScope;
  const nodeRef = useRef<HTMLElement>(null);
  const value = getValue(formValue);
  const error = errors ? errors[name] || null : null;
  const valueID = useMemo(() => getNextValueID(), [value]);
  const scope = useMemo(() => ({ nodeRef, onValidate }), []);
  const updatingKey = `${externalUpdatingKey}:${valueID}:${error}:${isSubmiting}`;

  scope.nodeRef = nodeRef;
  scope.onValidate = onValidate;

  useEffect(() => {
    const validators: Array<SyntheticValidator> = sourceValidators.map(validator => {
      return {
        ...validator,
        name,
        getValue,
        nodeRef: scope.nodeRef,
        onValidate: scope.onValidate,
      };
    });

    validators.forEach(x => addValidator(x));

    return () => {
      validators.forEach(x => removeValidator(x));
    };
  }, []);

  const handleChange = useCallback((value: T) => {
    const { formValue, modify } = formScope;

    setValue(formValue, value);
    modify(formValue);
  }, []);

  return (
    <FieldInner
      {...props}
      updatingKey={updatingKey}
      nodeRef={nodeRef}
      value={value}
      error={error}
      onChange={handleChange}
    />
  );
}

const FieldComponent: React.FC<FieldProps> = Field;

FieldComponent.defaultProps = {
  onValidate: () => {},
};

export type FieldInnerProps<T = unknown, S extends object = any> = {
  updatingKey: string;
} & FieldProps<T, S> &
  FieldChildrenOptions<T>;

const FieldInner = memo(
  function <T, S extends object>(props: FieldInnerProps<T, S>): React.ReactElement {
    const { nodeRef, value, error, children, onChange } = props;

    return children({ nodeRef, value, error, onChange });
  },
  (prevProps, nextProps) => prevProps.updatingKey === nextProps.updatingKey,
);

export type FieldChildrenOptions<T = unknown> = {
  value: T;
  error: string | null;
  onChange: (value: T) => void;
} & Pick<OnValidateFieldOptions, 'nodeRef'>;

let nextValueID = 0;

const getNextValueID = () => ++nextValueID;

export { Field, type OnValidateFieldOptions };

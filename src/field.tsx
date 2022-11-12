import React, { memo, useEffect, useMemo, useRef } from 'react';

import { type Validator, type Formatter, type SyntheticValidator, type OnValidateFieldOptions } from './types';
import { useFormContext } from './context';
import { useUpdate, useEvent } from './hooks';

export type FieldProps<T, S extends object> = {
  name: string;
  getValue: (formValue: S) => T;
  setValue: (formValue: S, fieldValue: T) => void;
  validators?: Array<Validator<T, S>>;
  formatter?: Formatter<T>;
  updatingKey?: string | number;
  enableOnChangeValidation?: boolean;
  children: (options: FieldChildrenOptions<T>) => React.ReactElement;
  onValidate?: (options: OnValidateFieldOptions<T>) => void;
};

function Field<T, S extends object>(props: FieldProps<T, S>): React.ReactElement {
  const {
    name,
    getValue,
    setValue,
    formatter,
    validators: fieldValidators = [],
    updatingKey: externalUpdatingKey = '',
    enableOnChangeValidation,
    onValidate,
  } = props;
  const { state: formState } = useFormContext<S>();
  const { formValue, errors, inProcess, addValidator, removeValidator, lift } = formState;
  const { update } = useUpdate();
  const value = getValue(formValue);
  const nodeRef = useRef<HTMLElement>(null);
  const error = errors ? errors[name] || null : null;
  const scope = useMemo<FieldScope<T>>(() => ({ validators: [] }), []);
  const formattedValue = useMemo(() => formatter({ prevValue: value, nextValue: value, node: null }), [value]);
  const valueID = useMemo(() => getNextValueID(), [formattedValue]);
  const updatingKey = `${externalUpdatingKey}:${valueID}:${error}:${inProcess}`;

  useEffect(() => {
    scope.validators = fieldValidators.map(validator => {
      return {
        ...validator,
        name,
        getValue,
        nodeRef,
        onValidate,
      };
    });
    scope.validators.forEach(x => addValidator(x));

    return () => {
      scope.validators.forEach(x => removeValidator(x));
      scope.validators = [];
    };
  }, [name]);

  useEffect(() => {
    return () => {
      lift({ from: 'validateField', value: { [name]: undefined } });
    };
  }, []);

  const handleChange = useEvent((value: T) => {
    const { formValue, notify } = formState;
    const newFormattedValue = formatter({
      prevValue: formattedValue,
      nextValue: value,
      node: nodeRef.current,
    });

    setValue(formValue, newFormattedValue);
    notify(formValue);
    update();
    enableOnChangeValidation && (async () => await validate())();
  });

  const validate = useEvent(async (): Promise<boolean> => {
    const { formValue, validateField } = formState;
    const validators = scope.validators;
    const isValid =
      validators.length === 0 ? await Promise.resolve(true) : await validateField({ name, formValue, validators });

    return isValid;
  });

  return (
    <FieldInner
      {...props}
      updatingKey={updatingKey}
      nodeRef={nodeRef}
      value={formattedValue}
      error={error}
      validate={validate}
      onChange={handleChange}
    />
  );
}

const FieldComponent: React.FC<FieldProps<unknown, {}>> = Field;

FieldComponent.defaultProps = {
  formatter: ({ nextValue }) => nextValue,
  onValidate: () => {},
};

type FieldScope<T> = {
  validators: Array<SyntheticValidator>;
};

export type FieldInnerProps<T, S extends object> = {
  updatingKey: string;
} & FieldProps<T, S> &
  FieldChildrenOptions<T>;

const FieldInner = memo(
  function <T, S extends object>(props: FieldInnerProps<T, S>): React.ReactElement {
    const { name, nodeRef, value, error, children, validate, onChange } = props;

    return children({ name, nodeRef, value, error, validate, onChange });
  },
  (prevProps, nextProps) => prevProps.updatingKey === nextProps.updatingKey,
);

export type FieldChildrenOptions<T> = {
  name: string;
  value: T;
  error: string | null;
  validate: () => Promise<boolean>;
  onChange: (value: T) => void;
} & Pick<OnValidateFieldOptions<T>, 'nodeRef'>;

let nextValueID = 0;

const getNextValueID = () => ++nextValueID;

export { Field, type OnValidateFieldOptions };

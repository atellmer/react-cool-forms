import React, { useCallback, memo, useEffect, useMemo, useRef } from 'react';

import { useFormContext } from './form';
import { type Validator, type SyntheticValidator, type OnValidateFieldOptions } from './validators';

export type FieldProps<T = unknown, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => T;
  setValue: (formValue: S, fieldValue: T) => void;
  validators?: Array<Validator<T, S>>;
  updatingKey?: string | number;
  enableOnChangeValidation?: boolean;
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
    enableOnChangeValidation,
    onValidate,
  } = props;
  const { scope: formScope } = useFormContext<S>();
  const { formValue, errors, inProcess, addValidator, removeValidator } = formScope;
  const nodeRef = useRef<HTMLElement>(null);
  const value = getValue(formValue);
  const error = errors ? errors[name] || null : null;
  const valueID = useMemo(() => getNextValueID(), [value]);
  const scope = useMemo<FieldScope>(() => ({ nodeRef, validators: [], onValidate }), []);
  const updatingKey = `${externalUpdatingKey}:${valueID}:${error}:${inProcess}`;

  scope.nodeRef = nodeRef;
  scope.onValidate = onValidate;

  const createValidators = () => {
    const validators: Array<SyntheticValidator> = sourceValidators.map(validator => {
      return {
        ...validator,
        name,
        getValue,
        nodeRef: scope.nodeRef,
        onValidate: scope.onValidate,
      };
    });

    return validators;
  };

  useEffect(() => {
    scope.validators = createValidators();
    scope.validators.forEach(x => addValidator(x));

    return () => {
      scope.validators.forEach(x => removeValidator(x));
      scope.validators = [];
    };
  }, []);

  const handleChange = useCallback(
    (value: T) => {
      const { formValue, modify, validateField } = formScope;
      const validators = scope.validators;

      setValue(formValue, value);
      modify(formValue);

      if (enableOnChangeValidation && validators.length > 0) {
        (async () => {
          await validateField({ name, formValue, validators });
        })();
      }
    },
    [name, enableOnChangeValidation],
  );

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

type FieldScope = {
  nodeRef: React.RefObject<any>;
  validators: Array<SyntheticValidator>;
  onValidate: (options: OnValidateFieldOptions) => void;
};

export type FieldInnerProps<T = unknown, S extends object = any> = {
  updatingKey: string;
} & FieldProps<T, S> &
  FieldChildrenOptions<T>;

const FieldInner = memo(
  function <T, S extends object>(props: FieldInnerProps<T, S>): React.ReactElement {
    const { name, nodeRef, value, error, children, onChange } = props;

    return children({ name, nodeRef, value, error, onChange });
  },
  (prevProps, nextProps) => prevProps.updatingKey === nextProps.updatingKey,
);

export type FieldChildrenOptions<T = unknown> = {
  name: string;
  value: T;
  error: string | null;
  onChange: (value: T) => void;
} & Pick<OnValidateFieldOptions, 'nodeRef'>;

let nextValueID = 0;

const getNextValueID = () => ++nextValueID;

export { Field, type OnValidateFieldOptions };

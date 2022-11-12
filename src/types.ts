import React from 'react';

export type Validator<T = unknown, S extends object = any> = {
  method: (options: ValidatorMethodOptions<T, S>) => boolean | Promise<boolean>;
  message: string;
  interrupt?: boolean;
};

export type SyntheticValidator<T = unknown, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => T;
  onValidate?: (options: OnValidateFieldOptions<T>) => void;
} & Validator &
  Partial<Pick<OnValidateFieldOptions<T>, 'nodeRef'>>;

export type ValidatorMethodOptions<T, S extends object> = {
  fieldValue: T;
  formValue: S;
};

export type OnValidateFieldOptions<T, N extends HTMLElement = any> = {
  nodeRef: React.RefObject<N> | null;
  isValid: boolean;
  fieldValue: T;
};

export type Formatter<T, N extends HTMLElement = any> = (options: FormatterOptions<T, N>) => T;

export type FormatterOptions<T, N> = {
  prevValue: T;
  nextValue: T;
  node: N | null;
};

import { type RefObject } from 'react';

export type Validator<T = unknown, S extends object = any> = {
  method: (options: ValidatorMethodOptions<T, S>) => boolean | Promise<boolean>;
  message: string;
};

export type SyntheticValidator<T = unknown, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => T;
  onValidate?: (options: OnValidateFieldOptions<T>) => void;
} & Validator &
  Partial<Pick<OnValidateFieldOptions<T>, 'nodeRef'>>;

type ValidatorMethodOptions<T, S extends object> = {
  fieldValue: T;
  formValue: S;
};

export type OnValidateFieldOptions<T> = {
  nodeRef: RefObject<any> | null;
  isValid: boolean;
  fieldValue: T;
};

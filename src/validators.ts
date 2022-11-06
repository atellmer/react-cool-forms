export type Validator<T = unknown, S extends object = any> = {
  fn: (options: ValidatorFnOptions<T, S>) => boolean | Promise<boolean>;
  message: string;
};

export type SyntheticValidator<T = unknown, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => T;
} & Validator;

type ValidatorFnOptions<T = unknown, S extends object = any> = {
  value: T;
  formValue: S;
};

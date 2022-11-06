export type FormValidator<T = unknown, S extends object = any> = {
  method: (options: ValidatorMethodOptions<T, S>) => boolean | Promise<boolean>;
  message: string;
};

export type SyntheticFormValidator<T = unknown, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => T;
} & FormValidator;

type ValidatorMethodOptions<T = unknown, S extends object = any> = {
  value: T;
  formValue: S;
};

import { createContext, useContext } from 'react';

import { type FormState } from './form';
import { CONTEXT_ERROR } from './utils';

export type FormContextValue<T extends object = any> = {
  state: FormState<T>;
};

const FormContext = createContext<FormContextValue>(null);

function useFormContext<T extends object>() {
  const value = useContext<FormContextValue<T>>(FormContext);

  if (!value) {
    throw new Error(CONTEXT_ERROR);
  }

  return value;
}

export { FormContext, useFormContext };

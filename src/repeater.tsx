import React, { useRef, useEffect } from 'react';

import { Form, useFormContext, type OnChangeOptions, type FormRef, type FormChildrenOptions } from './form';
import { detecIsFunction } from './utils';
import { type SyntheticValidator } from './validators';

export type RepeaterProps<P extends object, T extends Array<any>, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => T;
  setValue: (formValue: S, fieldValue: T) => void;
  getKey?: (formValue: S) => string | number;
  interruptValidation?: boolean;
  children: (options: RepeaterChildrenOptions<P>) => React.ReactElement;
};

function Repeater<P extends object, T extends Array<P>>(props: RepeaterProps<P, T>): React.ReactElement {
  const { name, getValue, setValue, getKey, interruptValidation, children } = props;
  const { scope: formScope } = useFormContext();
  const { formValue, modify, addValidator, removeValidator, addResetFn, removeResetFn } = formScope;
  const items = getValue(formValue);
  const formRefs = useRef<Array<FormRef<any>>>([]);

  useEffect(() => {
    const method = async () => {
      const results: Array<boolean> = [];

      for (const formRef of formRefs.current) {
        const isValid = await formRef.validate(formRef.getFormValue());

        results.push(isValid);

        if (!isValid && interruptValidation) {
          break;
        }
      }

      const isValid = results.every(x => x);

      return isValid;
    };

    const validator: SyntheticValidator = {
      method,
      message: '',
      name,
      getValue: () => null,
    };

    addValidator(validator);

    return () => removeValidator(validator);
  }, []);

  useEffect(() => {
    const resetFn = () => {
      for (const formRef of formRefs.current) {
        formRef.reset();
      }
    };

    addResetFn(resetFn);

    return () => removeResetFn(resetFn);
  }, []);

  const handleChange =
    (idx: number) =>
    ({ formValue: item }: OnChangeOptions<P>) => {
      const items = getValue(formValue);

      items[idx] = item;
      setValue(formValue, items);
      modify(formValue);
    };

  return (
    <>
      {items.map((item, idx) => {
        const key = detecIsFunction(getKey) ? getKey(item) : idx;

        return (
          <Form
            key={key}
            connectedRef={ref => (formRefs.current[idx] = ref)}
            initialFormValue={item}
            onChange={handleChange(idx)}
            onSubmit={() => {}}>
            {({ formValue, inProcess }) => {
              return children({ formValue, inProcess });
            }}
          </Form>
        );
      })}
    </>
  );
}

export type RepeaterChildrenOptions<P extends object> = {} & Pick<FormChildrenOptions<P>, 'formValue' | 'inProcess'>;

export { Repeater };

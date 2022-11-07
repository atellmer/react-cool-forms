import React, { useRef, useEffect } from 'react';

import { Form, useFormContext, type OnChangeOptions, type FormRef, type FormChildrenOptions } from './form';
import { detecIsFunction, dummy } from './utils';
import { type SyntheticValidator } from './validators';

export type RepeaterProps<T extends object, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => Array<T>;
  setValue: (formValue: S, fieldValue: Array<T>) => void;
  getKey: (formValue: T) => string | number;
  interruptValidation?: boolean;
  addTringgerPosition?: 'before' | 'after';
  renderAddTrigger?: (options: RenderAddTriggerOptions<T>) => React.ReactElement;
  children: (options: RepeaterChildrenOptions<T>) => React.ReactElement;
};

function Repeater<T extends object, S extends object>(props: RepeaterProps<T, S>): React.ReactElement {
  const { name, getValue, setValue, getKey, interruptValidation, renderAddTrigger, addTringgerPosition, children } =
    props;
  const { scope: formScope } = useFormContext<S>();
  const { formValue, modify, inProcess, addValidator, removeValidator, addResetFn, removeResetFn } = formScope;
  const items = getValue(formValue);
  const formRefs = useRef<Array<FormRef<any>>>([]);

  useEffect(() => {
    const method = async () => {
      const results: Array<boolean> = [];
      const refs = formRefs.current.filter(Boolean);

      for (const ref of refs) {
        const isValid = await ref.validate(ref.getFormValue());

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
      const refs = formRefs.current.filter(Boolean);

      for (const ref of refs) {
        ref.reset();
      }
    };

    addResetFn(resetFn);

    return () => removeResetFn(resetFn);
  }, []);

  const handleUnmount = (idx: number) => () => {
    formRefs.current.splice(idx, 1);
  };

  const handleChange =
    (idx: number) =>
    ({ formValue: item }: OnChangeOptions<T>) => {
      const items = getValue(formValue);

      items[idx] = item;
      setValue(formValue, items);
      modify(formValue);
    };

  const add = (item: T) => {
    const items = getValue(formValue);

    items.push(item);
    setValue(formValue, items);
    modify(formValue);
  };

  const remove = (idx: number) => {
    const items = getValue(formValue);

    items.splice(idx, 1);
    setValue(formValue, items);
    modify(formValue);
  };

  const isAfter = addTringgerPosition === 'after';
  const isBefore = !isAfter;
  const isSingle = items.length === 1;
  const size = items.length;

  return (
    <>
      {isBefore && detecIsFunction(renderAddTrigger) && renderAddTrigger({ add, inProcess })}
      {items.map((item, idx) => {
        const key = getKey(item);
        const isFirst = idx === 0;
        const isLast = idx === items.length - 1;
        const isEven = idx % 2 === 0;
        const isOdd = !isEven;

        return (
          <Form
            key={key}
            connectedRef={ref => (formRefs.current[idx] = ref)}
            initialFormValue={item}
            onChange={handleChange(idx)}
            onUnmount={handleUnmount(idx)}
            onSubmit={dummy}>
            {({ formValue, inProcess }) => {
              return children({ idx, isFirst, isLast, isEven, isOdd, isSingle, size, formValue, inProcess, remove });
            }}
          </Form>
        );
      })}
      {isAfter && detecIsFunction(renderAddTrigger) && renderAddTrigger({ add, inProcess })}
    </>
  );
}

const RepeaterComponent: React.FC<RepeaterProps<any, any>> = Repeater;

RepeaterComponent.defaultProps = {
  addTringgerPosition: 'after',
};

export type RepeaterChildrenOptions<T extends object> = {
  idx: number;
  isFirst: boolean;
  isLast: boolean;
  isEven: boolean;
  isOdd: boolean;
  isSingle: boolean;
  size: number;
  remove: (idx: number) => void;
} & Pick<FormChildrenOptions<T>, 'formValue' | 'inProcess'>;

export type RenderAddTriggerOptions<T extends object> = {
  add: (item: T) => void;
} & Pick<FormChildrenOptions<T>, 'inProcess'>;

export { Repeater };

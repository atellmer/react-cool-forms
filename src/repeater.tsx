import React, { useRef, useEffect, useMemo } from 'react';

import { Form, useFormContext, type OnChangeOptions, type FormRef, type FormChildrenOptions } from './form';
import { detecIsFunction, dummy } from './utils';
import { type SyntheticValidator } from './validators';

export type RepeaterProps<T extends object, S extends object = any> = {
  name: string;
  getValue: (formValue: S) => Array<T>;
  setValue: (formValue: S, fieldValue: Array<T>) => void;
  getKey: (formValue: T) => string | number;
  interruptValidation?: boolean;
  tringgerPosition?: 'before' | 'after';
  renderTrigger?: (options: RenderTriggerOptions<T>) => React.ReactElement;
  children: (options: RepeaterChildrenOptions<T>) => React.ReactElement;
};

function Repeater<T extends object, S extends object>(props: RepeaterProps<T, S>): React.ReactElement {
  const { name, getValue, setValue, getKey, interruptValidation, renderTrigger, tringgerPosition, children } = props;
  const { scope: formScope } = useFormContext<S>();
  const { formValue, modify, inProcess, addValidator, removeValidator, addResetFn, removeResetFn } = formScope;
  const items = getValue(formValue);
  const formRefs = useRef<Array<FormRef<any>>>([]);
  const scope = useMemo(() => ({ shouldFocusIdx: -1 }), []);

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

  useEffect(() => {
    scope.shouldFocusIdx = -1;
  });

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

  const append = (item: T, shouldFocus?: boolean) => {
    const items = getValue(formValue);

    items.push(item);
    setValue(formValue, items);
    modify(formValue);
    shouldFocus && (scope.shouldFocusIdx = items.length - 1);
  };

  const prepend = (item: T, shouldFocus?: boolean) => {
    const items = getValue(formValue);

    items.unshift(item);
    setValue(formValue, items);
    modify(formValue);
    shouldFocus && (scope.shouldFocusIdx = 0);
  };

  const insert = (idx: number, item: T, shouldFocus?: boolean) => {
    const items = getValue(formValue);

    items.splice(idx, 0, item);
    setValue(formValue, items);
    modify(formValue);
    shouldFocus && (scope.shouldFocusIdx = idx);
  };

  const swap = (from: number, to: number) => {
    const items = getValue(formValue);
    const itemFrom = items[from];
    const itemTo = items[to];

    if (!itemFrom || !itemTo) return;

    items[from] = itemTo;
    items[to] = itemFrom;
    setValue(formValue, items);
    modify(formValue);
  };

  const remove = (sourceIdx: number | Array<number>) => {
    const idxs = Array.isArray(sourceIdx) ? sourceIdx : [sourceIdx];
    const items = getValue(formValue);

    for (const idx of idxs) {
      items.splice(idx, 1);
    }

    setValue(formValue, items);
    modify(formValue);
  };

  const isAfter = tringgerPosition === 'after';
  const isBefore = !isAfter;
  const isSingle = items.length === 1;
  const size = items.length;

  return (
    <>
      {isBefore &&
        detecIsFunction(renderTrigger) &&
        renderTrigger({ size, append, prepend, insert, swap, remove, inProcess })}
      {items.map((item, idx) => {
        const key = getKey(item);
        const isFirst = idx === 0;
        const isLast = idx === items.length - 1;
        const isEven = idx % 2 === 0;
        const isOdd = !isEven;
        const shouldFocus = scope.shouldFocusIdx === idx;

        return (
          <Form
            key={key}
            connectedRef={ref => (formRefs.current[idx] = ref)}
            initialFormValue={item}
            onChange={handleChange(idx)}
            onUnmount={handleUnmount(idx)}
            onSubmit={dummy}>
            {({ formValue, inProcess }) => {
              return children({
                idx,
                isFirst,
                isLast,
                isEven,
                isOdd,
                isSingle,
                size,
                shouldFocus,
                formValue,
                inProcess,
                remove,
              });
            }}
          </Form>
        );
      })}
      {isAfter &&
        detecIsFunction(renderTrigger) &&
        renderTrigger({ size, append, prepend, insert, swap, remove, inProcess })}
    </>
  );
}

const RepeaterComponent: React.FC<RepeaterProps<any, any>> = Repeater;

RepeaterComponent.defaultProps = {
  tringgerPosition: 'after',
};

export type RepeaterChildrenOptions<T extends object> = {
  idx: number;
  isFirst: boolean;
  isLast: boolean;
  isEven: boolean;
  isOdd: boolean;
  isSingle: boolean;
  size: number;
  shouldFocus: boolean;
  remove: (idx: number | Array<number>) => void;
} & Pick<FormChildrenOptions<T>, 'formValue' | 'inProcess'>;

export type RenderTriggerOptions<T extends object> = {
  size: number;
  append: (item: T, shouldFocus?: boolean) => void;
  prepend: (item: T, shouldFocus?: boolean) => void;
  insert: (idx: number, item: T, shouldFocus?: boolean) => void;
  remove: (idx: number | Array<number>) => void;
  swap: (from: number, to: number) => void;
} & Pick<FormChildrenOptions<T>, 'inProcess'>;

export { Repeater };

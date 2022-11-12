import React, { useRef, useEffect, useMemo, useImperativeHandle } from 'react';

import { type SyntheticValidator } from './types';
import { useFormContext } from './context';
import { Form, type OnChangeOptions, type FormRef, type FormChildrenOptions } from './form';
import { HAS_REPEATER_VALIDATION_ERROR, detecIsFunction, dummy, transformOjectToArray } from './utils';
import { useEvent } from './hooks';

export type RepeaterProps<T extends object, S extends object> = {
  name: string;
  connectedRef?: React.Ref<RepeaterRef<T>>;
  getValue: (formValue: S) => Array<T>;
  setValue: (formValue: S, fieldValue: Array<T>) => void;
  getKey: (formValue: T) => Key;
  interrupt?: boolean;
  triggerPosition?: 'before' | 'after';
  renderTrigger?: (options: RenderTriggerOptions<T>) => React.ReactElement;
  children: (options: RepeaterChildrenOptions<T>) => React.ReactElement;
};

function Repeater<T extends object, S extends object>(props: RepeaterProps<T, S>): React.ReactElement {
  const { name, connectedRef, getValue, setValue, getKey, interrupt, renderTrigger, triggerPosition, children } = props;
  const { state: formState } = useFormContext<S>();
  const { formValue, modify, notify, inProcess, addValidator, removeValidator, addResetFn, removeResetFn, lift } =
    formState;
  const items = getValue(formValue);
  const formRefs = useRef<Record<string, FormRef<T>>>({});
  const scope = useMemo(() => ({ shouldFocusIdx: -1 }), []);

  useEffect(() => {
    const method = async () => {
      const results: Array<boolean> = [];
      const refs = transformOjectToArray(formRefs.current);

      for (const ref of refs) {
        const isValid = await ref.validate(ref.getFormValue(), true);

        results.push(isValid);

        if (!isValid && interrupt) {
          break;
        }
      }

      const isValid = results.every(x => x);

      return isValid;
    };

    const validator: SyntheticValidator = {
      name,
      method,
      message: HAS_REPEATER_VALIDATION_ERROR,
      getValue: () => null,
    };

    addValidator(validator);

    return () => removeValidator(validator);
  }, []);

  useEffect(() => {
    const resetFn = () => {
      const refs = transformOjectToArray(formRefs.current);

      refs.forEach(ref => ref.reset());
    };

    addResetFn(resetFn);

    return () => removeResetFn(resetFn);
  }, []);

  useEffect(() => {
    scope.shouldFocusIdx = -1;
  });

  const handleUnmount = (key: Key) => () => {
    delete formRefs.current[key];
  };

  const handleChange =
    (idx: number) =>
    ({ formValue: item }: OnChangeOptions<T>) => {
      const items = getValue(formValue);

      items[idx] = item;
      setValue(formValue, items);
      notify(formValue);
    };

  const append = useEvent((item: T, shouldFocus?: boolean) => {
    const items = getValue(formValue);

    items.push(item);
    setValue(formValue, items);
    modify(formValue);
    shouldFocus && (scope.shouldFocusIdx = items.length - 1);
  });

  const prepend = useEvent((item: T, shouldFocus?: boolean) => {
    const items = getValue(formValue);

    items.unshift(item);
    setValue(formValue, items);
    modify(formValue);
    shouldFocus && (scope.shouldFocusIdx = 0);
  });

  const insert = useEvent((idx: number, item: T, shouldFocus?: boolean) => {
    const items = getValue(formValue);

    items.splice(idx, 0, item);
    setValue(formValue, items);
    modify(formValue);
    shouldFocus && (scope.shouldFocusIdx = idx);
  });

  const swap = useEvent((from: number, to: number) => {
    const items = getValue(formValue);
    const itemFrom = items[from];
    const itemTo = items[to];

    if (!itemFrom || !itemTo) return;

    items[from] = itemTo;
    items[to] = itemFrom;
    setValue(formValue, items);
    modify(formValue);
  });

  const remove = useEvent((sourceIdx: number | Array<number>) => {
    const idxs = Array.isArray(sourceIdx) ? sourceIdx : [sourceIdx];
    const items = getValue(formValue);

    for (const idx of idxs) {
      items.splice(idx, 1);
    }

    setValue(formValue, items);
    modify(formValue);
  });

  useImperativeHandle(connectedRef, () => {
    const ref: RepeaterRef<T> = {
      append,
      prepend,
      insert,
      swap,
      remove,
    };

    return ref;
  });

  const isAfter = triggerPosition === 'after';
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
        const setRef = (ref: FormRef<T>) => {
          formRefs.current[key] = ref;
        };

        return (
          <Form
            key={key}
            connectedRef={setRef}
            initialFormValue={item}
            onChange={handleChange(idx)}
            onUnmount={handleUnmount(key)}
            onLift={lift}
            onSubmit={dummy}>
            {({ formValue, errors, inProcess }) => {
              return children({
                key,
                idx,
                isFirst,
                isLast,
                isEven,
                isOdd,
                isSingle,
                size,
                shouldFocus,
                formValue,
                errors,
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

const RepeaterComponent: React.FC<RepeaterProps<{}, {}>> = Repeater;

RepeaterComponent.defaultProps = {
  triggerPosition: 'after',
};

export type RepeaterChildrenOptions<T extends object> = {
  key: Key;
  idx: number;
  isFirst: boolean;
  isLast: boolean;
  isEven: boolean;
  isOdd: boolean;
  isSingle: boolean;
  size: number;
  shouldFocus: boolean;
  remove: (idx: number | Array<number>) => void;
} & Pick<FormChildrenOptions<T>, 'formValue' | 'errors' | 'inProcess'>;

export type RenderTriggerOptions<T extends object> = {
  size: number;
  append: (item: T, shouldFocus?: boolean) => void;
  prepend: (item: T, shouldFocus?: boolean) => void;
  insert: (idx: number, item: T, shouldFocus?: boolean) => void;
  swap: (from: number, to: number) => void;
} & Pick<FormChildrenOptions<T>, 'inProcess'> &
  Pick<RepeaterChildrenOptions<T>, 'remove'>;

export type RepeaterRef<T extends object> = {} & Pick<
  RenderTriggerOptions<T>,
  'append' | 'prepend' | 'insert' | 'swap' | 'remove'
>;

type Key = string | number;

export { Repeater };

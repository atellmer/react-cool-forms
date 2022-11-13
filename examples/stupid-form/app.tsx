import React from 'react';
import styled from 'styled-components';
import {
  Form,
  Field,
  Repeater,
  Debugger,
  type Validator,
  type RenderTriggerOptions,
  type OnSubmitOptions,
  type FormatterOptions,
} from 'react-cool-forms';

import { masked, formatCurrency as formatCurrencyFn, transformCurrencyStringToNumber } from './utils';
import { TextField } from './components/text-field';
import { Checkbox } from './components/checkbox';
import { Button } from './components/button';
import { IconButton } from './components/icon-button';
import { SelectField } from './components/select-field';

export type AppProps = {};

const App: React.FC<AppProps> = () => {
  const initialFormValue: MyForm = {
    name: 'Alex',
    address: '',
    phone: '',
    payTip: false,
    tip: 0,
    items: [],
  };

  const handleSubmit = ({ formValue }: OnSubmitOptions<MyForm>) => {
    alert(JSON.stringify(formValue, null, 2));
  };

  const renderTrigger = ({ append, size }: RenderTriggerOptions<OrderItem>) => {
    const isLimit = size >= 3;

    return (
      <TriggerLayout>
        <span>
          count: {size} {isLimit ? '(maximum limit reached 🙃)' : ''}
        </span>
        <Button disabled={isLimit} onClick={() => append({ ID: getNextItemID(), name: '', fruit: null })}>
          Add item
        </Button>
      </TriggerLayout>
    );
  };

  return (
    <Root>
      <Content>
        <Form name='stupidForm' initialFormValue={initialFormValue} validators={[hasItems]} onSubmit={handleSubmit}>
          {({ formValue, errors, submit, reset }) => {
            const hasRootError = errors && errors['stupidForm'] && formValue.items.length === 0;

            return (
              <>
                <h1>The stupid form 🥳 {hasRootError ? '(You should add item 😈)' : ''}</h1>
                <div>
                  <Field
                    name='name'
                    getValue={(x: MyForm) => x.name}
                    setValue={(x, v) => (x.name = v)}
                    enableOnChangeValidation
                    validators={[required]}>
                    {({ value, error, onChange }) => (
                      <TextField
                        label='Name 😊'
                        placeholder='Enter the name...'
                        value={value}
                        error={error}
                        onChange={onChange}
                      />
                    )}
                  </Field>
                  <HorizontalLayout>
                    <Field
                      name='address'
                      getValue={(x: MyForm) => x.address}
                      setValue={(x, v) => (x.address = v)}
                      enableOnChangeValidation
                      validators={[required]}>
                      {({ value, error, onChange }) => (
                        <TextField
                          label='Delivery address'
                          placeholder='Enter the address...'
                          value={value}
                          error={error}
                          onChange={onChange}
                        />
                      )}
                    </Field>
                    <Field
                      name='phone'
                      getValue={(x: MyForm) => x.phone}
                      setValue={(x, v) => (x.phone = v)}
                      enableOnChangeValidation
                      formatter={formatPhone}
                      validators={[required, isPhone]}>
                      {({ value, error, nodeRef, onChange }) => (
                        <TextField
                          ref={nodeRef}
                          label='Phone number'
                          placeholder='+0-000-000-0000'
                          value={value}
                          error={error}
                          onChange={onChange}
                        />
                      )}
                    </Field>
                  </HorizontalLayout>

                  <Field
                    name='payTip'
                    getValue={(x: MyForm) => x.payTip}
                    setValue={(x, v) => ((x.payTip = v), (x.tip = v ? x.tip : 0))}>
                    {({ value, onChange }) => (
                      <>
                        <Checkbox label=' Pay tip?' value={value} onChange={onChange} />
                        {value && (
                          <Field
                            name='tip'
                            getValue={(x: MyForm) => x.tip}
                            setValue={(x, v) => (x.tip = v as number)}
                            enableOnChangeValidation
                            formatter={formatCurrency}
                            validators={[required, isSmallTip, isBigTip]}>
                            {({ value, error, notify, onChange }) => (
                              <TextField
                                label='Tip (wait, what for? 🤪)'
                                value={value}
                                error={error}
                                onChange={onChange}
                                onFocus={() => {
                                  transformCurrencyStringToNumber(value) === 0 && notify('');
                                }}
                                onBlur={() => {
                                  notify(transformCurrencyStringToNumber(value));
                                }}
                              />
                            )}
                          </Field>
                        )}
                      </>
                    )}
                  </Field>
                  <RepeaterLayout>
                    <Repeater
                      name='items'
                      getValue={(x: MyForm) => x.items}
                      setValue={(x, v) => (x.items = v)}
                      getKey={x => x.ID}
                      renderTrigger={renderTrigger}>
                      {({ idx, key, remove }) => {
                        return (
                          <Item>
                            <Field
                              name={`items(${key}).name`}
                              getValue={(x: OrderItem) => x.name}
                              setValue={(x: OrderItem, v) => (x.name = v)}
                              enableOnChangeValidation
                              updatingKey={idx}
                              formatter={formatUppercase}
                              validators={[required]}>
                              {({ value, error, onChange }) => (
                                <TextField
                                  placeholder='Enter the name of your best friend...'
                                  value={value}
                                  error={error}
                                  onChange={onChange}
                                />
                              )}
                            </Field>
                            <Field
                              name={`items(${key}).fruit`}
                              getValue={(x: OrderItem) => x.fruit}
                              setValue={(x: OrderItem, v) => (x.fruit = v)}
                              enableOnChangeValidation
                              updatingKey={idx}
                              validators={[required as unknown as Validator<Fruit>, isHeNormal]}>
                              {({ value, error, onChange }) => (
                                <SelectField
                                  value={value}
                                  getID={(x: Fruit) => x.ID}
                                  getName={(x: Fruit) => x.name}
                                  dataSource={fruits}
                                  error={error}
                                  emptyChoice='He loves this fruit 😊'
                                  onChange={onChange}
                                />
                              )}
                            </Field>
                            <IconButton variant='delete' onClick={() => remove(idx)} />
                          </Item>
                        );
                      }}
                    </Repeater>
                  </RepeaterLayout>
                </div>
                <ControlsLayout>
                  <Button onClick={reset}>Reset</Button>
                  <Button onClick={submit}>Submit</Button>
                </ControlsLayout>
                <Debugger />
              </>
            );
          }}
        </Form>
      </Content>
    </Root>
  );
};

type MyForm = {
  name: string;
  address: string;
  phone: string;
  payTip: boolean;
  tip: number;
  items: Array<OrderItem>;
};

type OrderItem = {
  ID: number;
  name: string;
  fruit: Fruit;
};

type Fruit = {
  ID: number;
  name: string;
};

const hasItems: Validator<MyForm, MyForm> = {
  method: ({ fieldValue }) => fieldValue.items.length > 0,
  message: `You should add item`,
};

const required: Validator<string> = {
  method: ({ fieldValue }) => Boolean(fieldValue),
  message: `It's required field`,
};

const isPhone: Validator<string> = {
  method: ({ fieldValue }) => fieldValue.length === 15,
  message: `Phone number is incorrect`,
};

const isSmallTip: Validator<number | string> = {
  method: ({ fieldValue }) => transformCurrencyStringToNumber(fieldValue) < 20,
  message: `This tip is too big`,
};

const isBigTip: Validator<number | string> = {
  method: ({ fieldValue }) => transformCurrencyStringToNumber(fieldValue) > 1,
  message: `This tip is too small`,
};

const isHeNormal: Validator<Fruit> = {
  method: ({ fieldValue }) => fieldValue?.ID !== 6,
  message: 'Is he normal?',
};

const formatPhone = (options: FormatterOptions<string, HTMLInputElement>) => {
  const { prevValue, nextValue } = options;
  const mask = ['+', /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  return masked({ mask, prevValue, nextValue });
};

const formatCurrency = (options: FormatterOptions<string | number, HTMLInputElement>) => {
  const { nextValue } = options;

  return formatCurrencyFn(nextValue);
};

const formatUppercase = (options: FormatterOptions<string, HTMLInputElement>) => {
  const { nextValue } = options;

  return nextValue.toUpperCase();
};

let nextitemID = 0;

const getNextItemID = () => ++nextitemID;

const fruits: Array<Fruit> = [
  { ID: 1, name: 'Banana 🍌' },
  { ID: 2, name: 'Orange 🍊' },
  { ID: 3, name: 'Apple 🍎' },
  { ID: 4, name: 'Cherry 🍒' },
  { ID: 5, name: 'Watermelon 🍉' },
  { ID: 6, name: `Doesn't like it 🥴` },
];

const Root = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  max-width: 800px;
  padding: 16px;
  margin: 0 auto;
`;

const Content = styled.div`
  width: 100%;
  padding: 16px;
  border: 2px solid #8eacbb;
`;

const ControlsLayout = styled.div`
  width: 100%;
  padding: 16px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`;

const HorizontalLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    margin-bottom: 12px;

    & .text-field {
      margin-bottom: 0;
    }
  }
`;

const RepeaterLayout = styled.div`
  padding: 16px;
  background-color: #dcedc8;
`;

const TriggerLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
`;

const Item = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 0.5fr 32px;
  grid-gap: 16px;
  align-items: start;
  padding: 8px 0;
  margin-bottom: 8px;

  & .text-field {
    margin-bottom: 0;
  }
`;

export { App };

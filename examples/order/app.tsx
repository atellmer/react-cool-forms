import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  Form,
  Field,
  Repeater,
  Debugger,
  type Validator,
  type RepeaterRef,
  type RenderTriggerOptions,
  type OnSubmitOptions,
  type FormatterOptions,
} from 'react-cool-forms';

import { masked, formatCurrency as formatCurrencyFn, transformCurrencyStringToNumber } from './utils';
import { TextField } from './components/text-field';
import { Checkbox } from './components/checkbox';
import { Button } from './components/button';
import { IconButton } from './components/icon-button';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
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
        <Button disabled={isLimit} onClick={() => append({ ID: getNextItemID(), name: '' })}>
          Add item
        </Button>
      </TriggerLayout>
    );
  };

  return (
    <Root>
      <Content>
        <Form initialFormValue={initialFormValue} onSubmit={handleSubmit}>
          {({ formValue, submit, reset }) => {
            return (
              <>
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
                            validators={[required, isSmallTip]}>
                            {({ value, error, notify, onChange }) => (
                              <TextField
                                label='Tip'
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
                          <Field
                            name={`items(${key}).name`}
                            getValue={(x: OrderItem) => x.name}
                            setValue={(x: OrderItem, v) => (x.name = v)}
                            enableOnChangeValidation
                            updatingKey={idx}
                            formatter={formatUppercase}
                            validators={[required]}>
                            {({ value, error, onChange }) => (
                              <Item>
                                <TextField
                                  placeholder='Enter the item name (uppercased)...'
                                  value={value}
                                  error={error}
                                  onChange={onChange}
                                />
                                <IconButton variant='delete' onClick={() => remove(idx)} />
                              </Item>
                            )}
                          </Field>
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
    grid-template-rows: 48px 48px;
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
  grid-template-columns: 1fr 32px;
  grid-gap: 16px;
  align-items: start;
  padding: 8px 0;
  margin-bottom: 8px;

  & .text-field {
    margin-bottom: 0;
  }
`;

export { App };

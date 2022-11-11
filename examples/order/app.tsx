import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Form, Field, Repeater, Debugger, type Validator, type RepeaterRef } from 'react-cool-forms';

import { masked } from './utils';
import { TextField } from './components/text-field';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const initialFormValue: MyForm = {
    name: 'Alex',
    address: '',
    phone: '',
  };

  return (
    <Root>
      <Content>
        <Form initialFormValue={initialFormValue} onSubmit={() => {}}>
          {() => {
            return (
              <>
                <div>
                  <Field
                    name='name'
                    getValue={(x: MyForm) => x.name}
                    setValue={(x, v) => (x.name = v)}
                    enableOnChangeValidation
                    validators={[required as Validator<string, MyForm>]}>
                    {({ value, error, onChange }) => (
                      <TextField label='Name' value={value} error={error} onChange={onChange} />
                    )}
                  </Field>
                  <Field
                    name='address'
                    getValue={(x: MyForm) => x.address}
                    setValue={(x, v) => (x.address = v)}
                    enableOnChangeValidation
                    validators={[required as Validator<string, MyForm>]}>
                    {({ value, error, onChange }) => (
                      <TextField label='Delivery address' value={value} error={error} onChange={onChange} />
                    )}
                  </Field>
                  <Field
                    name='phone'
                    getValue={(x: MyForm) => x.phone}
                    setValue={(x, v) => (x.phone = v)}
                    formatter={formatPhone}
                    enableOnChangeValidation
                    validators={[required as Validator<string, MyForm>]}>
                    {({ value, error, onChange }) => (
                      <TextField
                        label='Phone number'
                        placeholder='+0-000-000-0000'
                        value={value}
                        error={error}
                        onChange={onChange}
                      />
                    )}
                  </Field>
                </div>
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
};

const required: Validator = {
  method: ({ fieldValue }) => Boolean(fieldValue),
  message: `It's required field`,
};

const formatPhone = (prevValue: string, nextValue: string) => {
  const mask = ['+', /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  return masked({ mask, prevValue, nextValue });
};

const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  max-width: 800px;
  padding: 16px;
  margin: 0 auto;
`;

const Content = styled.div`
  width: 100%;
  padding: 16px;
  border: 1px solid #7c43bd;
`;

export { App };

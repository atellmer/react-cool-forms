import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  Form,
  Field,
  Repeater,
  Debugger,
  type Validator,
  type RepeaterRef,
  type OnSubmitOptions,
  type FormatterOptions,
} from 'react-cool-forms';

import { masked } from './utils';
import { TextField } from './components/text-field';
import { Button } from './components/button';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const initialFormValue: MyForm = {
    name: 'Alex',
    address: '',
    phone: '',
  };

  const handleSubmit = ({ formValue }: OnSubmitOptions<MyForm>) => {
    alert(JSON.stringify(formValue, null, 2));
  };

  return (
    <Root>
      <Content>
        <Form initialFormValue={initialFormValue} onSubmit={handleSubmit}>
          {({ submit, reset }) => {
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
                      <TextField label='Name' value={value} error={error} onChange={onChange} />
                    )}
                  </Field>
                  <Field
                    name='address'
                    getValue={(x: MyForm) => x.address}
                    setValue={(x, v) => (x.address = v)}
                    enableOnChangeValidation
                    validators={[required]}>
                    {({ value, error, onChange }) => (
                      <TextField label='Delivery address' value={value} error={error} onChange={onChange} />
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
};

const required: Validator<string, MyForm> = {
  method: ({ fieldValue }) => Boolean(fieldValue),
  message: `It's required field`,
};

const isPhone: Validator<string, MyForm> = {
  method: ({ fieldValue }) => fieldValue.length === 15,
  message: `Phone number is incorrect`,
};

const formatPhone = (options: FormatterOptions<string, HTMLInputElement>) => {
  const { prevValue, nextValue, node } = options;
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

export { App };

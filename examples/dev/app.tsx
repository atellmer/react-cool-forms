import React, { useRef, useEffect } from 'react';
import { Form, Field, type FormRef, type Validator } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const formRef = useRef<FormRef<User>>(null);
  const initialValue: User = { firstName: 'Alex', lastName: 'Plex' };

  return (
    <Form connectedRef={formRef} initialValue={initialValue} onSubmit={() => {}}>
      {({ formValue, errors, isSubmiting, submit, reset }) => {
        return (
          <>
            <Field
              name='firstName'
              getValue={(user: User) => user.firstName}
              setValue={(user: User, value: string) => (user.firstName = value)}
              validators={[required]}>
              {({ value, error, onChange }) => {
                // console.log('render firstName');
                return (
                  <div>
                    <input value={value} disabled={isSubmiting} onChange={e => onChange(e.target.value)} />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                  </div>
                );
              }}
            </Field>
            <Field
              name='lastName'
              getValue={(user: User) => user.lastName}
              setValue={(user: User, value: string) => (user.lastName = value)}
              validators={[required]}>
              {({ value, error, onChange }) => {
                // console.log('render lastName');
                return (
                  <div>
                    <input value={value} disabled={isSubmiting} onChange={e => onChange(e.target.value)} />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                  </div>
                );
              }}
            </Field>
            <button disabled={isSubmiting} onClick={submit}>
              Submit
            </button>
            <button disabled={isSubmiting} onClick={reset}>
              Reset
            </button>
          </>
        );
      }}
    </Form>
  );
};

const required: Validator<string, User> = {
  fn: ({ value }) => {
    return new Promise(resolve => {
      resolve(Boolean(value));
    });
  },
  message: 'It is required field',
};

type User = {
  firstName: string;
  lastName: string;
};

export { App };

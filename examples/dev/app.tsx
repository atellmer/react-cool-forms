import React from 'react';
import { Form, Field } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const initialValue: User = { firstName: 'Alex', lastName: 'Plex' };

  return (
    <Form initialValue={initialValue} onSubmit={() => {}}>
      {({ formValue, errors, submit, reset }) => {
        return (
          <>
            <Field
              name='firstName'
              getValue={(user: User) => user.firstName}
              setValue={(user: User, value: string) => (user.firstName = value)}>
              {({ value, error, onChange }) => {
                return <input value={value} onChange={e => onChange(e.target.value)} />;
              }}
            </Field>
            <Field
              name='lastName'
              getValue={(user: User) => user.lastName}
              setValue={(user: User, value: string) => (user.lastName = value)}>
              {({ value, error, onChange }) => {
                return <input value={value} onChange={e => onChange(e.target.value)} />;
              }}
            </Field>
            <button onClick={submit}>Submit</button>
            <button onClick={reset}>Reset</button>
          </>
        );
      }}
    </Form>
  );
};

type User = {
  firstName: string;
  lastName: string;
};

export { App };

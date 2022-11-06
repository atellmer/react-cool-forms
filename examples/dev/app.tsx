import React from 'react';
import { Form, Field } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const initialValue: User = { userName: 'Alex' };

  return (
    <Form initialValue={initialValue} onSubmit={() => {}} onChange={x => console.log('change', x)}>
      {({ formValue, submit }) => {
        return (
          <>
            <Field
              name='userName'
              getValue={(user: User) => user.userName}
              setValue={(user: User, value: string) => (user.userName = value)}>
              {({ value, error, onChange }) => <input value={value} onChange={e => onChange(e.target.value)} />}
            </Field>
            <button onClick={submit}>Submit</button>
          </>
        );
      }}
    </Form>
  );
};

type User = {
  userName: string;
};

export { App };

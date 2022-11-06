import React, { useRef, useEffect } from 'react';
import { Form, Field, type FormRef, type FormValidator } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const formRef = useRef<FormRef<Person>>(null);
  const initialValue: Person = { firstName: 'Alex', lastName: 'Plex', age: 18, position: null };

  useEffect(() => {
    console.log('formRef', formRef);
  }, []);

  return (
    <Form connectedRef={formRef} initialValue={initialValue} onSubmit={x => console.log('submit', x)}>
      {({ formValue, errors, isSubmiting, submit, reset }) => {
        return (
          <>
            <Field
              name='firstName'
              getValue={(user: Person) => user.firstName}
              setValue={(user: Person, value: string) => (user.firstName = value)}
              validators={[required as FormValidator<string, Person>]}>
              {({ value, error, onChange }) => {
                //console.log('render firstName');
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
              getValue={(user: Person) => user.lastName}
              setValue={(user: Person, value: string) => (user.lastName = value)}
              validators={[required as FormValidator<string, Person>]}>
              {({ value, error, onChange }) => {
                //console.log('render lastName');
                return (
                  <div>
                    <input value={value} disabled={isSubmiting} onChange={e => onChange(e.target.value)} />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                  </div>
                );
              }}
            </Field>
            <Field
              name='age'
              getValue={(user: Person) => user.age}
              setValue={(user: Person, value: number) => (user.age = value)}
              validators={[required as FormValidator<number, Person>, adult]}>
              {({ value, error, onChange }) => {
                //console.log('render age');
                return (
                  <div>
                    <input
                      type='number'
                      value={value}
                      disabled={isSubmiting}
                      onChange={e => onChange(Number(e.target.value))}
                    />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                  </div>
                );
              }}
            </Field>
            <Field
              name='position'
              getValue={(user: Person) => user.position}
              setValue={(user: Person, value: Position) => (user.position = value)}
              validators={[required as FormValidator<Position, Person>]}>
              {({ value, error, onChange }) => {
                //console.log('render position');
                return (
                  <div>
                    <select
                      value={value ? value.name : ''}
                      disabled={isSubmiting}
                      onChange={x => onChange(x.target.value ? { name: x.target.value } : null)}>
                      <option value=''>Empty</option>
                      <option value='programmer'>Programmer</option>
                      <option value='manager'>Manager</option>
                      <option value='actor'>Actor</option>
                    </select>
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

const required: FormValidator<any, Person> = {
  method: ({ value }) => {
    return new Promise(resolve => {
      resolve(Boolean(value));
    });
  },
  message: 'It is required field',
};

const adult: FormValidator<number, Person> = {
  method: ({ value }) => value >= 18,
  message: 'You must be adult',
};

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  position: Position;
};

type Position = {
  name: string;
};

export { App };

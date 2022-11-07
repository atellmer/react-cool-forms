import React, { useRef, useEffect } from 'react';
import { Form, Field, Repeater, Debugger, type FormRef, type Validator } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const formRef = useRef<FormRef<Person>>(null);
  const initialFormValue: Person = {
    firstName: 'Alex',
    lastName: 'Plex',
    age: 18,
    position: null,
    skills: [
      { ID: 1, name: 'coding' },
      { ID: 2, name: 'learning' },
    ],
  };

  useEffect(() => {
    // console.log('formRef', formRef);
  }, []);

  return (
    <Form
      connectedRef={formRef}
      initialFormValue={initialFormValue}
      //interruptValidation
      onSubmit={x => console.log('submit', x)}>
      {({ formValue, errors, inProcess, submit, reset }) => {
        return (
          <>
            <Field
              name='firstName'
              getValue={(person: Person) => person.firstName}
              setValue={(person: Person, value: string) => (person.firstName = value)}
              validators={[required as Validator<string, Person>]}
              enableOnChangeValidation
              onValidate={({ nodeRef, isValid }) => {
                const node = nodeRef.current as HTMLInputElement;

                !isValid &&
                  requestAnimationFrame(() => {
                    node.focus();
                    node.scrollIntoView(true);
                  });
              }}>
              {({ nodeRef, value, error, onChange }) => {
                //console.log('render firstName');
                return (
                  <div>
                    <input ref={nodeRef} value={value} disabled={inProcess} onChange={e => onChange(e.target.value)} />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                  </div>
                );
              }}
            </Field>
            <Field
              name='lastName'
              getValue={(person: Person) => person.lastName}
              setValue={(person: Person, value: string) => (person.lastName = value)}
              enableOnChangeValidation
              validators={[required as Validator<string, Person>]}>
              {({ value, error, onChange }) => {
                //console.log('render lastName');
                return (
                  <div>
                    <input value={value} disabled={inProcess} onChange={e => onChange(e.target.value)} />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                  </div>
                );
              }}
            </Field>
            <Field
              name='age'
              getValue={(person: Person) => person.age}
              setValue={(person: Person, value: number) => (person.age = value)}
              enableOnChangeValidation
              validators={[required as Validator<number, Person>, adult]}>
              {({ value, error, onChange }) => {
                //console.log('render age');
                return (
                  <div>
                    <input
                      type='number'
                      value={value}
                      disabled={inProcess}
                      onChange={e => onChange(Number(e.target.value))}
                    />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                  </div>
                );
              }}
            </Field>
            <Field
              name='position'
              getValue={(person: Person) => person.position}
              setValue={(person: Person, value: Position) => (person.position = value)}
              enableOnChangeValidation
              validators={[required as Validator<Position, Person>]}>
              {({ value, error, onChange }) => {
                //console.log('render position');
                return (
                  <div>
                    <select
                      value={value ? value.name : ''}
                      disabled={inProcess}
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
            <Repeater
              name='skills'
              getValue={(person: Person) => person.skills}
              setValue={(person: Person, value: Array<Skill>) => (person.skills = value)}
              getKey={x => x.ID}
              renderAddTrigger={({ add, inProcess }) => (
                <div>
                  <button disabled={inProcess} onClick={() => add({ ID: getNextSkillID(), name: '' })}>
                    add item
                  </button>
                </div>
              )}>
              {({ idx, inProcess, isSingle, remove }) => {
                return (
                  <>
                    <Field
                      name='name'
                      getValue={(skill: Skill) => skill.name}
                      setValue={(skill: Skill, value: string) => (skill.name = value)}
                      enableOnChangeValidation
                      validators={[required as Validator<string, Skill>]}>
                      {({ value, error, onChange }) => {
                        //console.log('render skill', value);
                        return (
                          <div>
                            <input value={value} disabled={inProcess} onChange={e => onChange(e.target.value)} />
                            {error && <div style={{ color: 'red' }}>{error}</div>}
                          </div>
                        );
                      }}
                    </Field>
                    <button disabled={isSingle || inProcess} onClick={() => remove(idx)}>
                      remove item
                    </button>
                  </>
                );
              }}
            </Repeater>
            <br />
            <br />
            <button disabled={inProcess} onClick={submit}>
              Submit
            </button>
            <button disabled={inProcess} onClick={reset}>
              Reset
            </button>
            <Debugger />
          </>
        );
      }}
    </Form>
  );
};

const required: Validator<any, any> = {
  method: ({ fieldValue }) => {
    return new Promise(resolve => {
      resolve(Boolean(fieldValue));
    });
  },
  message: 'It is required field',
};

const adult: Validator<number, Person> = {
  method: ({ fieldValue }) => fieldValue >= 18,
  message: 'You must be adult',
};

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  position: Position;
  skills: Array<Skill>;
};

type Position = {
  name: string;
};

type Skill = {
  ID: number;
  name: string;
};

let nextSkillID = 2;

const getNextSkillID = () => ++nextSkillID;

export { App };

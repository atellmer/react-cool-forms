import React, { useMemo, useRef } from 'react';
import { Form, Field, Repeater, Debugger, type Validator, type RepeaterRef } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const repeaterRef = useRef<RepeaterRef<Row>>(null);
  const initialFormValue: TableForm = useMemo(
    () => ({
      rows: Array(4)
        .fill(null)
        .map((_, idx) => createRow(`Row #${idx}`)),
    }),
    [],
  );

  const handleAppendRow = () => {
    repeaterRef.current.append(createRow(), true);
  };

  return (
    <Form
      name='rootForm'
      initialFormValue={initialFormValue}
      validators={[root]}
      onSubmit={x => console.log('submit', x)}>
      {({ submit, inProcess, reset }) => {
        console.log('[render Form]');
        return (
          <>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Place</th>
                </tr>
              </thead>
              <tbody>
                <Repeater
                  name='rows'
                  connectedRef={repeaterRef}
                  getValue={(form: TableForm) => form.rows}
                  setValue={(form: TableForm, value: Array<Row>) => (form.rows = value)}
                  getKey={x => x.ID}>
                  {({ idx, key, shouldFocus, remove }) => {
                    return (
                      <tr>
                        <td>
                          <Field
                            name={`rows(${key}).name`}
                            getValue={(row: Row) => row.name}
                            setValue={(row: Row, value: string) => (row.name = value)}
                            enableOnChangeValidation
                            validators={[required as Validator<string, Row>]}>
                            {({ value, error, onChange }) => {
                              const style = {
                                borderColor: error ? 'red' : 'black',
                                borderStyle: 'solid',
                                borderWidth: 2,
                                outline: 'none',
                              };

                              return (
                                <input
                                  value={value}
                                  autoFocus={shouldFocus}
                                  style={style}
                                  onChange={e => onChange(e.target.value)}
                                />
                              );
                            }}
                          </Field>
                        </td>
                        <td>
                          <Field
                            name={`rows(${key}).age`}
                            getValue={(row: Row) => row.age}
                            setValue={(row: Row, value: number) => (row.age = value)}
                            //enableOnChangeValidation
                            validators={[required as Validator<number, Row>]}>
                            {({ value, error, onChange }) => {
                              const style = {
                                borderColor: error ? 'red' : 'black',
                                borderStyle: 'solid',
                                borderWidth: 2,
                                outline: 'none',
                              };

                              return (
                                <input
                                  type='number'
                                  value={value}
                                  style={style}
                                  onChange={e => onChange(Number(e.target.value))}
                                />
                              );
                            }}
                          </Field>
                        </td>
                        <td>
                          <Field
                            name={`rows(${key}).place`}
                            getValue={(row: Row) => row.place}
                            setValue={(row: Row, value: string) => (row.place = value)}
                            enableOnChangeValidation
                            validators={[required as Validator<string, Row>]}>
                            {({ value, error, onChange }) => {
                              const style = {
                                borderColor: error ? 'red' : 'black',
                                borderStyle: 'solid',
                                borderWidth: 2,
                                outline: 'none',
                              };

                              return <input value={value} style={style} onChange={e => onChange(e.target.value)} />;
                            }}
                          </Field>
                        </td>
                        <td>
                          <button disabled={inProcess} onClick={() => remove(idx)}>
                            Remove row
                          </button>
                        </td>
                      </tr>
                    );
                  }}
                </Repeater>
              </tbody>
            </table>
            <br />
            <button onClick={handleAppendRow}>Append row</button>
            <br />
            <br />
            <button onClick={submit}>Submit</button>
            <button onClick={reset}>Reset</button>
            <Debugger />
          </>
        );
      }}
    </Form>
  );
};

const required: Validator = {
  method: ({ fieldValue }) => Boolean(fieldValue),
  message: 'It is required field',
};

const root: Validator<TableForm, TableForm> = {
  method: ({ fieldValue }) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(false);
      }, 100);
    });
  },
  message: 'Wrong form',
};

type TableForm = {
  rows: Array<Row>;
};

type Row = {
  ID: number;
  name: string;
  age: number;
  place: string;
};

let nextRowID = 0;

const getNextRowID = () => ++nextRowID;

function createRow(name = ''): Row {
  return { ID: getNextRowID(), name, age: 22, place: '' };
}

export { App };

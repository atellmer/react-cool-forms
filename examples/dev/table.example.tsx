import React, { useMemo } from 'react';
import { Form, Field, Repeater, Debugger, type Validator } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const initialFormValue: TableForm = useMemo(
    () => ({
      rows: Array(100)
        .fill(null)
        .map((_, idx) => createRow(`Row #${idx}`)),
    }),
    [],
  );

  return (
    <Form initialFormValue={initialFormValue} onSubmit={x => console.log('submit', x)}>
      {({ submit, reset }) => {
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
                  getValue={(form: TableForm) => form.rows}
                  setValue={(form: TableForm, value: Array<Row>) => (form.rows = value)}
                  getKey={x => x.ID}>
                  {({ idx }) => {
                    return (
                      <tr>
                        <td>
                          <Field
                            name={`rows[${idx}].name`}
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

                              return <input value={value} style={style} onChange={e => onChange(e.target.value)} />;
                            }}
                          </Field>
                        </td>
                        <td>
                          <Field
                            name={`rows[${idx}].age`}
                            getValue={(row: Row) => row.age}
                            setValue={(row: Row, value: number) => (row.age = value)}
                            enableOnChangeValidation
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
                            name={`rows[${idx}].place`}
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
                      </tr>
                    );
                  }}
                </Repeater>
              </tbody>
            </table>
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

function createRow(name: string): Row {
  return { ID: getNextRowID(), name, age: 22, place: '' };
}

export { App };

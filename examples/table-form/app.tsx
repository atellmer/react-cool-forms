import React, { useMemo, useRef } from 'react';
import { Form, Field, Repeater, type Validator, type RepeaterRef } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const repeaterRef = useRef<RepeaterRef<Row>>(null);
  const initialFormValue: TableForm = useMemo(
    () => ({
      rows: Array(1000)
        .fill(null)
        .map((_, idx) => createRow(`Row #${idx}`)),
    }),
    [],
  );

  const handleAppendRow = () => {
    repeaterRef.current.prepend(createRow(), true);
  };

  return (
    <Form initialFormValue={initialFormValue} onSubmit={x => console.log('submit', x)}>
      {({ submit, inProcess, reset }) => {
        return (
          <>
            <button onClick={submit}>Submit</button>
            <button onClick={reset}>Reset</button>
            <button onClick={handleAppendRow}>Add row</button>
            <table style={{ width: '100%' }}>
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
                            updatingKey={idx}
                            validators={[required as Validator<string, Row>]}>
                            {({ value, error, onChange }) => {
                              return (
                                <input
                                  value={value}
                                  autoFocus={shouldFocus}
                                  style={createInputStyle(error)}
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
                            updatingKey={idx}
                            validators={[required as Validator<number, Row>]}>
                            {({ value, error, onChange }) => {
                              return (
                                <input
                                  type='number'
                                  value={value}
                                  style={createInputStyle(error)}
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
                            updatingKey={idx}
                            validators={[required as Validator<string>]}>
                            {({ value, error, onChange }) => {
                              return (
                                <input
                                  value={value}
                                  style={createInputStyle(error)}
                                  onChange={e => onChange(e.target.value)}
                                />
                              );
                            }}
                          </Field>
                        </td>
                        <td>
                          <button style={{ width: '100%' }} disabled={inProcess} onClick={() => remove(idx)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  }}
                </Repeater>
              </tbody>
            </table>
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

function createRow(name = ''): Row {
  return { ID: getNextRowID(), name, age: 22, place: '' };
}

function createInputStyle(error: string) {
  return {
    width: '100%',
    borderColor: error ? 'red' : 'black',
    borderStyle: 'solid',
    borderWidth: 2,
    outline: 'none',
  };
}

export { App };

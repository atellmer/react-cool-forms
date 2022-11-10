import React, { useMemo } from 'react';
import { Form, Field, Repeater, Debugger, type Validator } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const initialFormValue: SettingsForm = useMemo(
    () => ({
      name: 'xxx',
      companies: Array(2)
        .fill(null)
        .map((_, idx) =>
          createCompany(`Company #${idx + 1}`, [createAccount('some account'), createAccount('some account')]),
        ),
    }),
    [],
  );

  return (
    <Form name='settingsForm' initialFormValue={initialFormValue} onSubmit={x => console.log('submit', x)}>
      {({ errors, submit, reset }) => {
        return (
          <>
            <Field
              name='name'
              getValue={(form: SettingsForm) => form.name}
              setValue={(form: SettingsForm, value: string) => (form.name = value)}
              enableOnChangeValidation
              validators={[required as Validator<string, SettingsForm>]}>
              {({ value, error, onChange }) => {
                // console.log('render settings form name');
                return (
                  <div>
                    <input value={value} onChange={e => onChange(e.target.value)} />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                  </div>
                );
              }}
            </Field>
            <Repeater
              name='companies'
              getValue={(form: SettingsForm) => form.companies}
              setValue={(form: SettingsForm, value: Array<Company>) => (form.companies = value)}
              getKey={x => x.ID}
              renderTrigger={({ append }) => (
                <div>
                  <button onClick={() => append(createCompany(''))}>Add company</button>
                </div>
              )}>
              {({ idx, remove }) => {
                const companyIdx = idx;

                return (
                  <div style={{ padding: 8, backgroundColor: '#eee', borderBottom: '1px solid black' }}>
                    <Field
                      name={`companies[${idx}].name`}
                      getValue={(company: Company) => company.name}
                      setValue={(company: Company, value: string) => (company.name = value)}
                      enableOnChangeValidation
                      validators={[required as Validator<string, Company>]}>
                      {({ value, error, validate, onChange }) => {
                        //console.log('render company name', idx);
                        return (
                          <div>
                            <input value={value} onChange={e => onChange(e.target.value)} />
                            {error && <div style={{ color: 'red' }}>{error}</div>}
                          </div>
                        );
                      }}
                    </Field>
                    <Field
                      name={`companies[${idx}].place`}
                      getValue={(company: Company) => company.place}
                      setValue={(company: Company, value: string) => (company.place = value)}
                      enableOnChangeValidation
                      validators={[required as Validator<string, Company>]}>
                      {({ value, error, onChange }) => {
                        //console.log('render company place', idx);
                        return (
                          <div>
                            <input value={value} onChange={e => onChange(e.target.value)} />
                            {error && <div style={{ color: 'red' }}>{error}</div>}
                          </div>
                        );
                      }}
                    </Field>
                    <div style={{ padding: 8 }}>
                      <Repeater
                        name='companies.accounts'
                        getValue={(company: Company) => company.accounts}
                        setValue={(company: Company, value: Array<Account>) => (company.accounts = value)}
                        getKey={x => x.ID}
                        renderTrigger={({ append }) => (
                          <div>
                            <button onClick={() => append(createAccount(''))}>Add account</button>
                          </div>
                        )}>
                        {({ idx, remove }) => {
                          return (
                            <div>
                              <Field
                                name={`companies[${companyIdx}].accounts[${idx}].name`}
                                getValue={(account: Account) => account.name}
                                setValue={(account: Account, value: string) => (account.name = value)}
                                enableOnChangeValidation
                                validators={[required as Validator<string, Account>]}>
                                {({ value, error, onChange }) => {
                                  //console.log('render account name', idx);
                                  return (
                                    <div>
                                      <input value={value} onChange={e => onChange(e.target.value)} />
                                      {error && <div style={{ color: 'red' }}>{error}</div>}
                                    </div>
                                  );
                                }}
                              </Field>
                              <button onClick={() => remove(idx)}>remove account</button>
                            </div>
                          );
                        }}
                      </Repeater>
                    </div>
                    <button onClick={() => remove(idx)}>remove company</button>
                  </div>
                );
              }}
            </Repeater>
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

type SettingsForm = {
  name: string;
  companies: Array<Company>;
};

type Company = {
  ID: number;
  name: string;
  place: string;
  accounts: Array<Account>;
};

type Account = {
  ID: number;
  name: string;
};

let nextCompanyID = 0;
let nextAccountID = 0;

const getNextCompanyID = () => ++nextCompanyID;
const getNextAccountID = () => ++nextAccountID;

function createCompany(name: string, accounts: Array<Account> = []): Company {
  return { ID: getNextCompanyID(), name, place: '', accounts };
}

function createAccount(name: string): Account {
  return { ID: getNextAccountID(), name };
}

export { App };

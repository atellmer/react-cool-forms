import React, { useMemo, useState } from 'react';
import { Form, Field, Debugger, type Validator } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  const [step, setStep] = useState('step1');
  const initialFormValue: WizardForm = useMemo(
    () => ({
      step1: {
        firstName: '',
        lastName: '',
      },
      step2: {
        age: 0,
        hobby: '',
      },
      step3: {
        nickname: '',
      },
    }),
    [],
  );

  const getPrevStep = (step: string) => {
    if (step === 'step3') return 'step2';

    return 'step1';
  };

  const getNextStep = (step: string) => {
    if (step === 'step1') return 'step2';

    return 'step3';
  };

  const handleNextStep = (formValue, validate) => async () => {
    const isValid = await validate(formValue);

    isValid && setStep(getNextStep(step));
  };

  return (
    <Form initialFormValue={initialFormValue} onSubmit={x => console.log('submit', x)}>
      {({ formValue, validate, submit }) => {
        const map = {
          step1: () => {
            return (
              <div key='1'>
                <Field
                  name='firstName'
                  getValue={(form: WizardForm) => form.step1.firstName}
                  setValue={(form: WizardForm, value: string) => (form.step1.firstName = value)}
                  validators={[required as Validator<string, WizardForm>]}>
                  {({ name, value, error, onChange }) => {
                    return <TextField label={name} value={value} error={error} onChange={onChange} />;
                  }}
                </Field>
                <Field
                  name='lastName'
                  getValue={(form: WizardForm) => form.step1.lastName}
                  setValue={(form: WizardForm, value: string) => (form.step1.lastName = value)}
                  validators={[required as Validator<string, WizardForm>]}>
                  {({ name, value, error, onChange }) => {
                    return <TextField label={name} value={value} error={error} onChange={onChange} />;
                  }}
                </Field>
              </div>
            );
          },
          step2: () => {
            return (
              <div key='2'>
                <Field
                  name='age'
                  getValue={(form: WizardForm) => form.step2.age}
                  setValue={(form: WizardForm, value: number) => (form.step2.age = value)}
                  validators={[required as Validator<number, WizardForm>]}>
                  {({ name, value, error, onChange }) => {
                    return <TextField label={name} type='number' value={value} error={error} onChange={onChange} />;
                  }}
                </Field>
                <Field
                  name='hobby'
                  getValue={(form: WizardForm) => form.step2.hobby}
                  setValue={(form: WizardForm, value: string) => (form.step2.hobby = value)}
                  validators={[required as Validator<string, WizardForm>]}>
                  {({ name, value, error, onChange }) => {
                    return <TextField label={name} value={value} error={error} onChange={onChange} />;
                  }}
                </Field>
              </div>
            );
          },
          step3: () => {
            return (
              <div key='3'>
                <Field
                  name='nickname'
                  getValue={(form: WizardForm) => form.step3.nickname}
                  setValue={(form: WizardForm, value: string) => (form.step3.nickname = value)}
                  validators={[required as Validator<string, WizardForm>]}>
                  {({ name, value, error, onChange }) => {
                    return <TextField label={name} value={value} error={error} onChange={onChange} />;
                  }}
                </Field>
              </div>
            );
          },
        };

        return (
          <div style={{ padding: 16 }}>
            <div>{map[step]()}</div>
            <div>{step}</div>
            <div>
              <button disabled={step === 'step1'} onClick={() => setStep(getPrevStep(step))}>
                Prev step
              </button>
              <button onClick={step === 'step3' ? submit : handleNextStep(formValue, validate)}>
                {step === 'step3' ? 'Submit' : 'Next step'}
              </button>
            </div>
            <Debugger />
          </div>
        );
      }}
    </Form>
  );
};

type TextFieldProps = {
  label: string;
  type?: 'text' | 'number';
  value: string | number;
  error?: string;
  onChange: (value: string | number) => void;
};

const TextField: React.FC<TextFieldProps> = ({ label, type = 'text', value, error, onChange }) => {
  return (
    <label>
      <div>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </label>
  );
};

const required: Validator = {
  method: ({ fieldValue }) => Boolean(fieldValue),
  message: 'It is required field',
};

type WizardForm = {
  step1: {
    firstName: string;
    lastName: string;
  };
  step2: {
    age: number;
    hobby: string;
  };
  step3: {
    nickname: string;
  };
};

export { App };

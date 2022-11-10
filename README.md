# react-cool-forms

## Features
- ✔️ Real flexible API
- ✔️ UI library agnostic
- ✔️ Dynamic fields
- ✔️ Array fields
- ✔️ Field-level validation
- ✔️ Dependent validation
- ✔️ Fully custom validators
- ✔️ Async validators support
- ✔️ High performance
- ✔️ Small size (5 Kb gzipped)

## Installation
npm:
```
npm install react-cool-forms
```
yarn:
```
yarn add react-cool-forms
```

## Usage

```tsx
import { Form, Field } from 'react-cool-forms';

const required = {
  method: ({ fieldValue }) => Boolean(fieldValue),
  message: `It's required field`,
};

const handleSubmit = x => console.log('submit: ', x);
const getFirstName = form => form.firstName;
const setFirstName = (form, value) => (form.firstName = value);

<Form initialFormValue={{ firstName: '' }} onSubmit={handleSubmit}>
  {({ submit }) => {
    return (
      <>
        <Field
          name='firstName'
          getValue={getFirstName}
          setValue={setFirstName}
          validators={[required]}>
          {({ value, error, onChange }) => {
            return (
              <div>
                <input value={value} onChange={e => onChange(e.target.value)} />
                {error && <div style={{ color: 'red' }}>{error}</div>}
              </div>
            );
          }}
        </Field>
        <button onClick={submit}>Submit</button>
      </>
    );
  }}
</Form>
```

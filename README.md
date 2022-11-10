# react-cool-forms

## Features
- ✔️ Real flexible API
- ✔️ UI library agnostic
- ✔️ Dynamic fields
- ✔️ Array fields
- ✔️ Field-level validation
- ✔️ Dependent validation
- ✔️ Custom validators
- ✔️ Async validators support
- ✔️ High performance
- ✔️ Small size (5 Kb gzipped)

## Motivation
I have been looking for a form validation library for react in the npm repository for a long time, but all of them did not suit me for one reason or another. First of all, I lacked the flexibility of the API of these libraries. Most of them are based on the use of simple HTML inputs and the like. But writing complex forms is not limited to inputs or checkboxes. Having a lot of experience with forms at my former company, I decided to write this library. The main message: any arbitrarily complex component that implements the value / onChange interface can be a full member of the form and pass the required validation.

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

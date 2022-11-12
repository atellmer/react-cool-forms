import React, { forwardRef } from 'react';

import { Root, Input, Label, ErrorMessage } from './styled';

export type TextFieldProps<T = string | number> = {
  value: T;
  type?: 'text' | 'number';
  error: string;
  label?: string;
  placeholder?: string;
  onChange: (value: T) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const { value, type = 'text', error, label, placeholder, onChange, onFocus, onBlur } = props;
  const hasError = Boolean(error);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = type === 'text' ? e.target.value : Number(e.target.value);

    onChange(value);
  };

  return (
    <Root className='text-field'>
      <Label>
        {label ? <span style={{ display: 'block', marginBottom: 2 }}>{label}:</span> : null}
        <Input
          ref={ref}
          type={type}
          value={value}
          hasError={hasError}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </Label>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Root>
  );
});

export { TextField };

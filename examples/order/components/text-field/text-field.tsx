import React, { forwardRef } from 'react';

import { Root, Input, Label, ErrorMessage } from './styled';

export type TextFieldProps<T = string | number> = {
  value: T;
  type?: 'text' | 'number';
  error: string;
  label?: string;
  placeholder?: string;
  onChange: (value: T) => void;
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const { value, type = 'text', error, label, placeholder, onChange } = props;
  const hasError = Boolean(error);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = type === 'text' ? e.target.value : Number(e.target.value);

    onChange(value);
  };

  return (
    <Root>
      <Label>
        {label ? `${label}:` : null}
        <Input
          ref={ref}
          type={type}
          value={value}
          hasError={hasError}
          placeholder={placeholder}
          onChange={handleChange}
        />
      </Label>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Root>
  );
});

export { TextField };

import React from 'react';

import { Root, Label, Input } from './styled';

export type CheckboxProps = {
  value: boolean;
  label: string;
  onChange: (value: boolean) => void;
};

const Checkbox: React.FC<CheckboxProps> = props => {
  const { value, onChange } = props;

  return (
    <Root>
      <Label>
        <Input checked={value} onChange={() => onChange(!value)} />
        <span>Pay tip?</span>
      </Label>
    </Root>
  );
};

export { Checkbox };

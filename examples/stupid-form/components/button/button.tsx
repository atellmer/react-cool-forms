import React from 'react';

import { Root } from './styled';

export type ButtonProps = {
  children: React.ReactNode;
} & React.AllHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = props => {
  const { children, disabled, onClick } = props;

  return (
    <Root disabled={disabled} onClick={onClick}>
      {children}
    </Root>
  );
};

export { Button };

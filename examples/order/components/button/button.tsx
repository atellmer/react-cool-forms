import React from 'react';

import { Root } from './styled';

export type ButtonProps = {
  children: React.ReactNode;
} & React.AllHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = props => {
  const { children, onClick } = props;

  return <Root onClick={onClick}>{children}</Root>;
};

export { Button };

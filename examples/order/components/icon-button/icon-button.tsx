import React from 'react';

import { Root } from './styled';

export type IconButtonProps = {
  variant: 'delete';
  onClick: () => void;
};

const IconButton: React.FC<IconButtonProps> = props => {
  const { onClick } = props;

  return <Root onClick={onClick}>x</Root>;
};

export { IconButton };

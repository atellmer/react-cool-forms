import styled, { css } from 'styled-components';

import { colors, ErrorMessage } from '../text-field/styled';

const Root = styled.div`
  position: relative;
  width: 100%;
`;

type InputProps = {
  hasError: boolean;
};

const Select = styled.select<InputProps>`
  width: 100%;
  height: 32px;
  border: 2px solid #7953d2;

  ${p =>
    p.hasError &&
    css`
      border-color: ${colors.danger};
      outline-color: ${colors.danger};
    `}
`;

export { Root, Select, ErrorMessage };

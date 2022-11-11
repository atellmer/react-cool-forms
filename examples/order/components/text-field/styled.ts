import styled, { css } from 'styled-components';

const colors = {
  danger: '#ff5c8d',
};

const Root = styled.div`
  width: 100%;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

type InputProps = {
  hasError: boolean;
};

const Input = styled.input<InputProps>`
  width: 100%;
  height: 32px;
  padding: 6px;
  border: 2px solid #7953d2;

  ${p =>
    p.hasError &&
    css`
      border-color: ${colors.danger};
      outline-color: ${colors.danger};
    `}
`;

const ErrorMessage = styled.p`
  color: ${colors.danger};
  font-size: 0.9rem;
  margin: 2px 0;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
`;

export { Root, Input, ErrorMessage, Label };

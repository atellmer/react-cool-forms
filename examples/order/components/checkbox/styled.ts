import styled from 'styled-components';

const Root = styled.div`
  position: relative;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: inline-flex;
  font-size: 1rem;
  align-items: center;
  cursor: pointer;
`;

const Input = styled.input.attrs({
  type: 'checkbox',
})`
  position: relative;
  margin: 8px;
  left: -8px;
  cursor: pointer;
`;

export { Root, Label, Input };

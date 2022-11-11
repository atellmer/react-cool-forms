import styled from 'styled-components';

const Root = styled.button`
  width: 100%;
  background-color: #0288d1;
  color: #fff;
  border: none;
  padding: 12px;
  cursor: pointer;
  transition: background-color 200ms ease-in-out;
  text-transform: uppercase;

  &:hover {
    background-color: #005b9f;
  }
`;

export { Root };

import React from 'react';

import { Root, Select, ErrorMessage } from './styled';

export type SelectFieldProps<T = unknown> = {
  value: T;
  dataSource: Array<T>;
  getID: (value: T) => string | number;
  getName: (value: T) => string | number;
  disabled?: boolean;
  error?: string;
  emptyChoice: string;
  onChange: (value: T) => void;
};

const SelectField: React.FC<SelectFieldProps> = props => {
  const { value, dataSource, getID, getName, disabled, error, emptyChoice, onChange } = props;
  const selectedID = value ? getID(value) : '';
  const hasError = Boolean(error);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const item = dataSource.find(x => `${getID(x)}` === e.target.value) || null;

    onChange(item);
  };

  return (
    <Root>
      <Select value={selectedID} hasError={hasError} disabled={disabled} onChange={handleChange}>
        {emptyChoice && <option value='-1'>{emptyChoice}</option>}
        {dataSource.map(x => {
          const ID = getID(x);
          const name = getName(x);

          return (
            <option key={ID} value={ID}>
              {name}
            </option>
          );
        })}
      </Select>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Root>
  );
};

export { SelectField };

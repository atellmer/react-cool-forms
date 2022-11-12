type MaskedOptions = {
  mask: Array<string | RegExp>;
  prevValue: string;
  nextValue: string;
};

function masked(options: MaskedOptions) {
  const { prevValue = '', nextValue = '', mask } = options;

  if (prevValue.length >= nextValue.length) return nextValue;

  const values = [];
  let idx = 0;

  for (const token of mask) {
    if (typeof token === 'string') {
      values.push(token);
    } else if (token instanceof RegExp) {
      if (token.test(nextValue[idx])) {
        values.push(nextValue[idx]);
      } else {
        break;
      }
    }

    idx++;
  }

  const formattedValue = values.join('');

  return formattedValue;
}

const formatCurrency = (value: string | number, currency = '$') => {
  const values: Array<string> = [];
  const strValue = `${value}`;
  const splitted = strValue.replace(`${currency} `, '').split('');
  let hasFirstNumber = false;
  let hasDecimalSeparator = false;
  let idx = 0;

  for (const part of splitted) {
    if ([',', '.'].includes(part) && hasFirstNumber && !hasDecimalSeparator) {
      hasDecimalSeparator = true;

      values.push(part);
    } else {
      const isNumber = !Number.isNaN(Number(part));

      if (isNumber) {
        hasFirstNumber = true;

        values.push(part);
      }
    }

    idx++;
  }

  const formattedValue = `${currency} ${values.join('')}`;

  return formattedValue;
};

const transformCurrencyStringToNumber = (value: string | number, currency = '$') =>
  Number(`${value}`.replace(`${currency} `, ''));

export { masked, formatCurrency, transformCurrencyStringToNumber };

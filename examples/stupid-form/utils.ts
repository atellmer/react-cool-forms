type MaskedOptions = {
  mask: Array<string | RegExp>;
  prevValue: string;
  nextValue: string;
};

function masked(options: MaskedOptions) {
  const { prevValue = '', nextValue = '', mask } = options;

  if (prevValue.length > nextValue.length) return nextValue;

  const regexpTokens = mask.filter(x => x instanceof RegExp);

  if (nextValue.length < regexpTokens.length && prevValue.length === nextValue.length) {
    return nextValue;
  }

  const stringTokens = mask.filter(x => typeof x === 'string');
  const values = [];
  let value = nextValue;
  let idx = -1;

  for (const token of stringTokens) {
    value = value.replace(token, '');
  }

  for (const token of mask) {
    if (typeof token === 'string') {
      values.push(token);
    } else if (token instanceof RegExp) {
      idx++;
      if (token.test(value[idx])) {
        values.push(value[idx]);
      } else {
        break;
      }
    }
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

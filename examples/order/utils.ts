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

export { masked };

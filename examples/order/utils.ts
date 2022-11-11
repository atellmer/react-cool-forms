type MaskedOptions = {
  mask: Array<string | RegExp>;
  prevValue: string;
  nextValue: string;
};

function masked(options: MaskedOptions) {
  const { mask, prevValue = '', nextValue = '' } = options;
  const splitted = nextValue.split('');
  const values = [];
  let idx = 0;

  const greed = (idx: number) => {
    const isForward = prevValue.length < nextValue.length;

    if (isForward && typeof mask[idx + 1] === 'string' && !splitted[idx + 1]) {
      values.push(mask[idx + 1]);
      greed(idx + 1);

      return true;
    }

    return false;
  };

  for (const part of splitted) {
    if (mask[idx] instanceof RegExp) {
      const regexp = mask[idx] as RegExp;

      if (regexp.test(part)) {
        values.push(part);

        if (greed(idx)) {
          break;
        }
      } else {
        break;
      }
    } else if (typeof mask[idx] === 'string') {
      if (mask[idx] === part) {
        values.push(part);
      } else {
        break;
      }
    }

    idx++;
  }

  if (nextValue && values.length === 0 && typeof mask[0] === 'string') {
    values.push(mask[0]);
  }

  const maskedValue = values.join('');

  return maskedValue;
}

export { masked };

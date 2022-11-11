import React, { useMemo } from 'react';

import { useFormState } from './hooks';

export type DebuggerProps = {};

const Debugger: React.FC<DebuggerProps> = () => {
  const { formValue, errors } = useFormState();
  const style: React.CSSProperties = useMemo(
    () => ({
      display: 'block',
      backgroundColor: '#efefef',
      padding: 16,
      marginTop: 0,
      marginBottom: 0,
    }),
    [],
  );
  const value = useMemo(
    () =>
      JSON.stringify(
        {
          errors,
          formValue,
        },
        null,
        2,
      ),
    [formValue, errors],
  );

  return <pre style={style}>{value}</pre>;
};

export { Debugger };

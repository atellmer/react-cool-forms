import React, { useMemo } from 'react';

import { useFormState } from './form';

export type DebuggerProps = {};

const Debugger: React.FC<DebuggerProps> = () => {
  const { formValue } = useFormState();
  const style: React.CSSProperties = useMemo(
    () => ({
      display: 'block',
      backgroundColor: '#efefef',
      padding: 16,
      marginTop: 16,
      marginBottom: 16,
    }),
    [],
  );

  return <pre style={style}>{JSON.stringify(formValue, null, 2)}</pre>;
};

export { Debugger };

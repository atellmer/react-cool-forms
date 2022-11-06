import React from 'react';
import { Form } from 'react-cool-forms';

export type AppProps = {};

const App: React.FC<AppProps> = props => {
  return (
    <Form initialValue={{}} onSubmit={() => {}}>
      {() => <div>form</div>}
    </Form>
  );
};

export { App };

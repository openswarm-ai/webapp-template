import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../shared/state/store';

const Main: React.FC = () => {

  return (
    <Provider store={store}>
      Hello World
    </Provider>
  );
};

export default Main;

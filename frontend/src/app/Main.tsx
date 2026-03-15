import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../shared/state/store';
import ClaudeThemeProvider from '@/shared/styles/ThemeContext';
import Health from '@/app/pages/Health/Health';

const Main: React.FC = () => {
  return (
    <Provider store={store}>
      <ClaudeThemeProvider>
        <Health />
      </ClaudeThemeProvider>
    </Provider>
  );
};

export default Main;

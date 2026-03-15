// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import tempStateReducer from './tempStateSlice';

export const store = configureStore({
  reducer: {
    tempState: tempStateReducer,
  },
});

// Optionally, export RootState and AppDispatch types for use with TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

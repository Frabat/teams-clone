import { configureStore } from '@reduxjs/toolkit';
import ptoReducer from './ptoSlice';
import dateReducer from './dateSlice';

export const store = configureStore({
  reducer: {
    pto: ptoReducer,
    date: dateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
import { configureStore } from '@reduxjs/toolkit';
import calendarReducer from '../features/calendar/calendarSlice';
import ptoReducer from '../features/pto/ptoSlice';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    pto: ptoReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
import { combineReducers } from '@reduxjs/toolkit';
import calendarReducer from '../features/calendar/calendarSlice';

const rootReducer = combineReducers({
  calendar: calendarReducer,
  // Add other reducers here
});

export default rootReducer; 
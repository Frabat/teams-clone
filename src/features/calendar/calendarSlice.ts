import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO Date string
  end: string;   // ISO Date string
}

interface CalendarState {
  events: CalendarEvent[];
  currentDate: string; // ISO Date string for the displayed week/day start
  view: 'week' | 'day' | 'month';
}

const initialState: CalendarState = {
  events: [],
  currentDate: new Date().toISOString(),
  view: 'week',
};

export const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.events.push(action.payload);
    },
    updateEvent: (state, action: PayloadAction<CalendarEvent>) => {
      const index = state.events.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
    },
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload;
    },
    setView: (state, action: PayloadAction<'week' | 'day' | 'month'>) => {
      state.view = action.payload;
    },
  },
});

export const {
  addEvent,
  updateEvent,
  removeEvent,
  setCurrentDate,
  setView,
} = calendarSlice.actions;

// Selectors
export const selectCalendarEvents = (state: RootState) => state.calendar.events;
export const selectCurrentDate = (state: RootState) => state.calendar.currentDate;
export const selectView = (state: RootState) => state.calendar.view;

export default calendarSlice.reducer; 
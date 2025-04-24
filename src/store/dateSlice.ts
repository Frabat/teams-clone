import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addDays, parseISO, format } from 'date-fns';

export interface Holiday {
  id: string;
  name: string;
  date: string; // ISO string
  isRecurring: boolean;
}

interface DateState {
  currentDate: string; // ISO string
  selectedDate: string; // ISO string
  holidays: Holiday[];
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  workingHours: {
    start: number; // 0-23
    end: number; // 0-23
  };
}

const initialState: DateState = {
  currentDate: new Date().toISOString(),
  selectedDate: new Date().toISOString(),
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  workingHours: {
    start: 9, // 9 AM
    end: 17, // 5 PM
  },
  holidays: [
    // 2024 Federal Holidays
    {
      id: '1',
      name: 'New Year\'s Day',
      date: '2024-01-01T00:00:00.000Z',
      isRecurring: true,
    },
    {
      id: '2',
      name: 'Martin Luther King Jr. Day',
      date: '2024-01-15T00:00:00.000Z',
      isRecurring: true,
    },
    {
      id: '3',
      name: 'Presidents\' Day',
      date: '2024-02-19T00:00:00.000Z',
      isRecurring: true,
    },
    {
      id: '4',
      name: 'Memorial Day',
      date: '2024-05-27T00:00:00.000Z',
      isRecurring: true,
    },
    {
      id: '5',
      name: 'Juneteenth',
      date: '2024-06-19T00:00:00.000Z',
      isRecurring: true,
    },
    {
      id: '6',
      name: 'Independence Day',
      date: '2024-07-04T00:00:00.000Z',
      isRecurring: true,
    },
    {
      id: '7',
      name: 'Labor Day',
      date: '2024-09-02T00:00:00.000Z',
      isRecurring: true,
    },
    {
      id: '8',
      name: 'Columbus Day',
      date: '2024-10-14T00:00:00.000Z',
      isRecurring: true,
    },
    {
      id: '9',
      name: 'Veterans Day',
      date: '2024-11-11T00:00:00.000Z',
      isRecurring: true,
    },
    {
      id: '10',
      name: 'Thanksgiving Day',
      date: '2024-11-28T00:00:00.000Z',
      isRecurring: true,
    },
    {
      id: '11',
      name: 'Christmas Day',
      date: '2024-12-25T00:00:00.000Z',
      isRecurring: true,
    },
  ],
};

const dateSlice = createSlice({
  name: 'date',
  initialState,
  reducers: {
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    addHoliday: (state, action: PayloadAction<Omit<Holiday, 'id'>>) => {
      const id = (Math.max(...state.holidays.map(h => parseInt(h.id))) + 1).toString();
      state.holidays.push({ ...action.payload, id });
    },
    updateHoliday: (state, action: PayloadAction<Holiday>) => {
      const index = state.holidays.findIndex(h => h.id === action.payload.id);
      if (index !== -1) {
        state.holidays[index] = action.payload;
      }
    },
    deleteHoliday: (state, action: PayloadAction<string>) => {
      state.holidays = state.holidays.filter(h => h.id !== action.payload);
    },
    setWorkingDays: (state, action: PayloadAction<number[]>) => {
      state.workingDays = action.payload;
    },
    setWorkingHours: (state, action: PayloadAction<{ start: number; end: number }>) => {
      state.workingHours = action.payload;
    },
  },
});

export const {
  setCurrentDate,
  setSelectedDate,
  addHoliday,
  updateHoliday,
  deleteHoliday,
  setWorkingDays,
  setWorkingHours,
} = dateSlice.actions;

export default dateSlice.reducer; 
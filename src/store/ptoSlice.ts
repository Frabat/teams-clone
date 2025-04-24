import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addDays, parseISO, format, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

export interface PTOEvent {
  id: string;
  userId: string;
  userName: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isFullDay: boolean;
  type: 'auto' | 'manual';
}

interface User {
  id: string;
  name: string;
  totalPTOHours: number;
  usedPTOHours: number;
}

interface PTOState {
  events: PTOEvent[];
  users: User[];
}

const initialState: PTOState = {
  users: [
    {
      id: '1',
      name: 'Francesco Battista',
      totalPTOHours: 150,
      usedPTOHours: 32,
    },
    {
      id: '2',
      name: 'Rahul Das',
      totalPTOHours: 150,
      usedPTOHours: 24,
    },
    {
      id: '3',
      name: 'Dillon Hall-Rodriguez',
      totalPTOHours: 150,
      usedPTOHours: 40,
    },
    {
      id: '4',
      name: 'Jeff Underwood',
      totalPTOHours: 150,
      usedPTOHours: 16,
    },
    {
      id: '5',
      name: 'Shengxiang Zhao',
      totalPTOHours: 150,
      usedPTOHours: 48,
    },
  ],
  events: [
    // Full day PTO for Francesco
    {
      id: '1',
      userId: '1',
      userName: 'Francesco Battista',
      startDate: '2025-04-29T00:00:00.000Z',
      endDate: '2025-04-29T23:59:59.999Z',
      isFullDay: true,
      type: 'auto',
    },
    // Other PTOs
    {
      id: '2',
      userId: '2',
      userName: 'Rahul Das',
      startDate: '2025-04-30T15:00:00.000Z',
      endDate: '2025-04-30T18:00:00.000Z',
      isFullDay: false,
      type: 'auto',
    },
    {
      id: '3',
      userId: '3',
      userName: 'Dillon Hall-Rodriguez',
      startDate: '2025-05-02T13:00:00.000Z',
      endDate: '2025-05-02T17:00:00.000Z',
      isFullDay: false,
      type: 'auto',
    },
    // Next week
    {
      id: '4',
      userId: '4',
      userName: 'Jeff Underwood',
      startDate: '2025-05-05T14:00:00.000Z',
      endDate: '2025-05-05T16:00:00.000Z',
      isFullDay: false,
      type: 'auto',
    },
    // Previous week
    {
      id: '5',
      userId: '5',
      userName: 'Shengxiang Zhao',
      startDate: '2025-04-22T09:00:00.000Z',
      endDate: '2025-04-22T17:00:00.000Z',
      isFullDay: false,
      type: 'auto',
    },
  ],
};

const ptoSlice = createSlice({
  name: 'pto',
  initialState,
  reducers: {
    addPTOEvent: (state, action: PayloadAction<Omit<PTOEvent, 'id'>>) => {
      const id = (Math.max(...state.events.map(e => parseInt(e.id))) + 1).toString();
      state.events.push({ ...action.payload, id });
    },
    updatePTOEvent: (state, action: PayloadAction<PTOEvent>) => {
      const index = state.events.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deletePTOEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(e => e.id !== action.payload);
    },
    updateEventsForWeek: (state, action: PayloadAction<{ startDate: Date; endDate: Date }>) => {
      // Filter events to only show those within the current week
      state.events = state.events.filter(event => {
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);
        return isWithinInterval(eventStart, { start: action.payload.startDate, end: action.payload.endDate }) ||
               isWithinInterval(eventEnd, { start: action.payload.startDate, end: action.payload.endDate });
      });
    },
  },
});

export const { addPTOEvent, updatePTOEvent, deletePTOEvent, updateEventsForWeek } = ptoSlice.actions;
export default ptoSlice.reducer; 
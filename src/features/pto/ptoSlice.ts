import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface PTO {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'vacation' | 'personal';
}

interface PTOState {
  ptos: PTO[];
}

const initialState: PTOState = {
  ptos: [
    // Francesco Battista's PTOs
    {
      id: '1',
      userId: '1',
      userName: 'Francesco Battista',
      title: 'Vacation',
      description: 'Annual vacation',
      startDate: '2025-04-21',
      endDate: '2025-04-21',
      startTime: '09:00',
      endTime: '17:00',
      status: 'approved',
      type: 'vacation',
    },
    {
      id: '2',
      userId: '1',
      userName: 'Francesco Battista',
      title: 'Vacation',
      description: 'Annual vacation',
      startDate: '2025-04-22',
      endDate: '2025-04-22',
      startTime: '09:00',
      endTime: '17:00',
      status: 'approved',
      type: 'vacation',
    },
    // Rahul Das's PTOs
    {
      id: '3',
      userId: '2',
      userName: 'Rahul Das',
      title: 'Personal Day',
      description: 'Doctor appointment',
      startDate: '2025-04-24',
      endDate: '2025-04-24',
      startTime: '09:00',
      endTime: '17:00',
      status: 'approved',
      type: 'personal',
    },
    {
      id: '4',
      userId: '2',
      userName: 'Rahul Das',
      title: 'Personal Day',
      description: 'Doctor appointment',
      startDate: '2025-04-25',
      endDate: '2025-04-25',
      startTime: '14:00',
      endTime: '17:00',
      status: 'approved',
      type: 'personal',
    },
    // Jeff Underwood's PTOs
    {
      id: '5',
      userId: '3',
      userName: 'Jeff Underwood',
      title: 'Vacation',
      description: 'Annual vacation',
      startDate: '2025-04-29',
      endDate: '2025-04-29',
      startTime: '09:00',
      endTime: '17:00',
      status: 'approved',
      type: 'vacation',
    },
    {
      id: '6',
      userId: '3',
      userName: 'Jeff Underwood',
      title: 'Vacation',
      description: 'Annual vacation',
      startDate: '2025-04-30',
      endDate: '2025-04-30',
      startTime: '09:00',
      endTime: '17:00',
      status: 'approved',
      type: 'vacation',
    },
    // Shengxiang Zhao's PTOs
    {
      id: '7',
      userId: '4',
      userName: 'Shengxiang Zhao',
      title: 'Personal Day',
      description: 'Doctor appointment',
      startDate: '2025-05-02',
      endDate: '2025-05-02',
      startTime: '09:00',
      endTime: '17:00',
      status: 'approved',
      type: 'personal',
    },
    {
      id: '8',
      userId: '4',
      userName: 'Shengxiang Zhao',
      title: 'Personal Day',
      description: 'Doctor appointment',
      startDate: '2025-05-03',
      endDate: '2025-05-03',
      startTime: '09:00',
      endTime: '17:00',
      status: 'approved',
      type: 'personal',
    },
    // Dillon Hall-Rodriguez's PTOs
    {
      id: '9',
      userId: '5',
      userName: 'Dillon Hall-Rodriguez',
      title: 'Vacation',
      description: 'Annual vacation',
      startDate: '2025-05-06',
      endDate: '2025-05-06',
      startTime: '09:00',
      endTime: '17:00',
      status: 'approved',
      type: 'vacation',
    },
    {
      id: '10',
      userId: '5',
      userName: 'Dillon Hall-Rodriguez',
      title: 'Vacation',
      description: 'Annual vacation',
      startDate: '2025-05-07',
      endDate: '2025-05-07',
      startTime: '09:00',
      endTime: '17:00',
      status: 'approved',
      type: 'vacation',
    },
  ],
};

export const ptoSlice = createSlice({
  name: 'pto',
  initialState,
  reducers: {
    addPTO: (state, action: PayloadAction<PTO>) => {
      state.ptos.push(action.payload);
    },
    updatePTO: (state, action: PayloadAction<PTO>) => {
      const index = state.ptos.findIndex((pto) => pto.id === action.payload.id);
      if (index !== -1) {
        state.ptos[index] = action.payload;
      }
    },
    deletePTO: (state, action: PayloadAction<string>) => {
      state.ptos = state.ptos.filter((pto) => pto.id !== action.payload);
    },
  },
});

export const { addPTO, updatePTO, deletePTO } = ptoSlice.actions;

export const selectAllPTOs = (state: RootState) => state.pto.ptos;
export const selectPTOsByDate = (state: RootState, date: string) =>
  state.pto.ptos.filter((pto) => pto.startDate <= date && pto.endDate >= date);

export default ptoSlice.reducer; 
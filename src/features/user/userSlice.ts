import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  currentUser: User;
}

const initialState: UserState = {
  currentUser: {
    id: '1',
    name: 'Francesco Battista',
    email: 'francesco.battista@example.com',
    role: 'Software Engineer',
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
  },
});

export const { setCurrentUser } = userSlice.actions;

// Selectors
export const selectCurrentUser = (state: RootState) => state.user.currentUser;

export default userSlice.reducer; 
export interface User {
  id: string;
  name: string;
  totalPTOHours: number;
  usedPTOHours: number;
}

export interface PTOEvent {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  isFullDay: boolean;
  type: 'auto' | 'manual';
} 
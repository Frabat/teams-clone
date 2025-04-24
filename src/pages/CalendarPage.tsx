import React from 'react';
import { useSelector } from 'react-redux';
import { startOfWeek } from 'date-fns';
import { selectCurrentDate } from '../features/calendar/calendarSlice';
import CalendarGrid from '../components/CalendarGrid';
import CalendarHeader from '../components/CalendarHeader';
import CalendarSidebar from '../components/CalendarSidebar';

const CalendarPage: React.FC = () => {
  const currentDate = useSelector(selectCurrentDate);
  const weekStart = startOfWeek(new Date(currentDate), { weekStartsOn: 0 });

  return (
    <div className="flex flex-1 h-full bg-[#1F1F1F]">
      <CalendarSidebar />
      <div className="flex flex-col flex-1 bg-[#1F1F1F]">
        <CalendarHeader />
        <CalendarGrid weekStart={weekStart} />
      </div>
    </div>
  );
};

export default CalendarPage; 
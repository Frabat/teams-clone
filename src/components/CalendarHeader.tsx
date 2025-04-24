import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChevronLeftOutlined,
  ChevronRightOutlined,
  CalendarTodayOutlined,
  AddOutlined,
  MoreHorizOutlined
} from '@mui/icons-material';
import { format, addDays, startOfWeek } from 'date-fns';
import { selectCurrentDate, setCurrentDate } from '../features/calendar/calendarSlice';

const CalendarHeader = () => {
  const dispatch = useDispatch();
  const currentDate = useSelector(selectCurrentDate);
  const weekStart = startOfWeek(new Date(currentDate), { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 6);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    dispatch(setCurrentDate(addDays(new Date(currentDate), days).toISOString()));
  };

  const goToToday = () => {
    dispatch(setCurrentDate(new Date().toISOString()));
  };

  return (
    <div className="h-16 border-b border-[#404040] flex items-center justify-between px-4 bg-[#1F1F1F]">
      <div className="flex items-center space-x-4">
        <button
          className="h-8 px-4 bg-[#444791] text-white rounded-sm hover:bg-[#444791]/90
            flex items-center justify-center text-sm font-medium"
        >
          <AddOutlined sx={{ fontSize: 20, marginRight: '4px' }} />
          New meeting
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-1.5 rounded-sm hover:bg-[#3D3D3D] text-[#A8A8A8] hover:text-white"
          >
            <ChevronLeftOutlined />
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="p-1.5 rounded-sm hover:bg-[#3D3D3D] text-[#A8A8A8] hover:text-white"
          >
            <ChevronRightOutlined />
          </button>
          <button
            onClick={goToToday}
            className="h-8 px-3 text-sm text-[#A8A8A8] hover:text-white hover:bg-[#3D3D3D] rounded-sm
              flex items-center space-x-2"
          >
            <CalendarTodayOutlined sx={{ fontSize: 18 }} />
            <span>Today</span>
          </button>
        </div>

        <span className="text-lg font-semibold">
          {format(weekStart, 'MMMM d')}
          {format(weekStart, 'M') !== format(weekEnd, 'M') && 
            ` - ${format(weekEnd, 'MMMM d')}`}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-sm hover:bg-[#3D3D3D] text-[#A8A8A8] hover:text-white">
          <MoreHorizOutlined />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader; 
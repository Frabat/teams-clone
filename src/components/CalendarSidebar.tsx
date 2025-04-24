import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChevronLeftOutlined,
  ChevronRightOutlined,
  CheckBoxOutlineBlankOutlined,
  CheckBoxOutlined,
  ExpandMoreOutlined
} from '@mui/icons-material';
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  isSameDay
} from 'date-fns';
import { selectCurrentDate, setCurrentDate } from '../features/calendar/calendarSlice';

const CalendarSidebar = () => {
  const dispatch = useDispatch();
  const currentDate = useSelector(selectCurrentDate);
  const [displayMonth, setDisplayMonth] = React.useState(new Date(currentDate));

  const navigateMonth = (direction: 'prev' | 'next') => {
    setDisplayMonth(prev => addMonths(prev, direction === 'prev' ? -1 : 1));
  };

  const getDaysToDisplay = () => {
    const start = startOfWeek(startOfMonth(displayMonth));
    const end = endOfWeek(endOfMonth(displayMonth));
    return eachDayOfInterval({ start, end });
  };

  const selectDate = (date: Date) => {
    dispatch(setCurrentDate(date.toISOString()));
  };

  return (
    <div className="w-80 border-r border-[#404040] bg-[#1F1F1F] flex flex-col">
      {/* Mini Calendar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold">
            {format(displayMonth, 'MMMM yyyy')}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 rounded-sm hover:bg-[#3D3D3D] text-[#A8A8A8] hover:text-white"
            >
              <ChevronLeftOutlined sx={{ fontSize: 20 }} />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 rounded-sm hover:bg-[#3D3D3D] text-[#A8A8A8] hover:text-white"
            >
              <ChevronRightOutlined sx={{ fontSize: 20 }} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-xs text-[#A8A8A8] font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {getDaysToDisplay().map((date, i) => {
            const isSelected = isSameDay(date, new Date(currentDate));
            const isCurrentMonth = isSameMonth(date, displayMonth);
            const isCurrentDay = isToday(date);

            return (
              <button
                key={i}
                onClick={() => selectDate(date)}
                className={`
                  text-sm py-1 rounded-sm
                  ${!isCurrentMonth ? 'text-[#A8A8A8]/50' : ''}
                  ${isSelected ? 'bg-[#444791] text-white' : 'hover:bg-[#3D3D3D]'}
                  ${isCurrentDay && !isSelected ? 'text-[#444791] font-semibold' : ''}
                `}
              >
                {format(date, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar List */}
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold">Calendar</span>
          <button className="p-1 rounded-sm hover:bg-[#3D3D3D] text-[#A8A8A8] hover:text-white">
            <ExpandMoreOutlined />
          </button>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Calendar', color: '#444791' },
            { name: 'Birthdays', color: '#C4314B' },
            { name: 'United States holidays', color: '#70B5C9' },
          ].map((calendar, i) => (
            <div key={i} className="flex items-center space-x-2">
              <button className="text-[#A8A8A8] hover:text-white">
                {calendar.name === 'Calendar' ? (
                  <CheckBoxOutlined sx={{ fontSize: 20, color: calendar.color }} />
                ) : (
                  <CheckBoxOutlineBlankOutlined sx={{ fontSize: 20, color: calendar.color }} />
                )}
              </button>
              <span className="text-sm">{calendar.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar; 
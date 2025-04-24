import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton, styled } from '@mui/material';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, isWithinInterval, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updatePTOEvent } from '../../store/ptoSlice';
import PTODay from '../../components/PTO/PTODay';

const CalendarContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#1f1f1f',
  overflow: 'hidden',
});

const WeekHeader = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '60px repeat(7, 1fr)',
  borderBottom: '1px solid #404040',
});

const WeekDay = styled(Box)({
  textAlign: 'center',
  padding: '8px',
  backgroundColor: '#2d2d2d',
  color: '#fff',
  borderRight: '1px solid #404040',
  '&:last-child': {
    borderRight: 'none',
  },
});

const TimeSlots = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  width: '60px',
  borderRight: '1px solid #404040',
});

const TimeSlot = styled(Box)({
  height: '60px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  paddingRight: '8px',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '12px',
  borderBottom: '1px solid #404040',
});

const CalendarGrid = styled(Box)({
  display: 'flex',
  flex: 1,
  overflow: 'auto',
});

const WeekGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  flex: 1,
  minHeight: '1440px', // 24 hours * 60px
  position: 'relative',
});

const Calendar: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.pto.events);
  const users = useAppSelector((state) => state.pto.users);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Generate time slots for the full day (00:00 to 23:59)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    return `${i.toString().padStart(2, '0')}:00`;
  });

  // Filter events for the current week and ensure they're properly formatted
  const weekEvents = useMemo(() => {
    return events
      .filter(event => {
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);
        return isWithinInterval(eventStart, { start: weekStart, end: weekEnd }) ||
               isWithinInterval(eventEnd, { start: weekStart, end: weekEnd });
      })
      .map(event => ({
        ...event,
        startDate: new Date(event.startDate).toISOString(),
        endDate: new Date(event.endDate).toISOString(),
      }));
  }, [events, weekStart, weekEnd]);

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const handleEventUpdate = (eventId: string, newStartDate: string, newEndDate: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      dispatch(updatePTOEvent({
        ...event,
        startDate: newStartDate,
        endDate: newEndDate,
      }));
    }
  };

  return (
    <CalendarContainer>
      <WeekHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <IconButton onClick={handlePreviousWeek} sx={{ color: '#fff', p: 0.5 }}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="subtitle2" sx={{ color: '#fff' }}>
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </Typography>
          <IconButton onClick={handleNextWeek} sx={{ color: '#fff', p: 0.5 }}>
            <ChevronRight />
          </IconButton>
          <IconButton onClick={handleToday} sx={{ color: '#fff', p: 0.5, ml: 1 }}>
            <Typography variant="caption">Today</Typography>
          </IconButton>
        </Box>
        {days.map((day) => (
          <WeekDay key={day.toString()}>
            <Typography variant="subtitle2">{format(day, 'EEE')}</Typography>
            <Typography variant="h6">{format(day, 'd')}</Typography>
          </WeekDay>
        ))}
      </WeekHeader>
      <CalendarGrid>
        <TimeSlots>
          {timeSlots.map((time) => (
            <TimeSlot key={time}>
              <Typography variant="caption">{time}</Typography>
            </TimeSlot>
          ))}
        </TimeSlots>
        <WeekGrid>
          {days.map((day) => {
            const dayEvents = weekEvents.filter(event => {
              const eventStart = parseISO(event.startDate);
              const eventEnd = parseISO(event.endDate);
              return isSameDay(eventStart, day) || isSameDay(eventEnd, day);
            });
            
            return (
              <PTODay
                key={day.toString()}
                date={day}
                events={dayEvents}
                users={users}
                onEventUpdate={handleEventUpdate}
              />
            );
          })}
        </WeekGrid>
      </CalendarGrid>
    </CalendarContainer>
  );
};

export default Calendar; 
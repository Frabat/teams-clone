import React, { useState, useRef, useMemo } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { format, parseISO, getHours, getMinutes, addMinutes, setHours, setMinutes, isSameDay } from 'date-fns';
import { PTOEvent, User } from '../../types';

const DayContainer = styled(Box)({
  backgroundColor: '#2d2d2d',
  position: 'relative',
  height: '1440px', // 24 hours * 60px
  borderRight: '1px solid #404040',
  '&:last-child': {
    borderRight: 'none',
  },
});

const TimeSlot = styled(Box)({
  height: '60px',
  borderBottom: '1px solid #404040',
  position: 'relative',
});

const EventItem = styled(Box)<{ top: number; height: number; type: string; left: number; width: number }>(({ top, height, type, left, width }) => ({
  position: 'absolute',
  left: `${left}%`,
  width: `${width}%`,
  top: `${top}px`,
  height: `${height}px`,
  backgroundColor: '#4d2d2d',
  padding: '8px',
  borderRadius: '4px',
  borderLeft: '3px solid #A76262',
  zIndex: 1,
  overflow: 'hidden',
  opacity: 0.7,
  cursor: 'move',
  userSelect: 'none',
  '&:hover': {
    backgroundColor: '#5d3d3d',
    opacity: 1,
  },
  '& .resize-handle': {
    position: 'absolute',
    width: '100%',
    height: '8px',
    bottom: 0,
    cursor: 'ns-resize',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
  },
}));

interface PTODayProps {
  date: Date;
  events: PTOEvent[];
  users: User[];
  onEventUpdate: (eventId: string, newStartDate: string, newEndDate: string) => void;
}

const PTODay: React.FC<PTODayProps> = ({ date, events, users, onEventUpdate }) => {
  const [draggedEvent, setDraggedEvent] = useState<{ 
    id: string; 
    offsetX: number;
    offsetY: number; 
    originalDate: Date;
    originalColumn: number;
  } | null>(null);
  const [resizedEvent, setResizedEvent] = useState<{ 
    id: string; 
    startY: number; 
    originalHeight: number;
    originalEndDate: Date;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate time slots for the full day (00:00 to 23:59)
  const timeSlots: number[] = Array.from({ length: 24 }, (_, i) => i);

  // Group events by time slot to prevent overlaps
  const groupedEvents = useMemo(() => {
    const slots: { [key: string]: PTOEvent[] } = {};
    
    events.forEach(event => {
      if (event.isFullDay) return;
      
      const startTime = parseISO(event.startDate);
      const endTime = parseISO(event.endDate);
      const startMinutes = getHours(startTime) * 60 + getMinutes(startTime);
      const endMinutes = getHours(endTime) * 60 + getMinutes(endTime);
      
      // Find overlapping events
      const overlappingEvents = events.filter(e => {
        if (e.id === event.id || e.isFullDay) return false;
        const eStart = parseISO(e.startDate);
        const eEnd = parseISO(e.endDate);
        const eStartMinutes = getHours(eStart) * 60 + getMinutes(eStart);
        const eEndMinutes = getHours(eEnd) * 60 + getMinutes(eEnd);
        
        return (
          (startMinutes >= eStartMinutes && startMinutes < eEndMinutes) ||
          (endMinutes > eStartMinutes && endMinutes <= eEndMinutes) ||
          (startMinutes <= eStartMinutes && endMinutes >= eEndMinutes)
        );
      });
      
      // Create a unique key for this group of overlapping events
      const key = overlappingEvents
        .map(e => e.id)
        .sort()
        .join('-');
      
      if (!slots[key]) {
        slots[key] = [];
      }
      slots[key].push(event);
    });
    
    return slots;
  }, [events]);

  const handleDragStart = (mouseEvent: React.MouseEvent, eventId: string) => {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    
    const target = mouseEvent.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return;
    
    const ptoEvent = events.find(e => e.id === eventId);
    if (ptoEvent) {
      const columnWidth = containerRect.width;
      const initialColumn = Math.floor((rect.left - containerRect.left) / columnWidth);
      
      setDraggedEvent({ 
        id: eventId, 
        offsetX: mouseEvent.clientX - rect.left,
        offsetY: mouseEvent.clientY - rect.top,
        originalDate: parseISO(ptoEvent.startDate),
        originalColumn: initialColumn
      });
    }
  };

  const handleDragMove = (mouseEvent: React.MouseEvent) => {
    if (!draggedEvent || !containerRef.current) return;
    mouseEvent.preventDefault();

    const containerRect = containerRef.current.getBoundingClientRect();
    const columnWidth = containerRect.width;
    
    const newX = mouseEvent.clientX - containerRect.left - draggedEvent.offsetX;
    const newY = mouseEvent.clientY - containerRect.top - draggedEvent.offsetY;
    
    const newColumn = Math.max(0, Math.min(6, Math.floor(newX / columnWidth)));
    const minutes = Math.max(0, Math.min(1440, newY));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    const ptoEvent = events.find(e => e.id === draggedEvent.id);
    if (ptoEvent) {
      const daysDiff = newColumn - draggedEvent.originalColumn;
      const newDate = new Date(draggedEvent.originalDate);
      newDate.setDate(newDate.getDate() + daysDiff);
      newDate.setHours(hours, mins);
      
      const newStartDate = newDate.toISOString();
      const duration = parseISO(ptoEvent.endDate).getTime() - parseISO(ptoEvent.startDate).getTime();
      const newEndDate = new Date(newDate.getTime() + duration).toISOString();
      
      onEventUpdate(draggedEvent.id, newStartDate, newEndDate);
      
      if (newColumn !== draggedEvent.originalColumn) {
        setDraggedEvent(prev => prev ? {
          ...prev,
          originalColumn: newColumn,
          originalDate: newDate
        } : null);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedEvent(null);
  };

  const handleResizeStart = (mouseEvent: React.MouseEvent, eventId: string) => {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    
    const ptoEvent = events.find(e => e.id === eventId);
    if (ptoEvent) {
      setResizedEvent({ 
        id: eventId, 
        startY: mouseEvent.clientY,
        originalHeight: calculateEventPosition(ptoEvent).height,
        originalEndDate: parseISO(ptoEvent.endDate)
      });
    }
  };

  const handleResizeMove = (mouseEvent: React.MouseEvent) => {
    if (!resizedEvent) return;
    mouseEvent.preventDefault();
    
    const ptoEvent = events.find(e => e.id === resizedEvent.id);
    if (!ptoEvent) return;

    const deltaY = mouseEvent.clientY - resizedEvent.startY;
    const newHeight = Math.max(30, resizedEvent.originalHeight + deltaY);
    
    const minutesToAdd = Math.floor((newHeight - resizedEvent.originalHeight) / 60);
    const newEndDate = addMinutes(resizedEvent.originalEndDate, minutesToAdd);
    
    if (newEndDate.getTime() !== resizedEvent.originalEndDate.getTime()) {
      onEventUpdate(resizedEvent.id, ptoEvent.startDate, newEndDate.toISOString());
    }
  };

  const handleResizeEnd = () => {
    setResizedEvent(null);
  };

  React.useEffect(() => {
    if (draggedEvent) {
      window.addEventListener('mousemove', handleDragMove as any);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('mouseleave', handleDragEnd);
    }
    if (resizedEvent) {
      window.addEventListener('mousemove', handleResizeMove as any);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('mouseleave', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove as any);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('mouseleave', handleDragEnd);
      window.removeEventListener('mousemove', handleResizeMove as any);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('mouseleave', handleResizeEnd);
    };
  }, [draggedEvent, resizedEvent]);

  const calculateEventPosition = (event: PTOEvent) => {
    if (event.isFullDay) {
      return { top: 0, height: 1440, left: 0, width: 100 }; // Full day event
    }

    const startTime = parseISO(event.startDate);
    const endTime = parseISO(event.endDate);
    
    const startHour = getHours(startTime);
    const startMinute = getMinutes(startTime);
    const endHour = getHours(endTime);
    const endMinute = getMinutes(endTime);
    
    const top = (startHour * 60) + startMinute;
    const height = ((endHour - startHour) * 60) + (endMinute - startMinute);
    
    // Find the group this event belongs to
    const groupKey = Object.keys(groupedEvents).find(key => 
      groupedEvents[key].some(e => e.id === event.id)
    );
    
    if (groupKey) {
      const group = groupedEvents[groupKey];
      const index = group.findIndex(e => e.id === event.id);
      const width = 100 / group.length;
      const left = index * width;
      return { top, height, left, width };
    }
    
    return { top, height, left: 0, width: 100 };
  };

  return (
    <DayContainer ref={containerRef}>
      {timeSlots.map((hour) => (
        <TimeSlot key={hour} />
      ))}
      {events.map((event) => {
        const user = users.find(u => u.id === event.userId);
        const { top, height, left, width } = calculateEventPosition(event);
        const startTime = format(parseISO(event.startDate), 'HH:mm');
        const endTime = format(parseISO(event.endDate), 'HH:mm');
        
        return (
          <EventItem
            key={event.id}
            top={top}
            height={height}
            type={event.type}
            left={left}
            width={width}
            onMouseDown={(e) => handleDragStart(e, event.id)}
          >
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
              {user?.name || event.userName}{event.type === 'auto' ? ' - Auto PTO' : ''}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mt: 0.5 }}>
              {startTime} - {endTime}
            </Typography>
            {event.isFullDay && (
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 0.5 }}>
                Full Day
              </Typography>
            )}
            <div
              className="resize-handle"
              onMouseDown={(e) => handleResizeStart(e, event.id)}
            />
          </EventItem>
        );
      })}
    </DayContainer>
  );
};

export default PTODay; 
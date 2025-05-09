import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  Modifier,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { selectAllPTOs, updatePTO } from '../features/pto/ptoSlice';
import { PTO } from '../features/pto/ptoSlice';

interface CalendarGridProps {
  weekStart: Date;
}

const HOUR_HEIGHT = 60; // Height of each hour cell in pixels
const DAY_WIDTH = 150; // Width of each day column in pixels

// Create a snap modifier for grid
const createSnapToGridModifier = (hourHeight: number, dayWidth: number): Modifier => {
  return ({
    draggingNodeRect,
    transform,
  }) => {
    if (!draggingNodeRect) {
      return transform;
    }

    return {
      ...transform,
      x: Math.round(transform.x / dayWidth) * dayWidth,
      y: Math.round(transform.y / hourHeight) * hourHeight,
    };
  };
};

const PTOCard = ({ pto, isDragging = false }: { pto: PTO; isDragging?: boolean }) => {
  const startHour = parseInt(pto.startTime.split(':')[0]);
  const endHour = parseInt(pto.endTime.split(':')[0]);
  const duration = endHour - startHour;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: pto.id,
    data: { pto }
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    top: `${startHour * HOUR_HEIGHT}px`,
    height: `${duration * HOUR_HEIGHT}px`,
  } : {
    top: `${startHour * HOUR_HEIGHT}px`,
    height: `${duration * HOUR_HEIGHT}px`,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`absolute left-0 right-0 mx-2 p-2 rounded-sm border-l-4 bg-[#C4314B]/10 border-[#C4314B] hover:bg-[#C4314B]/20 transition-colors duration-200 cursor-move touch-none ${
        isDragging ? 'z-50 shadow-lg opacity-50' : ''
      }`}
      style={style}
    >
      <div className="text-xs font-medium text-[#C4314B] truncate">{`${pto.userName} PTO - AUTO`}</div>
      <div className="text-xs text-gray-400 truncate">{pto.userName}</div>
    </div>
  );
};

const DayColumn = ({ day, dayIdx, children }: { day: Date; dayIdx: number; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${dayIdx}-day`,
    data: { dayIdx, date: day }
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-full ${isOver ? 'bg-[#292929]/20' : ''}`}
      style={{ height: `${24 * HOUR_HEIGHT}px` }}
    >
      {children}
    </div>
  );
};

const CalendarGrid: React.FC<CalendarGridProps> = ({ weekStart }) => {
  const dispatch = useDispatch();
  const allPTOs = useSelector(selectAllPTOs);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [activePTO, setActivePTO] = React.useState<PTO | null>(null);

  // Create snap modifier
  const snapToGrid = useMemo(() => createSnapToGridModifier(HOUR_HEIGHT, DAY_WIDTH), []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const pto = allPTOs.find(p => p.id === active.id);
    if (pto) setActivePTO(pto);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActivePTO(null);
    
    if (!over) return;

    const pto = allPTOs.find(p => p.id === active.id);
    if (!pto) return;

    // Get the day index from the droppable ID
    const [dayIndex] = (over.id as string).split('-').map(Number);
    const newDate = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');

    // Calculate new hour based on the final position
    const currentStartHour = parseInt(pto.startTime.split(':')[0]);
    const deltaHours = Math.round(delta.y / HOUR_HEIGHT);
    const newHour = Math.max(0, Math.min(23, currentStartHour + deltaHours));

    // Calculate duration from current PTO
    const currentEndHour = parseInt(pto.endTime.split(':')[0]);
    const duration = currentEndHour - currentStartHour;

    // Ensure end hour doesn't exceed day bounds
    const endHour = Math.min(23, newHour + duration);
    
    // Format times
    const newStartTime = `${String(newHour).padStart(2, '0')}:00`;
    const newEndTime = `${String(endHour).padStart(2, '0')}:00`;

    // Update PTO in Redux store
    dispatch(updatePTO({
      ...pto,
      startDate: newDate,
      endDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime
    }));
  };

  const getPTOsForDay = (day: Date) => {
    return allPTOs.filter(pto => isSameDay(parseISO(pto.startDate), day));
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[snapToGrid, snapCenterToCursor]}
    >
      <div className="flex-1 overflow-auto">
        <div className="inline-flex flex-col min-w-full">
          <div className="sticky top-0 z-30 flex bg-[#1F1F1F] border-b border-[#292929]">
            <div className="w-16" />
            {days.map((day, i) => (
              <div
                key={i}
                className="flex-1 min-w-[150px] border-l border-[#292929] px-2 py-3"
              >
                <div className="font-semibold text-gray-200">{format(day, 'EEEE')}</div>
                <div className="text-gray-400">{format(day, 'MMM d, yyyy')}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-auto">
            <div className="sticky left-0 z-20 w-16 flex-none bg-[#1F1F1F] border-r border-[#292929]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="text-xs leading-5 text-gray-400 text-right pr-2 relative h-[60px]"
                >
                  <div className="sticky left-0 -mt-2.5">
                    {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-auto grid grid-cols-7 divide-x divide-[#292929]">
              {days.map((day, dayIdx) => {
                const dayPTOs = getPTOsForDay(day);
                return (
                  <DayColumn key={`${dayIdx}-day`} day={day} dayIdx={dayIdx}>
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-[60px] border-t border-[#292929] relative"
                        data-hour={hour}
                      />
                    ))}
                    {dayPTOs.map((pto) => (
                      <PTOCard key={pto.id} pto={pto} />
                    ))}
                  </DayColumn>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activePTO && <PTOCard pto={activePTO} isDragging />}
      </DragOverlay>
    </DndContext>
  );
};

export default CalendarGrid; 
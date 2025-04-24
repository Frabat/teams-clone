import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragOverlay,
  rectIntersection,
  useDraggable,
  useDroppable,
  DragStartEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { selectAllPTOs, updatePTO } from '../features/pto/ptoSlice';
import { PTO } from '../features/pto/ptoSlice';

interface CalendarGridProps {
  weekStart: Date;
}

const HOUR_HEIGHT = 60; // Height of each hour cell in pixels

const PTOCard = ({ pto, isDragging = false }: { pto: PTO; isDragging?: boolean }) => {
  const startHour = parseInt(pto.startTime.split(':')[0]);
  const endHour = parseInt(pto.endTime.split(':')[0]);
  const duration = endHour - startHour;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: pto.id,
    data: pto
  });

  const style = {
    transform: CSS.Transform.toString(transform),
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
  const { setNodeRef } = useDroppable({
    id: `${dayIdx}-day`,
    data: { dayIdx, date: day }
  });

  return (
    <div
      ref={setNodeRef}
      className="relative min-h-full"
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
    const { active, over } = event;
    setActivePTO(null);
    
    if (!over) return;

    const pto = allPTOs.find(p => p.id === active.id);
    if (!pto) return;

    // Get coordinates relative to the container
    const droppableElement = over.id as string;
    const [dayIndex] = droppableElement.split('-').map(Number);
    const newDate = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');

    // Get the drop coordinates
    const container = document.querySelector(`[data-droppable-id="${droppableElement}"]`);
    if (!container) return;

    // Calculate position relative to the container
    const rect = container.getBoundingClientRect();
    const scrollTop = container.parentElement?.scrollTop || 0;
    const clientY = (event.activatorEvent as PointerEvent).clientY;
    const dropY = clientY - rect.top + scrollTop;

    // Calculate new hour based on the drop position
    const newHour = Math.max(0, Math.min(23, Math.floor(dropY / HOUR_HEIGHT)));

    // Calculate duration from current PTO
    const currentStartHour = parseInt(pto.startTime.split(':')[0]);
    const currentEndHour = parseInt(pto.endTime.split(':')[0]);
    const duration = currentEndHour - currentStartHour;

    // Ensure end hour doesn't exceed day bounds
    const endHour = Math.min(23, newHour + duration);
    
    // Format times
    const newStartTime = `${String(newHour).padStart(2, '0')}:00`;
    const newEndTime = `${String(endHour).padStart(2, '0')}:00`;

    console.log('Updating PTO:', {
      id: pto.id,
      oldDate: pto.startDate,
      newDate,
      oldStartTime: pto.startTime,
      newStartTime,
      oldEndTime: pto.endTime,
      newEndTime,
      dropY,
      newHour
    });

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
      collisionDetection={rectIntersection}
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
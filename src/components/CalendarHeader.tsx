import React, { useState, useMemo, ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChevronLeftOutlined,
  ChevronRightOutlined,
  CalendarTodayOutlined,
  AddOutlined,
  MoreHorizOutlined,
  KeyboardArrowDownOutlined,
  Close as CloseIcon,
  EventAvailable,
  Person,
  AccessTime,
  Celebration,
  TrendingUp,
  Groups,
  CheckCircle
} from '@mui/icons-material';
import { format, addDays, startOfWeek, parseISO, differenceInHours, isSameMonth, isWithinInterval, addMonths, isBefore, isAfter, isSameDay } from 'date-fns';
import { selectCurrentDate, setCurrentDate } from '../features/calendar/calendarSlice';
import { selectAllPTOs, addPTO } from '../features/pto/ptoSlice';
import { RootState } from '../app/store';
import { v4 as uuidv4 } from 'uuid';

const MAX_PTO_HOURS = 150;

const calculateHours = (startDate: string, endDate: string, startTime: string, endTime: string) => {
  const start = parseISO(`${startDate}T${startTime}`);
  const end = parseISO(`${endDate}T${endTime}`);
  return differenceInHours(end, start);
};

// Federal Holidays 2024-2025
const FEDERAL_HOLIDAYS = [
  { date: '2024-12-25', name: 'Christmas Day' },
  { date: '2025-01-01', name: 'New Year\'s Day' },
  { date: '2025-01-20', name: 'Martin Luther King Jr. Day' },
  { date: '2025-02-17', name: 'Presidents Day' },
  { date: '2025-05-26', name: 'Memorial Day' },
  { date: '2025-07-04', name: 'Independence Day' },
  { date: '2025-09-01', name: 'Labor Day' },
  { date: '2025-11-27', name: 'Thanksgiving Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
];

// Current user info (in a real app, this would come from an auth context/store)
const CURRENT_USER = {
  id: '1',
  name: 'Francesco Battista'
};

interface BreakSuggestion {
  type: 'holiday' | 'popular' | 'optimal';
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  icon: ReactElement;
}

const CalendarHeader = () => {
  const dispatch = useDispatch();
  const currentDate = useSelector(selectCurrentDate);
  const allPTOs = useSelector(selectAllPTOs);
  const weekStart = startOfWeek(new Date(currentDate), { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 6);
  const [showPTODropdown, setShowPTODropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'summary' | 'plan' | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' } | null>(null);
  const [customBreak, setCustomBreak] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'vacation' as 'vacation' | 'personal'
  });

  // Calculate PTO statistics in hours
  const ptoStats = useMemo(() => {
    const stats = {
      total: 0,
      vacation: 0,
      personal: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    allPTOs.forEach(pto => {
      const hours = calculateHours(pto.startDate, pto.endDate, pto.startTime, pto.endTime);
      stats.total += hours;
      if (pto.type === 'vacation') stats.vacation += hours;
      if (pto.type === 'personal') stats.personal += hours;
      if (pto.status === 'pending') stats.pending += hours;
      if (pto.status === 'approved') stats.approved += hours;
      if (pto.status === 'rejected') stats.rejected += hours;
    });

    return stats;
  }, [allPTOs]);

  // Group PTOs by user with hour calculations
  const ptosByUser = useMemo(() => {
    const grouped = allPTOs.reduce((acc, pto) => {
      if (!acc[pto.userId]) {
        acc[pto.userId] = {
          userName: pto.userName,
          ptos: [],
          totalHours: 0,
          vacation: 0,
          personal: 0,
        };
      }
      const hours = calculateHours(pto.startDate, pto.endDate, pto.startTime, pto.endTime);
      acc[pto.userId].ptos.push(pto);
      acc[pto.userId].totalHours += hours;
      if (pto.type === 'vacation') acc[pto.userId].vacation += hours;
      if (pto.type === 'personal') acc[pto.userId].personal += hours;
      return acc;
    }, {} as Record<string, { userName: string; ptos: typeof allPTOs; totalHours: number; vacation: number; personal: number; }>);
    return Object.values(grouped);
  }, [allPTOs]);

  // Find popular PTO periods
  const popularPTOPeriods = useMemo(() => {
    const monthlyPTOs = allPTOs.reduce((acc, pto) => {
      const month = format(parseISO(pto.startDate), 'yyyy-MM');
      if (!acc[month]) acc[month] = 0;
      acc[month]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyPTOs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([month]) => month);
  }, [allPTOs]);

  // Check if a date range overlaps with existing PTOs
  const isDateRangeAvailable = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    return !allPTOs.some(pto => {
      const ptoStart = parseISO(pto.startDate);
      const ptoEnd = parseISO(pto.endDate);
      
      return (
        (isSameDay(start, ptoStart) || isAfter(start, ptoStart)) && isBefore(start, ptoEnd) ||
        (isSameDay(end, ptoStart) || isAfter(end, ptoStart)) && isBefore(end, ptoEnd) ||
        isBefore(start, ptoStart) && isAfter(end, ptoEnd)
      );
    });
  };

  // Generate break suggestions
  const breakSuggestions = useMemo(() => {
    const suggestions: BreakSuggestion[] = [];
    const today = new Date();
    const sixMonthsFromNow = addMonths(today, 6);

    // Holiday-based suggestions
    FEDERAL_HOLIDAYS.forEach(holiday => {
      const holidayDate = parseISO(holiday.date);
      const suggestedStart = format(addDays(holidayDate, -1), 'yyyy-MM-dd');
      const suggestedEnd = format(addDays(holidayDate, 1), 'yyyy-MM-dd');

      if (isWithinInterval(holidayDate, { start: today, end: sixMonthsFromNow }) &&
          isDateRangeAvailable(suggestedStart, suggestedEnd)) {
        suggestions.push({
          type: 'holiday' as const,
          title: `${holiday.name} Break`,
          description: `Take advantage of the ${holiday.name} holiday`,
          startDate: suggestedStart,
          endDate: suggestedEnd,
          icon: <Celebration className="text-[#C4314B]" />,
        });
      }
    });

    // Team pattern-based suggestions
    popularPTOPeriods.forEach(month => {
      const suggestedStart = `${month}-15`;
      const suggestedEnd = `${month}-19`;
      
      if (isDateRangeAvailable(suggestedStart, suggestedEnd)) {
        suggestions.push({
          type: 'popular' as const,
          title: `Popular Team Break`,
          description: `Many team members take time off in ${format(parseISO(`${month}-01`), 'MMMM yyyy')}`,
          startDate: suggestedStart,
          endDate: suggestedEnd,
          icon: <Groups className="text-[#444791]" />,
        });
      }
    });

    // Low coverage periods
    ['2025-03', '2025-08', '2025-10'].forEach(month => {
      const suggestedStart = `${month}-10`;
      const suggestedEnd = `${month}-14`;
      
      if (isDateRangeAvailable(suggestedStart, suggestedEnd)) {
        suggestions.push({
          type: 'optimal' as const,
          title: 'Optimal Break Period',
          description: `Low team PTO coverage in ${format(parseISO(`${month}-01`), 'MMMM yyyy')}`,
          startDate: suggestedStart,
          endDate: suggestedEnd,
          icon: <TrendingUp className="text-[#498205]" />,
        });
      }
    });

    return suggestions;
  }, [allPTOs]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    dispatch(setCurrentDate(addDays(new Date(currentDate), days).toISOString()));
  };

  const goToToday = () => {
    dispatch(setCurrentDate(new Date().toISOString()));
  };

  const handlePTOClick = (action: 'summary' | 'plan') => {
    setModalType(action);
    setShowModal(true);
    setShowPTODropdown(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const handleSelectBreak = (suggestion: BreakSuggestion) => {
    const newPTO = {
      id: uuidv4(),
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      title: suggestion.title,
      description: suggestion.description,
      startDate: suggestion.startDate,
      endDate: suggestion.endDate,
      startTime: '09:00',
      endTime: '17:00',
      status: 'pending' as const,
      type: (suggestion.type === 'holiday' ? 'vacation' : 'personal') as 'vacation' | 'personal'
    };

    dispatch(addPTO(newPTO));
    
    setNotification({
      message: 'The request has been submitted for approval',
      type: 'success'
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleCustomBreakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPTO = {
      id: uuidv4(),
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      title: customBreak.title,
      description: customBreak.description,
      startDate: customBreak.startDate,
      endDate: customBreak.endDate,
      startTime: '09:00',
      endTime: '17:00',
      status: 'pending' as const,
      type: customBreak.type
    };

    dispatch(addPTO(newPTO));
    
    setNotification({
      message: 'The request has been submitted for approval',
      type: 'success'
    });

    // Reset form
    setCustomBreak({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      type: 'vacation'
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleCustomBreakChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomBreak(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'summary':
        return (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Overall Statistics */}
            <div className="bg-[#3D3D3D] p-4 rounded-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Overall Statistics</h2>
                <div className="text-sm text-[#A8A8A8] flex items-center">
                  <AccessTime className="w-4 h-4 mr-1" />
                  Maximum: {MAX_PTO_HOURS} hours
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#444791]/20 p-3 rounded-sm border border-[#444791]">
                  <div className="text-2xl font-bold">{ptoStats.total}h</div>
                  <div className="text-sm text-[#A8A8A8]">Total Hours</div>
                  <div className="text-xs text-[#A8A8A8] mt-1">
                    {((ptoStats.total / MAX_PTO_HOURS) * 100).toFixed(1)}% used
                  </div>
                </div>
                <div className="bg-[#C4314B]/20 p-3 rounded-sm border border-[#C4314B]">
                  <div className="text-2xl font-bold">{ptoStats.vacation}h</div>
                  <div className="text-sm text-[#A8A8A8]">Vacation</div>
                  <div className="text-xs text-[#A8A8A8] mt-1">
                    {((ptoStats.vacation / MAX_PTO_HOURS) * 100).toFixed(1)}% of total
                  </div>
                </div>
                <div className="bg-[#498205]/20 p-3 rounded-sm border border-[#498205]">
                  <div className="text-2xl font-bold">{ptoStats.personal}h</div>
                  <div className="text-sm text-[#A8A8A8]">Personal</div>
                  <div className="text-xs text-[#A8A8A8] mt-1">
                    {((ptoStats.personal / MAX_PTO_HOURS) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-[#3D3D3D] p-4 rounded-sm">
              <h2 className="text-xl font-semibold mb-4">Status Breakdown</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Approved</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-[#292929] rounded-full h-2 mr-2">
                      <div 
                        className="bg-[#498205] h-2 rounded-full"
                        style={{ width: `${(ptoStats.approved / MAX_PTO_HOURS) * 100}%` }}
                      />
                    </div>
                    <span className="text-[#498205] font-medium">{ptoStats.approved}h</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pending</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-[#292929] rounded-full h-2 mr-2">
                      <div 
                        className="bg-[#C19C00] h-2 rounded-full"
                        style={{ width: `${(ptoStats.pending / MAX_PTO_HOURS) * 100}%` }}
                      />
                    </div>
                    <span className="text-[#C19C00] font-medium">{ptoStats.pending}h</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rejected</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-[#292929] rounded-full h-2 mr-2">
                      <div 
                        className="bg-[#C4314B] h-2 rounded-full"
                        style={{ width: `${(ptoStats.rejected / MAX_PTO_HOURS) * 100}%` }}
                      />
                    </div>
                    <span className="text-[#C4314B] font-medium">{ptoStats.rejected}h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Breakdown */}
            <div className="bg-[#3D3D3D] p-4 rounded-sm">
              <h2 className="text-xl font-semibold mb-4">Team Members</h2>
              <div className="space-y-4">
                {ptosByUser.map(user => (
                  <div key={user.userName} className="bg-[#292929] p-3 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Person className="mr-2" />
                        <span className="font-medium">{user.userName}</span>
                      </div>
                      <div className="text-sm text-[#A8A8A8]">
                        {((user.totalHours / MAX_PTO_HOURS) * 100).toFixed(1)}% used
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-[#A8A8A8]">Total Hours</div>
                        <div className="font-medium">{user.totalHours}h</div>
                      </div>
                      <div>
                        <div className="text-[#A8A8A8]">Vacation</div>
                        <div className="font-medium">{user.vacation}h</div>
                      </div>
                      <div>
                        <div className="text-[#A8A8A8]">Personal</div>
                        <div className="font-medium">{user.personal}h</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'plan':
        return (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {notification && (
              <div className="fixed top-4 right-4 bg-[#498205] text-white px-4 py-3 rounded-sm shadow-lg flex items-center space-x-2 z-50 animate-fade-in">
                <CheckCircle className="w-5 h-5" />
                <span>{notification.message}</span>
              </div>
            )}
            
            <div className="bg-[#3D3D3D] p-4 rounded-sm">
              <h2 className="text-xl font-semibold mb-4">Suggested Breaks</h2>
              <div className="space-y-4">
                {breakSuggestions.length > 0 ? (
                  breakSuggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="bg-[#292929] p-4 rounded-sm border border-[#404040] hover:border-[#666] transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="mt-1">{suggestion.icon}</div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{suggestion.title}</h3>
                            <button 
                              className="text-sm bg-[#444791] text-white px-3 py-1 rounded-sm hover:bg-[#444791]/90"
                              onClick={() => handleSelectBreak(suggestion)}
                            >
                              Select
                            </button>
                          </div>
                          <p className="text-sm text-[#A8A8A8] mt-1">{suggestion.description}</p>
                          <div className="flex items-center mt-2 text-sm text-[#A8A8A8]">
                            <AccessTime className="w-4 h-4 mr-1" />
                            {format(parseISO(suggestion.startDate), 'MMM d')} - {format(parseISO(suggestion.endDate), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[#A8A8A8] text-center py-4">
                    No available break suggestions for the upcoming period
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#3D3D3D] p-4 rounded-sm">
              <h2 className="text-xl font-semibold mb-4">Custom Break</h2>
              <form onSubmit={handleCustomBreakSubmit} className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={customBreak.title}
                    onChange={handleCustomBreakChange}
                    placeholder="Enter the title for your break"
                    className="bg-[#292929] border border-[#404040] rounded-sm px-3 py-2"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1">Description</label>
                  <textarea
                    name="description"
                    value={customBreak.description}
                    onChange={handleCustomBreakChange}
                    placeholder="Enter break description"
                    className="bg-[#292929] border border-[#404040] rounded-sm px-3 py-2 min-h-[80px] resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={customBreak.startDate}
                    onChange={handleCustomBreakChange}
                    className="bg-[#292929] border border-[#404040] rounded-sm px-3 py-2"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={customBreak.endDate}
                    onChange={handleCustomBreakChange}
                    className="bg-[#292929] border border-[#404040] rounded-sm px-3 py-2"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1">Type</label>
                  <select
                    name="type"
                    value={customBreak.type}
                    onChange={handleCustomBreakChange}
                    className="bg-[#292929] border border-[#404040] rounded-sm px-3 py-2"
                  >
                    <option value="vacation">Vacation</option>
                    <option value="personal">Personal Time</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#444791] text-white py-2 rounded-sm hover:bg-[#444791]/90 transition-colors"
                >
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="h-16 border-b border-[#404040] flex items-center justify-between px-4 bg-[#1F1F1F]">
        <div className="flex items-center space-x-4">
          <button
            className="h-8 px-4 bg-[#444791] text-white rounded-sm hover:bg-[#444791]/90
              flex items-center justify-center text-sm font-medium"
          >
            <AddOutlined sx={{ fontSize: 20, marginRight: '4px' }} />
            New meeting
          </button>

          <div className="relative">
            <button
              onClick={() => setShowPTODropdown(!showPTODropdown)}
              className="h-8 px-4 bg-[#C4314B] text-white rounded-sm hover:bg-[#C4314B]/90
                flex items-center justify-center text-sm font-medium"
            >
              Auto PTO
              <KeyboardArrowDownOutlined sx={{ fontSize: 20, marginLeft: '2px' }} />
            </button>

            {showPTODropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#292929] rounded-sm shadow-lg border border-[#404040] z-50">
                <div className="py-1">
                  <button
                    onClick={() => handlePTOClick('summary')}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#3D3D3D]"
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => handlePTOClick('plan')}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#3D3D3D]"
                  >
                    Plan
                  </button>
                </div>
              </div>
            )}
          </div>

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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#292929] w-full max-w-2xl rounded-sm shadow-lg border border-[#404040] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium flex items-center">
                {modalType === 'summary' ? (
                  <>
                    <EventAvailable className="mr-2" />
                    PTO Dashboard
                  </>
                ) : (
                  'Plan PTO'
                )}
              </h3>
              <button
                onClick={closeModal}
                className="text-[#A8A8A8] hover:text-white"
              >
                <CloseIcon />
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarHeader; 
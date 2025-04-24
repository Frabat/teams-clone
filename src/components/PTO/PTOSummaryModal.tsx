import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  styled,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { parseISO, format, isSameDay, addDays } from 'date-fns';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#2d2d2d',
    color: '#fff',
    minWidth: '600px',
  },
}));

const StyledTableCell = styled(TableCell)({
  color: '#fff',
  borderBottom: '1px solid #404040',
  padding: '16px',
  '&.MuiTableCell-head': {
    backgroundColor: '#1f1f1f',
    fontWeight: 600,
  },
});

const DialogHeader = styled(DialogTitle)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  borderBottom: '1px solid #404040',
});

interface PTOSummaryModalProps {
  open: boolean;
  onClose: () => void;
}

const PTOSummaryModal: React.FC<PTOSummaryModalProps> = ({ open, onClose }) => {
  const { users, events } = useAppSelector(state => state.pto);

  const teamData = useMemo(() => {
    return users.map(user => {
      const userEvents = events.filter(event => event.userId === user.id);
      
      // Group consecutive dates
      const dateRanges = userEvents.reduce((ranges: string[], event) => {
        const startDate = parseISO(event.startDate);
        const endDate = parseISO(event.endDate);
        
        // If it's a single day event
        if (isSameDay(startDate, endDate)) {
          ranges.push(format(startDate, 'MMM d'));
          return ranges;
        }
        
        // For multi-day events
        let currentDate = startDate;
        while (currentDate <= endDate) {
          ranges.push(format(currentDate, 'MMM d'));
          currentDate = addDays(currentDate, 1);
        }
        return ranges;
      }, []);

      // Format date ranges
      const formattedRanges = dateRanges.reduce((result: string[], date, index, array) => {
        if (index === 0) {
          result.push(date);
        } else if (index === array.length - 1) {
          result.push(date);
        } else if (format(parseISO(array[index + 1]), 'MMM d') !== format(addDays(parseISO(date), 1), 'MMM d')) {
          result.push(date);
        }
        return result;
      }, []);

      // Join dates with commas and hyphens for ranges
      const formattedDateRanges = formattedRanges.reduce((result: string, date, index) => {
        if (index === 0) return date;
        const prevDate = formattedRanges[index - 1];
        const currentDate = parseISO(date);
        const prevDateObj = parseISO(prevDate);
        
        if (isSameDay(addDays(prevDateObj, 1), currentDate)) {
          if (index === formattedRanges.length - 1) {
            return `${result}-${date}`;
          }
          return result;
        } else {
          return `${result}, ${date}`;
        }
      }, '');

      return {
        name: user.name,
        hoursUsed: user.usedPTOHours,
        remainingHours: user.totalPTOHours - user.usedPTOHours,
        dateRanges: formattedDateRanges,
      };
    });
  }, [users, events]);

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md">
      <DialogHeader>
        <Typography variant="h6">Team PTO Summary</Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: '#fff' }}
        >
          <Close />
        </IconButton>
      </DialogHeader>
      <DialogContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell align="center">Hours Used</StyledTableCell>
                <StyledTableCell align="center">Remaining Hours</StyledTableCell>
                <StyledTableCell>Date Ranges</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamData.map((member) => (
                <TableRow
                  key={member.name}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}
                >
                  <StyledTableCell>{member.name}</StyledTableCell>
                  <StyledTableCell align="center">{member.hoursUsed}</StyledTableCell>
                  <StyledTableCell align="center">{member.remainingHours}</StyledTableCell>
                  <StyledTableCell>{member.dateRanges}</StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </StyledDialog>
  );
};

export default PTOSummaryModal; 
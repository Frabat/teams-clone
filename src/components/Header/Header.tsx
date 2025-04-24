import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box, Button, styled, Menu, MenuItem } from '@mui/material';
import { Search, Notifications, Help, ChevronLeft, ChevronRight, VideoCall, AutoAwesome, KeyboardArrowDown } from '@mui/icons-material';
import PTOSummaryModal from '../PTO/PTOSummaryModal';
import { useAppDispatch } from '../../store/hooks';
import { addWeeks, format, startOfWeek, endOfWeek } from 'date-fns';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1f1f1f',
  color: '#fff',
  boxShadow: 'none',
  borderBottom: '1px solid #404040',
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  color: '#fff',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  }
}));

const StyledButton = styled(Button)({
  backgroundColor: '#6264A7',
  color: '#fff',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#7B7DC7',
  }
});

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const dispatch = useAppDispatch();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSummaryClick = () => {
    handleClose();
    setSummaryOpen(true);
  };

  const handlePreviousWeek = () => {
    const newWeek = addWeeks(currentWeek, -1);
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = addWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  return (
    <>
      <StyledAppBar position="static">
        <Toolbar sx={{ minHeight: '48px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NavigationButton onClick={handlePreviousWeek}>
              <ChevronLeft />
            </NavigationButton>
            <NavigationButton onClick={handleToday}>
              <Typography variant="body2">Today</Typography>
            </NavigationButton>
            <NavigationButton onClick={handleNextWeek}>
              <ChevronRight />
            </NavigationButton>
            <Typography variant="subtitle1" sx={{ ml: 2 }}>
              {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <StyledButton
              variant="contained"
              startIcon={<VideoCall />}
              size="small"
            >
              Quick Meeting
            </StyledButton>
            <StyledButton
              variant="contained"
              startIcon={<AutoAwesome />}
              endIcon={<KeyboardArrowDown />}
              size="small"
              onClick={handleClick}
              aria-controls={open ? 'auto-pto-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              Auto PTO
            </StyledButton>
            <Menu
              id="auto-pto-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'auto-pto-button',
              }}
              PaperProps={{
                sx: {
                  backgroundColor: '#2d2d2d',
                  color: '#fff',
                  minWidth: '120px',
                  '& .MuiMenuItem-root': {
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={handleSummaryClick}>Summary</MenuItem>
              <MenuItem onClick={handleClose}>Edit PTO</MenuItem>
            </Menu>
            <IconButton size="small" sx={{ color: '#fff' }}>
              <Search />
            </IconButton>
            <IconButton size="small" sx={{ color: '#fff' }}>
              <Notifications />
            </IconButton>
            <IconButton size="small" sx={{ color: '#fff' }}>
              <Help />
            </IconButton>
            <Avatar 
              sx={{ width: 28, height: 28 }}
              alt="User"
            />
          </Box>
        </Toolbar>
      </StyledAppBar>
      <PTOSummaryModal 
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
      />
    </>
  );
};

export default Header; 
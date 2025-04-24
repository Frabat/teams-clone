import React from 'react';
import { Box, List, ListItem, ListItemIcon, styled } from '@mui/material';
import { CalendarToday, Chat, People, Assignment, Apps } from '@mui/icons-material';

const StyledSidebar = styled(Box)({
  width: '48px',
  height: '100vh',
  backgroundColor: '#1f1f1f',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const StyledListItem = styled(ListItem)({
  padding: '12px',
  width: '48px',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  '&.Mui-selected': {
    backgroundColor: '#6264A7',
    '&:hover': {
      backgroundColor: '#6264A7',
    }
  },
});

const StyledListItemIcon = styled(ListItemIcon)({
  minWidth: 'unset',
  color: '#fff',
  opacity: 0.6,
  '&.Mui-selected': {
    opacity: 1,
  }
});

const Sidebar: React.FC = () => {
  return (
    <StyledSidebar>
      <List sx={{ width: '100%', p: 0 }}>
        <StyledListItem selected>
          <StyledListItemIcon className="Mui-selected">
            <CalendarToday sx={{ fontSize: 20 }} />
          </StyledListItemIcon>
        </StyledListItem>
        <StyledListItem>
          <StyledListItemIcon>
            <Chat sx={{ fontSize: 20 }} />
          </StyledListItemIcon>
        </StyledListItem>
        <StyledListItem>
          <StyledListItemIcon>
            <People sx={{ fontSize: 20 }} />
          </StyledListItemIcon>
        </StyledListItem>
        <StyledListItem>
          <StyledListItemIcon>
            <Assignment sx={{ fontSize: 20 }} />
          </StyledListItemIcon>
        </StyledListItem>
        <StyledListItem>
          <StyledListItemIcon>
            <Apps sx={{ fontSize: 20 }} />
          </StyledListItemIcon>
        </StyledListItem>
      </List>
    </StyledSidebar>
  );
};

export default Sidebar; 
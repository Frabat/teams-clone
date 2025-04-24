import React from 'react';
import { Box, Typography, Button, styled } from '@mui/material';
import { Add } from '@mui/icons-material';

const MeetingDetailsContainer = styled(Box)({
  width: '300px',
  height: '100%',
  backgroundColor: '#1f1f1f',
  borderLeft: '1px solid #404040',
  padding: '16px',
  color: '#fff',
});

const MeetingDetailsHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
});

const StyledButton = styled(Button)({
  backgroundColor: '#6264A7',
  color: '#fff',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#7B7DC7',
  }
});

const MeetingDetails: React.FC = () => {
  return (
    <MeetingDetailsContainer>
      <MeetingDetailsHeader>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          New Event
        </Typography>
        <StyledButton
          variant="contained"
          startIcon={<Add />}
          size="small"
        >
          New Event
        </StyledButton>
      </MeetingDetailsHeader>
      <Box>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          No Events Scheduled
        </Typography>
      </Box>
    </MeetingDetailsContainer>
  );
};

export default MeetingDetails; 
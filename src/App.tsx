import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import Calendar from './components/Calendar/Calendar';
import MeetingDetails from './components/MeetingDetails/MeetingDetails';
import styled from '@emotion/styled';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1f1f1f',
      paper: '#1f1f1f',
    },
    primary: {
      main: '#6264A7',
    },
  },
});

const AppContainer = styled(Box)({
  display: 'flex',
  height: '100vh',
  width: '100vw',
  backgroundColor: '#1f1f1f',
  color: '#fff',
});

const MainContent = styled(Box)({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden',
});

const ContentArea = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 300px',
  flex: 1,
  overflow: 'hidden',
});

const CalendarContainer = styled(Box)({
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

const MeetingDetailsContainer = styled(Box)({
  height: '100%',
  overflow: 'hidden',
  borderLeft: '1px solid #404040',
});

function App() {
  return (
    <Router>
      <Routes>
        <Provider store={store}>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <AppContainer>
              <Sidebar />
              <MainContent>
                <Header />
                <ContentArea>
                  <CalendarContainer>
                    <Calendar />
                  </CalendarContainer>
                  <MeetingDetailsContainer>
                    <MeetingDetails />
                  </MeetingDetailsContainer>
                </ContentArea>
              </MainContent>
            </AppContainer>
          </ThemeProvider>
        </Provider>
      </Routes>
    </Router>
  );
}

export default App;

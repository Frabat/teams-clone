import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <Router basename="/teams-clone">
      <Routes>
        <Route path="/" element={<MainLayout><CalendarPage /></MainLayout>} />
        {/* Redirect any other path to the calendar for now */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

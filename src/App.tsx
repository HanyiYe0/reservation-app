import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Grid, Box } from '@mui/material';
import Header from './components/Header';
import NextAppointmentCard from './components/NextAppointmentCard';
import AppointmentList from './components/AppointmentList';
import CalendarWidget from './components/CalendarWidget';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Mock data
const MOCK_APPOINTMENTS = [
  {
    time: '08:00 AM',
    barberName: 'Leonardo Minatti',
    profileImage: 'https://i.pravatar.cc/150?img=1',
  },
  {
    time: '09:30 AM',
    barberName: 'Cleiton Souza',
    profileImage: 'https://i.pravatar.cc/150?img=2',
  },
  {
    time: '11:00 AM',
    barberName: 'Mike Wilson',
    profileImage: 'https://i.pravatar.cc/150?img=3',
  },
  {
    time: '02:00 PM',
    barberName: 'Sarah Johnson',
    profileImage: 'https://i.pravatar.cc/150?img=4',
  },
  {
    time: '03:30 PM',
    barberName: 'John Smith',
    profileImage: 'https://i.pravatar.cc/150?img=5',
  },
];

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Header />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <NextAppointmentCard
                barberName={MOCK_APPOINTMENTS[0].barberName}
                time={MOCK_APPOINTMENTS[0].time}
                profileImage={MOCK_APPOINTMENTS[0].profileImage}
              />
            </Box>
            <AppointmentList appointments={MOCK_APPOINTMENTS} />
          </Grid>
          <Grid item xs={12} md={4}>
            <CalendarWidget
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;

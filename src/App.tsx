import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Grid, Box, Button } from '@mui/material';
import { format } from 'date-fns';
import Header from './components/Header';
import NextAppointmentCard from './components/NextAppointmentCard';
import AppointmentList from './components/AppointmentList';
import CalendarWidget from './components/CalendarWidget';
import BookingModal, { BookingFormData } from './components/BookingModal';

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

// Mock barbers data
const BARBERS = [
  { id: 1, name: 'Leonardo Minatti', profileImage: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'Cleiton Souza', profileImage: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Mike Wilson', profileImage: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'Sarah Johnson', profileImage: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, name: 'John Smith', profileImage: 'https://i.pravatar.cc/150?img=5' },
  { id: 6, name: 'Emma Davis', profileImage: 'https://i.pravatar.cc/150?img=6' },
  { id: 7, name: 'Carlos Rodriguez', profileImage: 'https://i.pravatar.cc/150?img=7' },
];

// Time slots
const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', 
  '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '01:00 PM', 
  '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM'
];

interface Appointment {
  time: string;
  barberName: string;
  profileImage: string;
  isBooked?: boolean;
  bookedBy?: string;
}

interface AppointmentsByDate {
  [key: string]: Appointment[];
}

// Generate appointments for the next 30 days
const generateAppointments = (): AppointmentsByDate => {
  const appointments: AppointmentsByDate = {};
  const today = new Date();
  
  // Generate appointments for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    // Generate 8-12 random appointments for each day
    const numAppointments = Math.floor(Math.random() * 5) + 8;
    const dayAppointments: Appointment[] = [];
    
    const usedTimeSlots = new Set<string>();
    for (let j = 0; j < numAppointments; j++) {
      let timeSlot: string;
      do {
        timeSlot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
      } while (usedTimeSlots.has(timeSlot));
      
      usedTimeSlots.add(timeSlot);
      const barber = BARBERS[Math.floor(Math.random() * BARBERS.length)];
      
      // Randomly mark some appointments as booked
      const isBooked = Math.random() < 0.3; // 30% chance of being booked
      
      dayAppointments.push({
        time: timeSlot,
        barberName: barber.name,
        profileImage: barber.profileImage,
        isBooked,
        bookedBy: isBooked ? 'Another Client' : undefined,
      });
    }
    
    // Sort appointments by time
    dayAppointments.sort((a, b) => {
      const timeA = new Date('1970/01/01 ' + a.time).getTime();
      const timeB = new Date('1970/01/01 ' + b.time).getTime();
      return timeA - timeB;
    });
    
    appointments[dateKey] = dayAppointments;
  }
  
  return appointments;
};

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentsByDate>(() => generateAppointments());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const dayAppointments = appointments[dateKey] || [];

  // Get the next available appointment
  const nextAppointment = dayAppointments.length > 0 ? dayAppointments[0] : null;

  const handleBookingSuccess = (dateKey: string, timeSlot: string, userName: string) => {
    setAppointments((prevAppointments) => {
      const newAppointments = { ...prevAppointments };
      const dayAppointments = [...(newAppointments[dateKey] || [])];
      
      const appointmentIndex = dayAppointments.findIndex(apt => apt.time === timeSlot);
      if (appointmentIndex !== -1) {
        dayAppointments[appointmentIndex] = {
          ...dayAppointments[appointmentIndex],
          isBooked: true,
          bookedBy: userName,
        };
      }
      
      newAppointments[dateKey] = dayAppointments;
      return newAppointments;
    });
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleBookingSubmit = async (bookingData: BookingFormData) => {
    try {
      // Here you would typically make an API call to your backend
      // For now, we'll simulate a successful booking
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      handleBookingSuccess(dateKey, bookingData.time, bookingData.name);
      setShowModal(false);
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error('This slot is no longer available. Please select another time.'));
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Header />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {nextAppointment && (
              <Box sx={{ mb: 4 }}>
                <NextAppointmentCard
                  barberName={nextAppointment.barberName}
                  time={nextAppointment.time}
                  profileImage={nextAppointment.profileImage}
                  isBooked={nextAppointment.isBooked}
                  bookedBy={nextAppointment.bookedBy}
                  customBookButton={
                    nextAppointment.isBooked ? (
                      <Button variant="contained" disabled>Booked</Button>
                    ) : (
                      <Button variant="contained" onClick={() => handleAppointmentClick(nextAppointment)}>Book Now</Button>
                    )
                  }
                />
              </Box>
            )}
            <AppointmentList 
              appointments={dayAppointments}
              onBookingSuccess={(timeSlot: string, userName: string) => 
                handleBookingSuccess(dateKey, timeSlot, userName)
              }
              selectedAppointment={selectedAppointment}
              onAppointmentSelect={handleAppointmentClick}
              renderBookButton={(appointment) => 
                appointment.isBooked ? (
                  <Button variant="contained" disabled>Booked</Button>
                ) : (
                  <Button variant="contained" onClick={() => handleAppointmentClick(appointment)}>Book Now</Button>
                )
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CalendarWidget
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </Grid>
        </Grid>

        {selectedAppointment && (
          <BookingModal
            open={showModal}
            onClose={() => setShowModal(false)}
            appointment={selectedAppointment}
            onSubmit={handleBookingSubmit}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;

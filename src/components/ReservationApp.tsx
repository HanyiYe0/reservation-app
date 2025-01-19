'use client';

import { useState } from 'react';
import { Box, Container, Grid, Button } from '@mui/material';
import { useAuth } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import Header from './Header';
import NextAppointmentCard from './NextAppointmentCard';
import AppointmentList from './AppointmentList';
import CalendarWidget from './CalendarWidget';
import { format } from 'date-fns';
import BookingModal from './BookingModal';

// Move these to a separate file later
const BARBERS = [
  { id: 1, name: 'Leonardo Minatti', profileImage: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'Cleiton Souza', profileImage: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Mike Wilson', profileImage: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'Sarah Johnson', profileImage: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, name: 'John Smith', profileImage: 'https://i.pravatar.cc/150?img=5' },
  { id: 6, name: 'Emma Davis', profileImage: 'https://i.pravatar.cc/150?img=6' },
  { id: 7, name: 'Carlos Rodriguez', profileImage: 'https://i.pravatar.cc/150?img=7' },
];

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

export default function ReservationApp() {
  const { isSignedIn } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      time: '09:00 AM',
      barberName: BARBERS[0].name,
      profileImage: BARBERS[0].profileImage,
    },
    {
      time: '10:00 AM',
      barberName: BARBERS[1].name,
      profileImage: BARBERS[1].profileImage,
    },
  ]);

  const handleAppointmentSelect = (appointment: Appointment) => {
    if (!isSignedIn) {
      return;
    }
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleBookingSuccess = (timeSlot: string, userName: string) => {
    setAppointments(prevAppointments => {
      return prevAppointments.map(apt => {
        if (apt.time === timeSlot) {
          return {
            ...apt,
            isBooked: true,
            bookedBy: userName,
          };
        }
        return apt;
      });
    });
    setShowModal(false);
  };

  const renderBookButton = (appointment: Appointment) => {
    if (appointment.isBooked) {
      return (
        <Button variant="contained" disabled>
          Booked
        </Button>
      );
    }

    if (!isSignedIn) {
      return (
        <SignInButton mode="modal">
          <Button variant="contained" color="primary">
            Sign in to Book
          </Button>
        </SignInButton>
      );
    }

    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleAppointmentSelect(appointment)}
      >
        Book Now
      </Button>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Header />
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <NextAppointmentCard
              barberName={appointments[0].barberName}
              time={appointments[0].time}
              profileImage={appointments[0].profileImage}
              isBooked={appointments[0].isBooked}
              bookedBy={appointments[0].bookedBy}
              customBookButton={renderBookButton(appointments[0])}
            />
          </Box>
          <AppointmentList 
            appointments={appointments}
            onBookingSuccess={handleBookingSuccess}
            selectedAppointment={selectedAppointment}
            onAppointmentSelect={handleAppointmentSelect}
            renderBookButton={renderBookButton}
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
          onSubmit={async (bookingData) => {
            handleBookingSuccess(bookingData.time, bookingData.name);
          }}
        />
      )}
    </Container>
  );
} 
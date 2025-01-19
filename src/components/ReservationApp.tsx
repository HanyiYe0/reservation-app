'use client';

import { useState } from 'react';
import { Box, Container, Grid, Button } from '@mui/material';
import { useAuth, useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import Header from './Header';
import NextAppointmentCard from './NextAppointmentCard';
import AppointmentList from './AppointmentList';
import CalendarWidget from './CalendarWidget';
import { format } from 'date-fns';
import BookingModal from './BookingModal';
import React from 'react';
import UserReservations from './UserReservations';

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

interface AppointmentsByDate {
  [key: string]: Appointment[];
}

// Debug wrapper for seededRandom
const seededRandom = (seed: string) => {
  console.log('Generating seeded random for:', seed);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const result = (hash >>> 0) / 4294967296;
  console.log('Seeded random result:', result);
  return result;
};

// Generate initial appointments for each date
const generateInitialAppointments = (date: Date): Appointment[] => {
  console.log('Generating appointments for date:', date);
  const dateStr = format(date, 'yyyy-MM-dd');
  const appointments: Appointment[] = [];
  const numAppointments = Math.floor(seededRandom(`${dateStr}-count`) * 5) + 8;
  console.log('Number of appointments to generate:', numAppointments);

  try {
    const usedTimeSlots = new Set<string>();
    const availableTimeSlots = [...TIME_SLOTS];

    for (let i = 0; i < numAppointments && availableTimeSlots.length > 0; i++) {
      const timeIndex = Math.floor(seededRandom(`${dateStr}-time-${i}`) * availableTimeSlots.length);
      const timeSlot = availableTimeSlots.splice(timeIndex, 1)[0];
      const barberIndex = Math.floor(seededRandom(`${dateStr}-barber-${i}`) * BARBERS.length);
      const barber = BARBERS[barberIndex];

      appointments.push({
        time: timeSlot,
        barberName: barber.name,
        profileImage: barber.profileImage,
        isBooked: false,
      });
    }

    const sortedAppointments = appointments.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
      const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
      return timeA - timeB;
    });

    console.log('Generated appointments:', sortedAppointments);
    return sortedAppointments;
  } catch (error) {
    console.error('Error generating appointments:', error);
    return [];
  }
};

export default function ReservationApp() {
  console.log('ReservationApp rendering');
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(() => {
    console.log('Initializing selectedDate');
    return new Date();
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [appointmentsByDate, setAppointmentsByDate] = useState<AppointmentsByDate>(() => {
    console.log('Initializing appointmentsByDate');
    const today = new Date();
    const todayKey = format(today, 'yyyy-MM-dd');
    const initialAppointments = generateInitialAppointments(today);
    console.log('Initial appointments generated:', initialAppointments);
    return {
      [todayKey]: initialAppointments
    };
  });

  // Get all user's reservations
  const userReservations = React.useMemo(() => {
    if (!isSignedIn || !user) return [];

    return Object.entries(appointmentsByDate).flatMap(([dateStr, appointments]) => {
      return appointments
        .filter(apt => apt.isBooked && apt.bookedBy === user.fullName)
        .map(apt => ({
          date: new Date(dateStr),
          time: apt.time,
          barberName: apt.barberName,
          profileImage: apt.profileImage
        }));
    });
  }, [appointmentsByDate, isSignedIn, user]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  console.log('Current dateKey:', dateKey);
  
  const currentAppointments = React.useMemo(() => {
    console.log('Calculating currentAppointments for dateKey:', dateKey);
    console.log('Current appointmentsByDate:', appointmentsByDate);
    
    if (!appointmentsByDate[dateKey]) {
      console.log('No appointments found for date, generating new ones');
      const newAppointments = generateInitialAppointments(selectedDate);
      setAppointmentsByDate(prev => ({
        ...prev,
        [dateKey]: newAppointments
      }));
      return newAppointments;
    }
    
    console.log('Returning existing appointments for date');
    return appointmentsByDate[dateKey];
  }, [dateKey, appointmentsByDate]);

  const handleAppointmentSelect = (appointment: Appointment) => {
    if (!isSignedIn) {
      return;
    }
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleBookingSuccess = (timeSlot: string, userName: string) => {
    setAppointmentsByDate(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(apt => {
        if (apt.time === timeSlot) {
          return {
            ...apt,
            isBooked: true,
            bookedBy: userName,
          };
        }
        return apt;
      })
    }));
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {isSignedIn && (
          <Button
            variant="outlined"
            onClick={() => setShowReservations(true)}
            sx={{ mr: 2 }}
          >
            My Reservations
          </Button>
        )}
      </Box>
      <Header />
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {currentAppointments.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <NextAppointmentCard
                barberName={currentAppointments[0].barberName}
                time={currentAppointments[0].time}
                profileImage={currentAppointments[0].profileImage}
                isBooked={currentAppointments[0].isBooked}
                bookedBy={currentAppointments[0].bookedBy}
                customBookButton={renderBookButton(currentAppointments[0])}
              />
            </Box>
          )}
          <AppointmentList 
            appointments={currentAppointments}
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
            handleBookingSuccess(bookingData.time, user?.fullName || 'Unknown User');
          }}
        />
      )}

      <UserReservations
        open={showReservations}
        onClose={() => setShowReservations(false)}
        reservations={userReservations}
      />
    </Container>
  );
} 
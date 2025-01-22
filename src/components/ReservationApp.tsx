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
  date?: Date;
  isCancelled?: boolean;
}

interface AppointmentsByDate {
  [key: string]: Appointment[];
}

interface Reservation {
  date: Date;
  time: string;
  barberName: string;
  profileImage: string;
  isBooked?: boolean;
  isCancelled?: boolean; // Add this property if needed
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

      const appointment: Appointment = {
        time: timeSlot,
        barberName: barber.name,
        profileImage: barber.profileImage,
        isBooked: false,
        date: new Date(date),
        isCancelled: false // Explicitly set to false
      };

      console.log(`Generated appointment for ${timeSlot}:`, appointment);
      appointments.push(appointment);
    }

    // Sort appointments by time
    const sortedAppointments = appointments.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
      const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
      return timeA - timeB;
    });

    // Add Leonardo Minatti at 8:30 AM if not present
    const hasLeonardo830 = sortedAppointments.some(
      apt => apt.barberName === 'Leonardo Minatti' && apt.time === '08:30 AM'
    );

    if (!hasLeonardo830) {
      sortedAppointments.push({
        time: '08:30 AM',
        barberName: 'Leonardo Minatti',
        profileImage: BARBERS[0].profileImage,
        isBooked: false,
        date: new Date(date),
        isCancelled: false
      });
      // Re-sort after adding Leonardo's appointment
      sortedAppointments.sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
        const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
        return timeA - timeB;
      });
    }

    // Verify all appointments are not cancelled
    sortedAppointments.forEach(apt => {
      if (apt.isCancelled) {
        console.warn('Found cancelled appointment:', apt);
        apt.isCancelled = false;
      }
    });

    console.log('Final sorted appointments:', sortedAppointments);
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
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [appointmentsByDate, setAppointmentsByDate] = useState<AppointmentsByDate>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [cancelledAppointments, setCancelledAppointments] = useState<Set<string>>(new Set());
  const [reservations, setReservations] = useState<Reservation[]>([
    // Initial reservations data
  ]);

  // Initialize appointments on client side only
  React.useEffect(() => {
    if (!isInitialized) {
      console.log('Initializing appointments on client side');
      
      // Try to load from localStorage first
      const savedAppointments = localStorage.getItem('appointments');
      if (savedAppointments) {
        try {
          const parsed = JSON.parse(savedAppointments);
          // Ensure all appointments have proper structure
          Object.keys(parsed).forEach(dateKey => {
            parsed[dateKey] = parsed[dateKey].map((apt: Appointment) => ({
              ...apt,
              isBooked: apt.isBooked ?? false,
              bookedBy: apt.bookedBy || undefined
            }));
          });
          console.log('Loaded appointments from localStorage:', parsed);
          setAppointmentsByDate(parsed);
          setIsInitialized(true);
          return;
        } catch (error) {
          console.error('Error parsing saved appointments:', error);
        }
      }

      // Generate initial appointments if none saved
      const today = new Date();
      const todayKey = format(today, 'yyyy-MM-dd');
      const initialAppointments = generateInitialAppointments(today);
      setAppointmentsByDate({ [todayKey]: initialAppointments });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Add event listener for opening reservations
  React.useEffect(() => {
    const handleOpenReservations = () => {
      setShowReservations(true);
    };

    window.addEventListener('openReservations', handleOpenReservations);
    return () => {
      window.removeEventListener('openReservations', handleOpenReservations);
    };
  }, []);

  // Get all user's reservations
  const userReservations = React.useMemo(() => {
    if (!isSignedIn || !user) return [];

    console.log('=== Calculating User Reservations ===');
    return Object.entries(appointmentsByDate).flatMap(([dateStr, appointments]) => {
      console.log('Processing date:', dateStr, 'appointments:', appointments);
      const reservations = appointments
        .filter(apt => apt.isBooked && apt.bookedBy === user.fullName)
        .map(apt => ({
          date: apt.date || new Date(dateStr),
          time: apt.time,
          barberName: apt.barberName,
          profileImage: apt.profileImage,
          isBooked: apt.isBooked
        }));
      console.log('Filtered reservations for date:', reservations);
      return reservations;
    });
  }, [appointmentsByDate, isSignedIn, user]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  console.log('Current dateKey:', dateKey);
  
  const currentAppointments = React.useMemo(() => {
    if (!isInitialized) {
      return [];
    }

    console.log('Calculating currentAppointments for dateKey:', dateKey);
    
    if (!appointmentsByDate[dateKey]) {
      console.log('No appointments found for date, generating new ones');
      const newAppointments = generateInitialAppointments(selectedDate);
      setAppointmentsByDate(prev => ({
        ...prev,
        [dateKey]: newAppointments
      }));
      return newAppointments;
    }
    
    const appointments = appointmentsByDate[dateKey];
    console.log('Appointments for date:', appointments);
    return appointments;
  }, [dateKey, appointmentsByDate, selectedDate, isInitialized]);

  const handleAppointmentSelect = (appointment: Appointment) => {
    if (!isSignedIn) {
      return;
    }
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleBookingSuccess = (timeSlot: string, userName: string) => {
    console.log('=== Handling Booking Success ===');
    console.log('Booking details:', { timeSlot, userName, dateKey, selectedDate });
    console.log('Current state before booking:', appointmentsByDate[dateKey]);
    
    setAppointmentsByDate(prev => {
      const newState = {
        ...prev,
        [dateKey]: prev[dateKey].map(apt => {
          if (apt.time === timeSlot) {
            console.log('Updating appointment:', apt);
            const updatedApt = {
              ...apt,
              isBooked: true,
              bookedBy: userName,
              date: selectedDate,
            };
            console.log('Updated appointment:', updatedApt);
            return updatedApt;
          }
          return apt;
        })
      };
      console.log('New state after booking:', newState);
      
      return newState;
    });
    setShowModal(false);
  };

  const handleCancelReservation = (date: Date, time: string, isCancelled: boolean) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    console.log('=== Starting Cancellation Process ===');
    console.log('Cancelling appointment:', { dateKey, time, isCancelled });
    
    setAppointmentsByDate(prev => {
        const newState = { ...prev };
        
        if (newState[dateKey]) {
            newState[dateKey] = newState[dateKey].map(apt => {
                if (apt.time === time) {
                    return {
                        ...apt,
                        isCancelled: true,
                        isBooked: true, // Keep it booked but marked as cancelled
                    };
                }
                return apt;
            });
        }
        
        return newState;
    });
    
    const currentDateKey = format(selectedDate, 'yyyy-MM-dd');
    if (currentDateKey === dateKey) {
        console.log('Cancelled appointment is on current date, forcing refresh');
        setSelectedDate(new Date(selectedDate.getTime()));
    }
  };

  const renderBookButton = (appointment: Appointment) => {
    console.log('=== Rendering Book Button ===');
    console.log('Appointment details:', {
      time: appointment.time,
      isBooked: appointment.isBooked,
      bookedBy: appointment.bookedBy,
      isCancelled: appointment.isCancelled
    });

    // If the appointment is cancelled, always show cancelled regardless of sign-in status
    if (appointment.isCancelled) {
      console.log('Showing Cancelled button - appointment is cancelled');
      return (
        <Button variant="contained" disabled>
          Cancelled
        </Button>
      );
    }

    // If user is not signed in
    if (!isSignedIn) {
      console.log('User not signed in, showing sign in button');
      return (
        <SignInButton mode="modal">
          <Button variant="contained" color="primary">
            Sign in to Book
          </Button>
        </SignInButton>
      );
    }

    // If the appointment is booked but not cancelled
    if (appointment.isBooked && !appointment.isCancelled) {
      console.log('Showing Booked button - appointment is booked');
      return (
        <Button variant="contained" disabled>
          Booked
        </Button>
      );
    }

    // For available appointments
    console.log('Showing Book Now button - appointment is available');
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
          {currentAppointments.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <NextAppointmentCard
                barberName={currentAppointments[0].barberName}
                time={currentAppointments[0].time}
                profileImage={currentAppointments[0].profileImage}
                isBooked={currentAppointments[0].isBooked}
                bookedBy={currentAppointments[0].bookedBy}
                isCancelled={currentAppointments[0].isCancelled}
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
        onCancelReservation={(date, time) => handleCancelReservation(date, time, true)}
      />
    </Container>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Grid, Button, Typography } from '@mui/material';
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

// Define the Barber interface
interface Barber {
  id: number;
  name: string;
  profile_picture: string;
  availability: any; // You can type this more specifically based on your JSON structure
  created_at: string;
  updated_at: string;
}

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
  barberId?: number;
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

// Add interface for database appointment
interface DBAppointment {
  id: number;
  date: string;
  time_slot: string;
  status: string;
  users: {
    name: string;
    email: string;
  };
  barbers: {
    name: string;
    profile_picture: string;
  };
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
const generateInitialAppointments = async (date: Date, barbers: Barber[]): Promise<Appointment[]> => {
  console.log('Generating appointments for date:', date);
  const dateStr = format(date, 'yyyy-MM-dd');
  
  try {
    // First, fetch existing appointments for this date
    const response = await fetch(`/api/appointments/getByDate?date=${dateStr}`);
    if (!response.ok) {
      throw new Error('Failed to fetch existing appointments');
    }
    const existingAppointments: DBAppointment[] = await response.json();
    console.log('Existing appointments:', existingAppointments);

    const appointments: Appointment[] = [];
    const usedTimeSlots = new Set<string>();
    const availableTimeSlots = [...TIME_SLOTS];

    // First, add existing appointments
    existingAppointments.forEach(dbApt => {
      // Convert 24h time to 12h time for display
      const time = new Date(`1970-01-01T${dbApt.time_slot}`);
      const timeSlot = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toUpperCase();

      usedTimeSlots.add(timeSlot);
      const index = availableTimeSlots.indexOf(timeSlot);
      if (index > -1) {
        availableTimeSlots.splice(index, 1);
      }

      appointments.push({
        time: timeSlot,
        barberName: dbApt.barbers.name,
        profileImage: dbApt.barbers.profile_picture,
        isBooked: true,
        bookedBy: dbApt.users.name,
        date: new Date(dbApt.date),
        isCancelled: false
      });
    });

    // Then generate additional available appointments
    const numAppointments = Math.floor(seededRandom(`${dateStr}-count`) * 5) + 8;
    
    for (let i = 0; i < numAppointments && availableTimeSlots.length > 0; i++) {
      const timeIndex = Math.floor(seededRandom(`${dateStr}-time-${i}`) * availableTimeSlots.length);
      const timeSlot = availableTimeSlots.splice(timeIndex, 1)[0];
      const barberIndex = Math.floor(seededRandom(`${dateStr}-barber-${i}`) * barbers.length);
      const barber = barbers[barberIndex];

      if (!usedTimeSlots.has(timeSlot)) {
        appointments.push({
          time: timeSlot,
          barberName: barber.name,
          profileImage: barber.profile_picture,
          isBooked: false,
          date: new Date(date),
          isCancelled: false,
          barberId: barber.id
        });
      }
    }

    // Sort appointments by time
    const sortedAppointments = appointments.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
      const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
      return timeA - timeB;
    });

    console.log('Final sorted appointments:', sortedAppointments);
    return sortedAppointments;
  } catch (error) {
    console.error('Error generating appointments:', error);
    return [];
  }
};

export default function ReservationApp() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [appointmentsByDate, setAppointmentsByDate] = useState<AppointmentsByDate>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelledAppointments, setCancelledAppointments] = useState<Set<string>>(new Set());
  const [reservations, setReservations] = useState<Reservation[]>([
    // Initial reservations data
  ]);

  // Fetch barbers when component mounts
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await fetch('/api/barbers');
        if (!response.ok) {
          throw new Error('Failed to fetch barbers');
        }
        const data = await response.json();
        setBarbers(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching barbers:', error);
        setIsLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  // Initialize appointments on client side only
  useEffect(() => {
    if (!isInitialized && barbers.length > 0) {
      console.log('Initializing appointments on client side');
      
      const today = new Date();
      const todayKey = format(today, 'yyyy-MM-dd');
      
      generateInitialAppointments(today, barbers).then(initialAppointments => {
        setAppointmentsByDate({ [todayKey]: initialAppointments });
        setIsInitialized(true);
      });
    }
  }, [isInitialized, barbers]);

  // Add event listener for opening reservations
  useEffect(() => {
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
      generateInitialAppointments(selectedDate, barbers).then(newAppointments => {
        setAppointmentsByDate(prev => ({
          ...prev,
          [dateKey]: newAppointments
        }));
      });
      return [];
    }
    
    const appointments = appointmentsByDate[dateKey];
    console.log('Appointments for date:', appointments);
    return appointments;
  }, [dateKey, appointmentsByDate, selectedDate, isInitialized, barbers]);

  const handleAppointmentSelect = (appointment: Appointment) => {
    if (!isSignedIn) {
      return;
    }
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleBookingSuccess = async (timeSlot: string, userName: string) => {
    console.log('=== Handling Booking Success ===');
    console.log('Booking details:', { timeSlot, userName, dateKey, selectedDate });
    
    if (!selectedAppointment || !user) {
      console.error('Missing required booking information');
      return;
    }

    try {
      // Create the appointment in the database
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName,
          userEmail: user.primaryEmailAddress?.emailAddress,
          barberId: selectedAppointment.barberId,
          date: format(selectedDate, 'yyyy-MM-dd'),
          timeSlot: timeSlot
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      // Update local state
      setAppointmentsByDate(prev => {
        const newState = {
          ...prev,
          [dateKey]: prev[dateKey].map(apt => {
            if (apt.time === timeSlot) {
              return {
                ...apt,
                isBooked: true,
                bookedBy: userName,
                date: selectedDate,
              };
            }
            return apt;
          })
        };
        console.log('New state after booking:', newState);
        return newState;
      });

      setShowModal(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      // You might want to show an error message to the user here
    }
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

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Loading barbers...</Typography>
        </Box>
      </Container>
    );
  }

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
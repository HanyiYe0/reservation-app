'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Grid, Button, Typography, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useAuth, useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import Header from './Header';
import NextAppointmentCard from './NextAppointmentCard';
import AppointmentList from './AppointmentList';
import CalendarWidget from './CalendarWidget';
import { format, isToday, isTomorrow, isThisWeek, addWeeks, isSameWeek } from 'date-fns';
import BookingModal from './BookingModal';
import React from 'react';
import UserReservations from './UserReservations';
import { LoadingBarbersSkeleton, LoadingAppointmentsSkeleton } from './LoadingSkeletons';

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
    id: number;
    name: string;
    email: string;
  };
  barbers: {
    id: number;
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
  const now = new Date();
  const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
  
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

    // Filter time slots for today
    const availableTimeSlots = TIME_SLOTS.filter(timeSlot => {
      if (!isToday) return true; // Show all slots for future dates
      
      // Convert time slot to minutes for comparison
      const [time, period] = timeSlot.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let slotMinutes = hours * 60 + minutes;
      
      // Adjust for PM times
      if (period === 'PM' && hours !== 12) {
        slotMinutes += 12 * 60;
      }
      // Adjust for 12 AM
      if (period === 'AM' && hours === 12) {
        slotMinutes = 0;
      }
      
      return slotMinutes > currentTime;
    });

    // First, add existing appointments
    existingAppointments.forEach(dbApt => {
      // Convert 24h time to 12h time for display
      const time = new Date(`1970-01-01T${dbApt.time_slot}`);
      const timeSlot = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toUpperCase();

      // Skip past appointments for today
      if (isToday) {
        const [slotTime, period] = timeSlot.split(' ');
        const [hours, minutes] = slotTime.split(':').map(Number);
        let slotMinutes = hours * 60 + minutes;
        if (period === 'PM' && hours !== 12) slotMinutes += 12 * 60;
        if (period === 'AM' && hours === 12) slotMinutes = 0;
        
        if (slotMinutes <= currentTime) return;
      }

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
        isCancelled: dbApt.status === 'cancelled',
        barberId: dbApt.barbers.id
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
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null); // Store time slot being cancelled
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    open: false,
    message: '',
    type: 'success'
  });

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

  // Fetch user's appointments when signed in
  useEffect(() => {
    const fetchUserAppointments = async () => {
      if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) return;

      try {
        const response = await fetch(
          `/api/appointments/getUserAppointments?email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch user appointments');
        }

        const data = await response.json();
        console.log('Fetched user appointments:', data);
        
        // Convert the appointments to our frontend format
        const formattedAppointments = data.map((apt: DBAppointment) => {
          // Parse the date string and create a new Date object
          const appointmentDate = new Date(apt.date + 'T00:00:00');
          console.log('Processing appointment date:', {
            original: apt.date,
            parsed: appointmentDate,
            isoString: appointmentDate.toISOString(),
            localString: appointmentDate.toLocaleDateString()
          });

          // Convert 24h time to 12h time for display
          const time = new Date(`1970-01-01T${apt.time_slot}`);
          const timeSlot = time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).toUpperCase();

          return {
            time: timeSlot,
            barberName: apt.barbers?.name || 'Unknown Barber',
            profileImage: apt.barbers?.profile_picture || '',
            isBooked: true,
            bookedBy: apt.users?.name || 'Unknown User',
            date: appointmentDate,
            isCancelled: apt.status === 'cancelled',
            barberId: apt.barbers?.id
          };
        });

        console.log('Formatted appointments:', formattedAppointments);
        setUserAppointments(formattedAppointments);
      } catch (error) {
        console.error('Error fetching user appointments:', error);
      }
    };

    fetchUserAppointments();
  }, [isSignedIn, user]);

  // Update the userReservations memo to handle possible undefined values
  const userReservations = React.useMemo(() => {
    if (!isSignedIn || !user || !userAppointments.length) return [];

    console.log('Creating user reservations from:', userAppointments);
    return userAppointments
      .filter(apt => apt.date && apt.barberName && apt.time) // Filter out incomplete appointments
      .map(apt => {
        // Ensure the date is properly set to midnight to avoid timezone issues
        const normalizedDate = new Date(format(apt.date!, 'yyyy-MM-dd') + 'T00:00:00');
        console.log('Normalizing date:', {
          original: apt.date,
          normalized: normalizedDate,
          isoString: normalizedDate.toISOString(),
          localString: normalizedDate.toLocaleDateString()
        });
        
        return {
          date: normalizedDate,
          time: apt.time,
          barberName: apt.barberName,
          profileImage: apt.profileImage || '',
          isBooked: true,
          isCancelled: apt.isCancelled || false
        };
      });
  }, [userAppointments, isSignedIn, user]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  console.log('Current dateKey:', dateKey);
  
  const currentAppointments = React.useMemo(() => {
    if (!isInitialized) {
      return [];
    }

    console.log('Calculating currentAppointments for dateKey:', dateKey);
    
    if (!appointmentsByDate[dateKey]) {
      console.log('No appointments found for date, generating new ones');
      setIsAppointmentsLoading(true);
      generateInitialAppointments(selectedDate, barbers).then(newAppointments => {
        setAppointmentsByDate(prev => ({
          ...prev,
          [dateKey]: newAppointments
        }));
        setIsAppointmentsLoading(false);
      });
      return [];
    }
    
    const appointments = appointmentsByDate[dateKey];
    console.log('Appointments for date:', appointments);
    return appointments;
  }, [dateKey, appointmentsByDate, selectedDate, isInitialized, barbers]);

  // Find the next available appointment
  const nextAvailableAppointment = React.useMemo(() => {
    if (!currentAppointments.length) return null;
    
    // Find the first appointment that isn't booked or cancelled
    return currentAppointments.find(apt => !apt.isBooked && !apt.isCancelled) || currentAppointments[0];
  }, [currentAppointments]);

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

    setIsBooking(true);
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

      const responseData = await response.json();
      console.log('Booking response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create appointment');
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

      // Immediately update userAppointments with the new booking
      const newAppointment = {
        time: timeSlot,
        barberName: selectedAppointment.barberName,
        profileImage: selectedAppointment.profileImage,
        isBooked: true,
        bookedBy: userName,
        date: selectedDate,
        isCancelled: false,
        barberId: selectedAppointment.barberId
      };

      setUserAppointments(prev => [...prev, newAppointment]);
      setNotification({
        open: true,
        message: 'Appointment booked successfully!',
        type: 'success'
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      setNotification({
        open: true,
        message: 'Failed to book appointment. Please try again.',
        type: 'error'
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelReservation = async (date: Date, time: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    console.log('=== Starting Cancellation Process ===');
    console.log('Original date:', date);
    console.log('Formatted date:', dateKey);
    console.log('Cancelling appointment:', { dateKey, time });

    setIsCancelling(time);
    try {
      // Convert 12-hour time to 24-hour format for the backend
      const [timeStr, period] = time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      const time24 = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

      console.log('Converted time:', time24);

      // Call the cancel endpoint
      const response = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dateKey,
          time_slot: time24,
          user_email: user?.primaryEmailAddress?.emailAddress
        }),
      });

      const responseData = await response.json();
      console.log('Cancel response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to cancel appointment');
      }

      // Update local state
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

      // Update userAppointments state
      setUserAppointments(prev => 
        prev.map(apt => {
          if (apt.date && format(apt.date, 'yyyy-MM-dd') === dateKey && apt.time === time) {
            return {
              ...apt,
              isCancelled: true
            };
          }
          return apt;
        })
      );

      // Refresh the current date's appointments if needed
      const currentDateKey = format(selectedDate, 'yyyy-MM-dd');
      if (currentDateKey === dateKey) {
        console.log('Cancelled appointment is on current date, forcing refresh');
        const newAppointments = await generateInitialAppointments(selectedDate, barbers);
        setAppointmentsByDate(prev => ({
          ...prev,
          [currentDateKey]: newAppointments
        }));
      }

      setNotification({
        open: true,
        message: 'Appointment cancelled successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setNotification({
        open: true,
        message: 'Failed to cancel appointment. Please try again.',
        type: 'error'
      });
    } finally {
      setIsCancelling(null);
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

  const getRelativeTimeText = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE');
    if (isSameWeek(date, addWeeks(new Date(), 1))) return 'Next Week';
    return format(date, 'MMMM d');
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return <LoadingBarbersSkeleton />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Header selectedDate={selectedDate} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Scheduled Times
            </Typography>
            {isAppointmentsLoading ? (
              <LoadingAppointmentsSkeleton />
            ) : currentAppointments.length > 0 ? (
              <>
                {nextAvailableAppointment && (
                  <Box sx={{ mb: 4 }}>
                    <NextAppointmentCard
                      barberName={nextAvailableAppointment.barberName}
                      time={nextAvailableAppointment.time}
                      profileImage={nextAvailableAppointment.profileImage}
                      isBooked={nextAvailableAppointment.isBooked}
                      bookedBy={nextAvailableAppointment.bookedBy}
                      isCancelled={nextAvailableAppointment.isCancelled}
                      customBookButton={renderBookButton(nextAvailableAppointment)}
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
              </>
            ) : (
              <Box 
                display="flex" 
                flexDirection="column"
                justifyContent="center" 
                alignItems="center" 
                minHeight="200px"
                sx={{ 
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No Available Time Slots
                </Typography>
                <Typography color="text.secondary">
                  {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                    ? "All appointments for today have passed or are fully booked. Please try selecting another date."
                    : "No appointments available for this date. Please try selecting another date."}
                </Typography>
              </Box>
            )}
          </Box>
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
          isBooking={isBooking}
        />
      )}

      <UserReservations
        open={showReservations}
        onClose={() => setShowReservations(false)}
        reservations={userReservations}
        onCancelReservation={handleCancelReservation}
        isCancelling={isCancelling}
      />

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 
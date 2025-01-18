import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Button, Snackbar, Alert } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Appointment {
  time: string;
  barberName: string;
  profileImage: string;
  isBooked?: boolean;
  bookedBy?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onBookClick: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onBookClick }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={appointment.profileImage}
          alt={appointment.barberName}
          sx={{ width: 48, height: 48 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{appointment.barberName}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon sx={{ mr: 1, fontSize: 'small', color: 'primary.main' }} />
            <Typography variant="body1" color="primary">
              {appointment.time}
            </Typography>
          </Box>
          {appointment.isBooked && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Booked by {appointment.bookedBy}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          disabled={appointment.isBooked}
          onClick={() => onBookClick(appointment)}
        >
          {appointment.isBooked ? 'Booked' : 'Book'}
        </Button>
      </Box>
    </CardContent>
  </Card>
);

interface AppointmentListProps {
  appointments: Appointment[];
  onBookingSuccess: (timeSlot: string, userName: string) => void;
  selectedAppointment: Appointment | null;
  onAppointmentSelect: (appointment: Appointment) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onBookingSuccess,
  selectedAppointment,
  onAppointmentSelect,
}) => {
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const morningAppointments = appointments.filter(
    (apt) => apt.time.includes('AM')
  );
  const afternoonAppointments = appointments.filter(
    (apt) => apt.time.includes('PM')
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Morning
        </Typography>
        {morningAppointments.map((apt, index) => (
          <AppointmentCard
            key={index}
            appointment={apt}
            onBookClick={onAppointmentSelect}
          />
        ))}
      </Box>

      <Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Afternoon
        </Typography>
        {afternoonAppointments.map((apt, index) => (
          <AppointmentCard
            key={index}
            appointment={apt}
            onBookClick={onAppointmentSelect}
          />
        ))}
      </Box>

      <Snackbar
        open={notification.show}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, show: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, show: false })}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppointmentList; 
import React from 'react';
import { Box, Typography, Card, CardContent, Avatar } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Appointment {
  time: string;
  barberName: string;
  profileImage: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => (
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
        </Box>
      </Box>
    </CardContent>
  </Card>
);

interface AppointmentListProps {
  appointments: Appointment[];
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments }) => {
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
          <AppointmentCard key={index} appointment={apt} />
        ))}
      </Box>

      <Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Afternoon
        </Typography>
        {afternoonAppointments.map((apt, index) => (
          <AppointmentCard key={index} appointment={apt} />
        ))}
      </Box>
    </Box>
  );
};

export default AppointmentList; 
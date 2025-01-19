import React from 'react';
import { Box, Card, CardContent, Typography, Avatar } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface NextAppointmentCardProps {
  barberName: string;
  time: string;
  profileImage: string;
  isBooked?: boolean;
  bookedBy?: string;
  customBookButton?: React.ReactNode;
}

const NextAppointmentCard: React.FC<NextAppointmentCardProps> = ({
  barberName,
  time,
  profileImage,
  isBooked,
  bookedBy,
  customBookButton,
}) => {
  return (
    <Card sx={{ mb: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Next Appointment
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={profileImage}
            alt={barberName}
            sx={{ width: 64, height: 64 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {barberName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="primary">
                {time}
              </Typography>
            </Box>
            {isBooked && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Booked by {bookedBy}
              </Typography>
            )}
          </Box>
          {customBookButton}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NextAppointmentCard; 
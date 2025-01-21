import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  IconButton,
  Paper,
  Button,
  ListItemSecondaryAction
} from '@mui/material';
import { Modal } from '@mui/base/Modal';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';

interface Reservation {
  date: Date;
  time: string;
  barberName: string;
  profileImage: string;
  isBooked?: boolean;
}

interface UserReservationsProps {
  open: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onCancelReservation: (date: Date, time: string) => void;
}

export default function UserReservations({ open, onClose, reservations, onCancelReservation }: UserReservationsProps) {
  const [cancelledReservations, setCancelledReservations] = useState<string[]>([]);

  const sortedReservations = [...reservations].sort((a, b) => {
    // Check if date and time are valid for a
    const dateTimeA = a.date && a.time ? new Date(`${format(new Date(a.date), 'yyyy/MM/dd')} ${a.time}`) : null;
    // Check if date and time are valid for b
    const dateTimeB = b.date && b.time ? new Date(`${format(new Date(b.date), 'yyyy/MM/dd')} ${b.time}`) : null;

    // Handle invalid date cases
    if (!dateTimeA) return 1; // Move invalid dates to the end
    if (!dateTimeB) return -1; // Move invalid dates to the end

    return dateTimeA.getTime() - dateTimeB.getTime();
  });

  const handleCancel = (date: Date, time: string) => {
    // Simple log that will definitely show up
    console.log('Cancel clicked -', 'Date:', format(date, 'yyyy-MM-dd'), 'Time:', time);
    
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    setCancelledReservations(prev => [...prev, key]);
    onCancelReservation(new Date(date), time);
  };

  const isReservationCancelled = (date: string, time: string) => {
    // Log the inputs for debugging
    console.log('Checking reservation:', { date, time });

    const reservationDate = new Date(date);
    
    // Check if the date is valid
    if (isNaN(reservationDate.getTime()) || !time) {
      return false; // or handle as needed
    }
    
    // Format the date and check cancellation logic
    const formattedDate = format(reservationDate, 'yyyy/MM/dd');
    
    // Your cancellation logic here
    // For example, return true if the reservation is cancelled based on some condition
    return false; // Replace with actual logic
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1300,
        }}
      >
        <Paper
          sx={{
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            m: 2,
            p: 3,
            position: 'relative',
            zIndex: 1301,
          }}
          elevation={24}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Your Reservations</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {sortedReservations.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              You don't have any reservations yet.
            </Typography>
          ) : (
            <List>
              {sortedReservations.map((reservation, index) => {
                const reservationDate = new Date(reservation.date);
                const formattedDate = isNaN(reservationDate.getTime()) ? 'Invalid date' : format(reservationDate, 'MMMM d, yyyy');

                return (
                  <ListItem key={index} divider={index !== sortedReservations.length - 1}>
                    <ListItemAvatar>
                      <Avatar src={reservation.profileImage} alt={reservation.barberName} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={reservation.barberName}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {formattedDate}
                          </Typography>
                          {' — '}
                          {reservation.time}
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        disabled={isReservationCancelled(reservation.date, reservation.time)}
                        onClick={() => {
                          console.log('Cancel button clicked for:', reservation.time);
                          handleCancel(reservation.date, reservation.time);
                        }}
                      >
                        {isReservationCancelled(reservation.date, reservation.time) ? 'Cancelled' : 'Cancel'}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>
      </Box>
    </Modal>
  );
} 
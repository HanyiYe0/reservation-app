import React, { useState, useEffect } from 'react';
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
  isCancelled?: boolean;
}

interface UserReservationsProps {
  open: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onCancelReservation: (date: Date, time: string, isCancelled: boolean) => void;
}

export default function UserReservations({ open, onClose, reservations, onCancelReservation }: UserReservationsProps) {
  const [localReservations, setLocalReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    console.log('=== User Reservations Modal Opened ===');
    setLocalReservations(prevReservations => {
      const updatedReservations = reservations.map(newRes => {
        const existingRes = prevReservations.find(prevRes => 
          prevRes.date.getTime() === newRes.date.getTime() && prevRes.time === newRes.time
        );
        return existingRes ? { ...newRes, isCancelled: existingRes.isCancelled } : newRes;
      });
      return updatedReservations;
    });
  }, [reservations]);

  const handleCancel = (reservation: Reservation) => {
    console.log('=== Cancel Button Clicked ===');
    console.log('Reservation to cancel:', reservation);

    // Update the local state to mark the reservation as cancelled
    setLocalReservations(prevReservations => {
      return prevReservations.map(res => 
        res.date.getTime() === reservation.date.getTime() && res.time === reservation.time
          ? { ...res, isCancelled: true } // Set as cancelled
          : res
      );
    });

    // Call the onCancelReservation function to update the state in ReservationApp
    onCancelReservation(reservation.date, reservation.time, true);
  };

  const sortedReservations = [...localReservations].sort((a, b) => {
    // Check if date and time are valid for a
    const dateTimeA = a.date && a.time ? new Date(`${format(new Date(a.date), 'yyyy/MM/dd')} ${a.time}`) : null;
    // Check if date and time are valid for b
    const dateTimeB = b.date && b.time ? new Date(`${format(new Date(b.date), 'yyyy/MM/dd')} ${b.time}`) : null;

    // Handle invalid date cases
    if (!dateTimeA) return 1; // Move invalid dates to the end
    if (!dateTimeB) return -1; // Move invalid dates to the end

    return dateTimeA.getTime() - dateTimeB.getTime();
  });

  return (
    <Modal 
      open={open} 
      onClose={() => {
        console.log('=== User Reservations Modal Closed ===');
        onClose();
      }}
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
                          <Typography component="span" variant="body2" color={reservation.isCancelled ? 'error' : 'text.secondary'}>
                            {reservation.time} {reservation.isCancelled && '(Cancelled)'}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button 
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={reservation.isCancelled}
                        onClick={() => {
                          console.log('Button clicked directly');
                          handleCancel(reservation);
                        }}
                      >
                        {reservation.isCancelled ? 'Cancelled' : 'Cancel'}
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
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
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress
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
  onCancelReservation: (date: Date, time: string) => void;
  isCancelling: string | null;
}

const UserReservations: React.FC<UserReservationsProps> = ({
  open,
  onClose,
  reservations,
  onCancelReservation,
  isCancelling
}) => {
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
    onCancelReservation(reservation.date, reservation.time);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>My Reservations</DialogTitle>
      <DialogContent>
        {reservations.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No reservations found
          </Typography>
        ) : (
          <List>
            {reservations.map((reservation, index) => (
              <ListItem
                key={index}
                sx={{
                  mb: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar src={reservation.profileImage} alt={reservation.barberName} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" component="span">
                        {reservation.barberName}
                      </Typography>
                      {reservation.isCancelled && (
                        <Typography
                          variant="caption"
                          sx={{
                            backgroundColor: 'error.main',
                            color: 'error.contrastText',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          Cancelled
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {format(reservation.date, 'MMMM d, yyyy')}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.secondary">
                        {reservation.time}
                      </Typography>
                    </>
                  }
                />
                {!reservation.isCancelled && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancel(reservation)}
                    disabled={isCancelling === reservation.time}
                    sx={{ ml: 2 }}
                  >
                    {isCancelling === reservation.time ? (
                      <>
                        <CircularProgress size={20} color="error" sx={{ mr: 1 }} />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel'
                    )}
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserReservations; 
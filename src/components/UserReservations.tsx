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
    const dateTimeA = new Date(`${format(a.date, 'yyyy/MM/dd')} ${a.time}`);
    const dateTimeB = new Date(`${format(b.date, 'yyyy/MM/dd')} ${b.time}`);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });

  const handleCancel = (date: Date, time: string) => {
    console.log('Cancel button clicked:', { date, time });
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    setCancelledReservations(prev => [...prev, key]);
    onCancelReservation(date, time);
  };

  const isReservationCancelled = (date: Date, time: string) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    return cancelledReservations.includes(key);
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
              {sortedReservations.map((reservation, index) => (
                <ListItem key={index} divider={index !== sortedReservations.length - 1}>
                  <ListItemAvatar>
                    <Avatar src={reservation.profileImage} alt={reservation.barberName} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={reservation.barberName}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {format(reservation.date, 'MMMM d, yyyy')}
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
                      onClick={() => handleCancel(reservation.date, reservation.time)}
                    >
                      {isReservationCancelled(reservation.date, reservation.time) ? 'Cancelled' : 'Cancel'}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Modal>
  );
} 
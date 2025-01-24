import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton
} from '@mui/material';
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
  const sortedReservations = [...reservations].sort((a, b) => {
    const dateTimeA = new Date(`${format(a.date, 'yyyy/MM/dd')} ${a.time}`);
    const dateTimeB = new Date(`${format(b.date, 'yyyy/MM/dd')} ${b.time}`);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <DialogTitle>My Reservations</DialogTitle>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        {sortedReservations.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No reservations found
          </Typography>
        ) : (
          <List>
            {sortedReservations.map((reservation, index) => (
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
                    onClick={() => onCancelReservation(reservation.date, reservation.time)}
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
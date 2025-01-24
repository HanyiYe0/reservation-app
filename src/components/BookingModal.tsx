import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  appointment: {
    time: string;
    barberName: string;
    profileImage: string;
  };
  onSubmit: (bookingData: { time: string }) => Promise<void>;
  isBooking?: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onClose,
  appointment,
  onSubmit,
  isBooking = false
}) => {
  const handleSubmit = async () => {
    await onSubmit({ time: appointment.time });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <DialogTitle>Confirm Booking</DialogTitle>
        <IconButton onClick={onClose} disabled={isBooking}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={appointment.profileImage}
            alt={appointment.barberName}
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Box>
            <Typography variant="h6">{appointment.barberName}</Typography>
            <Typography color="text.secondary">{appointment.time}</Typography>
          </Box>
        </Box>
        <Typography variant="body1">
          Would you like to book this appointment?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isBooking}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isBooking}
          startIcon={isBooking ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isBooking ? 'Booking...' : 'Book'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingModal; 
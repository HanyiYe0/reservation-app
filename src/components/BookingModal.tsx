import React from 'react';
import { Modal } from '@mui/base/Modal';
import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';

interface Appointment {
  time: string;
  barberName: string;
  profileImage: string;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSubmit: (data: { time: string }) => void;
}

export default function BookingModal({ open, onClose, appointment, onSubmit }: BookingModalProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ time: appointment.time });
  };

  return (
    <Modal open={open} onClose={onClose}>
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
            maxWidth: 400,
            p: 3,
            position: 'relative',
            zIndex: 1301,
          }}
          elevation={24}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Confirm Booking
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to book an appointment with {appointment.barberName} at {appointment.time}.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Confirm Booking
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
} 
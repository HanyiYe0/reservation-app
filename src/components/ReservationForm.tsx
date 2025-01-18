import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';

// Mock data for barbers
const BARBERS = [
  { id: 1, name: 'John Smith' },
  { id: 2, name: 'Sarah Johnson' },
  { id: 3, name: 'Mike Wilson' },
];

// Mock data for time slots
const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM'
];

const ReservationForm: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the reservation data to a backend server
    console.log({
      date: selectedDate,
      time: selectedTime,
      barber: selectedBarber,
    });
    alert('Reservation submitted successfully!');
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Book Your Haircut
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              sx={{ width: '100%', mb: 3 }}
              disablePast
            />
          </LocalizationProvider>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Time</InputLabel>
            <Select
              value={selectedTime}
              label="Select Time"
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            >
              {TIME_SLOTS.map((time) => (
                <MenuItem key={time} value={time}>
                  {time}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Barber</InputLabel>
            <Select
              value={selectedBarber}
              label="Select Barber"
              onChange={(e) => setSelectedBarber(e.target.value)}
              required
            >
              {BARBERS.map((barber) => (
                <MenuItem key={barber.id} value={barber.id}>
                  {barber.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            Book Appointment
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReservationForm; 
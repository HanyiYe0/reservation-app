import React from 'react';
import { Box, Typography } from '@mui/material';
import { format, isToday, isTomorrow, isThisWeek, addWeeks, isSameWeek } from 'date-fns';

interface HeaderProps {
  selectedDate: Date;
}

const Header: React.FC<HeaderProps> = ({ selectedDate }) => {
  const getRelativeTimeText = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE');
    if (isSameWeek(date, addWeeks(new Date(), 1))) return 'Next Week';
    return format(date, 'MMMM d');
  };

  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Scheduled Times
      </Typography>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2,
          justifyContent: 'center',
          mb: 3
        }}
      >
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'normal' }}>
          {format(selectedDate, 'MMMM d, yyyy')}
        </Typography>
        <Box
          sx={{
            backgroundColor: isToday(selectedDate) ? 'primary.main' : 'grey.100',
            color: isToday(selectedDate) ? 'primary.contrastText' : 'text.secondary',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.875rem',
            fontWeight: 'medium'
          }}
        >
          {getRelativeTimeText(selectedDate)}
        </Box>
      </Box>
    </Box>
  );
};

export default Header; 
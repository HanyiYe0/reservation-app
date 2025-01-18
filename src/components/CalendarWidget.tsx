import React, { useState } from 'react';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface CalendarWidgetProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6">
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <Typography
            key={day}
            variant="caption"
            align="center"
            sx={{ fontWeight: 'bold' }}
          >
            {day}
          </Typography>
        ))}
        {days.map((day) => (
          <Box
            key={day.toISOString()}
            onClick={() => onDateSelect(day)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 36,
              cursor: 'pointer',
              borderRadius: 1,
              bgcolor: isSameDay(day, selectedDate) ? 'primary.main' : 'transparent',
              color: isSameDay(day, selectedDate) ? 'white' : 'inherit',
              '&:hover': {
                bgcolor: isSameDay(day, selectedDate) ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <Typography variant="body2">
              {format(day, 'd')}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default CalendarWidget; 
import React, { useState } from 'react';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay } from 'date-fns';
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
  const today = startOfDay(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    if (!isBefore(startOfMonth(newMonth), startOfMonth(today))) {
      setCurrentMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day: Date) => {
    if (!isBefore(day, today)) {
      onDateSelect(day);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton 
          onClick={handlePrevMonth}
          disabled={isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(today))}
        >
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
        {days.map((day) => {
          const isPastDate = isBefore(day, today);
          return (
            <Box
              key={day.toISOString()}
              onClick={() => !isPastDate && handleDateClick(day)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 36,
                cursor: isPastDate ? 'not-allowed' : 'pointer',
                borderRadius: 1,
                bgcolor: isSameDay(day, selectedDate) ? 'primary.main' : 'transparent',
                color: isPastDate 
                  ? 'text.disabled' 
                  : isSameDay(day, selectedDate) 
                  ? 'white' 
                  : 'inherit',
                opacity: isPastDate ? 0.5 : 1,
                '&:hover': {
                  bgcolor: isPastDate 
                    ? 'transparent' 
                    : isSameDay(day, selectedDate) 
                    ? 'primary.dark' 
                    : 'action.hover',
                },
              }}
            >
              <Typography variant="body2">
                {format(day, 'd')}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default CalendarWidget; 
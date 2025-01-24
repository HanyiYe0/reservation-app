import React, { useState } from 'react';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isBefore, 
  startOfDay,
  getDay,
  addDays,
  isToday
} from 'date-fns';
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

  // Get the first day of the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = addDays(monthStart, -getDay(monthStart));
  const endDate = addDays(monthEnd, 6 - getDay(monthEnd));

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
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
    <Paper 
      elevation={3}
      sx={{ 
        p: 3,
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 3,
        px: 1
      }}>
        <IconButton 
          onClick={handlePrevMonth}
          disabled={isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(today))}
          sx={{ 
            '&:hover': { 
              backgroundColor: 'rgba(0, 0, 0, 0.04)' 
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <IconButton 
          onClick={handleNextMonth}
          sx={{ 
            '&:hover': { 
              backgroundColor: 'rgba(0, 0, 0, 0.04)' 
            }
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 1.5,
        mb: 1
      }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <Typography
            key={day}
            variant="caption"
            align="center"
            sx={{ 
              fontWeight: 600,
              color: 'text.secondary',
              fontSize: '0.75rem'
            }}
          >
            {day}
          </Typography>
        ))}
        {days.map((day) => {
          const isPastDate = isBefore(day, today);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isSelectedDay = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          
          return (
            <Box
              key={day.toISOString()}
              onClick={() => !isPastDate && isCurrentMonth && handleDateClick(day)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 36,
                cursor: (!isPastDate && isCurrentMonth) ? 'pointer' : 'default',
                borderRadius: '50%',
                bgcolor: isSelectedDay 
                  ? 'primary.main' 
                  : isTodayDate && !isSelectedDay
                  ? 'primary.light'
                  : 'transparent',
                color: !isCurrentMonth 
                  ? 'text.disabled'
                  : isPastDate 
                  ? 'text.disabled' 
                  : isSelectedDay 
                  ? 'white' 
                  : isTodayDate
                  ? 'primary.main'
                  : 'text.primary',
                opacity: !isCurrentMonth ? 0.3 : isPastDate ? 0.5 : 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: (!isPastDate && isCurrentMonth)
                    ? isSelectedDay 
                      ? 'primary.dark' 
                      : 'action.hover'
                    : 'transparent',
                },
                border: isTodayDate && !isSelectedDay ? '1px solid' : 'none',
                borderColor: 'primary.main'
              }}
            >
              <Typography 
                variant="body2"
                sx={{ 
                  fontWeight: isSelectedDay || isTodayDate ? 600 : 400,
                  fontSize: '0.875rem'
                }}
              >
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
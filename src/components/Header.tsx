import React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';

const Header: React.FC = () => {
  const today = new Date();
  const formattedDate = format(today, "'Today | Day' dd | EEEE");

  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Scheduled Times
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {formattedDate}
      </Typography>
    </Box>
  );
};

export default Header; 
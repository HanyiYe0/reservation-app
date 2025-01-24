import React from 'react';
import { Box, Container, Grid, Skeleton } from '@mui/material';

export const LoadingBarbersSkeleton = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Skeleton variant="rectangular" width={200} height={40} sx={{ mb: 3, mx: 'auto' }} />
    <Grid container spacing={4}>
      <Grid item xs={12} md={8}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  </Container>
);

export const LoadingAppointmentsSkeleton = () => (
  <Box display="flex" flexDirection="column" gap={2} minHeight="200px">
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Skeleton variant="circular" width={50} height={50} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
    </Box>
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="30%" height={20} />
        </Box>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      </Box>
    ))}
  </Box>
);
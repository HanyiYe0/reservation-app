import { Box, Typography } from "@mui/material";
import { auth } from "@clerk/nextjs/server";
import ReservationApp from '../components/ReservationApp';

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Please Sign In
        </Typography>
        <Typography>
          You need to be signed in to view and make reservations.
        </Typography>
      </Box>
    );
  }

  return <ReservationApp />;
} 
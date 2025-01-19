'use client';

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { theme } from '../theme';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ flexGrow: 1 }}>
              <AppBar position="static">
                <Toolbar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Reservation App
                  </Typography>
                  <SignedIn>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button
                        color="inherit"
                        onClick={() => {
                          // This will be handled by the ReservationApp component
                          const event = new CustomEvent('openReservations');
                          window.dispatchEvent(event);
                        }}
                      >
                        My Reservations
                      </Button>
                      <UserButton />
                    </Box>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button color="inherit">
                        Sign in
                      </Button>
                    </SignInButton>
                  </SignedOut>
                </Toolbar>
              </AppBar>
              {children}
            </Box>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
} 
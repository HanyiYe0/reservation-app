import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ReservationForm from './components/ReservationForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReservationForm />
    </ThemeProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import Navigation from './components/Navigation';
import AttendancePage from './pages/AttendancePage';
import ReportPage from './pages/ReportPage';
import Login from './components/Login';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        signInAnonymously(auth)
          .then((userCredential) => {
            setUser(userCredential.user);
          })
          .catch((error) => {
            console.error("Error signing in anonymously:", error);
          });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
              Hệ thống Quản lý - TNG Company
            </Typography>
            <Navigation />
            <Routes>
              <Route path="/" element={user ? <AttendancePage user={user} /> : <Navigate to="/login" />} />
              <Route path="/report" element={user ? <ReportPage user={user} /> : <Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;

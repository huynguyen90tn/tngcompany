import React from 'react';
import { Container, Box } from '@mui/material';
import Login from '../components/Login';

function LoginPage() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Login />
      </Box>
    </Container>
  );
}

export default LoginPage;
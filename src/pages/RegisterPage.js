import React from 'react';
import { Container, Box } from '@mui/material';
import Register from '../components/Register';

function RegisterPage() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Register />
      </Box>
    </Container>
  );
}

export default RegisterPage;
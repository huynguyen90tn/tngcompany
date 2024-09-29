import React from 'react';
import { Container, Box } from '@mui/material';
import MemberList from '../components/MemberList';

function MemberListPage() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <MemberList />
      </Box>
    </Container>
  );
}

export default MemberListPage;
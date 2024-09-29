import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import DailyReport from '../components/DailyReport';

function ReportPage({ user }) {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Báo Cáo Công Việc Hằng Ngày
        </Typography>
        <DailyReport user={user} />
      </Box>
    </Container>
  );
}

export default ReportPage;
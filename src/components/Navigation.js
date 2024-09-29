import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Box } from '@mui/material';

function Navigation() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
      <Button component={Link} to="/" variant="outlined" sx={{ mr: 2 }}>
        Điểm Danh
      </Button>
      <Button component={Link} to="/report" variant="outlined">
        Báo Cáo Công Việc
      </Button>
    </Box>
  );
}

export default Navigation;

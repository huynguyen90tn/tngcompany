import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
      <Button component={Link} to="/" variant="outlined" sx={{ mr: 2 }}>
        Điểm Danh
      </Button>
      <Button component={Link} to="/report" variant="outlined" sx={{ mr: 2 }}>
        Báo Cáo Công Việc
      </Button>
      <Button component={Link} to="/members" variant="outlined" sx={{ mr: 2 }}>
        Danh Sách Thành Viên
      </Button>
      <Button onClick={handleLogout} variant="outlined" color="secondary">
        Đăng Xuất
      </Button>
    </Box>
  );
}

export default Navigation;
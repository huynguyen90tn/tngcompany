import React from 'react';
import { Button } from '@mui/material';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    signInAnonymously(auth)
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error("Error signing in anonymously:", error);
      });
  };

  return (
    <Button variant="contained" onClick={handleLogin}>
      Đăng nhập Ẩn danh
    </Button>
  );
}

export default Login;
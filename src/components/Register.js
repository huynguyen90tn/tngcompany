import React, { useState } from 'react';
import { Button, Typography, Container, Box, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    memberId: '',
    gender: '',
    joinDate: '',
    system: '',
    phoneNumber: '',
    hometown: '',
    currentAddress: '',
    licensePlate: ''
  });
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error("No user signed in");
      return;
    }
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        email: user.email,
        photoURL: user.photoURL
      });
      navigate('/');
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography component="h1" variant="h5">
          Đăng ký
        </Typography>
        {!user ? (
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleGoogleSignIn}
          >
            Đăng nhập bằng Google
          </Button>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="memberId"
              label="Mã số thành viên"
              name="memberId"
              value={formData.memberId}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Giới tính</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <MenuItem value="Nam">Nam</MenuItem>
                <MenuItem value="Nữ">Nữ</MenuItem>
                <MenuItem value="Khác">Khác</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              id="joinDate"
              label="Ngày gia nhập"
              name="joinDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.joinDate}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Hệ</InputLabel>
              <Select
                name="system"
                value={formData.system}
                onChange={handleInputChange}
              >
                <MenuItem value="TÂY VÂN CÁC">TÂY VÂN CÁC</MenuItem>
                <MenuItem value="HỌA TAM ĐƯỜNG">HỌA TAM ĐƯỜNG</MenuItem>
                <MenuItem value="HOA VÂN CÁC">HOA VÂN CÁC</MenuItem>
                <MenuItem value="THIÊN MINH ĐƯỜNG">THIÊN MINH ĐƯỜNG</MenuItem>
                <MenuItem value="HỒ LY SƠN TRANG">HỒ LY SƠN TRANG</MenuItem>
                <MenuItem value="TINH VÂN CÁC">TINH VÂN CÁC</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              id="phoneNumber"
              label="Số điện thoại"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="hometown"
              label="Quê quán"
              name="hometown"
              value={formData.hometown}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="currentAddress"
              label="Nơi ở hiện nay"
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="licensePlate"
              label="Biển số xe (nếu có)"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleInputChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Đăng ký
            </Button>
          </form>
        )}
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" color="primary" align="center">
            Đã có tài khoản? Đăng nhập ngay
          </Typography>
        </Link>
      </Box>
    </Container>
  );
}

export default Register;
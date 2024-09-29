import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, FormControl, InputLabel, Typography, CircularProgress, Avatar } from '@mui/material';
import { fetchMembers } from '../services/firebaseService';

function MemberList() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const fetchedMembers = await fetchMembers();
        setMembers(fetchedMembers);
        setFilteredMembers(fetchedMembers);
        setLoading(false);
      } catch (error) {
        console.error('Error loading members:', error);
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  useEffect(() => {
    let result = members;
    if (searchTerm) {
      result = result.filter(member => member.memberId.includes(searchTerm));
    }
    if (selectedSystem) {
      result = result.filter(member => member.system === selectedSystem);
    }
    setFilteredMembers(result);
  }, [searchTerm, selectedSystem, members]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSystemChange = (event) => {
    setSelectedSystem(event.target.value);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Danh sách thành viên
      </Typography>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Tìm kiếm theo mã số"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Nhập mã số thành viên"
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Lọc theo hệ</InputLabel>
        <Select
          value={selectedSystem}
          onChange={handleSystemChange}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="TÂY VÂN CÁC">TÂY VÂN CÁC</MenuItem>
          <MenuItem value="HỌA TAM ĐƯỜNG">HỌA TAM ĐƯỜNG</MenuItem>
          <MenuItem value="HOA VÂN CÁC">HOA VÂN CÁC</MenuItem>
          <MenuItem value="THIÊN MINH ĐƯỜNG">THIÊN MINH ĐƯỜNG</MenuItem>
          <MenuItem value="HỒ LY SƠN TRANG">HỒ LY SƠN TRANG</MenuItem>
          <MenuItem value="TINH VÂN CÁC">TINH VÂN CÁC</MenuItem>
        </Select>
      </FormControl>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ảnh</TableCell>
              <TableCell>Mã số</TableCell>
              <TableCell>Họ và tên</TableCell>
              <TableCell>Giới tính</TableCell>
              <TableCell>Ngày gia nhập</TableCell>
              <TableCell>Hệ</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Quê quán</TableCell>
              <TableCell>Nơi ở hiện nay</TableCell>
              <TableCell>Biển số xe</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.map((member, index) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Avatar src={member.profileImage} alt={member.fullName} />
                </TableCell>
                <TableCell>{member.memberId}</TableCell>
                <TableCell>{member.fullName}</TableCell>
                <TableCell>{member.gender}</TableCell>
                <TableCell>{member.joinDate}</TableCell>
                <TableCell>{member.system}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phoneNumber}</TableCell>
                <TableCell>{member.hometown}</TableCell>
                <TableCell>{member.currentAddress}</TableCell>
                <TableCell>{member.licensePlate || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default MemberList;
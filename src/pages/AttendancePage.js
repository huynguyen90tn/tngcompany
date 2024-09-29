import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AttendanceForm from '../components/AttendanceForm';
import { fetchAttendanceHistory, fetchMonthlyStats } from '../services/firebaseService';

function AttendancePage({ user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch data callback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); // Set loading state
      const history = await fetchAttendanceHistory(user.uid, selectedDate);
      setAttendanceHistory(history);
      const stats = await fetchMonthlyStats(selectedDate);
      setMonthlyStats(stats);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user.uid, selectedDate]);

  // Fetch data when component mounts or selectedDate changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AttendanceForm user={user} onAttendanceSubmit={fetchData} />
        </Grid>

        {/* Date Picker for selecting date */}
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: 2 }}>
            <DatePicker
              label="Chọn ngày"
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} />}
            />
          </Card>
        </Grid>

        {/* Monthly Stats Table */}
        <Grid item xs={12}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>Thống kê đi muộn</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã số</TableCell>
                    <TableCell>Họ và tên</TableCell>
                    <TableCell>Số lần đi muộn</TableCell>
                    <TableCell>Tổng thời gian đi muộn</TableCell>
                    <TableCell>Tổng số giờ bị trừ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(monthlyStats).map(([employeeId, stats]) => (
                    <TableRow key={employeeId}>
                      <TableCell>{employeeId}</TableCell>
                      <TableCell>{stats.name}</TableCell>
                      <TableCell>{stats.lateCount}</TableCell>
                      <TableCell>
                        {Math.floor(stats.totalLateMinutes / 60)} giờ {stats.totalLateMinutes % 60} phút
                      </TableCell>
                      <TableCell>{stats.totalDeductedHours}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Attendance History Table */}
        <Grid item xs={12}>
          <Card sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>Chi tiết điểm danh</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Họ và tên</TableCell>
                    <TableCell>Mã số</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Đi muộn</TableCell>
                    <TableCell>Địa điểm</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.timestamp.toLocaleString()}</TableCell>
                      <TableCell>
                        {record.lateMinutes > 0
                          ? `${Math.floor(record.lateMinutes / 60)} giờ ${record.lateMinutes % 60} phút`
                          : 'Đúng giờ'}
                      </TableCell>
                      <TableCell>{record.attendanceLocation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}

export default AttendancePage;

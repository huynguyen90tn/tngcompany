import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Card, CardContent, Typography, Grow, Fade, Box } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import AttendanceForm from '../components/AttendanceForm';
import AttendanceHistory from '../components/AttendanceHistory';
import MonthlyStats from '../components/MonthlyStats';
import { fetchAttendanceHistory, fetchMonthlyStats, submitAttendance } from '../services/firebaseService';
import { motion, AnimatePresence } from 'framer-motion';

function AttendancePage({ user }) {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState({});
  const [attendanceLocation, setAttendanceLocation] = useState('');
  const [showCongratulation, setShowCongratulation] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const history = await fetchAttendanceHistory(user.uid, selectedDate);
      setAttendanceHistory(history);
      const stats = await fetchMonthlyStats(selectedDate);
      setMonthlyStats(stats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setStatus("Lỗi khi lấy dữ liệu: " + error.message);
      setLoading(false);
    }
  }, [user.uid, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAttendance = async (attendanceData) => {
    try {
      await submitAttendance(attendanceData);
      setStatus(`Điểm danh thành công! ${attendanceData.lateMinutes > 0 ? `Bạn đi muộn ${Math.floor(attendanceData.lateMinutes / 60)} giờ ${attendanceData.lateMinutes % 60} phút.` : ''}`);
      setShowCongratulation(true);
      setTimeout(() => setShowCongratulation(false), 5000);
      fetchData();
    } catch (error) {
      console.error("Lỗi khi điểm danh:", error);
      setStatus(`Lỗi khi điểm danh: ${error.message}`);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchData();
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <>
      <Grow in={true} timeout={1000}>
        <Card elevation={3} sx={{ mb: 4, p: 3, borderRadius: '16px', background: 'linear-gradient(145deg, #ffffff, #f0f0f0)' }}>
          <AttendanceForm
            employeeName={employeeName}
            employeeId={employeeId}
            attendanceLocation={attendanceLocation}
            setEmployeeName={setEmployeeName}
            setEmployeeId={setEmployeeId}
            setAttendanceLocation={setAttendanceLocation}
            onAttendance={handleAttendance}
          />
        </Card>
      </Grow>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <Typography color="primary" sx={{ mt: 2, textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {status}
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      <Fade in={showCongratulation} timeout={1000}>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h5" className="congratulation-text" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
            Chúc bạn {employeeName} (Mã số: {employeeId}) ngày mới tốt lành!
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className="custom-calendar"
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <MonthlyStats monthlyStats={monthlyStats} />
        </Grid>
      </Grid>

      <AttendanceHistory attendanceHistory={attendanceHistory} />
    </>
  );
}

export default AttendancePage;
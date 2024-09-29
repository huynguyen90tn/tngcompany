import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { submitAttendance, fetchAttendanceHistory, fetchMonthlyStats } from '../services/firebaseService';

function AttendanceForm({ user }) {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [attendanceLocation, setAttendanceLocation] = useState('');
  const [openLateDialog, setOpenLateDialog] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [hasReported, setHasReported] = useState(false);
  const [lateApprover, setLateApprover] = useState('');
  const [deductedHours, setDeductedHours] = useState(0);
  const [showDeductionNotice, setShowDeductionNotice] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [todayAttendance, setTodayAttendance] = useState([]);

  useEffect(() => {
    fetchMonthlyStats(new Date()).then(setMonthlyStats);
    fetchAttendanceHistory(user.uid, new Date()).then(setTodayAttendance);
  }, [user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    const cutoffTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 5, 0);
    
    if (now > cutoffTime) {
      setOpenLateDialog(true);
    } else {
      await submitAttendance({ employeeName, employeeId, attendanceLocation, lateMinutes: 0, deductedHours: 0, userId: user.uid });
      fetchAttendanceHistory(user.uid, new Date()).then(setTodayAttendance);
    }
  };

  const handleLateSubmit = async () => {
    const now = new Date();
    const cutoffTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 5, 0);
    const lateMinutes = Math.round((now - cutoffTime) / (1000 * 60));
    const calculatedDeductedHours = calculateDeductedHours(lateMinutes, hasReported);
    setDeductedHours(calculatedDeductedHours);

    await submitAttendance({
      employeeName,
      employeeId,
      attendanceLocation,
      lateMinutes,
      lateReason,
      lateReport: hasReported ? 'Đã báo cáo' : 'Chưa báo cáo',
      lateApprover: hasReported ? lateApprover : '',
      deductedHours: calculatedDeductedHours,
      userId: user.uid
    });
    setOpenLateDialog(false);
    setShowDeductionNotice(true);
    fetchAttendanceHistory(user.uid, new Date()).then(setTodayAttendance);
  };

  const calculateDeductedHours = (lateMinutes, hasReported) => {
    let deductedHours;
    if (lateMinutes <= 24) {
      deductedHours = hasReported ? 0.5 : 1;
    } else if (lateMinutes <= 55) {
      deductedHours = hasReported ? 1 : 2;
    } else if (lateMinutes <= 85) {
      deductedHours = hasReported ? 1.5 : 3;
    } else {
      const additionalHalfHours = Math.ceil((lateMinutes - 85) / 30);
      deductedHours = hasReported ? 1.5 + (0.5 * additionalHalfHours) : 3 + additionalHalfHours;
    }
    return hasReported ? deductedHours : deductedHours * 2;
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Họ và tên"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mã số thành viên"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="attendance-location-label">Địa điểm điểm danh</InputLabel>
              <Select
                labelId="attendance-location-label"
                value={attendanceLocation}
                onChange={(e) => setAttendanceLocation(e.target.value)}
                label="Địa điểm điểm danh"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="Tại Tổng đàn">Tại Tổng đàn</MenuItem>
                <MenuItem value="Tại nhà">Tại nhà</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{
                mt: 2,
                borderRadius: '12px',
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(25, 118, 210, 0.25)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 8px rgba(25, 118, 210, 0.3)',
                }
              }}
            >
              Điểm Danh
            </Button>
          </Grid>
        </Grid>
      </form>
      
      <Dialog open={openLateDialog} onClose={() => setOpenLateDialog(false)}>
        <DialogTitle>Bạn đi muộn</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Lý do đi muộn"
            type="text"
            fullWidth
            value={lateReason}
            onChange={(e) => setLateReason(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Đã báo cáo chưa?</InputLabel>
            <Select
              value={hasReported}
              onChange={(e) => setHasReported(e.target.value)}
            >
              <MenuItem value={true}>Đã báo cáo</MenuItem>
              <MenuItem value={false}>Chưa báo cáo</MenuItem>
            </Select>
          </FormControl>
          {hasReported && (
            <TextField
              margin="dense"
              label="Người duyệt báo cáo"
              type="text"
              fullWidth
              value={lateApprover}
              onChange={(e) => setLateApprover(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLateDialog(false)}>Hủy</Button>
          <Button onClick={handleLateSubmit}>OK</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeductionNotice} onClose={() => setShowDeductionNotice(false)}>
        <DialogTitle>Thông báo trừ giờ</DialogTitle>
        <DialogContent>
          <Typography>
            {hasReported 
              ? `Bạn đi muộn có lý do và đã xin phép (${lateApprover}). Bạn bị trừ ${deductedHours} giờ làm việc.`
              : `Bạn đi muộn chưa xin phép. Bạn bị trừ ${deductedHours} giờ (Phạt x2 số giờ đi muộn).`
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeductionNotice(false)}>OK</Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h6" sx={{ mt: 4 }}>Tổng số giờ đi muộn trong tháng</Typography>
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
                <TableCell>{Math.floor(stats.totalLateMinutes / 60)} giờ {stats.totalLateMinutes % 60} phút</TableCell>
                <TableCell>{stats.totalDeductedHours}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ mt: 4 }}>Điểm danh hôm nay</Typography>
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
            {todayAttendance.map((record) => (
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
    </>
  );
}

export default AttendanceForm;
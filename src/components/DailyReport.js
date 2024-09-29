import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Button, Grid, Typography, Paper, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { submitDailyReport, fetchDailyReports, deleteDailyReport } from '../services/firebaseService';

function DailyReport({ user }) {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    level: '',
    workingHours: 0,
    lateHours: 0,
    leaveHours: 0,
    overtimeHours: 0,
    permission: 'Chọn câu trả lời bên dưới',
    leaveApprover: '',
    totalHours: 0,
    workLocation: '',
    reportLink: '',
    workDescription: '',
    overtimeContent: '',
    overtimeApprover: ''
  });

  const [reports, setReports] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetData, setResetData] = useState({
    employeeId: '',
    level: ''
  });
  const [openOvertimeDialog, setOpenOvertimeDialog] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      const newState = { ...prevState, [name]: value };
      if (['workingHours', 'lateHours', 'leaveHours', 'overtimeHours'].includes(name)) {
        newState.totalHours = Number(newState.workingHours) + Number(newState.lateHours) + Number(newState.leaveHours) + Number(newState.overtimeHours);
      }
      if (name === 'overtimeHours' && Number(value) > 0) {
        setOpenOvertimeDialog(true);
      }
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Vui lòng điền đầy đủ thông tin và kiểm tra lại các trường.');
      return;
    }
    try {
      await submitDailyReport({ ...formData, date: selectedDate, userId: user.uid });
      alert('Báo cáo đã được gửi thành công!');
      resetForm();
      fetchReports(selectedDate);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      employeeId: '',
      level: '',
      workingHours: 0,
      lateHours: 0,
      leaveHours: 0,
      overtimeHours: 0,
      permission: 'Chọn câu trả lời bên dưới',
      leaveApprover: '',
      totalHours: 0,
      workLocation: '',
      reportLink: '',
      workDescription: '',
      overtimeContent: '',
      overtimeApprover: ''
    });
  };

  const validateForm = () => {
    const requiredFields = ['name', 'employeeId', 'level', 'workLocation', 'reportLink', 'workDescription'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        console.log(`Field ${field} is empty`);
        return false;
      }
    }
    if (formData.permission === 'Chọn câu trả lời bên dưới' && formData.leaveHours > 0) {
      console.log('Permission not selected');
      return false;
    }
    if (formData.permission === 'Đã xin phép' && !formData.leaveApprover && formData.leaveHours > 0) {
      console.log('Leave approver not provided');
      return false;
    }
    if (!/^https?:\/\/.+/.test(formData.reportLink)) {
      console.log('Invalid report link');
      return false;
    }
    if (!/^[1-9]\d{2}$/.test(formData.employeeId)) {
      console.log('Invalid employee ID');
      return false;
    }
    if (formData.overtimeHours > 0 && (!formData.overtimeContent || !formData.overtimeApprover)) {
      console.log('Overtime information incomplete');
      return false;
    }
    return true;
  };

  const fetchReports = async (date) => {
    try {
      const fetchedReports = await fetchDailyReports(date);
      setReports(fetchedReports.sort((a, b) => a.employeeId.localeCompare(b.employeeId)));
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    fetchReports(selectedDate);
  }, [selectedDate]);

  const handleResetReport = () => {
    setOpenResetDialog(true);
  };

  const handleConfirmReset = async () => {
    try {
      await deleteDailyReport(resetData.employeeId, resetData.level, selectedDate);
      alert('Báo cáo đã được xóa thành công!');
      fetchReports(selectedDate);
      setOpenResetDialog(false);
    } catch (error) {
      console.error('Error resetting report:', error);
      alert('Có lỗi xảy ra khi xóa báo cáo. Vui lòng thử lại.');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>Báo Cáo Công Việc Hằng Ngày</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã số nhân viên"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
                inputProps={{ pattern: "[1-9][0-9]{2}" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                >
                  {[...Array(10)].map((_, i) => (
                    <MenuItem key={i} value={i + 1}>{i + 1}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Số giờ làm việc"
                name="workingHours"
                value={formData.workingHours}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Số giờ đi muộn"
                name="lateHours"
                value={formData.lateHours}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Số giờ xin nghỉ"
                name="leaveHours"
                value={formData.leaveHours}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Số giờ tăng ca"
                name="overtimeHours"
                value={formData.overtimeHours}
                onChange={handleInputChange}
              />
            </Grid>
            {formData.leaveHours > 0 && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Xin phép</InputLabel>
                    <Select
                      name="permission"
                      value={formData.permission}
                      onChange={handleInputChange}
                      required
                    >
                      <MenuItem value="Chọn câu trả lời bên dưới">Chọn câu trả lời bên dưới</MenuItem>
                      <MenuItem value="Chưa xin phép">Chưa xin phép</MenuItem>
                      <MenuItem value="Đã xin phép">Đã xin phép</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Người giải quyết nghỉ"
                    name="leaveApprover"
                    value={formData.leaveApprover}
                    onChange={handleInputChange}
                    disabled={formData.permission !== 'Đã xin phép'}
                    required={formData.permission === 'Đã xin phép'}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tổng số giờ"
                value={formData.totalHours}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Địa điểm làm việc</InputLabel>
                <Select
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Tại Tổng đàn">Tại Tổng đàn</MenuItem>
                  <MenuItem value="Tại nhà">Tại nhà</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link báo cáo công việc"
                name="reportLink"
                value={formData.reportLink}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả kết quả làm việc"
                name="workDescription"
                value={formData.workDescription}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Gửi Báo Cáo
              </Button>
              <Button onClick={handleResetReport} variant="outlined" sx={{ ml: 2 }}>
                Reset Báo Cáo
              </Button>
            </Grid>
          </Grid>
        </form>
        
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Báo Cáo Ngày: {selectedDate.toLocaleDateString()}</Typography>
        <DatePicker
          value={selectedDate}
          onChange={(newDate) => {
            setSelectedDate(newDate);
            fetchReports(newDate);
          }}
          renderInput={(params) => <TextField {...params} />}
        />
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={7} align="center">Giờ hành chính</TableCell>
                <TableCell colSpan={3} align="center">Làm thêm ngoài giờ</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Mã số</TableCell>
                <TableCell>Họ và tên</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Số giờ làm việc</TableCell>
                <TableCell>Số giờ đi muộn</TableCell>
                <TableCell>Số giờ xin nghỉ</TableCell>
                <TableCell>Tổng số giờ</TableCell>
                <TableCell>Địa điểm làm việc</TableCell>
                <TableCell>Link báo cáo</TableCell>
                <TableCell>Mô tả công việc</TableCell>
                <TableCell>Số giờ tăng ca</TableCell>
                <TableCell>Nội dung tăng ca</TableCell>
                <TableCell>Người duyệt tăng ca</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.employeeId}</TableCell>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{report.level}</TableCell>
                  <TableCell>{report.workingHours}</TableCell>
                  <TableCell>{report.lateHours}</TableCell>
                  <TableCell>{report.leaveHours}</TableCell>
                  <TableCell>{report.totalHours}</TableCell>
                  <TableCell>{report.workLocation}</TableCell>
                  <TableCell>{report.reportLink}</TableCell>
                  <TableCell>{report.workDescription}</TableCell>
                  <TableCell>{report.overtimeHours}</TableCell>
                  <TableCell>{report.overtimeContent}</TableCell>
                  <TableCell>{report.overtimeApprover}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)}>
        <DialogTitle>Reset Báo Cáo</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            sx={{ mt: 2 }}
            label="Mã số thành viên"
            value={resetData.employeeId}
            onChange={(e) => setResetData({ ...resetData, employeeId: e.target.value })}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Level</InputLabel>
            <Select
              value={resetData.level}
              onChange={(e) => setResetData({ ...resetData, level: e.target.value })}
            >
              {[...Array(10)].map((_, i) => (
                <MenuItem key={i} value={i + 1}>{i + 1}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Hủy</Button>
          <Button onClick={handleConfirmReset} variant="contained" color="error">Xác nhận xóa</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openOvertimeDialog} onClose={() => setOpenOvertimeDialog(false)}>
        <DialogTitle>Thông tin tăng ca</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            sx={{ mt: 2 }}
            label="Nội dung tăng ca"
            name="overtimeContent"
            value={formData.overtimeContent}
            onChange={handleInputChange}
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            sx={{ mt: 2 }}
            label="Người duyệt tăng ca"
            name="overtimeApprover"
            value={formData.overtimeApprover}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOvertimeDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default DailyReport;
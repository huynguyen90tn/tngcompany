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
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      const newState = { ...prevState, [name]: value };
      if (['workingHours', 'overtimeHours'].includes(name)) {
        newState.totalHours = Number(newState.workingHours) + Number(newState.overtimeHours);
      }
      if (name === 'overtimeHours' && Number(value) > 0) {
        setOpenOvertimeDialog(true);
      }
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) {
      return;
    }
    try {
      await submitDailyReport({ ...formData, date: selectedDate, userId: user.uid });
      alert('Báo cáo đã được gửi thành công!');
      resetForm();
      fetchReports(selectedDate);
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.');
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
        setError(`Vui lòng điền ${field === 'name' ? 'họ và tên' : field === 'employeeId' ? 'mã số nhân viên' : field === 'level' ? 'cấp độ' : field === 'workLocation' ? 'địa điểm làm việc' : field === 'reportLink' ? 'link báo cáo' : 'mô tả công việc'}.`);
        return false;
      }
    }
    if (formData.permission === 'Chọn câu trả lời bên dưới' && formData.leaveHours > 0) {
      setError('Vui lòng chọn trạng thái xin phép.');
      return false;
    }
    if (formData.permission === 'Đã xin phép' && !formData.leaveApprover && formData.leaveHours > 0) {
      setError('Vui lòng điền người duyệt nghỉ phép.');
      return false;
    }
    if (!/^https?:\/\/.+/.test(formData.reportLink)) {
      setError('Link báo cáo không hợp lệ. Vui lòng kiểm tra lại.');
      return false;
    }
    if (!/^[1-9]\d{2}$/.test(formData.employeeId)) {
      setError('Mã số nhân viên không hợp lệ. Vui lòng kiểm tra lại.');
      return false;
    }
    if (formData.overtimeHours > 0 && (!formData.overtimeContent || !formData.overtimeApprover)) {
      setError('Vui lòng điền đầy đủ thông tin tăng ca.');
      return false;
    }
    if (Number(formData.workingHours) + Number(formData.lateHours) + Number(formData.leaveHours) !== 8) {
      setError('Tổng số giờ làm việc, giờ đi muộn và giờ nghỉ phép phải bằng 8 giờ.');
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
      setError('Có lỗi xảy ra khi lấy dữ liệu báo cáo.');
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
      setError('Có lỗi xảy ra khi xóa báo cáo. Vui lòng thử lại.');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>Báo Cáo Công Việc Hằng Ngày</Typography>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
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
                placeholder="Ví dụ: Nguyễn Văn A"
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
                placeholder="Ví dụ: 001"
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
                InputProps={{ inputProps: { min: 0, max: 8, step: 0.5 } }}
                placeholder="Ví dụ: 7.5"
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
                InputProps={{ inputProps: { min: 0, max: 8, step: 0.5 } }}
                placeholder="Ví dụ: 0.5"
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
                InputProps={{ inputProps: { min: 0, max: 8, step: 0.5 } }}
                placeholder="Ví dụ: 0"
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
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
                placeholder="Ví dụ: 2"
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
                    placeholder="Ví dụ: Trưởng phòng A"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tổng số giờ làm việc trong ngày"
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
                placeholder="Ví dụ: https://docs.google.com/document/d/..."
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
                placeholder="Ví dụ: Hoàn thành báo cáo dự án A, tham gia cuộc họp với khách hàng B..."
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
                <TableCell>STT</TableCell>
                <TableCell>Mã số</TableCell>
                <TableCell>Họ và tên</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Số giờ làm việc</TableCell>
                <TableCell>Số giờ đi muộn</TableCell>
                <TableCell>Số giờ xin nghỉ</TableCell>
                <TableCell>Tổng số giờ làm việc</TableCell>
                <TableCell>Địa điểm làm việc</TableCell>
                <TableCell>Link báo cáo</TableCell>
                <TableCell>Mô tả công việc</TableCell>
                <TableCell>Số giờ tăng ca</TableCell>
                <TableCell>Nội dung tăng ca</TableCell>
                <TableCell>Người duyệt tăng ca</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report, index) => (
                <TableRow key={report.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{report.employeeId}</TableCell>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{report.level}</TableCell>
                  <TableCell>{report.workingHours}</TableCell>
                  <TableCell>{report.lateHours}</TableCell>
                  <TableCell>{report.leaveHours}</TableCell>
                  <TableCell>{report.totalHours}</TableCell>
                  <TableCell>{report.workLocation}</TableCell>
                  <TableCell>
                    <a href={report.reportLink} target="_blank" rel="noopener noreferrer">
                      {report.reportLink}
                    </a>
                  </TableCell>
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
            placeholder="Ví dụ: 001"
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
            placeholder="Ví dụ: Hoàn thành báo cáo khẩn cho dự án A"
          />
          <TextField
            fullWidth
            sx={{ mt: 2 }}
            label="Người duyệt tăng ca"
            name="overtimeApprover"
            value={formData.overtimeApprover}
            onChange={handleInputChange}
            placeholder="Ví dụ: Trưởng phòng B"
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
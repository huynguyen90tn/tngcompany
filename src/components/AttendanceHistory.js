import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Card, CardContent } from '@mui/material';

function AttendanceHistory({ attendanceHistory }) {
  return (
    <Card elevation={3} sx={{ mt: 3, borderRadius: '16px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Chi tiết điểm danh
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Họ và tên</TableCell>
                <TableCell>Mã số</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Đi muộn</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Báo cáo</TableCell>
                <TableCell>Người duyệt</TableCell>
                <TableCell>Địa điểm</TableCell>
                <TableCell>Số giờ bị trừ</TableCell>
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
                  <TableCell>{record.lateReason || '-'}</TableCell>
                  <TableCell>{record.lateReport || '-'}</TableCell>
                  <TableCell>{record.lateApprover || '-'}</TableCell>
                  <TableCell>{record.attendanceLocation}</TableCell>
                  <TableCell>{record.deductedHours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export default AttendanceHistory;
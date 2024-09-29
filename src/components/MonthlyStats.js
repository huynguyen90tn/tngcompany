import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Card, CardContent } from '@mui/material';

function MonthlyStats({ monthlyStats }) {
  return (
    <Card elevation={3} sx={{ borderRadius: '16px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Thống kê đi muộn
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none' }}>
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
      </CardContent>
    </Card>
  );
}

export default MonthlyStats;
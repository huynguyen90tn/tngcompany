import React from 'react';
import DailyReport from '../components/DailyReport';

function ReportPage({ user }) {
  return (
    <DailyReport user={user} />
  );
}

export default ReportPage;
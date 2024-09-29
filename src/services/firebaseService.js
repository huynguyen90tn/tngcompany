import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, deleteDoc } from 'firebase/firestore';

export const submitAttendance = async (attendanceData) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    await addDoc(attendanceRef, {
      ...attendanceData,
      userId: auth.currentUser.uid,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error("Error submitting attendance:", error);
    throw error;
  }
};

export const fetchAttendanceHistory = async (userId, selectedDate) => {
  try {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    }));
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    throw error;
  }
};

export const fetchMonthlyStats = async (selectedDate) => {
  try {
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('timestamp', '>=', Timestamp.fromDate(startOfMonth)),
      where('timestamp', '<=', Timestamp.fromDate(endOfMonth)),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const stats = {};

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!stats[data.employeeId]) {
        stats[data.employeeId] = {
          name: data.employeeName,
          totalLateMinutes: 0,
          lateCount: 0,
          reportedLateCount: 0,
          totalDeductedHours: 0,
        };
      }
      if (data.lateMinutes > 0) {
        stats[data.employeeId].totalLateMinutes += data.lateMinutes;
        stats[data.employeeId].lateCount += 1;
        if (data.lateReport === 'Đã báo cáo') {
          stats[data.employeeId].reportedLateCount += 1;
        }
        stats[data.employeeId].totalDeductedHours += data.deductedHours;
      }
    });

    return Object.entries(stats)
      .sort(([idA], [idB]) => idA.localeCompare(idB))
      .reduce((acc, [id, stat]) => ({ ...acc, [id]: stat }), {});
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    throw error;
  }
};

export const submitDailyReport = async (reportData) => {
  try {
    const reportsRef = collection(db, 'dailyReports');
    await addDoc(reportsRef, {
      ...reportData,
      userId: auth.currentUser.uid,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error("Error submitting daily report:", error);
    throw error;
  }
};

export const fetchDailyReports = async (date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const reportsRef = collection(db, 'dailyReports');
    const q = query(
      reportsRef,
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    }));
  } catch (error) {
    console.error("Error fetching daily reports:", error);
    throw error;
  }
};

export const deleteDailyReport = async (employeeId, level, date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const reportsRef = collection(db, 'dailyReports');
    const q = query(
      reportsRef,
      where('employeeId', '==', employeeId),
      where('level', '==', level),
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<=', Timestamp.fromDate(endOfDay))
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      await deleteDoc(querySnapshot.docs[0].ref);
    } else {
      throw new Error("Không tìm thấy báo cáo để xóa.");
    }
  } catch (error) {
    console.error("Error deleting daily report:", error);
    throw error;
  }
};
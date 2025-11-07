const reportService = require('../services/reportService');

async function handleGetCoursePerformance(event, courseId) { 
  try {
    const data = await reportService.getCoursePerformanceReport(courseId); 
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetEnrollmentStatus(event, courseId) {
  try {
    const data = await reportService.getEnrollmentStatusReport(courseId);
    console.log('DEBUG: handleGetEnrollmentStatus (dados do DB):', data);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetGradeDistribution(event, courseId) {
  try {
    const data = await reportService.getGradeDistributionReport(courseId);
    console.log('DEBUG: handleGetGradeDistribution (dados do DB):', data);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetCourseAverages(event) {
  try {
    const data = await reportService.getCourseAveragesReport();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetDetailedEnrollments(event) {
  try {
    const data = await reportService.getDetailedEnrollmentsReport();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetTotalStudentsPerCourse(event) {
  try {
    const data = await reportService.getTotalStudentsPerCourseReport();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}



async function handleGetStudentsPerProfessor(event) {
  try {
    const data = await reportService.getStudentsPerProfessorReport();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { 
  handleGetCoursePerformance,
  handleGetEnrollmentStatus,
  handleGetGradeDistribution,
  handleGetCourseAverages,
  handleGetDetailedEnrollments,
  handleGetTotalStudentsPerCourse,

  handleGetStudentsPerProfessor
};
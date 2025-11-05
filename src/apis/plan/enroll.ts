import http from '@/utils/http'

const BASE_URL = '/exam/enroll'



export interface EnrollReq {
    enrollStatus: number;
    examPlanId: number;
}


/** @desc 考生考试报名*/
export function singUp(data: EnrollReq) {
    return http.post(`${BASE_URL}/singUp`,data)
}

/** @desc 校验考试时间*/
export function checkEnrolledTime(examPlanId: number) {
    return http.get(`${BASE_URL}/checkEnrollTime?examPlanId=${examPlanId}`)
}
/** @desc 考生取消报名*/
export function cancelEnroll(examPlanId: number) {
    return http.get(`${BASE_URL}/cancelEnroll/${examPlanId}`)
}
/** @desc 下载准考证 PDF */
export async function downloadExamTicket(userId, examNumber) {
  const res = await http.post(
    '/api/exam/ticket/download',
    { userId, examNumber },
    {
      responseType: 'blob',
      timeout: 30000
    }
  )

  // 若 http 封装返回 res.data，则直接返回
  return res?.data || res
}
/**
 * @desc 根据考试计划ID和考生ID获取缴费审核信息
 * @param {number} examPlanId - 考试计划ID
 * @param {number} examineeId - 考生ID
 */
export async function getExamineePaymentAuditInfo(examPlanId: number, examineeId: string) {
  return http.get('/exam/examineePaymentAudit/info', { examPlanId, examineeId });
}



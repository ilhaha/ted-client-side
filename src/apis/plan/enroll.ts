import http from '@/utils/http'

const BASE_URL = '/exam/enroll'




export interface EnrollResp {
  id: string
  userId: string
  examPlanId: string
  enrollStatus: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUser: string
  updateUser: string
  examNumber: string
  classroomId: string
  seatId: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface EnrollDetailResp {
  id: string
  userId: string
  examPlanId: string
  enrollStatus: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUser: string
  updateUser: string
  examNumber: string
  classroomId: string
  seatId: string
  createUserString: string
  updateUserString: string
}
export interface EnrollQuery {
  nickName: string | undefined
  planName: string | undefined
  enrollStatus: string | undefined
  sort: Array<string>
}
export interface EnrollPageQuery extends EnrollQuery, PageQuery {}

export interface EnrollReq {
  enrollStatus: number;
  examPlanId: number;
}
/** @desc 考生考试报名*/
export function singUp(data: EnrollReq) {
  return http.post(`${BASE_URL}/singUp`, data)
}
/** @desc 查询考生报名表列表 */
export function listEnroll(query: EnrollPageQuery) {
  return http.get<PageRes<EnrollResp[]>>(`${BASE_URL}`, query)
}

/** @desc 删除考生报名表 */
export function deleteEnroll(id: string) {
  return http.del(`${BASE_URL}/${id}`)
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
/**
 * @desc 考生提交缴费凭证（保存上传的URL）
 * @param {number} examPlanId - 考试计划ID
 * @param {string} examineeId - 考生ID
 * @param {string} paymentProofUrl - 上传后的缴费凭证URL
 */
export async function submitExamineePaymentProof(
  examPlanId: number,
  examineeId: string,
  paymentProofUrl: string,
  auditStatus: number
) {
  return http.post('/exam/examineePaymentAudit/payment/uploadProof', {
    examPlanId,
    examineeId,
    paymentProofUrl,
    auditStatus
  });
}




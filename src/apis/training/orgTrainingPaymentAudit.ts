import http from '@/utils/http'

const BASE_URL = '/training/orgTrainingPaymentAudit'

export interface OrgTrainingPaymentAuditResp {
  id: string
  orgId: string
  trainingId: string
  categoryId: string
  candidateId: string
  enrollId: string
  noticeNo: string
  paymentAmount: string
  paymentTime: string
  paymentProofUrl: string
  auditNoticeUrl: string
  auditStatus: string
  rejectReason: string
  auditorId: string
  auditTime: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface OrgTrainingPaymentAuditDetailResp {
  id: string
  orgId: string
  trainingId: string
  categoryId: string
  candidateId: string
  enrollId: string
  noticeNo: string
  paymentAmount: string
  paymentTime: string
  paymentProofUrl: string
  auditNoticeUrl: string
  auditStatus: string
  rejectReason: string
  auditorId: string
  auditTime: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface OrgTrainingPaymentAuditQuery {
  orgId: string | undefined
  trainingId: string | undefined
  categoryId: string | undefined
  candidateId: string | undefined
  enrollId: string | undefined
  noticeNo: string | undefined
  paymentAmount: string | undefined
  sort: Array<string>
}
export interface OrgTrainingPaymentAuditPageQuery extends OrgTrainingPaymentAuditQuery, PageQuery {}

/** @desc 查询机构培训缴费审核（记录考生参与机构培训的缴费及审核流程）列表 */
export function listOrgTrainingPaymentAudit(query: OrgTrainingPaymentAuditPageQuery) {
  return http.get<PageRes<OrgTrainingPaymentAuditResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构培训缴费审核（记录考生参与机构培训的缴费及审核流程）详情 */
export function getOrgTrainingPaymentAudit(id: string) {
  return http.get<OrgTrainingPaymentAuditDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构培训缴费审核（记录考生参与机构培训的缴费及审核流程） */
export function addOrgTrainingPaymentAudit(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构培训缴费审核（记录考生参与机构培训的缴费及审核流程） */
export function updateOrgTrainingPaymentAudit(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构培训缴费审核（记录考生参与机构培训的缴费及审核流程） */
export function deleteOrgTrainingPaymentAudit(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出机构培训缴费审核（记录考生参与机构培训的缴费及审核流程） */
export function exportOrgTrainingPaymentAudit(query: OrgTrainingPaymentAuditQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
// 接口定义修改：examineeId 类型从 string → number
export async function getTrainingPaymentAuditInfo(orgId: number, enrollId: number) {
  return http.get(`${BASE_URL}/info`, { orgId, enrollId });
}

/**
 * @desc 考生提交缴费凭证（保存上传的URL）
 * @param {number} orgId -机构名称
 * @param {string} examineeId - 考生申请加入机构id
 * @param {string} paymentProofUrl - 上传后的培训缴费凭证URL
 */
export async function submitTrainingPaymentProof(
  orgId: number,
  enrollId: number,
  paymentProofUrl: string,
  auditStatus:number
) {
  return http.post(`${BASE_URL}/uploadProof`, {
    orgId,
    enrollId,
    paymentProofUrl,
    auditStatus
  });
}

/** @desc 考生培训缴费审核 */
export function reviewTrainingPayment(query: OrgTrainingPaymentAuditQuery) {
  return http.post(`${BASE_URL}/reviewTrainingPayment`, query)
}

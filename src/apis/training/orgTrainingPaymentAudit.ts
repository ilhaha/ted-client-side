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

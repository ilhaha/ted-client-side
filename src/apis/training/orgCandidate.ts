import http from '@/utils/http'

const BASE_URL = '/training/orgCandidate'

export interface OrgCandidateResp {
  id: string
  orgId: string
  candidateId: string
  projectId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  status: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface OrgCandidateDetailResp {
  id: string
  orgId: string
  candidateId: string
  projectId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  status: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface OrgCandidateQuery {
  candidateId: string | undefined
  projectId: string | undefined
  sort: Array<string>
}
export interface OrgCandidatePageQuery extends OrgCandidateQuery, PageQuery {}

/** @desc 新增机构考生关联 */
export function orgReview(data: any) {
  return http.post(`${BASE_URL}/review`, data)
}

/** @desc 查询机构考生关联列表 */
export function listOrgCandidate(query: OrgCandidatePageQuery) {
  return http.get<PageRes<OrgCandidateResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构考生关联详情 */
export function getOrgCandidate(id: string) {
  return http.get<OrgCandidateDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构考生关联 */
export function addOrgCandidate(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构考生关联 */
export function updateOrgCandidate(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构考生关联 */
export function deleteOrgCandidate(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出机构考生关联 */
export function exportOrgCandidate(query: OrgCandidateQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

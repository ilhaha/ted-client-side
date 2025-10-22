import http from '@/utils/http'

const BASE_URL = '/training/enrollPre'

export interface EnrollPreResp {
  id: string
  candidateId: string
  planId: string
  uploadQrcode: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface EnrollPreDetailResp {
  id: string
  candidateId: string
  planId: string
  uploadQrcode: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface EnrollPreQuery {
  candidateId: string | undefined
  planId: string | undefined
  sort: Array<string>
}
export interface EnrollPrePageQuery extends EnrollPreQuery, PageQuery {}

/** @desc 查询机构考生预报名列表 */
export function listEnrollPre(query: EnrollPrePageQuery) {
  return http.get<PageRes<EnrollPreResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构考生预报名详情 */
export function getEnrollPre(id: string) {
  return http.get<EnrollPreDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构考生预报名 */
export function addEnrollPre(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构考生预报名 */
export function updateEnrollPre(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构考生预报名 */
export function deleteEnrollPre(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出机构考生预报名 */
export function exportEnrollPre(query: EnrollPreQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

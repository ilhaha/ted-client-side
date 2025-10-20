import http from '@/utils/http'

const BASE_URL = '/exam/examIdcard'

export interface ExamIdcardResp {
  id: string
  realName: string
  gender: string
  nation: string
  birthDate: string
  address: string
  idCardNumber: string
  issuingAuthority: string
  validStartDate: string
  validEndDate: string
  idCardPhotoFront: string
  idCardPhotoBack: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamIdcardDetailResp {
  id: string
  realName: string
  gender: string
  nation: string
  birthDate: string
  address: string
  idCardNumber: string
  issuingAuthority: string
  validStartDate: string
  validEndDate: string
  idCardPhotoFront: string
  idCardPhotoBack: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamIdcardQuery {
  realName: string | undefined
  idCardNumber: string | undefined
  sort: Array<string>
}
export interface ExamIdcardPageQuery extends ExamIdcardQuery, PageQuery {}

/** @desc 判断考生是否已实名认证 */
export function verifyRealName(username: string) {
  return http.get(`${BASE_URL}/verifyRealName`,{ username })
}


/** @desc 查询考生身份证信息列表 */
export function listExamIdcard(query: ExamIdcardPageQuery) {
  return http.get<PageRes<ExamIdcardResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生身份证信息详情 */
export function getExamIdcard(id: string) {
  return http.get<ExamIdcardDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生身份证信息 */
export function addExamIdcard(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 新增考生身份证信息 */
export function saveExamIdcard(data: any) {
  return http.post(`${BASE_URL}/save/realName`, data)
}

/** @desc 修改考生身份证信息 */
export function updateExamIdcard(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生身份证信息 */
export function deleteExamIdcard(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生身份证信息 */
export function exportExamIdcard(query: ExamIdcardQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

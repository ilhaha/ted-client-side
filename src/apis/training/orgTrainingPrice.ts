import http from '@/utils/http'

const BASE_URL = '/training/orgTrainingPrice'

export interface OrgTrainingPriceResp {
  id: string
  categoryId: string
  orgId: string
  price: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface OrgTrainingPriceDetailResp {
  id: string
  categoryId: string
  orgId: string
  price: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface OrgTrainingPriceQuery {
  categoryId: string | undefined
  orgId: string | undefined
  price: string | undefined
  sort: Array<string>
}
export interface OrgTrainingPricePageQuery extends OrgTrainingPriceQuery, PageQuery {}

/** @desc 查询机构培训价格（仅核心字段：主键、八大类ID、机构ID、价格）列表 */
export function listOrgTrainingPrice(query: OrgTrainingPricePageQuery) {
  return http.get<PageRes<OrgTrainingPriceResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构培训价格（仅核心字段：主键、八大类ID、机构ID、价格）详情 */
export function getOrgTrainingPrice(id: string) {
  return http.get<OrgTrainingPriceDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构培训价格（仅核心字段：主键、八大类ID、机构ID、价格） */
export function addOrgTrainingPrice(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构培训价格（仅核心字段：主键、八大类ID、机构ID、价格） */
export function updateOrgTrainingPrice(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构培训价格（仅核心字段：主键、八大类ID、机构ID、价格） */
export function deleteOrgTrainingPrice(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出机构培训价格（仅核心字段：主键、八大类ID、机构ID、价格） */
export function exportOrgTrainingPrice(query: OrgTrainingPriceQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

import http from '@/utils/http'

const BASE_URL = '/training/org'

export interface OrgResp {
  id: string
  code: string
  name: string
  socialCode: string
  location: string
  legalPerson: string
  scale: string
  businessLicense: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  CandidateName: string[]
}
export interface OrgDetailResp {
  id: string
  code: string
  name: string
  socialCode: string
  location: string
  legalPerson: string
  scale: string
  businessLicense: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  nickname: string
  phone: string
}
export interface OrgQuery {
  code: string | undefined
  sort: Array<string>
}

export interface ProjectCategoryVO {
  label: string
  value: number
  parentId?: number
  children?: ProjectCategoryVO[]
}

export interface OrgPageQuery extends OrgQuery, PageQuery { }

/** @desc 通过excel导入作业人员信息 */
export function importWorker(file: any, classId: string) {
  return http.post(`${BASE_URL}/import/worker/${classId}`, file, {
    timeout: 1800000,
  })
}


/** @desc 下载导入作业人员模板 */
export function downloadImportWorkerTemplate(classId: string) {
  return http.download(`${BASE_URL}/download/importWorker/template/${classId}`)
}


/** @desc 获取机构对应的项目-班级-考生级联选择 */
export function getSelectProjectClassByType(type: number) {
  return http.get<any[]>(`${BASE_URL}/select/project/class/type/${type}`)
}

/** @desc 机构预报名 */
export function orgApply(data: any) {
  return http.post(`${BASE_URL}/apply`, data)
}

/** @desc 获取机构对应的项目-班级-考生级联选择 */
export function getSelectProjectClassCandidate(projectId: string, planType: number, planId: string) {
  return http.get<ProjectCategoryVO[]>(`${BASE_URL}/select/project/class/candidate/${planType}`, { projectId, planId })
}

/** @desc 获取机构对应的项目-班级级联选择 */
export function getSelectProjectClass(orgId: string, projectId: string) {
  return http.get<ProjectCategoryVO[]>(`${BASE_URL}/select/project/class`, { orgId, projectId })
}

/** @desc 获取机构对应的分类-项目-班级级联选择 */
export function getSelectCategoryProjectClass(orgId: string) {
  return http.get<ProjectCategoryVO[]>(`${BASE_URL}/select/category/project/class`, { orgId })
}

/** @desc 获取机构八大类-项目级联选择器 */
export function getSelectCategoryProject(orgId: string) {
  return http.get<ProjectCategoryVO[]>(`${BASE_URL}/select/category/project`, { orgId })
}

/** @desc 查询机构信息列表 */
export function listOrg(query: OrgPageQuery) {
  return http.get<PageRes<OrgResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构信息详情 */
export function getOrg(id: string) {
  return http.get<OrgDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构信息 */
export function addOrg(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构信息 */
export function updateOrg(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构信息 */
export function deleteOrg(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出机构信息 */
export function exportOrg(query: OrgQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/**@desc 导入机构考生关联信息 */
export function getStudents(id: string) {
  return http.get(`${BASE_URL}/${id}`)
}

export function getOrgInfo() {
  return http.get<OrgDetailResp>(`${BASE_URL}/getOrgInfo`)
}


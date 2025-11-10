import http from '@/utils/http'

const BASE_URL = '/worker/workerApply'

export interface WorkerApplyResp {
  id: string
  candidateId: string
  categoryId: string
  qualificationPath: string
  status: string
  createTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface WorkerApplyDetailResp {
  id: string
  candidateId: string
  categoryId: string
  qualificationPath: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface WorkerApplyQuery {
  candidateId: string | undefined
  categoryId: string | undefined
  status: string | undefined
  sort: Array<string>
}
export interface WorkerApplyPageQuery extends WorkerApplyQuery, PageQuery {}

/** @desc 机构批量导入 */
export function orgImport(data: any[]) {
  return http.post(`${BASE_URL}/org/import`, data)
}

/** @desc 查询作业人员报名列表 */
export function listWorkerApply(query: WorkerApplyPageQuery) {
  return http.get<PageRes<WorkerApplyResp[]>>(`${BASE_URL}`, query)
}

/** @desc 删除作业人员报名 */
export function deleteWorkerApply(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}
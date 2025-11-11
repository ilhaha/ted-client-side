<template>
  <div class="gi_table_page">
    <GiTable
      title="机构培训缴费审核管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #toolbar-left>
	    <a-input-search v-model="queryForm.trainingId" placeholder="请输入关联培训ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.categoryId" placeholder="请输入关联八大类ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.candidateId" placeholder="请输入考生ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.enrollId" placeholder="请输入关联报名记录ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.noticeNo" placeholder="请输入缴费通知单编号）" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.paymentAmount" placeholder="请输入缴费金额（元）" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <!-- <template #toolbar-right>
        <a-button v-permission="['training:orgTrainingPaymentAudit:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['training:orgTrainingPaymentAudit:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template> -->
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:orgTrainingPaymentAudit:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['training:orgTrainingPaymentAudit:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['training:orgTrainingPaymentAudit:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <OrgTrainingPaymentAuditAddModal ref="OrgTrainingPaymentAuditAddModalRef" @save-success="search" />
    <OrgTrainingPaymentAuditDetailDrawer ref="OrgTrainingPaymentAuditDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import OrgTrainingPaymentAuditAddModal from './OrgTrainingPaymentAuditAddModal.vue'
import OrgTrainingPaymentAuditDetailDrawer from './OrgTrainingPaymentAuditDetailDrawer.vue'
import { type OrgTrainingPaymentAuditResp, type OrgTrainingPaymentAuditQuery, deleteOrgTrainingPaymentAudit, exportOrgTrainingPaymentAudit, listOrgTrainingPaymentAudit } from '@/apis/training/orgTrainingPaymentAudit'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'OrgTrainingPaymentAudit' })


const queryForm = reactive<OrgTrainingPaymentAuditQuery>({
  orgId: undefined,
  trainingId: undefined,
  categoryId: undefined,
  candidateId: undefined,
  enrollId: undefined,
  noticeNo: undefined,
  paymentAmount: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listOrgTrainingPaymentAudit({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '关联机构ID', dataIndex: 'orgId', slotName: 'orgId' },
  { title: '关联培训ID', dataIndex: 'trainingId', slotName: 'trainingId' },
  { title: '关联八大类ID', dataIndex: 'categoryId', slotName: 'categoryId' },
  { title: '考生ID', dataIndex: 'candidateId', slotName: 'candidateId' },
  { title: '关联报名记录ID', dataIndex: 'enrollId', slotName: 'enrollId' },
  { title: '缴费通知单编号', dataIndex: 'noticeNo', slotName: 'noticeNo' },
  { title: '缴费金额（元）', dataIndex: 'paymentAmount', slotName: 'paymentAmount' },
  { title: '缴费时间', dataIndex: 'paymentTime', slotName: 'paymentTime' },
  { title: '缴费凭证URL', dataIndex: 'paymentProofUrl', slotName: 'paymentProofUrl' },
  { title: '缴费通知单URL', dataIndex: 'auditNoticeUrl', slotName: 'auditNoticeUrl' },
  { title: '审核状态', dataIndex: 'auditStatus', slotName: 'auditStatus' },
  { title: '驳回原因', dataIndex: 'rejectReason', slotName: 'rejectReason' },
  { title: '审核人', dataIndex: 'auditorId', slotName: 'auditorId' },
  { title: '审核时间', dataIndex: 'auditTime', slotName: 'auditTime' },
  { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:orgTrainingPaymentAudit:detail', 'training:orgTrainingPaymentAudit:update', 'training:orgTrainingPaymentAudit:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.orgId = undefined
  queryForm.trainingId = undefined
  queryForm.categoryId = undefined
  queryForm.candidateId = undefined
  queryForm.enrollId = undefined
  queryForm.noticeNo = undefined
  queryForm.paymentAmount = undefined
  search()
}

// 删除
const onDelete = (record: OrgTrainingPaymentAuditResp) => {
  return handleDelete(() => deleteOrgTrainingPaymentAudit(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportOrgTrainingPaymentAudit(queryForm))
}

const OrgTrainingPaymentAuditAddModalRef = ref<InstanceType<typeof OrgTrainingPaymentAuditAddModal>>()
// 新增
const onAdd = () => {
  OrgTrainingPaymentAuditAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: OrgTrainingPaymentAuditResp) => {
  OrgTrainingPaymentAuditAddModalRef.value?.onUpdate(record.id)
}

const OrgTrainingPaymentAuditDetailDrawerRef = ref<InstanceType<typeof OrgTrainingPaymentAuditDetailDrawer>>()
// 详情
const onDetail = (record: OrgTrainingPaymentAuditResp) => {
  OrgTrainingPaymentAuditDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>

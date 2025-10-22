<template>
  <div class="gi_table_page">
    <GiTable
      title="机构考生预报名管理"
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
	    <a-input-search v-model="queryForm.candidateId" placeholder="请输入考生id" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.planId" placeholder="请输入计划id" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['training:enrollPre:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['training:enrollPre:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:enrollPre:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['training:enrollPre:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['training:enrollPre:delete']"
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

    <EnrollPreAddModal ref="EnrollPreAddModalRef" @save-success="search" />
    <EnrollPreDetailDrawer ref="EnrollPreDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import EnrollPreAddModal from './EnrollPreAddModal.vue'
import EnrollPreDetailDrawer from './EnrollPreDetailDrawer.vue'
import { type EnrollPreResp, type EnrollPreQuery, deleteEnrollPre, exportEnrollPre, listEnrollPre } from '@/apis/training/enrollPre'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'EnrollPre' })


const queryForm = reactive<EnrollPreQuery>({
  candidateId: undefined,
  planId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listEnrollPre({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键', dataIndex: 'id', slotName: 'id' },
  { title: '考生id', dataIndex: 'candidateId', slotName: 'candidateId' },
  { title: '计划id', dataIndex: 'planId', slotName: 'planId' },
  { title: '上传资料二维码', dataIndex: 'uploadQrcode', slotName: 'uploadQrcode' },
  { title: '资料上传状态 0-资料待补充 1-报考资料已齐全', dataIndex: 'status', slotName: 'status' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '逻辑删除 0-未删除 1-已删除', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:enrollPre:detail', 'training:enrollPre:update', 'training:enrollPre:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.candidateId = undefined
  queryForm.planId = undefined
  search()
}

// 删除
const onDelete = (record: EnrollPreResp) => {
  return handleDelete(() => deleteEnrollPre(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportEnrollPre(queryForm))
}

const EnrollPreAddModalRef = ref<InstanceType<typeof EnrollPreAddModal>>()
// 新增
const onAdd = () => {
  EnrollPreAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: EnrollPreResp) => {
  EnrollPreAddModalRef.value?.onUpdate(record.id)
}

const EnrollPreDetailDrawerRef = ref<InstanceType<typeof EnrollPreDetailDrawer>>()
// 详情
const onDetail = (record: EnrollPreResp) => {
  EnrollPreDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>

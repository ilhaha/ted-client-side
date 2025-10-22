<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-cascader v-model="queryForm.projectId" :options="categoryOptions" placeholder="请选择考试项目" allow-clear
          @change="search" />
        <a-input-search v-model="queryForm.className" placeholder="请输入班级名称" allow-clear @search="search" />
        <a-button type="primary" @click="search">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['training:orgClass:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['training:orgClass:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:orgClass:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['training:orgClass:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link v-permission="['training:orgClass:delete']" status="danger" :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'" @click="onDelete(record)">
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <OrgClassAddModal ref="OrgClassAddModalRef" @save-success="search" />
    <OrgClassDetailDrawer ref="OrgClassDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import OrgClassAddModal from './OrgClassAddModal.vue'
import OrgClassDetailDrawer from './OrgClassDetailDrawer.vue'
import { type OrgClassResp, type OrgClassQuery, deleteOrgClass, exportOrgClass, listOrgClass } from '@/apis/training/orgClass'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { type ProjectCategoryVO, getSelectCategoryProject } from '@/apis/training/org'

import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'OrgClass' })


const queryForm = reactive<OrgClassQuery>({
  projectId: undefined,
  className: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listOrgClass({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '考试项目', dataIndex: 'projectName', slotName: 'projectName' },
  { title: '班级名称', dataIndex: 'className', slotName: 'className' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:orgClass:detail', 'training:orgClass:update', 'training:orgClass:delete'])
  }])
// 详情
const OrgClassDetailDrawerRef = ref<InstanceType<typeof OrgClassDetailDrawer>>()

const onDetail = (record: OrgClassResp) => {
  OrgClassDetailDrawerRef.value?.onOpen(record.id)
}

const OrgClassAddModalRef = ref<InstanceType<typeof OrgClassAddModal>>()
// 新增
const onAdd = () => {
  OrgClassAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: OrgClassResp) => {
  OrgClassAddModalRef.value?.onUpdate(record.id)
}

const categoryOptions = ref<ProjectCategoryVO[]>([])

onMounted(async () => {
  const res = await getSelectCategoryProject()
  categoryOptions.value = res.data
})

</script>

<style scoped lang="scss"></style>

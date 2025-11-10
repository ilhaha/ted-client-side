<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-select v-model="queryForm.classType" placeholder="班级类型" allow-clear class="search-input ml-2"
          @change="search">
          <a-option value="0">作业班</a-option>
          <a-option value="1">检验班</a-option>
        </a-select>
        <a-cascader v-model="queryForm.projectId" :options="categoryOptions" placeholder="请选择考试项目" allow-clear
          @change="search" />
        <a-input-search v-model="queryForm.className" placeholder="请输入班级名称" allow-clear @search="search" />
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
        <a-button v-permission="['training:orgClass:improtWorker']" @click="openImport">
          <template #icon><icon-upload /></template>
          <template #default>导入作业人员名单</template>
        </a-button>
      </template>
      <template #classType="{ record }">
        <a-tag :color="getClassTypeColor(record.classType)">
          {{ getClassTypeText(record.classType) }}
        </a-tag>
      </template>
      <template #qrcodeApplyUrl="{ record }">
        <a-space v-if="record.qrcodeApplyUrl">
          <a-image width="80" height="60" :src="record.qrcodeApplyUrl" :preview-props="{ zoomRate: 1.5 }"
            class="preview-image" fit="cover" @error="handleImageError" />
        </a-space>
        <span v-else>-</span>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['worker:workerApply:list']" title="资料明细" @click="openWorkerList(record)">资料明细</a-link>
        </a-space>
        <a-space>
          <a-link v-permission="['training:orgClass:update']" title="修改" @click="onUpdate(record)">修改</a-link>
        </a-space>
      </template>
    </GiTable>

    <OrgClassAddModal ref="OrgClassAddModalRef" @save-success="search" />
    <WokerImportModel ref="WokerImportModelRef" @setUploadLoading="handSetUploadLoading" />
    <a-modal v-model:visible="showWokerListVisible" title="学员名单" :mask-closable="false" :esc-to-close="false"
      width="90%" draggable :footer="null" modal-class="no-padding-modal" @close="handClose">
      <WokerList ref="WokerListRef" />
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import OrgClassAddModal from './OrgClassAddModal.vue'
import WokerImportModel from './WokerImportModel.vue'
import WokerList from '@/views/workerApply/index.vue'
import { type OrgClassResp, type OrgClassQuery, deleteOrgClass, exportOrgClass, listOrgClass } from '@/apis/training/orgClass'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { type ProjectCategoryVO, getSelectCategoryProject } from '@/apis/training/org'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'OrgClass' })

const emit = defineEmits<{
  (e: 'setImportLoading', payload: any): void
}>()


const queryForm = reactive<OrgClassQuery>({
  projectId: undefined,
  className: undefined,
  classType: "0",
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
  { title: '班级类型', dataIndex: 'classType', slotName: 'classType' },
  { title: '作业人员报考二维码', dataIndex: 'qrcodeApplyUrl', slotName: 'qrcodeApplyUrl' },
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

const showWokerListVisible = ref(false)
// 查看作业人员名单
const WokerListRef = ref<InstanceType<typeof WokerList>>()
const openWorkerList = (res: any) => {
  WokerListRef.value?.onOpen(res.id)
  showWokerListVisible.value = true
}


const handSetUploadLoading = (res: any) => {
  emit("setImportLoading", res)
}
// 打开作业人员导入弹窗
const WokerImportModelRef = ref<InstanceType<typeof WokerImportModel>>()
const openImport = () => {
  WokerImportModelRef.value?.onOpen()
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

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = "/images/ce853a5576cd3913a87d709a354cdef.png"; // 你的默认图片路径
  img.onerror = null; // 防止默认图片也加载失败时无限循环
};

// 重置
const reset = () => {
  queryForm.projectId = undefined
  queryForm.className = undefined
  queryForm.classType = undefined
  search()
}

const getClassTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return 'blue'
    case 1:
      return 'orange'
    default:
      return 'gray'
  }
}

const getClassTypeText = (status: number) => {
  switch (status) {
    case 0:
      return '作业班'
    case 1:
      return '检验班'
    default:
      return ''
  }
}
onMounted(async () => {
  const res = await getSelectCategoryProject()
  categoryOptions.value = res.data
})

</script>

<style>
.no-padding-modal .arco-modal-body {
  padding: 0 !important;
}
</style>

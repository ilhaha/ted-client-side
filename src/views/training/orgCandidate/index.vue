<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #idCardPhotos="{ record }">
        <a-space v-if="record.idCardPhotos">
          <a-image v-for="(path, index) in record.idCardPhotos.split(',')" :key="index" width="80" height="60"
            :src="path" :preview-props="{ zoomRate: 1.5 }" class="preview-image" fit="cover" />
        </a-space>
        <span v-else>-</span>
      </template>

      <template #toolbar-left>
        <a-input-search v-model="queryForm.candidateName" placeholder="请输入考生姓名" allow-clear @search="search" />
        <a-cascader v-model="queryForm.projectId" :options="categoryOptions" placeholder="请选择考试项目" allow-clear
          @change="search" />
        <a-button type="primary" @click="search">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:orgCandidate:update']" title="修改" @click="openReview(record)">审核</a-link>
        </a-space>
      </template>
    </GiTable>

    <a-modal v-model:visible="visible" title="审核考生加入机构" :mask-closable="false" :esc-to-close="false"
      :width="width >= 600 ? 600 : '100%'" draggable>
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item field="status" label="审核结果" :rules="[{ required: true, message: '请选择审核结果' }]">
          <a-radio-group v-model="form.status">
            <a-radio :value="2">通过申请</a-radio>
            <a-radio :value="-1">拒绝申请</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="form.status === 2" field="orClassId" label="分配班级"
          :rules="[{ required: true, message: '请选择班级' }]">
          <a-cascader v-model="form.orClassId" :options="categoryProjectClassOptions" placeholder="请选择班级" allow-clear />
        </a-form-item>
        <a-form-item v-if="form.status === -1" field="remark" label="拒绝原因"
          :rules="[{ required: true, message: '请填写拒绝原因' }]">
          <a-input v-model="form.remark" placeholder="请输入退回原因" allow-clear />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-space>
          <a-button @click="openCancle">取消</a-button>
          <a-button type="primary" @click="review">确定</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { type OrgCandidateResp, type OrgCandidateQuery, deleteOrgCandidate, exportOrgCandidate, listOrgCandidate } from '@/apis/training/orgCandidate'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { type ProjectCategoryVO, getSelectCategoryProject, getSelectProjectClass } from '@/apis/training/org'
import { orgReview } from '@/apis/training/orgCandidate'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { useWindowSize } from '@vueuse/core'
import { useResetReactive } from '@/hooks'
import { Message } from '@arco-design/web-vue'

const { width } = useWindowSize()
defineOptions({ name: 'OrgCandidate' })

const visible = ref(false)
const formRef = ref()

const queryForm = reactive<OrgCandidateQuery>({
  candidateName: undefined,
  projectId: undefined,
  type: "add"
})


const [form, resetForm] = useResetReactive({
  status: 2,
  remark: undefined,
  orClassId: undefined,
  candidateId: undefined,
  id: undefined
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listOrgCandidate({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '姓名', dataIndex: 'nickName', slotName: 'nickName' },
  { title: '联系电话', dataIndex: 'phoneNumber', slotName: 'phoneNumber' },
  { title: '申报项目', dataIndex: 'projectName', slotName: 'projectName' },
  { title: '实名信息', dataIndex: 'idCardPhotos', slotName: 'idCardPhotos' },
  { title: '申请时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:orgCandidate:detail', 'training:orgCandidate:update', 'training:orgCandidate:delete'])
  }
]);
const categoryProjectClassOptions = ref<ProjectCategoryVO[]>([])

const openReview = async (record: OrgCandidateResp) => {
  const res = await getSelectProjectClass(record.orgId, record.projectId, 1)
  categoryProjectClassOptions.value = res.data
  visible.value = true
  form.id = record.id
  form.candidateId = record.candidateId
}
// 真正审核
const review = async () => {
  const isInvalid = await formRef.value?.validate()
  if (isInvalid) return false
  const res = await orgReview(form)
  if (res.data) {
    Message.success('审核成功')
    visible.value = false
    resetForm()
    search()
  }

}

// 关闭审核弹窗
const openCancle = async () => {
  visible.value = false
  formRef.value?.resetFields()
  resetForm()
}

// 重置
const reset = () => {
  queryForm.candidateName = undefined
  queryForm.projectId = undefined
  search()
}

const categoryOptions = ref<ProjectCategoryVO[]>([])

onMounted(async () => {
  const res = await getSelectCategoryProject()
  categoryOptions.value = res.data
})


</script>

<style scoped lang="scss"></style>

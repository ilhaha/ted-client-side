<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getOrgTrainingPaymentAudit, addOrgTrainingPaymentAudit, updateOrgTrainingPaymentAudit } from '@/apis/training/orgTrainingPaymentAudit'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改机构培训缴费审核（记录考生参与机构培训的缴费及审核流程）' : '新增机构培训缴费审核（记录考生参与机构培训的缴费及审核流程）'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '关联机构ID（关联机构表主键）',
    field: 'orgId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入关联机构ID（关联机构表主键）' }]
  },
  {
    label: '关联培训ID（关联机构培训价格表主键）',
    field: 'trainingId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入关联培训ID（关联机构培训价格表主键）' }]
  },
  {
    label: '关联八大类ID（关联八大类字典表主键）',
    field: 'categoryId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入关联八大类ID（关联八大类字典表主键）' }]
  },
  {
    label: '考生ID（缴费考生，关联用户表主键）',
    field: 'candidateId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考生ID（缴费考生，关联用户表主键）' }]
  },
  {
    label: '关联报名记录ID（关联机构培训报名记录表主键）',
    field: 'enrollId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入关联报名记录ID（关联机构培训报名记录表主键）' }]
  },
  {
    label: '缴费通知单编号（格式：ORG_PAY_时间戳_随机数）',
    field: 'noticeNo',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入缴费通知单编号（格式：ORG_PAY_时间戳_随机数）' }]
  },
  {
    label: '缴费金额（元）',
    field: 'paymentAmount',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入缴费金额（元）' }]
  },
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateOrgTrainingPaymentAudit(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addOrgTrainingPaymentAudit(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getOrgTrainingPaymentAudit(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>

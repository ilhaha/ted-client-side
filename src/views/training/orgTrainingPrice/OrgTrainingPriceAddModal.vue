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
import { getOrgTrainingPrice, addOrgTrainingPrice, updateOrgTrainingPrice } from '@/apis/training/orgTrainingPrice'
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
const title = computed(() => (isUpdate.value ? '修改机构培训价格（仅核心字段：主键、八大类ID、机构ID、价格）' : '新增机构培训价格（仅核心字段：主键、八大类ID、机构ID、价格）'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '八大类ID（关联八大类字典表主键）',
    field: 'categoryId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入八大类ID（关联八大类字典表主键）' }]
  },
  {
    label: '机构ID（关联机构表主键）',
    field: 'orgId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入机构ID（关联机构表主键）' }]
  },
  {
    label: '培训价格（元，精确到分，对应“价格表”核心需求）',
    field: 'price',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入培训价格（元，精确到分，对应“价格表”核心需求）' }]
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
      await updateOrgTrainingPrice(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addOrgTrainingPrice(form)
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
  const { data } = await getOrgTrainingPrice(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>

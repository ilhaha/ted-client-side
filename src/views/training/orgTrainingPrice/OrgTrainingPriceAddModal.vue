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
    <!-- 让 GiForm 自动识别 hidden -->
<GiForm
  ref="formRef"
  v-model="form"
  :columns="isUpdate ? columns.filter(c => c.field !== 'projectId') : columns"
/>

  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getOrgTrainingPrice, addOrgTrainingPrice, updateOrgTrainingPrice } from '@/apis/training/orgTrainingPrice'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { type ProjectCategoryVO, getSelectCategoryProject } from '@/apis/training/org'

const emit = defineEmits<{ (e: 'save-success'): void }>()

const { width } = useWindowSize()
const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改机构培训价格' : '新增机构培训价格'))
const formRef = ref<InstanceType<typeof GiForm>>()

// 表单数据
const [form, resetForm] = useResetReactive({
  projectId: undefined,
  price: undefined
})

// 分类选项
const categoryOptions = ref<ProjectCategoryVO[]>([])

// 表单列定义
const columns: ColumnItem[] = reactive([
  {
    label: '培训项目',
    field: 'projectId',
    type: 'cascader',
    span: 24,
    hidden: false, // 🟢 初始显示（新增用）
    props: {
      allowSearch: true,
      multiple: false,
      options: categoryOptions,
      fieldNames: { label: 'label', value: 'value' }
    },
    rules: [{ required: true, message: '请选择考试项目' }]
  },
  {
    label: '培训价格（元）',
    field: 'price',
    type: 'InputNumber',
    span: 24,
    props: {
      min: 0.01,
      step: 0.01,
      precision: 2,
      placeholder: '请输入培训价格（元）'
    },
    rules: [
      { required: true, message: '请输入培训价格（元）' },
      {
        validator: (_, value) => {
          if (value === null || value === undefined || value === '') {
            return Promise.reject('请输入培训价格（元）')
          }
          if (value <= 0) {
            return Promise.reject('价格必须大于0元')
          }
          return Promise.resolve()
        },
        trigger: 'blur'
      }
    ]
  }
])

// 🔄 重置表单
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 💾 保存数据
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

// 🟢 新增：显示“培训项目”
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
  const projectColumn = columns.find(c => c.field === 'projectId')
  if (projectColumn) projectColumn.hidden = false
}

// 🔒 修改：隐藏“培训项目”
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getOrgTrainingPrice(id)
  Object.assign(form, data)
  visible.value = true
  const projectColumn = columns.find(c => c.field === 'projectId')
  if (projectColumn) projectColumn.hidden = true
}

// 初始化分类数据
onMounted(async () => {
  const res = await getSelectCategoryProject()
  categoryOptions.value = res.data
})

defineExpose({ onAdd, onUpdate })
</script>

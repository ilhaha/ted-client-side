<template>
    <div>
        <a-modal v-model:visible="visible" title="机构报考" :mask-closable="false" :esc-to-close="false"
            :width="width >= 600 ? 600 : '100%'" draggable @close="openCancle">
            <a-form ref="formRef" :model="form" layout="vertical">
                <a-form-item field="examPlanName" label="报考八大类" :rules="[{ required: true, message: '请输入八大类' }]">
                    <a-input v-model="form.projectName" placeholder="请输入八大类" disabled />
                </a-form-item>
                <a-form-item field="examPlanName" label="报考计划" :rules="[{ required: true, message: '请输入计划名称' }]">
                    <a-input v-model="form.examPlanName" placeholder="请输入计划名称" disabled />
                </a-form-item>
                <a-form-item field="candidateIds" label="选择报考考生名单" :rules="[{ required: true, message: '请选择报考考生名单' }]">
                    <a-cascader v-model="form.candidateIds" :options="categoryProjectClassOptions" placeholder="请选择班级"
                        :multiple="true" allow-clear />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-space>
                    <a-button @click="openCancle">取消</a-button>
                    <a-button type="primary" @click="apply">确定</a-button>
                </a-space>
            </template>
        </a-modal>
    </div>
</template>

<script setup lang="ts">

import { useResetReactive } from '@/hooks'
import { type ProjectCategoryVO, getSelectProjectClassCandidate, applyPre } from '@/apis/training/org'
import { useWindowSize } from '@vueuse/core'
import { Message } from '@arco-design/web-vue'

const { width } = useWindowSize()

defineOptions({ name: 'EnrollPre' })

const formRef = ref()
// const isInvalid = await formRef.value?.validate()

const [form, resetForm] = useResetReactive({
    examPlanId: undefined,
    projectId: undefined,
    candidateIds: undefined,
    examPlanName: undefined,
    projectName: undefined,
})

const visible = ref(false)

const categoryProjectClassOptions = ref<ProjectCategoryVO[]>([])

// 确定报考
const apply = async () => {
    const isInvalid = await formRef.value?.validate()
    if (isInvalid) return false
    const res = await applyPre({
        examPlanId: form.examPlanId,
        candidateIds: form.candidateIds
    })
    if (res.data) {
        Message.success('报考成功')
        visible.value = false
        resetForm()
    }
}
// 关闭弹窗
const openCancle = async () => {
    visible.value = false
    formRef.value?.resetFields()
    resetForm()
}
// 打开弹窗
const onOpen = async (record: any) => {
    const res = await getSelectProjectClassCandidate(record.projectId)
    categoryProjectClassOptions.value = res.data
    form.examPlanId = record.examPlanId
    form.projectId = record.projectId
    form.examPlanName = record.examPlanName
    form.projectName = record.projectName
    visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
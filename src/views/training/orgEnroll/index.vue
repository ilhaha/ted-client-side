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
                <a-form-item field="candidateIds" label="报考作业人员名单"
                    :rules="[{ required: true, message: '请选择报考作业人员名单' }]">
                    <a-cascader v-model="form.candidateIds" :options="categoryProjectClassOptions"
                        placeholder="请选择报考作业人员名单" :multiple="true" allow-clear path-mode />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-space>
                    <a-button @click="openCancle">取消</a-button>
                    <a-button type="primary" @click="apply" :loading="applyLodding">确定</a-button>
                </a-space>
            </template>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { useResetReactive } from '@/hooks'
import { type ProjectCategoryVO, getSelectProjectClassCandidate, orgApply } from '@/apis/training/org'
import { useWindowSize } from '@vueuse/core'
import { Message } from '@arco-design/web-vue'

const { width } = useWindowSize()

defineOptions({ name: 'OrgEnroll' })

const emit = defineEmits<{
    (e: 'applySuccess'): void
}>()

const applyLodding = ref(false)

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
    applyLodding.value = true
    try {
        const res = await orgApply({
            examPlanId: form.examPlanId,
            candidateIds: form.candidateIds
        })
        if (res.data) {
            Message.success('报考成功')
            emit("applySuccess")
            applyLodding.value = false
            visible.value = false
            resetForm()
        }
    } catch (error) {

    } finally {
        applyLodding.value = false
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
    const res = await getSelectProjectClassCandidate(record.projectId, record.planType, record.examPlanId)
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
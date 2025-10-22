<template>
  <a-drawer v-model:visible="visible" title="机构考生关联详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="机构ID">{{ dataDetail?.orgId }}</a-descriptions-item>
      <a-descriptions-item label="考生ID">{{ dataDetail?.candidateId }}</a-descriptions-item>
      <a-descriptions-item label="机构对应的项目id">{{ dataDetail?.projectId }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="状态 (负1-拒绝, 0-退出，1-待通过，2-已加入)">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="是否删除（0-未删除，1-已删除）">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type OrgCandidateDetailResp, getOrgCandidate as getDetail } from '@/apis/training/orgCandidate'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<OrgCandidateDetailResp>()
const visible = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>

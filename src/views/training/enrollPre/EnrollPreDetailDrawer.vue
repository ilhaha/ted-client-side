<template>
  <a-drawer v-model:visible="visible" title="机构考生预报名详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考生id">{{ dataDetail?.candidateId }}</a-descriptions-item>
      <a-descriptions-item label="计划id">{{ dataDetail?.planId }}</a-descriptions-item>
      <a-descriptions-item label="上传资料二维码">{{ dataDetail?.uploadQrcode }}</a-descriptions-item>
      <a-descriptions-item label="资料上传状态 0-资料待补充 1-报考资料已齐全">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="逻辑删除 0-未删除 1-已删除">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type EnrollPreDetailResp, getEnrollPre as getDetail } from '@/apis/training/enrollPre'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<EnrollPreDetailResp>()
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

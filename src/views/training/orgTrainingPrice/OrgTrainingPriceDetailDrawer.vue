<template>
  <a-drawer v-model:visible="visible" title="机构培训价格（仅核心字段：主键、八大类ID、机构ID、价格）详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID（自增唯一标识）">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="八大类ID（关联八大类字典表主键）">{{ dataDetail?.categoryId }}</a-descriptions-item>
      <a-descriptions-item label="机构ID（关联机构表主键）">{{ dataDetail?.orgId }}</a-descriptions-item>
      <a-descriptions-item label="培训价格（元，精确到分，对应“价格表”核心需求）">{{ dataDetail?.price }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="是否删除（0否，1是）">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type OrgTrainingPriceDetailResp, getOrgTrainingPrice as getDetail } from '@/apis/training/orgTrainingPrice'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<OrgTrainingPriceDetailResp>()
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

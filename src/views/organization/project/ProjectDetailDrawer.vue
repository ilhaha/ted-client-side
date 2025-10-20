<template>
  <a-drawer v-model:visible="visible" title="项目详情" :width="width >= 600 ? 600 : '100%'">
    <template #footer>
      <a-button @click="visible = false">关闭</a-button>
    </template>
    <a-descriptions :column="1" size="large" class="general-description">
      <a-descriptions-item label="项目编号">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="项目名称">{{ dataDetail?.projectName }}</a-descriptions-item>
      <a-descriptions-item label="项目代号">{{ dataDetail?.projectCode }}</a-descriptions-item>
    </a-descriptions>

    <!--  地址相关  -->
    <a-table v-if="locationDetail.length > 0" :columns="columns" :data="locationDetail" :pagination="false">
      <template #locationName="{ record }">
        {{ record.province + record.city + record.street + record.detailedAddress }}
      </template>
    </a-table>

    <a-descriptions-item>&nbsp;</a-descriptions-item>

    <!--  资料相关  -->
    <a-table v-if="documentDetail.length > 0" :columns="documentColumns" :data="documentDetail" :pagination="false">
    </a-table>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

import {
  type ProjectDetailResp,
  getProject as getDetail,
  type ProjectLocationList,
  type ProjectDocumentList,
  bindingLocation,
  bindingDocumentListApi,
}
  from '@/apis/exam/project'

import type { TableInstanceColumns } from "@/components/GiTable/type";
import { isMobile } from "@/utils";
import has from "@/utils/has";

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ProjectDetailResp>()
const locationDetail = ref<ProjectLocationList[]>([])
const documentDetail = ref<ProjectDocumentList[]>([])
const visible = ref(false)
const columns = ref<TableInstanceColumns[]>([
  { title: '考试地点', dataIndex: 'locationName', slotName: 'locationName' },
])

const documentColumns = ref<TableInstanceColumns[]>([
  { title: '所需报名提交资料', dataIndex: 'typeName', slotName: 'typeName' }
])

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  const [detailRes, locationRes, documentRes] = await Promise.all([
    getDetail(dataId.value),
    bindingLocation(dataId.value),
    bindingDocumentListApi(dataId.value)
  ])
  dataDetail.value = detailRes.data
  locationDetail.value = locationRes.data ?? []
  documentDetail.value = documentRes.data ?? []
  visible.value = true
}

defineExpose({ onOpen })
</script>
<style scoped lang="scss"></style>

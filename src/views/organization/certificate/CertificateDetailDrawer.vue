<template>
  <a-drawer v-model:visible="visible" title="证书" :width="width >= 600 ? 600 : '100%'">
    <template #footer>
      <a-button @click="visible = false">关闭</a-button>
    </template>
    <div class="certificate-drawer-content">
      <div v-if="certificateLoading" class="loading-container">
        <a-spin size="large" />
      </div>
      <div v-else-if="certificateList?.length > 0" class="certificate-list">
        <div v-for="(cert, index) in certificateList" :key="index" class="certificate-card">
          <div class="certificate-image">
            <img :src="cert.imageUrl || '/static/images/default-cert.jpg'" :alt="cert.certificateTypeName" />
          </div>
          <div class="certificate-info">
            <div class="certificate-header">
              <h3>{{ cert.certificateTypeName }}</h3>
              <a-tag :color="getCertStatusColor(cert.certificateStatus)">
                {{ getCertStatusText(cert.certificateStatus) }}
              </a-tag>
            </div>
            <div class="certificate-details">
              <div class="detail-item">
                <IconBook />
                <span>证书编号：{{ cert.certificateNumber }}</span>
              </div>
              <div class="detail-item">
                <IconCalendar />
                <span>发证日期：{{ cert.holdingDate || '未填写' }}</span>
              </div>
              <div class="detail-item">
                <IconCalendar />
                <span>有效期至：{{ cert.expiryDate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <a-empty description="暂无证书信息" />
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { getCertificateByCandidateId } from '@/apis/certificates/certificates'


const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const certificateList = ref<any[]>([])
  const certificateLoading = ref(false)
// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  certificateLoading.value = true
  try {
    const response = await getCertificateByCandidateId(dataId.value)
    if (response?.data?.length > 0) {
      certificateList.value = response.data
    } else {
      certificateList.value = []
    }
  } catch (error) {
    certificateList.value = []
  } finally {
    certificateLoading.value = false
  }
  visible.value = true
}

const getCertStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '有效',
    2: '已过期',
    3: '已作废',
    4: '待审核',
  }
  return statusMap[status] || '未知状态'
}

defineExpose({ onOpen })
</script>
<style scoped lang="scss"></style>

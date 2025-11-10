<template>
  <a-drawer v-model:visible="visible" title="机构培训缴费审核（记录考生参与机构培训的缴费及审核流程）详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="关联机构ID（关联机构表主键）">{{ dataDetail?.orgId }}</a-descriptions-item>
      <a-descriptions-item label="关联培训ID（关联机构培训价格表主键）">{{ dataDetail?.trainingId }}</a-descriptions-item>
      <a-descriptions-item label="关联八大类ID（关联八大类字典表主键）">{{ dataDetail?.categoryId }}</a-descriptions-item>
      <a-descriptions-item label="考生ID（缴费考生，关联用户表主键）">{{ dataDetail?.candidateId }}</a-descriptions-item>
      <a-descriptions-item label="关联报名记录ID（关联机构培训报名记录表主键）">{{ dataDetail?.enrollId }}</a-descriptions-item>
      <a-descriptions-item label="缴费通知单编号（格式：ORG_PAY_时间戳_随机数）">{{ dataDetail?.noticeNo }}</a-descriptions-item>
      <a-descriptions-item label="缴费金额（元）">{{ dataDetail?.paymentAmount }}</a-descriptions-item>
      <a-descriptions-item label="缴费时间">{{ dataDetail?.paymentTime }}</a-descriptions-item>
      <a-descriptions-item label="缴费凭证URL（考生上传的缴费截图/凭证）">{{ dataDetail?.paymentProofUrl }}</a-descriptions-item>
      <a-descriptions-item label="缴费通知单URL（生成的缴费通知PDF地址）">{{ dataDetail?.auditNoticeUrl }}</a-descriptions-item>
      <a-descriptions-item label="审核状态：0-待缴费，1-已缴费待审核，2-审核通过，3-审核驳回，4-补正审核，5-退款审核，6-已退款，7-退款驳回">{{ dataDetail?.auditStatus }}</a-descriptions-item>
      <a-descriptions-item label="驳回原因（审核驳回/退款驳回时填写）">{{ dataDetail?.rejectReason }}</a-descriptions-item>
      <a-descriptions-item label="审核人ID（关联管理员表主键）">{{ dataDetail?.auditorId }}</a-descriptions-item>
      <a-descriptions-item label="审核时间">{{ dataDetail?.auditTime }}</a-descriptions-item>
      <a-descriptions-item label="创建人（考生/系统）">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人（考生/审核员）">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="是否删除（0否，1是）">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type OrgTrainingPaymentAuditDetailResp, getOrgTrainingPaymentAudit as getDetail } from '@/apis/training/orgTrainingPaymentAudit'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<OrgTrainingPaymentAuditDetailResp>()
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

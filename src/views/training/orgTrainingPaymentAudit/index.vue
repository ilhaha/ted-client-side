<template>
  <div class="gi_table_page">
    <GiTable
      title="机构培训缴费审核管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-input-search
          v-model="queryForm.trainingId"
          placeholder="请输入关联培训ID"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.categoryId"
          placeholder="请输入关联八大类ID"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.candidateId"
          placeholder="请输入考生ID"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.enrollId"
          placeholder="请输入关联报名记录ID"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.noticeNo"
          placeholder="请输入缴费通知单编号）"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.paymentAmount"
          placeholder="请输入缴费金额（元）"
          allow-clear
          @search="search"
        />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #auditNoticeUrl="{ record }">
        <a-link
          @click="getPreviewUrl(record.auditNoticeUrl)"
          v-if="record.auditNoticeUrl"
          >{{ record.noticeNo }}</a-link
        >
      </template>
      <template #paymentProofUrl="{ record }">
        <a-link
          @click="getPreviewUrl(record.paymentProofUrl)"
          v-if="record.paymentProofUrl"
          >预览</a-link
        >
      </template>
      <!-- <template #toolbar-right>
        <a-button v-permission="['training:orgTrainingPaymentAudit:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['training:orgTrainingPaymentAudit:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template> -->

      <template #action="{ record }">
        <a-space>
          <a-link
            v-permission="['document:document:detail']"
            title="审核"
            @click="onExamine(record)"
            >审核</a-link
          >
          <!--          <a-link v-permission="['document:document:update']" title="修改" @click="onUpdate(record)">修改</a-link>-->
          <!--          <a-link-->
          <!--            v-permission="['document:document:delete']"-->
          <!--            status="danger"-->
          <!--            :disabled="record.disabled"-->
          <!--            :title="record.disabled ? '不可删除' : '删除'"-->
          <!--            @click="onDelete(record)"-->
          <!--          >-->
          <!--            删除-->
          <!--          </a-link>-->
        </a-space>
      </template>
      <template #auditStatus="{ record }">
        <template>
          <a-space size="large">
            <a-dropdown @select="handleSelect">
              <a-button>Click Me</a-button>
              <template #content>
                <a-doption>Option 1</a-doption>
                <a-doption disabled>Option 2</a-doption>
                <a-doption :value="{ value: 'Option3' }">Option 3</a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </template>
        <a-tag :color="getStatusColor(record.auditStatus)">{{
          getStatusText(record.auditStatus)
        }}</a-tag>
      </template>
    </GiTable>

    <OrgTrainingPaymentAuditAddModal
      ref="OrgTrainingPaymentAuditAddModalRef"
      @save-success="search"
    />
    <OrgTrainingPaymentAuditDetailDrawer
      ref="OrgTrainingPaymentAuditDetailDrawerRef"
    />
    <TrainingPaymentModal ref="TrainingPaymentModalRef" @save-success="search" />
  </div>
</template>

<script setup lang="ts">
import OrgTrainingPaymentAuditAddModal from "./OrgTrainingPaymentAuditAddModal.vue";
import OrgTrainingPaymentAuditDetailDrawer from "./OrgTrainingPaymentAuditDetailDrawer.vue";
import {
  type OrgTrainingPaymentAuditResp,
  type OrgTrainingPaymentAuditQuery,
  deleteOrgTrainingPaymentAudit,
  exportOrgTrainingPaymentAudit,
  listOrgTrainingPaymentAudit,
} from "@/apis/training/orgTrainingPaymentAudit";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import TrainingPaymentModal from "./TrainingPanymentModal.vue";

defineOptions({ name: "OrgTrainingPaymentAudit" });

const queryForm = reactive<OrgTrainingPaymentAuditQuery>({
  orgId: undefined,
  trainingId: undefined,
  categoryId: undefined,
  candidateId: undefined,
  enrollId: undefined,
  noticeNo: undefined,
  paymentAmount: undefined,
  sort: ["id,desc"],
});

const getStatusText = (auditStatus: number) => {
  switch (auditStatus) {
    case 0:
      return "待上传缴费凭证";
    case 1:
      return "已缴费待审核";
    case 2:
      return "审核通过";
    case 3:
      return "待补正";
    case 4:
      return "补正审核";
    case 5:
      return "退款审核";
    case 6:
      return "已退款";
    case 7:
      return "缴费审核通过，但驳回退款";
    default:
      return "";
  }
};

const getStatusColor = (auditStatus: number) => {
  switch (auditStatus) {
    case 0:
      return "red";
    case 1:
      return "red";
    case 2:
      return "green";
    case 3:
      return "orange";
    case 4:
      return "red";
    case 5:
      return "red";
    case 6:
      return "orange";
    case 7:
      return "green";
    default:
      return "default";
  }
};

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listOrgTrainingPaymentAudit({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: "培训项目", dataIndex: "projectName", slotName: "projectName" },
  { title: "培训考生", dataIndex: "candidateName", slotName: "candidateName" },
  {
    title: "缴费通知单",
    dataIndex: "auditNoticeUrl",
    slotName: "auditNoticeUrl",
  },
  {
    title: "缴费凭证",
    dataIndex: "paymentProofUrl",
    slotName: "paymentProofUrl",
  },
  {
    title: "预缴费金额（元）",
    dataIndex: "paymentAmount",
    slotName: "paymentAmount",
  },
  { title: "缴费时间", dataIndex: "paymentTime", slotName: "paymentTime" },
  { title: "审核状态", dataIndex: "auditStatus", slotName: "auditStatus" },
  { title: "驳回原因", dataIndex: "rejectReason", slotName: "rejectReason" },
  { title: "审核时间", dataIndex: "auditTime", slotName: "auditTime" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "training:orgTrainingPaymentAudit:detail",
      "training:orgTrainingPaymentAudit:update",
      "training:orgTrainingPaymentAudit:delete",
    ]),
  },
]);

// 重置
const reset = () => {
  queryForm.orgId = undefined;
  queryForm.trainingId = undefined;
  queryForm.categoryId = undefined;
  queryForm.candidateId = undefined;
  queryForm.enrollId = undefined;
  queryForm.noticeNo = undefined;
  queryForm.paymentAmount = undefined;
  search();
};

// 删除
const onDelete = (record: OrgTrainingPaymentAuditResp) => {
  return handleDelete(() => deleteOrgTrainingPaymentAudit(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportOrgTrainingPaymentAudit(queryForm));
};

const OrgTrainingPaymentAuditAddModalRef =
  ref<InstanceType<typeof OrgTrainingPaymentAuditAddModal>>();
// 新增
const onAdd = () => {
  OrgTrainingPaymentAuditAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: OrgTrainingPaymentAuditResp) => {
  OrgTrainingPaymentAuditAddModalRef.value?.onUpdate(record.id);
};

const OrgTrainingPaymentAuditDetailDrawerRef =
  ref<InstanceType<typeof OrgTrainingPaymentAuditDetailDrawer>>();
// 详情
const onDetail = (record: OrgTrainingPaymentAuditResp) => {
  OrgTrainingPaymentAuditDetailDrawerRef.value?.onOpen(record.id);
};

const TrainingPaymentModalRef =
  ref<InstanceType<typeof TrainingPaymentModal>>();
//审核
const onExamine = async (record: OrgTrainingPaymentAuditResp) => {
  TrainingPaymentModalRef.value?.onExamine(
    record.id,
    record.candidateId,
    record.enrollId
  );
};

const getPreviewUrl = (url: string) => {
  if (!url) {
    Message.warning("暂无文件可预览");
    return;
  }
  // 提取文件扩展名
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    //  PDF 直接在浏览器中预览
    window.open(url, "_blank");
  } else if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
    //  Office 文件使用微软在线预览
    const previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
      url
    )}`;
    window.open(previewUrl, "_blank");
  } else {
    Message.warning("暂不支持此文件类型预览");
  }
};
</script>

<style scoped lang="scss"></style>

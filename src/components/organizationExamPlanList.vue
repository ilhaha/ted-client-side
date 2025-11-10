<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 800 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #examType="{ record }">
        <a-tag :color="getExamTypeColor(record.examType)" bordered>{{
          getExamTypeText(record.examType)
        }}</a-tag>
      </template>
      <template #toolbar-left>
        <a-select v-model="queryForm.planType" placeholder="考试人员类型" allow-clear class="search-input ml-2"
          @change="search">
          <a-option :value="0">作业人员</a-option>
          <a-option :value="1">检验人员</a-option>
        </a-select>
        <!-- <div class="search-container"> -->
        <a-input-search v-model="queryForm.examPlanName" placeholder="搜索计划名称" allow-clear @search="search" />
        <a-input-search v-model="queryForm.projectName" placeholder="搜索项目名称" allow-clear @search="search" />
        <a-select v-model="queryForm.status" placeholder="计划状态" allow-clear class="search-input ml-2" @change="search">
          <a-option value="3">发布中</a-option>
          <a-option value="5">考试中</a-option>
          <a-option value="6">已结束</a-option>
        </a-select>
        <a-space class="ml-2">
          <a-button class="ml-2" @click="reset">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
        </a-space>
        <!-- </div> -->
      </template>
      <template #examPlanName="{ record }">
        <a-link title="查看计划证书" @click="openCertificateInfo(record)">{{ record.examPlanName }}</a-link>
      </template>
      <template #projectName="{ record }">
        <a-link title="查看项目详情" @click="openProjectInfo(record)">{{ record.projectName }}</a-link>
      </template>
      <template #startTime="{ record }">
        {{ record.startTime + " ~ " + record.endTime }}
      </template>
      <template #enrollStartTime="{ record }">
        {{ record.enrollStartTime + " ~ " + record.enrollEndTime }}
      </template>
      <template #planType="{ record }">
        <a-tag :color="getPlanTypeColor(record.planType)" bordered>
          {{ getPlanTypeText(record.planType) }}
        </a-tag>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)" bordered>
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space :size="2">
          <a-link v-if="record.status == 3 && record.remainingSlots > 0 && record.planType == 0" title="报考"
            @click="openClassSignUp(record)" v-permission="['exam:enroll:add']">报考</a-link>
          <a-link v-if="record.status == 3 && record.planType == 0" title="报考人员" @click="openApplyList(record)"
            v-permission="['exam:enroll:list']">报考人员</a-link>
          <!-- <a-link v-if="record.status == 5 || record.status == 6" title="考生信息"
            @click="openExamInfo(record)">考生信息</a-link> -->
        </a-space>

      </template>
    </GiTable>

    <ProjectDetailDrawer ref="ProjectDetailDrawerRef" />
    <CertificateDetailDrawer ref="CertificateDetailDrawerRef" />
    <OrgEnroll ref="OrgEnrollRef" @applySuccess="handApplySuccess" />
    <ApplyList ref="ApplyListRef" />
  </div>
</template>

<script setup lang="ts">
import ProjectDetailDrawer from "@/views/organization/project/ProjectDetailDrawer.vue";
import CertificateDetailDrawer from "@/views/organization/certificate/CertificateDetailDrawer.vue";
import OrgEnroll from '@/views/training/orgEnroll/index.vue'
import ApplyList from '@/views/training/orgEnroll/ApplyList.vue'
import { onMounted, ref, computed } from 'vue'
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import { orgGetPlanList } from '@/apis/plan/examPlan'

defineOptions({ name: "ExamPlan" });

const queryForm = reactive<ExamPlanQuery>({
  planType: 0,
  sort: ["tep.enroll_end_time,asc"],
});

const rowSelection = reactive({
  type: "checkbox",
  showCheckedAll: true,
  onlyCurrent: false,
});

const pageSize = ref(10)
const total = ref(0)
const dataList = ref([])

const currentPage = ref(1)

const pagination = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: total.value,
  showTotal: true,
  showPageSize: true,
  onChange: async (page: number) => {
    currentPage.value = page
    await search()
  },
  onPageSizeChange: async (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    await search()
  },
}))

const OrgEnrollRef = ref<InstanceType<typeof OrgEnroll>>();

const openClassSignUp = (record: any) => {
  OrgEnrollRef.value?.onOpen(record);
};


const ApplyListRef = ref<InstanceType<typeof ApplyList>>();

const openApplyList = (record: any) => {
  ApplyListRef.value?.onOpen(record.examPlanId);
};

const handApplySuccess = () => {
  search()
}

// 获取项目详情
const ProjectDetailDrawerRef = ref<InstanceType<typeof ProjectDetailDrawer>>();
const openProjectInfo = (record: any) => {
  ProjectDetailDrawerRef.value?.onOpen(record.projectId);
};


// 获取证书详情
const CertificateDetailDrawerRef = ref<InstanceType<typeof CertificateDetailDrawer>>();
const openCertificateInfo = (record: any) => {
  CertificateDetailDrawerRef.value?.onOpen(record.examPlanId);
};

const columns = ref<TableInstanceColumns[]>([
  { title: "计划名称", dataIndex: "examPlanName", slotName: "examPlanName" },
  { title: "考试项目", dataIndex: "projectName", slotName: "projectName" },
  {
    title: "考试项目代号",
    dataIndex: "projectCode",
    slotName: "projectCode",
  },
  {
    title: "所属八大类",
    dataIndex: "categoryName",
    slotName: "categoryName",
    show: true,
  },
  {
    title: "考试人员类型",
    dataIndex: "planType",
    slotName: "planType",
    show: true,
  },
  {
    title: "剩余报名名额",
    dataIndex: "remainingSlots",
    slotName: "remainingSlots",
    align: "center",
  },
  {
    title: "报名时间",
    dataIndex: "enrollStartTime",
    slotName: "enrollStartTime",
    width: 170,
  },
  {
    title: "考试时间",
    dataIndex: "startTime",
    slotName: "startTime",
    width: 170,
  },
  {
    title: "考试时长(分钟)",
    dataIndex: "examDuration",
    slotName: "examDuration",
    align: "center",
  },
  { title: "计划状态", dataIndex: "status", slotName: "status", width: 100 },
  {
    title: "考试费用/人",
    dataIndex: "examFee",
    slotName: "examFee",
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "exam:examPlan:detail",
      "exam:examPlan:update",
      "exam:examPlan:delete",
    ]),
  },
]);


const getStatusColor = (status: number) => {
  switch (status) {
    case 3:
      return "green"; // 已生效
    case 5:
      return "purple"; // 已开考
    case 6:
      return "gray"; // 已结束
    default:
      return "default";
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 3:
      return "发布中";
    case 5:
      return "已开考";
    case 6:
      return "已结束";
  }
};

const reset = () => {
  queryForm.examPlanName = undefined;
  queryForm.projectName = undefined;
  queryForm.status = undefined;
  queryForm.planType = 0
  search();
};

const search = async () => {
  const query = new URLSearchParams({
    examPlanName: queryForm.examPlanName || '',
    projectName: queryForm.projectName || '',
    status: queryForm.status || 3,
    planType: queryForm.planType,
    page: String(currentPage.value),
    size: String(pageSize.value),
  }).toString()

  const response = await orgGetPlanList(query)
  if (response?.data) {
    dataList.value = response.data.list || []
    total.value = response.data.total || 0
    pagination.total = total.value
  }
}

const getExamTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue"; // 理论考试
    case 1:
      return "orange"; // 实操考试
    default:
      return "default";
  }
};

const getExamTypeText = (status: number) => {
  switch (status) {
    case 0:
      return "理论考试";
    case 1:
      return "实操考试";
    default:
      return "未知状态";
  }
};

const getPlanTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return "orange";
    case 1:
      return "cyan";
    default:
      return "default";
  }
};

const getPlanTypeText = (status: number) => {
  switch (status) {
    case 0:
      return "作业人员";
    case 1:
      return "检验人员";
    default:
      return "未知类型";
  }
};

onMounted(() => {
  search()
})
</script>

<style scoped lang="scss">
.search-container {
  display: flex;
  align-items: center;
  width: 100%;

  .search-input {
    width: 180px !important;
  }

  :deep(.arco-picker) {
    width: 180px !important;
  }

  :deep(.arco-select) {
    width: 180px !important;
  }
}

.ml-2 {
  margin-left: 8px;
}

:deep(.arco-space) {
  display: flex;
  align-items: center;
}

.gi_table_page {
  position: relative;
}
</style>

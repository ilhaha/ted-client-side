<template>
  <a-layout class="layout-container">
    <div class="menu-demo">
      <!-- 添加公告栏 -->
      <div class="notice-bar">
        <a-carousel
          class="notice-carousel"
          animation-name="fade"
          :auto-play="true"
          :show-arrow="false"
          indicator-position="never"
          :interval="3000"
        >
          <a-carousel-item
            v-for="(notice, index) in announcements"
            :key="index"
          >
            <div class="notice-item" @click="goAnnouncements(notice.uri)">
              <IconNotification class="notice-icon" />
              <span class="notice-text">{{ notice.title }}</span>
            </div>
          </a-carousel-item>
        </a-carousel>
      </div>

      <a-layout-header class="header">
        <a-menu v-model:selected-keys="selectedKeys" mode="horizontal">
          <a-menu-item key="exam-plan">
            <template #icon>
              <IconCalendar />
            </template>
            考试计划
          </a-menu-item>
          <a-menu-item key="courses">
            <template #icon>
              <IconBook />
            </template>
            培训课程
          </a-menu-item>
          <a-menu-item key="projects">
            <template #icon>
              <IconCode />
            </template>
            项目展示
          </a-menu-item>
          <a-menu-item key="agency">
            <template #icon><icon-common /></template>
            考试机构
          </a-menu-item>
        </a-menu>
      </a-layout-header>

      <div class="content-layout">
        <div class="tab-content">
          <ExamPlanList
            v-if="selectedKeys[0] === 'exam-plan'"
            :exams="examPlanList"
            @select="showExamDetail"
          />

          <CourseList
            v-if="selectedKeys[0] === 'courses'"
            :courses="courseList"
            @select="showCourseDetail"
          />

          <ProjectList
            v-if="selectedKeys[0] === 'projects'"
            :projects="projectList"
            @select="showProjectDetail"
          />

          <AgencyList
            v-if="selectedKeys[0] === 'agency'"
            ref="agencyRef"
            @select="showAgencyDetail"
          />
        </div>
        <!-- 详情抽屉 -->
        <a-drawer
          :visible="visible"
          :width="640"
          @cancel="onClose"
          :footer="null"
        >
          <template #title>
            <div class="drawer-title">
              <span class="title-text">{{ selectedItem?.projectName }}</span>
              <a-tag
                v-if="selectedType === 'project'"
                :color="selectedItem?.projectStatus === '1' ? 'green' : 'blue'"
              >
                {{ selectedItem?.projectStatus === "1" ? "已上架" : "进行中" }}
              </a-tag>
            </div>
          </template>

          <div v-if="selectedItem" class="detail-content">
            <div class="detail-image">
              <img
                :src="
                  selectedItem.businessLicense ||
                  selectedItem?.imageUrl ||
                  '/static/images/test.jpg'
                "
                :alt="selectedItem?.projectName"
              />
            </div>
            <a-descriptions layout="inline-vertical">
              <a-descriptions-item
                v-for="(item, index) in getDescriptionData()"
                :key="index"
                :label="item.label"
              >
                <span v-html="item.value"></span>
              </a-descriptions-item>
            </a-descriptions>

            <!-- 添加分割线 -->
            <a-divider style="margin: 16px 0" />

            <!-- 证书信息卡片 -->
            <div
              v-if="selectedKeys[0] === 'exam-plan'"
              class="certificate-card"
            >
              <h4>证书信息</h4>
              <a-card :bordered="true" class="info-card">
                <div
                  v-if="selectedItem?.certificates?.length"
                  class="certificate-list"
                >
                  <div
                    v-for="(cert, index) in selectedItem.certificates"
                    :key="index"
                    class="cert-item"
                  >
                    <div class="cert-name">{{ cert.certificateName }}</div>
                    <div class="cert-number">
                      证书编号：{{ cert.certificateNumber || "暂无" }}
                    </div>
                  </div>
                </div>
                <div v-else class="empty-certs">
                  <a-empty description="暂无证书信息" />
                </div>
              </a-card>
            </div>

            <!-- 资料卡片 -->
            <div v-if="selectedKeys[0] === 'projects'" class="document-card">
              <h4>所需资料</h4>
              <a-card :bordered="true" class="info-card">
                <div
                  v-if="selectedItem?.documentList?.length"
                  class="document-tags"
                >
                  <a-tag
                    v-for="(doc, index) in selectedItem.documentList"
                    :key="index"
                    size="medium"
                    class="doc-tag"
                  >
                    <template #icon>
                      <icon-file />
                    </template>
                    {{ doc }}
                  </a-tag>
                </div>
                <div v-else class="empty-docs">
                  <a-empty description="暂无所需资料" />
                </div>
              </a-card>
            </div>
            <div v-if="selectedKeys[0] === 'exam-plan'" class="document-card">
              <h4>所需资料</h4>
              <a-card :bordered="true" class="info-card">
                <div
                  v-if="selectedItem?.documentNames?.length"
                  class="document-tags"
                >
                  <a-tag
                    v-for="(doc, index) in selectedItem.documentNames"
                    :key="index"
                    size="medium"
                    class="doc-tag"
                  >
                    <template #icon>
                      <icon-file />
                    </template>
                    {{ doc }}
                  </a-tag>
                </div>
                <div v-else class="empty-docs">
                  <a-empty description="暂无所需资料" />
                </div>
              </a-card>
            </div>

            <!-- 地点卡片 -->
            <div v-if="selectedKeys[0] === 'projects'" class="location-card">
              <h4>考试地点</h4>
              <a-card :bordered="true" class="info-card">
                <div
                  v-if="selectedItem?.locationList?.length"
                  class="location-tags"
                >
                  <a-tag
                    v-for="(location, index) in selectedItem.locationList"
                    :key="index"
                    size="medium"
                    class="location-tag"
                  >
                    <template #icon>
                      <IconLocation />
                    </template>
                    {{ location }}
                  </a-tag>
                </div>
                <div v-else class="empty-location">
                  <a-empty description="暂无考试地点" />
                </div>
              </a-card>
            </div>

            <!-- 操作按钮 -->
            <template v-if="selectedType === 'exam'">
              <a-divider />
              <div class="exam-actions">
                <a-button
                  v-show="isIdentityCard"
                  type="primary"
                  @click="handleViewIdentityCard"
                  >查看准考证</a-button
                >
                <a-modal
                  v-model:visible="isWindowIdentityCard"
                  :hide-cancel="false"
                >
                  <template #title> 准考证信息 </template>
                  <div>
                    <div>考试名称：{{ identityCard.examPlanName }}</div>
                    <div>准考证号：{{ identityCard.examNumber }}</div>
                    <div>考试开始时间：{{ identityCard.startTime }}</div>
                    <div>考试结束时间：{{ identityCard.endTime }}</div>
                  </div>
                  <template #footer>
                    <a-button
                      type="primary"
                      :loading="downloading"
                      @click="
                        handleDownload(
                          identityCard.userId,
                          identityCard.name,
                          identityCard.examPlanName,
                          identityCard.examNumber
                        )
                      "
                      v-if="identityCard.showStatus == 1"
                    >
                      下载准考证 PDF
                    </a-button>
                  </template>
                </a-modal>
                <a-button
                  type="primary"
                  :disabled="!canRegister"
                  @click="handleExamRegister"
                  v-if="!isQualifications"
                >
                  {{ getExamActionText() }}
                </a-button>
                <!-- 添加取消报名按钮 -->
                <a-button
                  type="primary"
                  v-if="
                    selectedItem?.enrollStatus != '0' &&
                    selectedItem?.enrollStatus != '6'
                  "
                  @click="handleCancelRegistration"
                >
                  取消报名
                </a-button>
                <!-- 上传缴费按钮 -->
                <a-button
                  type="primary"
                  :disabled="
                    selectedItem.enrollStatus !== 1 || // 报名状态不是 1
                    qualificationInfo.auditStatus === 2 || // 缴费审核通过时禁用
                    qualificationInfo.auditStatus === 7 ||
                    qualificationInfo.auditStatus === 5 ||
                    qualificationInfo.auditStatus === 6 
                  "
                  @click="handlePayment"
                >
                  {{ getExampaymentText() }}
                </a-button>

                <!-- 申请退款按钮 -->
                <a-button
                  v-if="showRefundButton()"
                  type="primary"
                  @click="handlePayment"
                >
                  {{ getRefundText() }}
                </a-button>
              </div>
            </template>
            <template v-if="selectedType === 'agency'">
              <!-- 状态为0：显示发送申请 -->
              <a-popconfirm
                content="确定要给当前机构发送申请吗"
                @ok="openAddAgency"
              >
                <a-button v-show="agencyStatus === 0" type="primary"
                  >发送申请</a-button
                >
              </a-popconfirm>

              <!-- 状态为1：显示撤回申请 -->
              <a-popconfirm content="确定撤回当前申请吗" @ok="handleDelAgency">
                <a-button v-show="agencyStatus === 1" type="primary"
                  >撤回申请</a-button
                >
              </a-popconfirm>

              <!-- 状态为-1：同时显示撤回申请 + 重新申请 -->
              <template v-if="agencyStatus === -1">
                <a-popconfirm
                  content="确定撤回当前申请吗"
                  @ok="handleDelAgency"
                >
                  <a-button type="primary" style="margin-right: 8px"
                    >撤回申请</a-button
                  >
                </a-popconfirm>
                <a-popconfirm
                  content="确定重新向当前机构发送申请吗"
                  @ok="openAddAgency"
                >
                  <a-button type="primary">重新申请</a-button>
                </a-popconfirm>
              </template>

              <!-- 状态为2：显示退出机构 -->
              <a-popconfirm content="确定退出当前机构吗" @ok="handleQuitAgency">
                <a-button v-show="agencyStatus === 2" type="primary"
                  >退出机构</a-button
                >
              </a-popconfirm>
            </template>
          </div>
          <!-- 添加加载状态 -->
          <div v-else class="loading-content">
            <a-spin dot />
          </div>
        </a-drawer>
      </div>
      <SpecialCertificationApplicant
        :visible="isNotFillIn"
        @close="handleModalClose"
        @upload-application-success="handleUploadSuccess"
      ></SpecialCertificationApplicant>

      <ExamineePayment
        :visible="isNotFillInPayment"
        @close="handleModalClosePayment"
        :paymentAuditData="paymentAuditData"
        @upload-application-success="handleUploadSuccessPayment"
      ></ExamineePayment>

      <!-- 选择机构项目弹窗 -->
      <a-modal
        v-model:visible="selectProjectModalVisible"
        title="选择机构培训项目"
        :mask-closable="false"
      >
        <a-cascader
          :options="categoryOptions"
          placeholder="请选择考试项目"
          allow-clear
          @change="selectOrgProject"
        />

        <template #footer>
          <a-space>
            <a-button @click="handleAddAgencyCancel">取消</a-button>
            <a-button type="primary" @click="handleAddAgency">确定</a-button>
          </a-space>
        </template>
      </a-modal>
    </div>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  IconAlipayCircle,
  IconApps,
  IconBook,
  IconCalendar,
  IconCode,
  IconLocation,
  IconNotification,
  IconWechatpay,
} from "@arco-design/web-vue/es/icon";
import { Message } from "@arco-design/web-vue";
import ExamPlanList from "@/components/ExamPlanList.vue";
import ProjectList from "@/components/ProjectList.vue";
import CourseList from "@/components/CourseList.vue";
import AgencyList from "@/components/AgencyList.vue";
import SpecialCertificationApplicant from "@/components/SpecialCertificationApplicant/index.vue";
import ExamineePayment from "@/components/SpecialCertificationApplicant/ExamineePayment.vue";
import { listTraining } from "@/apis/training/training";
import {
  downloadExamTicket,
  getExamineePaymentAuditInfo,
  submitExamineePaymentProof,
} from "@/apis/plan/enroll";

import {
  type EnrollResp,
  getExamPlanDetail,
  viewIdentityCard,
} from "@/apis/plan/examPlan";
import { getProjectDetail, getProjectList } from "@/apis/project/project";
import { listAnnouncementHome } from "@/apis/common/announcement";
import { getStudentInfo } from "@/apis/studentInfo/student";
import { getCandidatesId } from "@/apis/specialCertificationApplicant/index.ts";
import { checkEnrolledTime, singUp, cancelEnroll } from "@/apis/plan/enroll";
import { candidatesUpload } from "@/apis/specialCertificationApplicant/index";
import {
  getAgencyDetail,
  getAgencyStatus,
  studentAddAgency,
  studentDelAgency,
  studentQuitAgency,
} from "@/apis/org/org";
import {
  type ProjectCategoryVO,
  getSelectCategoryProject,
} from "@/apis/training/org";

const selectedKeys = ref(["exam-plan"]);
const visible = ref(false);
const selectedItem = ref(null);
const selectedType = ref("certificate");
const isNotFillIn = ref(false);
const isNotFillInPayment = ref(false);
const planId = ref(null);
const isQualifications = ref(false);

// 添加支付相关状态
const selectProjectModalVisible = ref(false);
const getCertificateDesc = (cert) => {
  return [
    { label: "证书编号", value: cert.id },
    { label: "发证机构", value: cert.issuer },
    { label: "获得时间", value: cert.date },
    { label: "有效期至", value: cert.validUntil },
    { label: "技能标签", value: cert.skills.join("、") },
  ];
};

const getStatusColor = (status) => {
  const statusMap = {
    0: "blue",
    1: "green",
    2: "grey",
    3: "red",
  };
  return statusMap[status] || "blue";
};

const getStatusText = (status) => {
  const statusMap = {
    0: "未报名",
    1: "已报名",
    2: "已完成",
    3: "已过期",
  };
  return statusMap[status] || "未知";
};

const showCertDetail = (cert) => {
  selectedItem.value = cert;
  visible.value = true;
};

const handleModalClose = () => {
  isNotFillIn.value = false;
};
const handleModalClosePayment = () => {
  isNotFillInPayment.value = false;
};

// 确认上传申请表
const handleUploadSuccess = async (imageUrl: string) => {
  const form = {
    planId: planId.value,
    imageUrl,
  };
  const res = await candidatesUpload(form);
  if (res.data) {
    Message.success("申请表上传成功");
    fetchQualification(Number(planId.value));
  } else {
    Message.error("申请表上传成功");
  }
};
const paymentAuditData = ref<any>(null);
const fileList = ref([]); // 和子组件 v-model 绑定的文件列表

const handleUploadSuccessPayment = async (paymentProofUrl: string) => {
  const {
    planId: examPlanId,
    candidatesId: examineeId,
    auditStatus: auditStatus,
  } = qualificationInfo.value || {};
  if (!examPlanId || !examineeId || !auditStatus) {
    Message.error("缺少考试计划或考生信息");
    return;
  }
  try {
    await submitExamineePaymentProof(
      examPlanId,
      examineeId,
      paymentProofUrl,
      auditStatus
    );
    Message.success("缴费凭证上传成功，已提交审核！");

    //  上传成功后清空文件列表
    fileList.value = [];
    isNotFillInPayment.value = false; // 可同步关闭弹窗
  } catch (error) {
    Message.error("提交缴费凭证失败，请稍后再试");
  }
};
const onClose = () => {
  visible.value = false;
  selectedItem.value = null;
};
// 新增取消报名方法
const handleCancelRegistration = async () => {
  // 获取当前时间
  const currentTime = new Date();
  // 假设 selectedItem 中有报名截止时间字段 registrationEndTime
  const registrationEndTime = new Date(selectedItem.value?.enrollEndTime);
  console.log(currentTime, registrationEndTime);
  if (currentTime > registrationEndTime) {
    Message.error("当前已过报名截止时间，无法取消报名");
    return;
  }
  try {
    const examPlanId = Number(planId.value);
    await cancelEnroll(examPlanId);
    // 取消报名成功后刷新数据
    await fetchExamDetail(String(examPlanId));
    await fetchQualification(String(examPlanId));
    // 可以在这里添加成功提示或者其他逻辑
    Message.success("取消报名成功");
  } catch (error) {
    // 可以在这里添加失败提示或者其他逻辑
    console.error("取消报名失败", error);
  }
};
const examPlanList = ref<EnrollResp[]>([]);
// 添加一个获取数据的方法
// const fetchExamPlanList = async () => {
//   try {
//     const response = await getExamPlanList()
//     console.log('API返回数据：', response)
//     // 通常后端返回的数据会包含在 response.data 中
//     examPlanList.value = response.data
//   } catch (error) {
//     console.error('获取考试计划列表失败：', error)
//   }
// }
// onMounted(() => {
//   fetchExamPlanList()
// })
// 项目数据
const projectList = ref([]);
const fetchProjectList = async () => {
  try {
    const response = await getProjectList();
    projectList.value = response.data;
    console.log("projectList:", projectList.value); // 打印项目列表数据
  } catch (error) {
    console.error("获取考试证书数据失败：", error);
  }
};

const getProjectDesc = (project) => {
  return [
    // { label: '项目角色', value: project.createUserName },
    // { label: '项目周期', value: project.examDuration },
    { label: "项目编号", value: project.projectCode },
    { label: "所属部门", value: project.deptName },
  ];
};

const showProjectDetail = async (project) => {
  visible.value = true;
  selectedType.value = "project";
  selectedItem.value = null; // 清空之前的数据
  // 获取详细信息
  await fetchProjectDetail(project.id);
};

const getExamStatusText = (status) => {
  const statusMap = {
    0: "未报名",
    1: "已报名",
    2: "已完成",
    3: "已过期",
  };
  return statusMap[status] || "未知";
};

const getExamStatusColor = (status) => {
  const colorMap = {
    0: "blue",
    1: "green",
    2: "purple",
    3: "red",
  };
  return colorMap[status] || "gray";
};

const showExamDetail = (exam: any) => {
  planId.value = exam.examPlanId;
  visible.value = true;
  console.log(visible.value);
  selectedType.value = "exam";
  selectedItem.value = null; // 清空之前的数据
  // 获取详细信息
  fetchExamDetail(exam.examPlanId);
  fetchQualification(exam.examPlanId);
};

const getExamDesc = (exam) => {
  // 文件在线预览处理
  const getPreviewUrl = (url) => {
    if (!url) return "#";
    const lower = url.toLowerCase();
    if (lower.endsWith(".pdf")) return url;
    if (
      lower.endsWith(".doc") ||
      lower.endsWith(".docx") ||
      lower.endsWith(".xls") ||
      lower.endsWith(".xlsx") ||
      lower.endsWith(".ppt") ||
      lower.endsWith(".pptx")
    ) {
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
        url
      )}`;
    }
    return url;
  };

  return [
    { label: "考试时间", value: exam.examStartTime },
    { label: "报名截止", value: exam.enrollEndTime },
    { label: "考试地点", value: exam.examPlace },
    { label: "考试时长", value: exam.examDuration + "小时" },
    { label: "考试费用", value: exam.examFee + "元" },
    { label: "考试项目", value: exam.projectName },
    {
      label: "考试状态",
      value: getExamStatusText(exam.enrollStatus),
      color: getExamStatusColor(exam.enrollStatus),
    },
    { label: "报名审核通知", value: qualificationInfo.value?.remark || "无" },
    {
      label: "缴费审核通知",
      value: qualificationInfo.value?.rejectReason || "无",
    },

    // ✅ 新增：申请表链接
    qualificationInfo.value?.imageUrl
      ? {
          label: "申请表",
          value: `<a href="${getPreviewUrl(
            qualificationInfo.value.imageUrl
          )}" target="_blank" rel="noopener noreferrer">查看申请表</a>`,
        }
      : { label: "申请表", value: "未上传" },
  ];
};

const getAgencyDesc = (agency) => {
  return [
    { label: "机构代号", value: agency.code },
    { label: "机构名称", value: agency.name },
    { label: "社会统一代码", value: agency.socialCode },
    { label: "机构地点", value: agency.location },
    { label: "机构法人", value: agency.legalPerson },
    { label: "公司规模大小", value: agency.scale },
    { label: "审核备注", value: remark || "无" },
  ];
};

const getDescriptionData = () => {
  switch (selectedType.value) {
    case "certificate":
      return getCertificateDesc(selectedItem.value);
    case "exam":
      return getExamDesc(selectedItem.value);
    case "agency":
      return getAgencyDesc(selectedItem.value);
    default:
      return getProjectDesc(selectedItem.value);
  }
};

const getDetailTitle = () => {
  const titleMap = {
    certificate: "证书说明",
    exam: "考试说明",
    //project: '项目描述',
  };
  return titleMap[selectedType.value] || "";
};

const examActionText = computed(() => {
  if (!selectedItem.value) return "";

  switch (selectedItem.value.enrollStatus) {
    case "0":
      return "报名考试";
    case "1":
      return "已报名";
    case "2":
      return "已结束";
    case "3":
      return "已过期";
    default:
      return `报名考试(${selectedItem.value.enrollStatus})`; // 添加状态值便于调试
  }
});

const canRegister = computed(() => {
  const qualStatus = qualificationInfo.value?.status;

  // 如果没有资格信息，可以报名
  if (qualStatus === null || qualStatus === undefined) return true;

  // 等待审核 或 资料需补正 可以报名
  if (qualStatus === 0 || qualStatus === 2 || qualStatus === 4) return true;

  // 其他状态都不能报名
  return false;
});

const isIdentityCard = ref(false);

const getExamActionText = () => {
  const qualStatus = qualificationInfo.value?.status;

  if (qualStatus === null || qualStatus === undefined) {
    return "立即报名";
  }
  if (qualStatus === 0) {
    return "等待审核";
  }
  if (qualStatus === 1) {
    return "报名成功";
  }
  if (qualStatus === 2) {
    return "资料需补正";
  }
  if (qualStatus === 3) {
    return "禁止报名";
  }
  if (qualStatus === 4) {
    return "等待补正审核";
  }

  return "";
};

const getExampaymentText = () => {
  const auditStatus = qualificationInfo.value?.auditStatus;
  switch (auditStatus) {
    case 0:
      return "立即缴费"; // 待缴费
    case 1:
      return "待审核"; // 已缴费待审核
    case 2:
      return "缴费审核通过";
    case 3:
      return "补正"; // 补正/驳回
    case 4:
      return "补正审核中";
    case 5:
      return "退款审核中";
    case 6:
      return "已退款";
    case 7:
      return "退款被驳回";
    default:
      return "立即缴费"; // 未知状态，默认
  }
};
// 退款按钮文字显示
const getRefundText = () => {
  const auditStatus = qualificationInfo.value?.auditStatus;
  switch (auditStatus) {
    case 2: // 审核通过
      return "申请退款";
    case 5: // 退款审核中
      return "退款审核中";
    case 7: // 退款被驳回
      return "退款被驳回";
    default:
      return ""; // 其他状态不显示文字
  }
};

// 是否显示按钮
const showRefundButton = () => {
  const text = getRefundText();
  return text !== "";
};

const handleExamRegister = async () => {
  // 处理考试报名逻辑
  // 校验考试时间
  const examPlanId = Number(planId.value);
  const checkRes = await checkEnrolledTime(examPlanId);
  if (checkRes.data) return;
  const res = await getStudentInfo();
  if (res?.data) {
    const userDocumentList = res.data.documentList || [];
    const examPlanDocument = selectedItem.value.documentNames;

    // 找出差集 - 考试需要的文档中用户还没有的文档
    const missingDocuments = examPlanDocument.filter(
      (doc) => !userDocumentList.includes(doc)
    );

    if (missingDocuments.length > 0) {
      Message.warning(`您还缺少以下资料：${missingDocuments.join("、")}`);
      return;
    }
    if (!isQualifications.value) {
      isNotFillIn.value = true;
    }
  }
};

const qualificationInfo = ref(null);
const fetchQualification = async (examPlanId: string) => {
  const response = await getCandidatesId(Number(examPlanId));
  qualificationInfo.value = response.data; // 保存完整数据

  // 审核状态处理
  if (response.data == null) {
    isQualifications.value = false; // 未填写
  } else if (response.data.status === 1) {
    isQualifications.value = true; // 审核通过
  } else {
    isQualifications.value = false; // 其它状态都不能报名
  }
  // 打印审核状态
  console.log("资格审核状态:", response.data?.status);
};

// 子组件ref
const agencyRef = ref<InstanceType<typeof agencyRef>>();
// 选择机构培训项目
const selectOrgProject = (value: string) => {
  selectedItem.value.selectedProjectId = value;
};

// 真正申请加入
const handleAddAgency = async () => {
  if (!selectedItem.value.selectedProjectId) {
    Message.warning("请选择培训项目");
    return;
  }
  const res = await studentAddAgency(
    selectedItem.value.id,
    selectedItem.value.selectedProjectId
  );
  if (res.data > 0) {
    selectedItem.value.selectedProjectId = null;
    selectProjectModalVisible.value = false;
    Message.success("申请成功，已通知相关机构");
  } else if (res.data === -1) {
    Message.error("请勿重复申请");
  } else {
    Message.error("申请失败");
  }
  //关闭抽屉
  visible.value = false;
  //刷新列表
  await agencyRef.value.fetchAgencyList();
};

const handleAddAgencyCancel = () => {
  selectedItem.value.selectedProjectId = null;
  selectProjectModalVisible.value = false;
};

const categoryOptions = ref<ProjectCategoryVO[]>([]);
// 弹出申请加入机构
const openAddAgency = async () => {
  const selectRes = await getSelectCategoryProject(selectedItem.value.id);
  categoryOptions.value = selectRes.data;
  selectProjectModalVisible.value = true;
};
//取消当前机构
const handleDelAgency = async () => {
  const res = await studentDelAgency(selectedItem.value.id);
  if (res.data == 2) {
    Message.success("取消机构申请成功");
  } else {
    Message.error("取消机构申请失败");
  }
  // 关闭抽屉
  visible.value = false;
  // 刷新列表
  await agencyRef.value.fetchAgencyList();
};
// 退出机构方法
const handleQuitAgency = async () => {
  // 调用“退出机构”的接口（用你项目中真实的退出接口，比如 studentQuitAgency）
  const res = await studentQuitAgency(selectedItem.value.id);

  // 根据接口返回结果提示用户
  if (res.data > 0 || res.success) {
    Message.success("退出机构成功"); // 业务文案明确是“退出”
  } else {
    Message.error("退出机构失败，请稍后重试");
  }

  // 后续操作：关闭抽屉 + 刷新列表，保证页面状态同步
  visible.value = false;
  await agencyRef.value.fetchAgencyList();
};
// 添加课程数据
const courseList = ref([]);
const fetchCourseList = async () => {
  try {
    const response = await listTraining({
      status: -1,
      page: 1, // 当前页
      size: 10, // 每页大小
    });
    // 通常后端返回的数据会包含在 response.data 中
    courseList.value = response.data.list;
  } catch (error) {
    console.error("获取考试证书数据失败：", error);
  }
};

onMounted(() => {
  fetchProjectList();
  fetchProjectList();
  fetchCourseList();
  fetchAnnouncement();
});

const showCourseDetail = (course) => {
  selectedType.value = "course";
  selectedItem.value = course;
  visible.value = true;
};

// 公告数据
const announcements = ref([]);

// 获取最新的五条公告标题
async function fetchAnnouncement() {
  try {
    const announcementResp = await listAnnouncementHome();
    const { data } = announcementResp;
    // 用获取到的数据更新 poems
    announcements.value = data;
  } catch (error) {
    console.error("获取公告失败：", error);
  }
}

// 获取路由实例
const router = useRouter();

const goAnnouncements = (uri) => {
  router.push(`/carousel/${uri}`);
};

// 获取考试计划详情
const fetchExamDetail = async (examPlanId: string) => {
  try {
    const response = await getExamPlanDetail(examPlanId);
    selectedItem.value = {
      ...response.data,
      certificates: response.data.certificates || [], // 确保 certificates 是数组
      documents: response.data.documents || [], // 确保 documents 是数组
    };
    isIdentityCard.value =
      selectedItem.value.enrollStatus == "1" ||
      selectedItem.value.enrollStatus == "2";
  } catch (error) {
    console.error("获取考试计划详情失败：", error);
    Message.error("获取考试计划详情失败");
    onClose();
  }
};

// 添加获取项目详情的方法
const fetchProjectDetail = async (projectId: string) => {
  try {
    const response = await getProjectDetail(projectId);
    selectedItem.value = {
      ...response.data,
      documentNames: response.data.documentsList || [], // 修改为 documentsList
      locations: response.data.locationsList || [], // 修改为 locationsList
    };
  } catch (error) {
    console.error("获取项目详情失败：", error);
    Message.error("获取项目详情失败");
    onClose();
  }
};

// 发送申请、已发送申请、退出机构(0、1、2)
const agencyStatus = ref(0);
let remark = "";

const fetchAgencyDetail = async (agencyId: string) => {
  try {
    const response = await getAgencyDetail(agencyId); // 获取机构详情
    selectedItem.value = {
      ...response.data,
      documentNames: response.data.candidateName || [], // 修改为 documentsList
    };
  } catch (error) {
    console.error("获取项目详情失败：", error);
    Message.error("获取项目详情失败");
    onClose();
  }
};

const fetchAgencyStatus = async (orgId: any) => {
  const ref = await getAgencyStatus(orgId);
  agencyStatus.value = ref.data.data.status;
  remark = ref.data.data.remark;
};

// 查看机构详情
const showAgencyDetail = async (agency) => {
  visible.value = true;
  selectedType.value = "agency";
  selectedItem.value = null; // 清空之前的数据
  // 获取详细信息
  await fetchAgencyDetail(agency.id);
  await fetchAgencyStatus(agency.id);
};

// 上传缴费凭证
const handlePayment = async () => {
  const { planId: examPlanId, candidatesId: examineeId } =
    qualificationInfo.value || {};
  if (!examPlanId || !examineeId) {
    console.error("❌ 缺少 planId 或 candidatesId，无法查询审核信息");
    return;
  }
  // 打开缴费弹窗
  isNotFillInPayment.value = true;
  // 调接口查询缴费审核信息
  try {
    const auditInfo = await getExamineePaymentAuditInfo(examPlanId, examineeId);
    paymentAuditData.value = auditInfo?.data; // 注意这里 data 的结构
  } catch (error) {
    console.error("❌ 获取缴费审核信息失败：", error);
  }
};

const isWindowIdentityCard = ref(false);
const identityCard = ref({
  examPlanName: "",
  examNumber: "",
  startTime: "",
  endTime: "",
  userId: "",
  name: "",
});

const handleViewIdentityCard = async () => {
  if (!planId.value) {
    Message.error("请选择考试计划");
    return;
  }
  isWindowIdentityCard.value = true;
  const res = await viewIdentityCard(planId.value);
  identityCard.value = res.data;
};
const downloading = ref(false);
async function handleDownload(userId, name, examPlanName, examNumber) {
  try {
    downloading.value = true; // 🔄 开始加载
    const res = await downloadExamTicket(userId, examNumber);
    const blob = new Blob([res], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `${examPlanName}-${name}-${examNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Message.success("下载成功");
  } catch (err) {
    console.error("❌ 下载准考证失败:", err);
    Message.error("下载准考证失败，请稍后重试");
  } finally {
    downloading.value = false; // ✅ 下载结束，关闭加载状态
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  background: var(--color-bg-1);
  border-radius: 4px;
  overflow: hidden;
  height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
}

.menu-demo {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// 添加公告栏样式
.notice-bar {
  margin: 0 0px 0px 0px;
  padding: 8px 16px 0px 16px;
  background: var(--color-bg-2);
  border-radius: 4px;
}

.notice-carousel {
  height: 32px;
}

.notice-item {
  display: flex;
  align-items: center;
  height: 32px;

  .notice-icon {
    color: rgb(var(--primary-6));
    margin-right: 8px;
    font-size: 16px;
  }

  .notice-text {
    color: var(--color-text-2);
    font-size: 14px;
  }
}

.header {
  background: var(--color-bg-2);
  border-radius: 4px;
  margin: 0 16px 16px 0px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.content-layout {
  flex: 1;
  background: var(--color-bg-1);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-content {
  flex: 1;
  overflow: hidden;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-content {
  padding: 20px 0;
}

.cert-description {
  h4 {
    margin-bottom: 12px;
    color: var(--color-text-1);
  }

  p {
    color: var(--color-text-2);
    line-height: 1.6;
  }
}

.exam-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 24px;
}

.certificate-card {
  margin: 16px 0;

  h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: var(--color-text-1);
  }

  .info-card {
    background-color: var(--color-fill-2);
    border-radius: 8px;
    border: 1px solid var(--color-border-2);

    :deep(.arco-card-body) {
      padding: 16px;
    }
  }

  .certificate-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .cert-item {
      padding: 12px;
      background-color: var(--color-bg-2);
      border-radius: 4px;

      .cert-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 8px;
      }

      .cert-number {
        font-size: 13px;
        color: var(--color-text-3);
      }
    }
  }

  .empty-certs {
    padding: 16px 0;
    display: flex;
    justify-content: center;
  }
}

.document-card,
.location-card {
  margin-bottom: 16px;

  h4 {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 8px;
  }

  .info-card {
    background-color: var(--color-fill-2);

    :deep(.arco-card-body) {
      padding: 16px;
    }
  }
}

.document-tags,
.location-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .doc-tag,
  .location-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;

    :deep(.arco-icon) {
      font-size: 14px;
    }
  }
}

.empty-docs,
.empty-location {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.loading-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.detail-image {
  width: 100%;
  height: 240px; // 设置固定高度
  overflow: hidden;
  border-radius: 4px;
  background-color: var(--color-fill-2);
  margin-bottom: 16px; // 添加底部间距

  img {
    width: 100%;
    height: 100%;
    object-fit: contain; // 保持图片比例
    background-color: var(--color-fill-2); // 背景色
  }
}

.payment-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 20px 0;

  .qr-code {
    width: 200px;
    height: 200px;
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .payment-methods {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;

    .payment-btn {
      min-width: 120px;
    }
  }
}
</style>

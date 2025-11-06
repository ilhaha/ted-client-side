<template>
  <a-spin :loading="importLoading" tip="正在努力解析您的文件，请耐心等待😊" dot>
    <div class="main-container">
      <div class="organization-container">
        <!-- 右侧内容区 -->
        <div class="right-content">
          <div class="user-id"></div>

          <!-- 导航菜单 -->
          <div class="nav-menu">
            <a-menu v-model:selected-keys="activeTab" mode="horizontal" @menu-item-click="handleTabChange">
              <a-menu-item key="1"> 考试计划 </a-menu-item>
              <a-menu-item key="2"> 班级管理 </a-menu-item>
              <a-menu-item key="6"> 培训申请 </a-menu-item>
              <a-menu-item key="3"> 培训名单 </a-menu-item>
              <a-menu-item key="5"> 专家管理 </a-menu-item>
              <a-menu-item key="7"> 培训管理 </a-menu-item>
            </a-menu>
          </div>

          <!-- 内容区域 -->
          <div class="list-content">
            <div v-if="activeTab === '1'" class="tab-content">
              <organizationExamPlanList :exams="examPlanList" />
            </div>
            <div v-if="activeTab === '2'" class="project-list">
              <orgClassList @setImportLoading="handSetImportLoading" />
            </div>
            <div v-if="activeTab === '3'" class="tab-content">
              <div class="action-buttons">
                <a-space>
                  <a-button @click="handleBatchSignUp">
                    <template #icon>
                      <IconDownload />
                    </template>
                    批量注册
                  </a-button>
                </a-space>
              </div>
              <a-table :data="studentApplyFortList" :columns="studentApplyFortColumns"
                :loading="studentApplyFortLoading" :pagination="{
                  total: studentTotal,
                  current: studentCurrentPage,
                  pageSize: studentPageSize,
                  showTotal: true,
                  onChange: handleStudentPageChange,
                }">
                <template #operations="{ record }">
                  <a-button type="text" @click="handleViewCertificate(record.candidateId)">
                    <template #icon>
                      <IconEye />
                    </template>
                    证书查询
                  </a-button>
                  <!-- 新增查看资料按钮 -->
                  <a-button type="text" @click="handleViewDocuments(record.candidateId)">
                    <template #icon>
                      <IconFile />
                    </template>
                    查看资料
                  </a-button>
                  <a-button @click="handleUploadData(record.candidateId)">
                    <template #icon>
                      <IconFile />
                    </template>
                    上传资料
                  </a-button>
                  <a-button type="text" status="danger" @click="handleRemoveStudent(record.orgId, record.candidateId)">
                    <template #icon>
                      <IconDelete />
                    </template>
                    移除学生
                  </a-button>
                </template>
              </a-table>
              <DocumentUpload :visible="uploadVisible" title="上传资料" @close="uploadVisible = false"
                @upload-success="handleUploadSuccess">
              </DocumentUpload>

              <!-- 新增资料弹窗 -->
              <Drawer v-model:visible="showDocumentModal" title="学员资料" :footer="false" width="500px"
                @close="handleCloseDocument">
                <div class="document-drawer-content">
                  <div v-if="documentLoading" class="loading-container">
                    <a-spin size="large" />
                  </div>
                  <div v-else-if="documentList.length" class="document-list">
                    <div v-for="(doc, index) in documentList" :key="index" class="document-card">
                      <div class="document-image">
                        <a-image :src="doc.documentUrl" :alt="doc.documentName" :preview="true" fit="cover"
                          @error="handleImageError" />
                      </div>
                      <div class="document-info">
                        <div class="document-header">
                          <h3>{{ doc.documentName }}</h3>
                          <a-tag :color="getDocStatusColor(doc.status)">
                            {{ getDocStatusText(doc.status) }}
                          </a-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="no-data">
                    <a-empty description="暂无资料信息" />
                  </div>
                </div>
              </Drawer>
            </div>
            <div v-if="activeTab === '4'" class="tab-content">
              <TrainingLesson />
            </div>
            <div v-if="activeTab === '5'" class="tab-content">
              <ExpertList />
            </div>
            <div v-if="activeTab === '6'" class="tab-content">
              <orgCandidateList />
            </div>
            <!-- 新增培训管理内容 -->
            <div v-if="activeTab === '7'" class="tab-content">
              <TrainingManagement v-if="activeTab === '7'" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-spin>
  <!-- 批量注册弹窗 -->
  <Modal v-model:visible="showBatchSignUpModal" title="批量注册学员" :footer="false" width="400px" @close="handleFileClose">
    <div class="batch-modal-content">
      <a-space direction="vertical" size="large" fill>
        <a-upload v-model:file-list="fileList" :action="`${uploadUrl}/training/org/upload`" :headers="{
          Authorization: `Bearer ${getToken()}`,
        }" :limit="1" accept=".xls,.xlsx" list-type="text" @success="handleSuccess" @before-upload="beforeUpload"
          @error="handleError">
          <template #upload-button>
            <a-button type="primary">
              <template #icon>
                <IconUpload />
              </template>
              上传Excel文件
            </a-button>
          </template>
        </a-upload>

        <a-button type="outline" @click="handleDownloadTemplate">
          <template #icon>
            <IconDownload />
          </template>
          下载模板文件
        </a-button>

        <div class="upload-tip">
          <p>提示：</p>
          <ul>
            <li>仅支持 .xls, .xlsx 格式的文件</li>
            <li>文件大小不超过 2MB</li>
            <li>请严格按照模板格式填写数据</li>
          </ul>
        </div>
        <a-button type="primary" class="confirm-upload-btn" :disabled="!fileList.length" @click="handleConfirmUpload">
          确认上传
        </a-button>
      </a-space>
    </div>
  </Modal>
  <!-- 查看证书抽屉 -->
  <Drawer v-model:visible="showCertificateModal" title="查看证书" :footer="false" width="500px"
    @close="handleCloseCertificate">
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
                <span>发证日期：{{ cert.holdingDate || "未填写" }}</span>
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
  </Drawer>
  <!-- 计划详情抽屉 -->
  <a-drawer :visible="visible" :width="640" @cancel="onClose">
    <template #title>
      <div class="drawer-title">
        <span class="title-text">{{ selectedItem?.projectName }}</span>
        <a-tag v-if="selectedType === 'project'" :color="selectedItem?.projectStatus === '1' ? 'green' : 'blue'">
          {{ selectedItem?.projectStatus === "1" ? "已上架" : "进行中" }}
        </a-tag>
      </div>
    </template>

    <div v-if="selectedItem" class="detail-content">
      <div class="detail-image">
        <img :src="selectedItem?.imageUrl || '/static/images/test.jpg'" :alt="selectedItem?.projectName" />
      </div>
      <a-descriptions :data="getDescriptionData()" layout="inline-vertical" />
      <a-divider />
      <div class="detail-description">
        <h4>{{ getDetailTitle() }}</h4>
        <p>{{ selectedItem.redeme }}</p>
      </div>

      <!-- 添加分割线 -->
      <a-divider style="margin: 16px 0" />

      <!-- 证书信息卡片 -->
      <div v-if="activeTab === '1'" class="certificate-card">
        <h4>证书信息</h4>
        <a-card :bordered="true" class="info-card">
          <div v-if="selectedItem?.certificates?.length" class="certificate-list">
            <div v-for="(cert, index) in selectedItem.certificates" :key="index" class="cert-item">
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
      <div v-if="activeTab === '2'" class="document-card">
        <h4>所需资料</h4>
        <a-card :bordered="true" class="info-card">
          <div v-if="selectedItem?.documentList?.length" class="document-tags">
            <a-tag v-for="(doc, index) in selectedItem.documentList" :key="index" size="medium" class="doc-tag">
              <template #icon>
                <IconFile />
              </template>
              {{ doc }}
            </a-tag>
          </div>
          <div v-else class="empty-docs">
            <a-empty description="暂无所需资料" />
          </div>
        </a-card>
      </div>
      <div v-if="activeTab === '1'" class="document-card">
        <h4>所需资料</h4>
        <a-card :bordered="true" class="info-card">
          <div v-if="selectedItem?.documentNames?.length" class="document-tags">
            <a-tag v-for="(doc, index) in selectedItem.documentNames" :key="index" size="medium" class="doc-tag">
              <template #icon>
                <IconFile />
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
      <div v-if="activeTab === '2'" class="location-card">
        <h4>考试地点</h4>
        <a-card :bordered="true" class="info-card">
          <div v-if="selectedItem?.locationList?.length" class="location-tags">
            <a-tag v-for="(location, index) in selectedItem.locationList" :key="index" size="medium"
              class="location-tag">
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
    </div>
    <!-- 添加加载状态 -->
    <div v-else class="loading-content">
      <a-spin dot />
    </div>
    <template #footer>
      <a-button v-if="activeTab === '1'" type="primary" @click="handleClick">选择考生</a-button>
      <a-modal :visible="selectStudent" draggable :width="800" :mask-closable="false" ok-text="选择" @ok="handleUpload"
        @cancel="handleCloseUpload">
        <template #title> 选择需要提交申请表的考生 </template>
        <div class="search">
          <div class="nickname">
            <input v-model="nickname" type="text" placeholder="搜索考生名称" />
            <a-button type="primary" @click="searchByNickName">搜索</a-button>
            <a-button @click="resetName">重置</a-button>
            <a-modal :visible="studentUploadVisible" :width="900" :mask-closable="false">
              <template #title> 上传资料申请表 </template>
              <div>
                <a-table :columns="uploadColumns" :data="uploadList" :virtual-list-props="{ height: 300 }"
                  :pagination="false" style="width: 800px; min-height: 342px; margin-left: 25px">
                  <template #upload="{ record }">
                    <a-upload :file-list="getUploadFileList(record.id)" list-type="picture-card"
                      :action="studentFileUploadUrl" :limit="1" :data="uploadData"
                      style="display: flex; justify-content: center"
                      :headers="{ Authorization: `Bearer ${getToken()}` }" accept="image/jpeg,image/png,image/jpg"
                      image-preview @success="(file) => handleStudentSuccess([file, record])"
                      @error="(error) => handleStudentError(error, record.id)" />
                  </template>
                  <template #cancel="{ record }">
                    <a-popconfirm content="确定取消上传吗?" cancel-text="不取消" ok-text="确定取消" @ok="handleStudentCancel(record)">
                      <a-link>取消上传</a-link>
                    </a-popconfirm>
                  </template>
                </a-table>
              </div>
              <template #footer>
                <div class="studentUploadFooter">
                  <div />
                  <div>
                    <a-button @click="handleStudentUploadCancel">取消</a-button>
                    <a-button type="primary" :loading="studentUploadLoading"
                      @click="handleStudentUploadOk">确定</a-button>
                  </div>
                </div>
              </template>
            </a-modal>
          </div>
          <a-table v-model:selected-keys="checkboxList" :data="studentList" :columns="studentColumns"
            :loading="studentLoading" :row-selection="rowSelection" :pagination="{
              total,
              current: currentPage,
              pageSize,
              showTotal: true,
              onChange: handlePageChange,
            }" row-key="id" style="width: 700px; min-height: 300px; margin-left: 25px" @select="handleCheckbox">
            <template #studentStatus="{ record }">
              <a-space direction="vertical">
                <a-space>
                  <a-link :status="record.studentStatus ? 'success' : 'warning'">{{ record.studentStatus ? "已提交" :
                    "未提交"
                  }}</a-link>
                </a-space>
              </a-space>
            </template>
          </a-table>
        </div>
      </a-modal>
      <a-button type="primary" @click="onClose">确定</a-button>
    </template>
  </a-drawer>

</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { Drawer, Message, Modal } from "@arco-design/web-vue";
import * as XLSX from "xlsx";
import { getToken } from "@/utils/auth";
import {
  approveStudent,
  getCandidatesList,
  getOneCandidateDocument,
  getStudentAddList,
  parseExcel,
  refuseStudent,
  agencyRemoveStudent,
} from "@/apis/org/org";
import organizationExamPlanList from "@/components/organizationExamPlanList.vue";
import orgClassList from "@/views/training/orgClass/index.vue";
import orgCandidateList from "@/views/training/orgCandidate/index.vue";
import { type ProjectResp, getProjectDetail } from "@/apis/project/project";
import TrainingLesson from "@/components/TrainingLesson.vue";
import ExpertList from "@/components/ExpertList.vue";
import { getCertificateByCandidateId } from "@/apis/certificates/certificates";
import TrainingManagement from "@/views/organization/train/index.vue";
import type { EnrollResp } from "@/apis/plan/examPlan";
import {
  candidatesUploads,
  getCandidatesId,
} from "@/apis/specialCertificationApplicant";
import { getStudentDocumentTypeStatus, getStudentList } from "@/apis";
import DocumentUpload from "@/components/DocumentUpload/index.vue";
import { studentUploadDocuments } from "@/apis/document";
import { getExamPlanDetail } from "@/apis/plan/examPlan";
import { getOrgInfo } from "@/apis/training/org";

const uploadUrl = `${import.meta.env.VITE_API_PREFIX}`;
const showBatchSignUpModal = ref(false);
const fileList = ref([]);
const uploading = ref(false);
const fileId = ref("");
const showCertificateModal = ref(false);
const certificateLoading = ref(false);
const certificateList = ref<any[]>([]);
const showDocumentModal = ref(false);
const documentLoading = ref(false);
const documentList = ref<Document[]>([]);
const importLoading = ref(false)

const handSetImportLoading = (res: any) => {
  importLoading.value = res
}
// 查看资料方法
const handleViewDocuments = async (candidateId: string) => {
  showDocumentModal.value = true;
  documentLoading.value = true;
  try {
    // 调用后端接口获取资料
    const response = await getOneCandidateDocument(candidateId);
    if (response.data) {
      documentList.value = response.data;
    } else {
      documentList.value = [];
    }
  } catch (error) {
    console.error("查询资料失败:", error);
    documentList.value = [];
    Message.error("获取资料失败");
  } finally {
    documentLoading.value = false;
  }
};

// 关闭资料抽屉
const handleCloseDocument = () => {
  showDocumentModal.value = false;
  documentList.value = [];
};

// 点击后跳出弹窗
const handleBatchSignUp = () => {
  showBatchSignUpModal.value = true;
};

// 处理上传成功
const handleSuccess = (file: any) => {
  if (file.response && file.response.code === "0") {
    fileId.value = file.response.data; // 确保这里提取的是文件 ID
    Message.success("上传成功");
  } else {
    Message.error(file.response?.msg || "上传失败");
  }
};

// 上传前校验
const beforeUpload = (file: File) => {
  const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isExcel) {
    Message.error("只能上传 Excel 文件!");
    return false;
  }
  if (!isLt2M) {
    Message.error("文件大小不能超过 2MB!");
    return false;
  }
  return true;
};

// 确认上传
const handleConfirmUpload = async () => {
  if (!fileId.value) {
    Message.warning("请先上传文件");
    return;
  }

  uploading.value = true;
  try {
    // 调用解析方法
    const parseResponse = await parseExcel(fileId.value.data);

    if (parseResponse.data && parseResponse.data.msg) {
      Message.success("文件解析成功");
      // 处理解析后的数据
    } else {
      Message.error(parseResponse.data.message || "文件解析失败");
    }
  } catch (error: any) {
    Message.error(error.message || "解析失败，请重试");
  } finally {
    uploading.value = false;
    fileList.value = []; // 清空文件列表
    fileId.value = ""; // 清空文件 ID
  }
};

// 处理上传错误
const handleError = (error: any) => {
  console.error("上传失败:", error);
  Message.error("上传失败，请重试");
};

// 关闭弹窗时清空文件列表
const handleFileClose = () => {
  fileList.value = [];
};

// 下载模板
const handleDownloadTemplate = () => {
  // 创建 Excel 模板内容
  const templateData = [
    ["id", "身份证号", "姓名"], // 表头
  ];

  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);

  // 设置列宽
  worksheet["!cols"] = [
    { wch: 20 }, // 身份证号列宽
    { wch: 15 }, // 姓名列宽
  ];

  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "学员注册名单");

  // 生成Excel文件并下载
  XLSX.writeFile(workbook, "学员注册名单模板.xlsx");
};

// 机构信息模拟数据
const orgInfo = ref({
  nickname: "",
  name: "",
  phone: "",
  code: "",
  address: "",
});

const handleRemoveStudent = (orgId, candidateId) => {
  Modal.confirm({
    title: '确认移除学生',
    content: '确定要将该学生从机构中移除吗？此操作不可撤销。',
    okText: '确认',
    cancelText: '取消',

    async onOk() {
      try {
        const res = await agencyRemoveStudent(orgId, candidateId)
        if (res.code === '0' && res.success) {
          Message.success('学生已成功移除')
          loadStudentList()
        } else {
          Message.warning(res.msg || '移除失败')
        }
      } catch (error) {
        // 兼容网络异常或 500 报错
        // Message.error(error?.message || '移除失败')
      }
    },
  })
}


// 刷新学生列表
const loadStudentList = async () => {
  await fetchStudentList();
}

const examPlanList = ref<EnrollResp[]>([]);

// 学员名单模拟数据
const studentApplyFortList = ref([]);
const studentCurrentPage = ref(1);
const studentPageSize = ref(10);
const studentTotal = ref(0);
const studentApplyFortLoading = ref(false);

// 需要上传资格申请表的考生
const uploadList = ref([]);

// 添加获取考生列表的方法
const fetchStudentList = async () => {
  studentApplyFortLoading.value = true;
  try {
    const response = await getCandidatesList();

    if (response?.data) {
      studentApplyFortList.value = response.data.list || [];
      studentTotal.value = response.data.total || 0;
    }
  } catch (error) {
    console.error("获取考生列表失败：", error);
    Message.error("获取考生列表失败");
    studentApplyFortList.value = [];
    studentTotal.value = 0;
  } finally {
    studentApplyFortLoading.value = false;
  }
};

// 添加分页变化处理方法
const handleStudentPageChange = async (page: number) => {
  studentCurrentPage.value = page;
  await fetchStudentList();
};

// 当前选中的菜单项
const activeTab = ref("1");

const studentApplyFortColumns = [
  {
    title: "考生学号",
    dataIndex: "candidateId",
    width: 80,
    align: "center",
  },
  {
    title: "姓名",
    dataIndex: "nickName",
    width: 50,
    align: "center",
  },
  {
    title: "联系电话",
    dataIndex: "phoneNumber",
    width: 80,
    align: "center",
  },
  {
    title: "邮箱",
    dataIndex: "email",
    width: 80,
    align: "center",
  },
  {
    title: "操作",
    width: 100,
    slotName: "operations",
    fixed: "right",
    align: "center",
  },
];

// 获取证件状态颜色
const getCertStatusColor = (status: number) => {
  const statusMap: Record<number, string> = {
    1: "green", // 有效
    2: "red", // 已过期
    3: "red", // 已作废
    4: "orange", // 待审核
  };
  return statusMap[status] || "gray";
};

// 获取证件状态文本
const getCertStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: "有效",
    2: "已过期",
    3: "已作废",
    4: "待审核",
  };
  return statusMap[status] || "未知状态";
};

// 查看证书方法
const handleViewCertificate = async (candidateId: string) => {
  showCertificateModal.value = true;
  certificateLoading.value = true;
  try {
    const response = await getCertificateByCandidateId(candidateId);
    if (response?.data?.length > 0) {
      certificateList.value = response.data;
    } else {
      certificateList.value = [];
      // Message.warning('未找到证书信息')
    }
  } catch (error) {
    console.error("查询证书失败:", error);
    // Message.error('查询证书失败')
    certificateList.value = [];
  } finally {
    certificateLoading.value = false;
  }
};

// 关闭证书抽屉
const handleCloseCertificate = () => {
  showCertificateModal.value = false;
  certificateList.value = [];
};


// 修改 handleTabChange 方法，在切换到学员名单时获取数据
const handleTabChange = (key: string) => {
  activeTab.value = key;
  if (key === "3") {
    fetchStudentList();
  }
};

const visible = ref(false);
const selectedItem = ref(null);
const selectedType = ref("certificate");
const planId = ref(null);
const isQualifications = ref(false);

const onClose = () => {
  visible.value = false;
  selectedItem.value = null;
};

const getExamDesc = () => {
  return [
    { label: "考试时间", value: selectedItem.value.examStartTime },
    { label: "报名截止", value: selectedItem.value.enrollEndTime },
    { label: "考试地点", value: selectedItem.value.examPlace },
    { label: "考试时长", value: selectedItem.value.examDuration },
    { label: "考试费用", value: selectedItem.value.examFee },
    { label: "考试项目", value: selectedItem.value.projectName },
  ];
};

const getProjectDesc = (project) => {
  return [
    { label: "项目编号", value: project.projectCode },
    { label: "所属部门", value: project.deptName },
  ];
};

const getDescriptionData = () => {
  switch (selectedType.value) {
    case "exam":
      return getExamDesc();
    default:
      return getProjectDesc(selectedItem.value);
  }
};

const getDetailTitle = () => {
  const titleMap = {
    certificate: "证书说明",
    exam: "考试说明",
  };
  return titleMap[selectedType.value] || "";
};

// 获取考试计划详情
const fetchExamDetail = async (examPlanId: string) => {
  const response = await getExamPlanDetail(examPlanId);
  selectedItem.value = {
    ...response.data,
    certificates: response.data.certificates || [],
    documents: response.data.documents || [],
  };
};

const fetchQualification = async (examPlanId: string) => {
  const response = await getCandidatesId(Number(examPlanId));
  // 已填写
  if (response.data == null) {
    isQualifications.value = false;
  } else if (response.data.status == 0) {
    isQualifications.value = true;
  }
};

// 添加获取项目详情的方法
const fetchProjectDetail = async (projectId: string) => {
  const response = await getProjectDetail(projectId);
  selectedItem.value = {
    ...response.data,
    documentNames: response.data.documentsList || [],
    locations: response.data.locationsList || [],
  };
};

const showExamDetail = (exam: any) => {
  planId.value = exam.id;
  visible.value = true;
  selectedType.value = "exam";
  selectedItem.value = null; // 清空之前的数据
  // 获取详细信息
  fetchExamDetail(exam.examPlanId);
  fetchQualification(exam.examPlanId);
};

const uploadVisible = ref(false);
const candidateId = ref("");

const handleUploadSuccess = async (data: {
  docPath: string;
  typeId: number;
}) => {
  try {
    // 传入考生id
    const params = {
      docPath: data.docPath,
      typeId: data.typeId,
      candidateId: candidateId.value,
    };
    const res = await studentUploadDocuments(params);
    if (res.data === "成功") {
      Message.success("上传成功");
    }
  } finally {
    uploadVisible.value = false;
  }
};

// 上传考生资料
const handleUploadData = async (record) => {
  candidateId.value = record;
  uploadVisible.value = true;
};

const selectStudent = ref(false);
const nickname = ref("");
const studentLoading = ref(false);
const studentList = ref([]);
const checkboxList = ref([]);
// 表格分页配置
const currentPage = ref(1);
const pageSize = ref(4);
const total = ref(0);

const rowSelection = reactive({
  type: "checkbox",
  showCheckedAll: false,
  onlyCurrent: false,
});

const studentColumns = [
  {
    title: "ID",
    dataIndex: "id",
    width: 100,
    align: "center",
  },
  {
    title: "考生名称",
    dataIndex: "nickname",
    width: 100,
    align: "center",
  },
  {
    title: "考生当前计划所需资料状态",
    dataIndex: "studentStatus",
    slotName: "studentStatus",
    width: 100,
    align: "center",
  },
];

const uploadColumns = [
  {
    title: "ID",
    dataIndex: "id",
    width: 100,
    align: "center",
  },
  {
    title: "考生名称",
    dataIndex: "nickname",
    width: 100,
    align: "center",
  },
  {
    title: "资格申请表",
    dataIndex: "upload",
    slotName: "upload",
    width: 100,
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "cancel",
    slotName: "cancel",
    width: 80,
    align: "center",
  },
];
const studentFileMap = ref(new Map());

// 修改初始文件列表为 Map 结构
const initStudentFileList = () => {
  studentFileMap.value = new Map();
  uploadList.value = [];
};

// 获得当前机构所有考生
const handleClick = async (page) => {
  try {
    initStudentFileList();
    selectStudent.value = true;
    studentLoading.value = true;
    currentPage.value = typeof page === "number" ? page : 1;
    const params = `page=${currentPage.value}&size=${pageSize.value}`;
    const res = await getStudentList(params, nickname.value);
    if (!res.data) {
      Message.error("获取考生列表失败");
    }
    const statusRes = await getStudentDocumentTypeStatus(
      selectedItem.value.documentNames
    );
    studentList.value = res.data.list;
    studentList.value.forEach((studentListItem) => {
      statusRes.data.forEach((statusResItem) => {
        if (studentListItem.id === statusResItem.studentId) {
          studentListItem.studentStatus = statusResItem.status;
        }
      });
    });
    total.value = res.data.total;
  } finally {
    studentLoading.value = false;
  }
};

// 添加分页变化处理方法
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await handleClick(page);
};

// 按照名称搜索
const searchByNickName = async () => {
  await handleClick(1);
};

// 重置名称
const resetName = async () => {
  nickname.value = "";
  await handleClick(1);
};

const handleCheckbox = async (record) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  const status = studentList.value.find(
    (item) => item.id === record[record.length - 1]
  );
  if (!status) {
    return;
  }
  if (!status.studentStatus) {
    checkboxList.value = checkboxList.value.filter(
      (item) => item !== record[record.length - 1]
    );
    Message.error("该考生未提交对应资料");
  }
};

// 批量上传
const studentUploadVisible = ref(false);
const studentUploadLoading = ref(false);
const studentFileUploadUrl = ref(
  `${import.meta.env.VITE_API_PREFIX}/upload/file`
);
const uploadData = ref({
  type: "pic",
});

const getUploadFileList = (key: number) => {
  return studentFileMap.value.get(key) || [];
};

// 取消上传
const handleStudentUploadCancel = () => {
  selectStudent.value = true;
  studentUploadVisible.value = false;
  initStudentFileList();
};

const imgSuccess = ref(new Map());

const handleStudentSuccess = (data: any[]) => {
  const [file, record] = data;
  const key = record.id;
  if (file.response.code === "0") {
    studentFileMap.value.set(key, [file]);
    imgSuccess.value.set(key, true);
    Message.success("图片上传成功");
    return;
  }
  Message.error("图片上传失败");
};

const handleStudentError = (error: any) => {
  console.error("上传失败:", error);
};

const handleStudentCancel = (record) => {
  uploadList.value = uploadList.value.filter((item) => item.id !== record.id);
  checkboxList.value = checkboxList.value.filter((item) => item !== record.id);
};

// 点击上传按钮弹窗
const handleUpload = () => {
  if (checkboxList.value.length === 0) {
    Message.error("请选择需要上传资格申请表的考生");
    return;
  }
  initStudentFileList();
  checkboxList.value.forEach((checkboxItem) => {
    uploadList.value.push(
      studentList.value.find((item) => item.id === checkboxItem)
    );
  });
  selectStudent.value = false;
  studentUploadVisible.value = true;
};

const handleCloseUpload = () => {
  uploadList.value = [];
  checkboxList.value = [];
  selectStudent.value = false;
  studentUploadVisible.value = false;
};

// 上传前校验
const studentBeforeUpload = () => {
  for (const value of imgSuccess.value) {
    if (!value) {
      Message.error("请等待图片上传成功");
      studentUploadLoading.value = false;
      return false;
    }
  }
  if (studentFileMap.value.size < uploadList.value.length) {
    Message.error("请上传对应的考生申请图片");
    studentUploadLoading.value = false;
    return false;
  }
  return true;
};

// 确定上传
const handleStudentUploadOk = async () => {
  studentUploadLoading.value = true;
  if (!studentBeforeUpload()) return;
  const studentMap = new Map();
  studentFileMap.value.forEach((value, key) => {
    studentMap.set(key, value[0].response.data.url);
  });
  // map转普通对象
  const obj = Object.fromEntries(studentMap);
  // json转json字符串
  const studentMapStr = JSON.stringify(obj);
  try {
    const res = await candidatesUploads({
      studentMapStr,
      planId: planId.value,
    });
    if (!res.data) {
      Message.error("提交申请失败");
    }
    Message.success("提交申请成功");
    initStudentFileList();
    checkboxList.value = [];
    studentUploadVisible.value = false;
  } catch {
  } finally {
    studentUploadLoading.value = false;
  }
};

// 获取资料状态颜色
const getDocStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    0: "orange", // 待审核
    1: "green", // 已生效
    2: "red", // 未通过
  };
  return statusMap[status] || "gray";
};

// 获取资料状态文本
const getDocStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    0: "待审核",
    1: "已生效",
    2: "未通过",
  };
  return statusMap[status] || "未知状态";
};

// 处理图片加载错误
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = "/static/images/default-doc.jpg";
};
</script>

<style scoped lang="scss">
.main-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  overflow: hidden;
  /* 整体不滚动 */
  padding: 10px;
}

/* 中间区域占满可视高度（或你要的 88vh）*/
.organization-container {
  width: 100%;
  height: 87vh;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 右侧整体内容区：column 布局 */
.right-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* 关键：允许内部 flex 子项收缩（否则子项 overflow 失效） */
}

/* 菜单固定区（不随内容滚动） */
.nav-menu {
  flex: 0 0 56px;
  /* 固定高度（根据你的菜单高度调整） */
  /* 不要用 position: sticky 必要时可保留 */
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  z-index: 10;
  box-sizing: border-box;
}

/* 内容区：真正的滚动容器 */
.list-content {
  flex: 1 1 auto;
  /* 占据剩余高度 */
  min-height: 0;
  /* 关键：允许该元素发生内部滚动 */
  overflow-y: auto;
  box-sizing: border-box;
}



.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  padding: 8px 0;
  background: var(--color-bg-2);
  border-radius: 4px;
}

.left-sidebar {
  position: fixed;
  top: 84px;
  left: 0;
  height: auto;
  width: 240px;
  background: var(--color-bg-2);
  padding: 20px;
  border-right: 1px solid var(--color-border);
  border-radius: 5px;

  .org-profile {
    text-align: center;
    margin-bottom: 16px;

    .org-logo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-bottom: 8px;
    }

    .org-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
      margin: 0;
    }
  }

  .info-list {
    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      color: var(--color-text-2);
      font-size: 13px;

      :deep(.arco-icon) {
        margin-right: 6px;
        font-size: 14px;
        color: var(--color-text-3);
      }

      .info-text {
        color: var(--color-text-1);
        margin-left: 6px;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// .right-content {
//   margin: 0px 20px;
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   height: calc(100vh - 78px); // 调整高度，减去顶部导航和边距
//   overflow: hidden; // 防止溢出
// }

.user-id {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-2);
  margin-bottom: 16px;
  font-size: 14px;
  padding-left: 16px;
}

.content-card {
  margin-left: 16px;
  background: var(--color-bg-2);
  border-radius: 4px;

  .nav-tabs {
    border-bottom: 1px solid var(--color-border);

    :deep(.arco-menu) {
      background: transparent;
      padding-left: 16px;
    }
  }

  .table-content {
    padding: 16px 24px;
  }
}

// .nav-menu {
//   background: var(--color-bg-2);
//   border-radius: 10px;
//   margin-bottom: 16px;

//   :deep(.arco-menu) {
//     background: transparent;

//     .arco-menu-item {
//       padding: 0 24px;
//       height: 46px;
//       line-height: 46px;
//       font-size: 14px;
//     }
//   }
// }

.list-content {
  // flex: 1;
  //min-height: 0; // 重要：确保子元素可以滚动
  // background: var(--color-bg-1);
  // border-radius: 16px;
  // display: flex;
  // flex-direction: column;
  // overflow: hidden;

  .project-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .project-card {
      background: var(--color-bg-2);
      transition: transform 0.2s;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .project-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .project-logo {
          width: 48px;
          height: 48px;
          border-radius: 4px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .project-details {
          flex: 1;

          h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: var(--color-text-1);
          }

          .project-meta {
            display: flex;
            gap: 16px;
            color: var(--color-text-3);
            font-size: 14px;
          }
        }

        .project-arrow {
          color: var(--color-text-3);
          font-size: 16px;
        }
      }
    }
  }

  .tab-content {
    flex: 1;
    overflow: hidden;

    :deep(.arco-table) {
      .arco-table-container {
        border-radius: 4px;
      }

      .arco-table-th {
        background-color: var(--color-fill-2);
      }

      .arco-table-tr:hover {
        td {
          background-color: var(--color-fill-2);
        }
      }

      .arco-table-pagination {
        margin-top: 16px;
      }
    }
  }
}

.batch-modal-content {
  padding: 16px;

  :deep(.arco-upload) {
    width: 100%;

    .arco-upload-list {
      margin-top: 8px;
    }

    .arco-btn {
      width: 100%;
    }
  }

  .upload-tip {
    margin-top: 16px;
    padding: 12px;
    background-color: var(--color-fill-2);
    border-radius: 4px;
    font-size: 13px;
    color: var(--color-text-2);

    p {
      margin: 0 0 8px 0;
      color: var(--color-text-1);
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.certificate-drawer-content {
  padding: 16px;

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 180px;
  }

  .certificate-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .certificate-card {
      background: var(--color-bg-2);
      border-radius: 4px;
      padding: 16px;
      display: flex;
      gap: 16px;
      transition: transform 0.2s;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .certificate-image {
        width: 100px;
        height: 140px;
        border-radius: 4px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .certificate-info {
        flex: 1;

        .certificate-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;

          h3 {
            font-size: 14px;
            font-weight: 600;
            color: var(--color-text-1);
            margin: 0;
          }
        }

        .certificate-details {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: var(--color-text-2);

            :deep(.arco-icon) {
              font-size: 14px;
              color: var(--color-text-3);
            }
          }
        }
      }
    }
  }

  .no-data {
    height: 180px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.table-button>button {
  margin-right: 5px;
}

.nickname {
  margin-bottom: 20px;
  text-align: center;
}

.nickname>input {
  width: 200px;
  height: 30px;
  outline: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 5px;
  padding-left: 5px;
}

.nickname>button {
  margin-right: 5px;
}

.studentUploadFooter {
  display: flex;
  justify-content: space-between;
}

.studentUploadFooter button {
  margin-left: 5px;
}

/* 新增样式 */
.document-drawer-content {
  padding: 16px;

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 180px;
  }

  .document-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding: 8px;

    .document-card {
      background: var(--color-bg-2);
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 1px solid var(--color-border);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .document-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
        background-color: var(--color-fill-2);

        :deep(.arco-image) {
          width: 100%;
          height: 100%;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      .document-info {
        padding: 12px;

        .document-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;

          h3 {
            font-size: 14px;
            font-weight: 600;
            color: var(--color-text-1);
            margin: 0;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .no-data {
    height: 180px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
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
    object-fit: contain;
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

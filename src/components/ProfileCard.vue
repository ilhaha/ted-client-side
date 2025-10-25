<template>
  <a-card class="profile-card">
    <div class="profile-header">
      <img :src="userInfo.avatar" class="profile-image" />
      <h3 class="profile-name">{{ userInfo.nickName }}</h3>
    </div>

    <a-divider />

    <div class="profile-info">
      <div class="info-item">
        <icon-phone />
        手机号：<span class="info-text">{{ userInfo.phoneNumber }}</span>
      </div>
      <div class="info-item">
        <icon-location />
        部门：<span class="info-text">{{ userInfo.deptName }}</span>
      </div>
    </div>

    <a-divider />

    <!-- 资料管理区 -->
    <div class="profile-documents" v-if="getRoleFlag() === '1'">
      <div class="document-header">
        <h4>资料列表</h4>
        <a-button
          class="document-button"
          type="text"
          @click="handleShowAllDocuments"
        >
          全部资料
        </a-button>
      </div>

      <div class="document-list">
        <template
          v-if="userInfo.documentList && userInfo.documentList.length > 0"
        >
          <a-tag
            v-for="(doc, index) in userInfo.documentList"
            :key="index"
            class="document-tag"
            size="medium"
          >
            <template #icon>
              <icon-file />
            </template>
            {{ doc }}
          </a-tag>
        </template>
        <div v-else class="empty-text">暂无资料信息</div>
      </div>

      <!-- 全部资料弹窗 -->
      <a-modal
        :visible="showModal"
        width="70%"
        @cancel="showModal = false"
        title="全部资料"
        :footer="null"
      >
        <template #title>
          <span>全部资料</span>
          <a-button
            @click="handleDocUpload"
            style="margin-left: auto; margin-right: 30px"
          >
            <icon-file />
            上传资料
          </a-button>
        </template>

        <a-table
          :columns="columns"
          :data="tableData"
          :pagination="pagination"
          row-key="id"
        >
          <template #documentUrl="{ record }">
            <a-image
              width="100"
              :src="record.documentUrl"
              :preview="true"
              :preview-props="{
                actions: ['rotateRight', 'zoomIn', 'zoomOut', 'originalSize']
              }"
            />
          </template>
        </a-table>

        <div class="pagination-wrapper">
          <a-pagination
            :total="total"
            :page-size="pageSize"
            v-model:current="currentPage"
            size="small"
            show-total
            :hide-on-single-page="false"
            @change="handlePageChange"
          />
        </div>

        <!-- 上传资料组件 -->
        <DocumentUpload
          :visible="uploadVisible"
          title="上传资料"
          @close="handleModalClose"
          @upload-success="handleUploadSuccess"
        />
      </a-modal>
    </div>

    <!-- 重新上传资料弹窗 -->
    <DocumentReUpload
      :visible="reUploadVisible"
      :currentDocName="reUploadDocName"
      :id="reUploadDocId"
      :typeId="reUplocadTypeId"
      :candidateId="reUploadcandidateId"
      :status="reUplocadStutas"
      @close="reUploadVisible = false"
      @reupload-success="handleReUploadSuccess"
    />
  </a-card>
</template>

<script setup lang="ts">
import {
  IconPhone,
  IconLocation,
  IconFile,
} from "@arco-design/web-vue/es/icon";
import { Image, Message } from "@arco-design/web-vue";
import { ref, onMounted, h } from "vue";
import { getRoleFlag } from "@/utils/auth";
import { listDocument } from "@/apis/File/upload";
import { getStudentInfo } from "@/apis/studentInfo/student";
import { studentUploadDocuments, studentReUploadDocument } from "@/apis/document";

import DocumentUpload from "@/components/DocumentUpload/index.vue";
import DocumentReUpload from "@/components/DocumentReUpload/index.vue";

// ========== 数据区域 ==========
const showModal = ref(false);
const uploadVisible = ref(false);
const reUploadVisible = ref(false);

const reUploadDocName = ref("");
const reUploadDocId = ref("");
// const reUplocadTypeId = ref("");
// const reUploadcandidateId = ref("");
const reUplocadStutas = ref("");

const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);

const userInfo = ref({
  avatar: "/static/images/test.jpg",
  nickName: "",
  documentList: [],
  phoneNumber: "未设置",
  deptName: "未设置",
});

// 状态颜色映射
const statusMap = {
  0: { text: "未审核", color: "#3498db", bgColor: "#e1f0fa" },
  1: { text: "已通过", color: "#2ecc71", bgColor: "#e8f8f0" },
  2: { text: "待补正", color: "#f39c12", bgColor: "#fef5e6" },
  3: { text: "待补正审核", color: "#9b59b6", bgColor: "#f5eef8" },
};

// 表格列定义
const columns = [
  { title: "资料种类名称", dataIndex: "typeName", key: "typeName" },
  {
    title: "审核状态",
    dataIndex: "status",
    key: "status",
    render: ({ record }) => {
      const s = statusMap[record.status] || {
        text: "未知状态",
        color: "#95a5a6",
        bgColor: "#f2f3f4",
      };
      return h(
        "span",
        {
          style: {
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "4px",
            color: s.color,
            backgroundColor: s.bgColor,
            border: `1px solid ${s.color}`,
          },
        },
        s.text
      );
    },
  },
  { title: "审核备注", dataIndex: "auditRemark", key: "auditRemark" },
  { title: "审核日期", dataIndex: "reviewTime", key: "reviewTime" },
  { title: "更新人", dataIndex: "reviewer", key: "reviewer" },
  {
    title: "资料图片",
    dataIndex: "documentUrl",
    key: "documentUrl",
    render: ({ record }) => {
      const urls = record.documentUrl ? record.documentUrl.split(",") : [];
      return h(
        "div",
        { class: "image-list" },
        urls.map((url) =>
          h(Image, {
            src: url.trim(),
            width: 80,
            height: 60,
            style: { marginRight: "8px", marginBottom: "8px" },
            preview: true,
            previewProps: {
              actions: ["rotateRight", "zoomIn", "zoomOut", "originalSize"],
            },
          })
        )
      );
    },
  },
  {
    title: "操作",
    key: "action",
    render: ({ record }) => {
      const buttonText = record.status === "2" ? "补正上传" : "重新上传";
      return h(
        "button",
        {
          class: "correction-upload-btn",
          onClick: () => openReUploadModal(record),
          style: {
            padding: "4px 8px",
            backgroundColor: "#3498db",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          },
        },
        buttonText
      );
    },
  },
];

const tableData = ref<any[]>([]);
const pagination = ref({ current: 1, pageSize: 10, total: 0 });

// ========== 方法区 ==========

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getStudentInfo();
    if (res?.data) {
      userInfo.value = {
        avatar: res.data.avatar || "/static/images/test.jpg",
        nickName: res.data.nickName || "",
        documentList: res.data.documentList || [],
        phoneNumber: res.data.phoneNumber || "未设置",
        deptName: res.data.deptName || "未设置",
      };
    }
  } catch (e) {
    Message.error("获取个人信息失败");
  }
};

// 获取资料列表
const handleShowAllDocuments = async () => {
  showModal.value = true;
  try {
    const params = `page=${currentPage.value}&size=${pageSize.value}`;
    const res = await listDocument(params);
    tableData.value = res.data.list || [];
    total.value = res.data.total || 0;
  } catch (e) {
    Message.error("获取资料列表失败");
  }
};

// 上传新资料
const handleDocUpload = () => {
  showModal.value = false;
  uploadVisible.value = true;
};

// 上传成功后刷新
const handleUploadSuccess = async (data: { docPath: string; typeId: number }) => {
  const res = await studentUploadDocuments(data);
  if (res.code === 0) {
    Message.success("上传成功");
    await handleShowAllDocuments();
  }
};

// 分页
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await handleShowAllDocuments();
};

// 打开重新上传弹窗
const openReUploadModal = (record: any) => {
  reUploadDocName.value = record.typeName;
  reUploadDocId.value = record.id;
  // reUplocadTypeId.value = record.typeId;
  // reUploadcandidateId.value = record.createUser;
  reUplocadStutas.value = record.status;
  reUploadVisible.value = true;
};

// 重新上传成功
const handleReUploadSuccess = async (data: { id: number; docPath: string; status:number }) => {
  try {
    //打印数据
    console.log("重新上传数据:", data);
    const res = await studentReUploadDocument(data);
    if (res.code == 0) {
      Message.success("重新上传成功");
      reUploadVisible.value = false;
      await handleShowAllDocuments();
      //关闭弹窗
      handleModalClose();
    } else {
      // Message.error("重新上传失败");
    }
  } catch (e) {
    // Message.error("重新上传失败");
  }
};

// 关闭上传资料弹窗
const handleModalClose = () => {
  uploadVisible.value = false;
  showModal.value = true;
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.profile-card {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.profile-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
.profile-name {
  font-size: 18px;
  font-weight: bold;
}
.profile-info {
  margin-top: 8px;
}
.info-item {
  margin-bottom: 6px;
}
.document-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.document-list {
  margin-top: 10px;
}
.empty-text {
  color: #888;
  font-size: 14px;
  margin-top: 10px;
}
.pagination-wrapper {
  margin-top: 16px;
  text-align: right;
}
</style>

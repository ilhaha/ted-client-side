<template>
  <div class="special-certification-applicant">
    <a-modal
      :visible="visible"
      :title="modalTitle"
      @cancel="handleCancel"
      :mask-closable="false"
      :footer="false"
      :width="500"
      class="custom-modal"
    >
      <div class="form-actions-container">
        <div class="action-buttons">
          <a-button
            type="primary"
            class="download-btn"
            @click="handleDownloadTemplate"
          >
            <template #icon><icon-download /></template>
            查看培训缴费通知单
          </a-button>
        </div>

        <div class="upload-section">
          <a-upload
            :action="uploadUrl"
            :headers="{
              Authorization: `Bearer ${getToken()}`,
            }"
            :data="{ type: 'file' }"
            :limit="1"
            v-model:file-list="fileList"
            :accept="'.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip'"
            @success="handleSuccess"
            @before-upload="beforeUpload"
            @error="handleError"
          >
            <template #upload-button>
              <div class="upload-button">
                <icon-upload />
                <div class="upload-text">点击或拖拽文件到此处上传</div>
                <div class="upload-hint">
                  支持常见文档（PDF、Word），大小不超过20MB
                </div>
              </div>
            </template>
          </a-upload>

          <a-button
            type="primary"
            class="confirm-upload-btn"
            :disabled="!fileList.length"
            @click="confirmUpload"
          >
            确认上传
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Message } from "@arco-design/web-vue";
import { getToken } from "@/utils/auth";

// 获取环境变量中的API基础URL
const uploadUrl = `${import.meta.env.VITE_API_PREFIX}/upload/file`;
// 上传之后的图片url
const imageUrl = ref("");

interface UploadItem {
  uid: string;
  name: string;
  status?: "init" | "uploading" | "done" | "error";
  file?: File;
  url?: string;
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  TrainingpaymentAuditData: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close", "upload-application-success"]);

const fileList = ref<UploadItem[]>([]);

const handleCancel = () => {
  emit("close");
};

const handleSuccess = (file: any) => {
  imageUrl.value = file.response.data.url;
};

const beforeUpload = (file: File) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    Message.error('只能上传 PDF 或 Word 文件');
    return false;
  }

  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    Message.error('文件不能超过 20MB');
    return false;
  }

  return true;
};

const handleError = (error: any) => {
  const maxSize = 2 * 1024 * 1024 * 1024;
  if (error.file.size > maxSize) {
    Message.error("上传失败，图片文件不能超过2GB！");
  } else {
    Message.error("系统错误");
  }
};

const handleDownloadTemplate = () => {
  const url = props.TrainingpaymentAuditData?.auditNoticeUrl;
  if (url) {
    window.open(url, "_blank");
  } else {
    Message.error("未找到缴费通知单文件地址");
  }
};

const confirmUpload = () => {
  if (fileList.value.length === 0) {
    Message.warning("请先选择要上传的文件");
    return;
  }
  emit("upload-application-success", imageUrl.value);
  emit("close");
};

// 根据状态动态显示 Modal 标题
const modalTitle = computed(() => {
  const status = props.TrainingpaymentAuditData?.auditStatus;
  switch (status) {
    case 0:
    case 1:
      return "上传缴费凭证";
    case 2:
      return "缴费审核已通过，确定要退款吗，退款将被取消报名资格";
    case 3:
      return "补正缴费凭证";
    case 4:
      return "补正审核中，可更新上传";
    case 5:
      return "退款审核中，可更新上传";
    case 6:
      return "已退款，禁止上传";
    case 7: 
      return "退款被驳回，重新上传申请退款";
    default:
      return "上传缴费凭证";
  }
});
</script>

<style scoped>
.form-actions-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 400px;
}

.download-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #165dff, #0e42d2);
  border: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.2);
}

.download-btn:hover {
  background: linear-gradient(135deg, #0e42d2, #0a2b8f);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 93, 255, 0.3);
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
  align-items: center;
}

/* 确保上传组件和按钮宽度一致 */
.upload-section :deep(.arco-upload) {
  width: 100%;
}

.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 100%;
  min-height: 140px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.upload-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    rgba(22, 93, 255, 0.05) 0%,
    rgba(22, 93, 255, 0) 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-button:hover {
  border-color: #165dff;
  background-color: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.upload-button:hover::before {
  opacity: 1;
}

.upload-button :deep(.arco-icon) {
  font-size: 32px;
  color: #165dff;
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}

.upload-button:hover :deep(.arco-icon) {
  transform: scale(1.1);
}

.upload-text {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-align: center;
}

.upload-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #86909c;
  text-align: center;
  max-width: 90%;
}

.confirm-upload-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #00b42a, #009a29);
  border: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 180, 42, 0.2);
  box-sizing: border-box;
  margin-top: 5px;
}

.confirm-upload-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #009a29, #007a21);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 180, 42, 0.3);
}

.confirm-upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #e5e6eb;
  box-shadow: none;
}

/* 自定义模态框样式 */
:deep(.arco-modal) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

:deep(.arco-modal-header) {
  background: linear-gradient(135deg, #165dff, #0e42d2);
  color: white;
  padding: 16px 20px;
  border-bottom: none;
}

:deep(.arco-modal-title) {
  font-weight: 600;
  font-size: 18px;
}

:deep(.arco-modal-close-btn) {
  color: white;
}

:deep(.arco-modal-close-btn:hover) {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

:deep(.arco-modal-body) {
  padding: 0;
}
</style>


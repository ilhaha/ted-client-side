<template>
  <div class="reupload-doc">
    <a-modal
      :visible="visible"
      :title="`重新上传：${currentDocName || '资料'}`"
      @cancel="handleCancel"
      :mask-closable="false"
      :footer="false"
      :width="500"
      class="custom-modal"
    >
      <div class="form-actions-container">
        <div class="upload-section">
          <!-- 上传组件 -->
          <a-upload
            :action="uploadUrl"
            :headers="{ Authorization: `Bearer ${getToken()}` }"
            :data="uploadData"
            v-model:file-list="fileList"
            :multiple="false"
            :accept="'image/jpeg,image/png,image/jpg,application/pdf'"
            @success="handleSuccess"
            @before-upload="beforeUpload"
            @error="handleError"
          >
            <template #upload-button>
              <div class="upload-button">
                <icon-upload />
                <div class="upload-text">点击或拖拽文件到此处上传</div>
                <div class="upload-hint">支持 JPG、PNG、PDF 文件，单个大小不超过 20MB</div>
              </div>
            </template>
          </a-upload>

          <a-button
            type="primary"
            class="confirm-upload-btn"
            :disabled="!fileList.length"
            @click="confirmReUpload"
          >
            确认上传
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getToken } from '@/utils/auth'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentDocName: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    required: true
  },
  // typeId: {
  //   type: Number,
  //   required: true
  // },
  // candidateId: {
  //   type: String,
  //   required: true
  // }
  status: {
    type: Number,
    default: ""
  }

})

const emit = defineEmits(['close', 'reupload-success'])

// 上传地址
const uploadUrl = `${import.meta.env.VITE_API_PREFIX}/upload/file`
const uploadData = ref({ type: 'pic' })

// 文件列表
const fileList = ref<any[]>([])

// 上传成功回调
const handleSuccess = (file: any) => {
  if (file.response.code != 0) {
    Message.error(file.response.msg || '上传失败')
    return
  }
  Message.success('文件上传成功')
}

// 上传前验证
const beforeUpload = (file: File) => {
  const isAllowed = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
  if (!isAllowed) {
    Message.error('仅支持 JPG、PNG 或 PDF 文件')
    return false
  }
  if (file.size / 1024 / 1024 > 20) {
    Message.error('文件大小不能超过 20MB')
    return false
  }
  return true
}

// 上传失败
const handleError = () => {
  Message.error('上传失败，请重试')
}

// 确认上传逻辑
const confirmReUpload = async () => {
  if (!fileList.value.length) {
    Message.warning('请先选择文件')
    return
  }

  const urls = fileList.value.map(item => item.response?.data?.url).filter(Boolean)
  if (!urls.length) {
    Message.error('未获取到上传结果')
    return
  }

  emit('reupload-success', {
    id: props.id,
    docPath: urls.join(','),
    // typeId: props.typeId,
    // candidateId: props.candidateId
    status: props.status
  })
  handleCancel()
}

// 关闭时重置
const handleCancel = () => {
  fileList.value = []
  emit('close')
}

watch(() => props.visible, (val) => {
  if (!val) fileList.value = []
})
</script>

<style scoped>
.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.upload-button {
  border: 1px dashed #c0c4cc;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}
.upload-text {
  margin-top: 8px;
  font-weight: 500;
}
.upload-hint {
  color: #888;
  font-size: 12px;
}
.confirm-upload-btn {
  width: 100%;
}

</style>

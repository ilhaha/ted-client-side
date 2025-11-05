<template>
  <a-modal v-model:visible="visible" title="作业人员信息导入" :mask-closable="false" :width="600" :footer="false"
    @close="handClose">
    <div class="import-modal-content">
      <a-alert>如果需下载导入模板，请先选择再下载模板。</a-alert>
      <div class="cascader-container">
        <a-form layout="vertical">
          <a-form-item label="作业人员班级" field="classId">
            <a-cascader placeholder="请选择班级" :options="orgCategoryClassOptions" v-model="selectedClass" />
          </a-form-item>
        </a-form>
      </div>

      <div class="action-buttons">
        <a-button type="outline" @click="downloadTemplate" :loading="downloadTemplateLoadding">
          <template #icon>
            <icon-download />
          </template>
          下载模板
        </a-button>
        <!-- 手动选择文件 -->
        <a-space direction="vertical" :style="{ width: '100%' }">
          <a-upload :show-file-list="false" accept=".xlsx" :disabled="!selectedClass" @before-upload="beforeUpload"
            :custom-request="customRequest" />
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getSelectProjectClassByType, downloadImportWorkerTemplate, importWorker } from '@/apis/training/org'
import { Modal } from '@arco-design/web-vue';

const visible = ref(false)
const orgCategoryClassOptions = ref<any[]>([])
const selectedClass = ref<string>('')
const downloadTemplateLoadding = ref(false)

// 自定义上传逻辑
const customRequest = async (options: any) => {
  console.log(options);

  const file = options.fileItem.file
  // 弹出确认框
  Modal.confirm({
    title: '确认导入',
    content: `确定要上传文件「${file.name}」进行导入吗？`,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const response = await importWorker(formData, selectedClass.value)
        Message.success('导入成功')
        visible.value = false
      } catch (error) {
      }
    },
  })
}

// 上传之前校验
const beforeUpload = (file: File) => {
  const isExcel =
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  if (!isExcel) {
    Message.error('只能上传 Excel 文件（.xlsx）')
    return false
  }

  return true
}

// 下载模板
const downloadTemplate = async () => {
  if (!selectedClass.value) {
    Message.error('请选择班级')
    return
  }
  downloadTemplateLoadding.value = true
  try {
    const res = await downloadImportWorkerTemplate(selectedClass.value)
    // 1️ 默认文件名
    let fileName = '作业人员模板.xlsx'

    // 2 从响应头提取文件名
    const disposition = res.headers['content-disposition']
    if (disposition) {
      // 尝试匹配 UTF-8 格式 (filename*=UTF-8''xxx.xlsx)
      const utf8Match = disposition.match(/filename\*=(?:UTF-8'')?([^;]+)/)
      if (utf8Match && utf8Match[1]) {
        fileName = decodeURIComponent(utf8Match[1])
      } else {
        // 尝试匹配普通格式 (filename=xxx.xlsx)
        const asciiMatch = disposition.match(/filename="?([^"]+)"?/)
        if (asciiMatch && asciiMatch[1]) {
          fileName = decodeURIComponent(asciiMatch[1])
        }
      }
    }
    // 3️ 生成 Blob 并下载
    const blob = new Blob([res.data], {
      type: res.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    Message.error('下载模板失败，请稍后重试')
  } finally {
    downloadTemplateLoadding.value = false
  }


}

// 关闭弹窗
const handClose = () => {
  visible.value = false
  selectedClass.value = ''
}

// 打开弹窗
const onOpen = async () => {
  visible.value = true
  const res = await getSelectProjectClassByType(0)
  orgCategoryClassOptions.value = res.data
}


defineExpose({ onOpen })
</script>

<style scoped>
.import-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cascader-container {
  margin: 12px 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}
</style>

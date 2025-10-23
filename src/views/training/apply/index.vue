<template>
  <div class="upload-page">
    <!-- 标题栏：顶部安全区适配 + 视觉强化 -->
    <div class="title-bar">
      <h2 class="page-title">报考资料补正</h2>
    </div>

    <!-- 可滚动上传区域：优化信息层级与间距 -->
    <div class="scroll-container">
      <!-- 报考个人信息：卡片化展示，提升辨识度 -->
      <div class="info-card">
        <div class="info-header">
          <span class="info-tag">个人信息</span>
        </div>
        <div class="info-content">
          <p class="user-name">{{ nickname || '未获取考生信息' }}</p>
          <p class="exam-info">
            {{ planInfoVO.categoryName || '' }} /
            {{ planInfoVO.projectName || '' }}
            <span class="project-code">[{{ planInfoVO.projectCode || '' }}]</span> /
            {{ planInfoVO.examPlanName || '' }}
          </p>
        </div>
      </div>


      <!-- 温馨提示2：报名资格申请表指引 -->
      <div class="tips-card warning-tips">
        <div class="tips-icon">⚠️</div>
        <div class="tips-text">
          请上传报名资格申请表（<span class="format-tag">仅支持PDF、Word格式</span>），且不能提供虚假材料。<br>
          <span class="warning-tag">提供虚假资料者，资料退回后将不可再次申报！</span>
        </div>
      </div>

      <!-- 单独上传：报名资格申请表（PDF/Word专属） -->
      <div class="doc-card form-card">
        <div class="doc-info">
          <span class="doc-name">报名资格申请表</span>
          <span class="upload-count">
            {{ (formFileList || []).length }}/1
          </span>
        </div>

        <div class="upload-wrapper">
          <a-upload list-type="text" :file-list="formFileList" :custom-request="(options) => handleFormUpload(options)"
            @before-remove="handleFormRemove" :disabled="formFileList.length >= 1" accept=".pdf,.doc,.docx" draggable>
          </a-upload>
        </div>
      </div>

      <!-- 温馨提示1：缺漏图片资料指引 -->
      <div class="tips-card">
        <div class="tips-icon">💡</div>
        <div class="tips-text">
          以下为您报考时<span class="highlight">缺少的资料</span>，请按类型补传：
          每种资料至少1张、最多3张，仅支持图片格式。
        </div>
      </div>

      <!-- 资料上传卡片：图片类资料 -->
      <div class="doc-card" v-for="item in unuploadedDocumentTypes" :key="item.id" @mouseenter="cardHovered = item.id"
        @mouseleave="cardHovered = ''">
        <div class="doc-info">
          <span class="doc-name">{{ item.typeName }}</span>
          <span class="upload-count">
            {{ (fileListMap[item.id] || []).length }}/3
          </span>
        </div>

        <div class="upload-wrapper">
          <a-upload list-type="picture-card" :file-list="fileListMap[item.id] || []"
            :custom-request="(options) => handleUpload(options, item, 'image')"
            @before-remove="(file) => handleRemove(file, item)" :accept="'image/*'" image-preview
            :show-remove-icon="true">
            <template #upload-button>
              <div class="upload-btn" :class="{
                disabled: (fileListMap[item.id] || []).length >= 3,
                hover: cardHovered === item.id && (fileListMap[item.id] || []).length < 3
              }">
                <IconPlus class="upload-icon" />
                <span class="upload-text">上传</span>
              </div>
            </template>
          </a-upload>

        </div>
      </div>

    </div>

    <!-- 底部按钮：优化固定效果与点击反馈 -->
    <div class="footer">
      <a-button type="primary" size="large" class="confirm-btn" @click="handleConfirm" :disabled="!isAllUploaded">
        确认上传
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, h } from 'vue'
import { useRoute } from 'vue-router'

import { Modal, Message, Input } from '@arco-design/web-vue'

import { uploadWhenInfo } from '@/apis/system/user-center'
import { applyUpload } from '@/apis/File/upload'
import { qrcodeUpload } from '@/apis/document/enrollPreUpload'
const route = useRoute()
const unuploadedDocumentTypes = ref<any[]>([])
const planInfoVO = ref<any>({})
const nickname = ref<string>('')
const fileListMap = reactive<Record<string, any[]>>({})
const form = reactive({ candidateId: '', planId: '' })
const cardHovered = ref('')
// 报名资格申请表专属文件列表（最多1个）
const formFileList = ref<any[]>([])
// 默认文件图标（非图片文件显示）
onMounted(async () => {
  form.candidateId = decodeURIComponent(String(route.query.candidateId || ''))
  form.planId = decodeURIComponent(String(route.query.planId || ''))
  if (form.candidateId && form.planId) {
    const res = await uploadWhenInfo(form.candidateId, form.planId)
    unuploadedDocumentTypes.value = res.data.unuploadedDocumentTypes || []
    planInfoVO.value = res.data.planInfoVO || {}
    nickname.value = res.data.nickname || ''
  } else {
    Message.error('二维码错误，请重新获取')
  }
})

// 计算是否所有资料（图片类+申请表）都已上传
const isAllUploaded = computed(() => {
  // 1. 图片类资料全部上传（每种至少1张）
  const isImageAllUploaded = unuploadedDocumentTypes.value.every(item =>
    (fileListMap[item.id] || []).length >= 1
  )
  // 2. 报名资格申请表已上传（至少1张）
  const isFormUploaded = formFileList.value.length >= 1
  // 两者都满足才启用确认按钮
  return isImageAllUploaded && isFormUploaded
})

// 图片类资料上传
const handleUpload = async (options: any, item: any, type: string) => {
  const file = options.fileItem.file
  // 格式校验（图片类）
  if (type === 'image' && !file.type.startsWith('image/')) {
    Message.warning(`${item.typeName} 仅支持图片格式`)
    options.onError?.()
    return
  }
  // 数量校验
  if ((fileListMap[item.id] || []).length >= 3) {
    Message.warning(`${item.typeName} 最多只能上传3张文件`)
    options.onError?.()
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await applyUpload(formData);
    if (res.data) {
      Message.success(`${item.typeName} 上传成功`)
      options.onSuccess?.()
      if (!fileListMap[item.id]) fileListMap[item.id] = []
      fileListMap[item.id].push({
        uid: options.fileItem.uid,
        url: res.data.url,
        name: file.name,
      })
    } else {
      options.onError?.()
      Message.error('上传失败，请重试')
    }
  } catch (error) {
    options.onError?.()
    Message.error('上传出错，请重试')
  }
}

// 报名资格申请表上传（单独处理）
const handleFormUpload = async (options: any) => {
  const file = options.fileItem.file

  const fileExt = file.name.split('.').pop()?.toLowerCase()
  // 格式校验（仅PDF/Word）
  if (!['pdf', 'doc', 'docx'].includes(fileExt || '')) {
    Message.warning('报名资格申请表仅支持PDF、Word格式')
    options.onError?.()
    return
  }

  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await applyUpload(formData);
    if (res.data) {
      Message.success('报名资格申请表上传成功')
      options.onSuccess?.()
      formFileList.value.push({
        uid: options.fileItem.uid,
        name: file.name,
        url: res.data.url,
      })
    } else {
      options.onError?.()
      Message.error('上传失败，请重试')
    }
  } catch (error) {
    options.onError?.()
    Message.error('上传出错，请重试')
  }
}

// 图片类资料删除
const handleRemove = (file: any, item: any) => {
  fileListMap[item.id] = (fileListMap[item.id] || []).filter(
    (f) => f.uid !== file.uid
  )
}

// 报名资格申请表删除
const handleFormRemove = (file: any) => {
  // 直接过滤掉要删除的文件，重新赋值触发响应式
  formFileList.value = formFileList.value.filter(f => f.uid !== file.uid)
}

const idInput = ref('')

const handleConfirm = async () => {
  if (!isAllUploaded.value) {
    Message.warning('请先完成所有资料的上传（图片类每种至少1张，申请表至少1张）')
    return
  }

  idInput.value = ''

  const IdModalContent = {
    setup() {
      return () =>
        h('div', { style: 'padding:16px; display:flex; flex-direction:column; gap:8px; background:#f9fafb; border-radius:8px;' }, [
          h('label', { style: 'font-weight:500; color:#1d2129; font-size:14px;' }, '请输入身份证后六位：'),
          h(Input, {
            type: 'password',
            maxlength: 6,
            placeholder: '输入6位数字',
            modelValue: idInput.value,
            'onUpdate:modelValue': (val: string) => { idInput.value = val },
            style: 'width:100%; padding:8px; border-radius:6px; border:1px solid #e5e6eb;'
          })
        ])
    }
  }

  Modal.confirm({
    title: '身份验证',
    content: () => h(IdModalContent),
    okText: '提交',
    cancelText: '取消',
    maskClosable: false,
    onBeforeOk: async () => {
      if (!idInput.value || idInput.value.length != 6) {
        Message.error('请输入正确的身份证后六位')
        return false  // 阻止关闭
      }

      try {
        await submitAllFiles(idInput.value)
        Message.success('上传成功')
        return true
      } catch (err) {
        return false
      }
    }
  })

}

const submitAllFiles = async (idLastSix: string) => {
  await qrcodeUpload({
    candidateId: form.candidateId,
    planId: form.planId,
    idLastSix: idLastSix,
    docFileList: Object.entries(fileListMap).map(([typeId, files]) => ({
      typeId,
      urls: files.map(f => f.url)
    })),
    qualificationFileUrl: formFileList.value[0]?.url || ''
  })
  Message.success('资料上传成功！')
}
</script>

<style scoped>
/* 页面基础样式 */
.upload-page {
  display: flex;
  flex-direction: column;
  padding: 0;
  font-size: 14px;
  background-color: #f9fafb;
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 标题栏 */
.title-bar {
  width: 100%;
  padding: 16px 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  color: #1d2129;
  margin: 0;
}

/* 滚动容器 */
.scroll-container {
  flex: 1;
  width: 100%;
  padding: 0 16px;
  overflow-y: auto;
  box-sizing: border-box;
  scroll-behavior: smooth;
  padding-bottom: 90px;
}

/* 滚动条美化 */
.scroll-container::-webkit-scrollbar {
  width: 4px;
}

.scroll-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 2px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: #c9c9c9;
  border-radius: 2px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 报考信息卡片 */
.info-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.info-header {
  margin-bottom: 12px;
}

.info-tag {
  font-size: 12px;
  color: #6e7191;
  font-weight: 500;
  padding: 2px 8px;
  background-color: #f2f3f5;
  border-radius: 8px;
}

.info-content {
  line-height: 1.6;
}

.user-name {
  color: #1d2129;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.exam-info {
  color: #4e5969;
  margin: 0;
  word-break: break-all;
}

.project-code {
  color: #165dff;
  font-weight: 500;
}

/* 温馨提示卡片 */
.tips-card {
  background: #edf2ff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 申请表提示用橙色背景，增强警示 */
.tips-card.warning-tips {
  background: #fff8f0;
  border-left: 4px solid #ff7d00;
}

.tips-icon {
  font-size: 18px;
  margin-top: 1px;
}

.tips-card.warning-tips .tips-icon {
  color: #ff7d00;
}

.tips-text {
  color: #1d2129;
  line-height: 1.5;
  flex: 1;
}

.tips-text .highlight {
  color: #165dff;
  font-weight: 500;
}

.tips-text .format-tag {
  color: #165dff;
  font-weight: 500;
}

.tips-text .warning-tag {
  color: #f53f3f;
  font-weight: 500;
}

/* 资料上传卡片（通用） */
.doc-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

/* 申请表卡片单独样式 */
.doc-card.form-card {
  margin-top: 8px;
}

.doc-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.doc-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.doc-name {
  font-weight: 500;
  font-size: 15px;
  color: #1d2129;
}

.upload-count {
  font-size: 12px;
  color: #6e7191;
  background-color: #f2f3f5;
  padding: 3px 10px;
  border-radius: 12px;
  transition: background-color 0.3s;
}

.doc-card:hover .upload-count {
  background-color: #e8ebf0;
}

/* 上传区域（通用） */
.upload-wrapper {
  width: 100%;
}

.upload-component {
  --upload-item-margin-right: 12px;
  --upload-item-margin-bottom: 12px;
}

/* 图片类上传按钮 */
.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #86909c;
  width: 80px;
  height: 80px;
  background-color: #f7f8fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.upload-btn.hover {
  background-color: #edf2ff;
  color: #165dff;
  transform: translateY(-2px);
}

.upload-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f7f8fa;
  color: #86909c;
  transform: none;
}

.upload-icon {
  font-size: 20px;
  margin-right: 6px;
}

.upload-text {
  font-size: 12px;
}

/* 申请表上传按钮 */
.form-upload-btn {
  background-color: #f7f8fa;
  color: #86909c;
  border-color: #e5e6eb;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.3s;
}

.form-upload-btn:hover:not(:disabled) {
  background-color: #edf2ff;
  color: #165dff;
  border-color: #c9d5ff;
}

/* 申请表文件列表样式 */
.form-file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
  margin-top: 8px;
  gap: 12px;
}

.form-file-item .file-icon {
  color: #165dff;
  font-size: 18px;
}

.form-file-item .file-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1d2129;
}

.form-file-item .file-size {
  color: #6e7191;
  font-size: 12px;
}

.form-file-item .file-remove {
  color: #86909c;
  cursor: pointer;
  transition: color 0.3s;
}

.form-file-item .file-remove:hover {
  color: #f53f3f;
}

/* 底部按钮 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f9fafb;
  padding: 12px 16px;
  box-sizing: border-box;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #f0f0f0;
}

.confirm-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  background-color: #165dff;
  border-color: #165dff;
  transition: all 0.3s;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #0e4bdb;
  border-color: #0e4bdb;
  transform: translateY(-1px);
}

.confirm-btn:disabled {
  background-color: #c9d1e0;
  border-color: #c9d1e0;
  color: #fff;
  cursor: not-allowed;
}

/* 小屏手机适配 */
@media (max-width: 375px) {
  .upload-btn {
    width: 70px;
    height: 70px;
  }

  .form-file-item {
    flex-wrap: wrap;
    gap: 8px;
  }

  .form-file-item .file-size {
    width: 100%;
    margin-top: -4px;
  }

  .confirm-btn {
    height: 44px;
    font-size: 15px;
  }

  .tips-text {
    font-size: 13px;
  }
}
</style>
<template>
    <div>
        <div v-if="isShow" class="upload-page">
            <div class="title-bar">
                <h2 class="page-title">考试缴费凭证补正</h2>
            </div>
            <div class="scroll-container">
                <div class="info-card">
                    <div class="info-header">
                        <span class="nickname">{{ paymentInfo.nickname }}</span>
                        <span class="info-tag">报名信息</span>
                    </div>
                    <div class="info-content">
                        <p class="exam-info">
                            {{ paymentInfo.categoryName || '' }} /
                            {{ paymentInfo.projectName || '' }} /
                            {{ paymentInfo.className }}
                        </p>
                        <p class="exam-info">
                            缴费编号 [<span class="notice-no">{{ paymentInfo.noticeNo || '未生成' }}</span>]
                        </p>
                    </div>
                </div>

                <div v-if="paymentInfo.auditStatus == 0">
                    <div class="tips-card">
                        <div class="tips-icon">💡</div>
                        <div class="tips-text">
                            请先核对个人信息和缴费编号无误后，再上传
                            <span class="highlight">缴费凭证</span>：
                            至少上传1张、最多3张，仅支持图片格式。
                        </div>
                    </div>
                    <div class="doc-card" @mouseenter="cardHovered = 'payment'" @mouseleave="cardHovered = ''">
                        <div class="doc-info">
                            <span class="doc-name">缴费凭证</span>
                            <span class="upload-count">
                                {{ (fileList || []).length }}/3
                            </span>
                        </div>

                        <div class="upload-wrapper">
                            <a-upload list-type="picture-card" :file-list="fileList || []"
                                :custom-request="(options) => handleUpload(options, 'image')"
                                @before-remove="(file) => handleRemove(file)" :accept="'image/*'" image-preview
                                :show-remove-icon="true" capture="environment">
                                <template #upload-button>
                                    <div class="upload-btn" :class="{
                                        disabled: (fileList || []).length >= 3,
                                        hover: cardHovered === 'payment' && (fileList || []).length < 3
                                    }">
                                        <IconPlus class="upload-icon" />
                                        <span class="upload-text">上传</span>
                                    </div>
                                </template>
                            </a-upload>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="tips-card" v-if="paymentInfo.auditStatus == 1 || paymentInfo.auditStatus == 4">
                        <div class="tips-icon">ℹ️</div>
                        <div class="tips-text">
                            您的缴费凭证已成功提交，正在审核中，请耐心等待审核结果。
                        </div>
                    </div>
                    <div class="tips-card" v-if="paymentInfo.auditStatus == 2">
                        <div class="tips-icon">✅</div>
                        <div class="tips-text">
                            您的缴费凭证已审核已通过，请关注考试内容及安排，按时准备考试。
                        </div>
                    </div>
                    <div class="tips-card" v-if="paymentInfo.auditStatus == 3">
                        <div class="tips-icon">⚠️</div>
                        <div class="tips-text">
                            您提交的缴费凭证审核未通过，具体原因如下：<br>
                            <span>{{ paymentInfo.rejectReason }}</span>
                        </div>
                    </div>
                    <div class="doc-card" @mouseenter="cardHovered = 'payment'" @mouseleave="cardHovered = ''">
                        <div class="doc-info">
                            <span class="doc-name">缴费凭证</span>
                            <span class="upload-count">
                                {{ (fileList || []).length }}/3
                            </span>
                        </div>

                        <div class="upload-wrapper" style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <a-image v-for="(path, index) in fileList" :key="index" :src="path" width="80" height="80"
                                style="object-fit: cover;" :preview="{ visible: true }" />
                        </div>

                    </div>
                </div>
            </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh;" v-else>
            <a-empty description="二维码无效或参数缺失" />
        </div>
        <div class="footer">
            <a-button type="primary" size="large" class="confirm-btn" :disabled="fileList.length == 0"
                @click="openPhoneVerifiedModel" v-if="paymentInfo.auditStatus == 0">
                确认提交
            </a-button>
            <a-button type="primary" size="large" class="confirm-btn" @click="restUpload"
                v-if="paymentInfo.auditStatus == 3">
                重新提交
            </a-button>
        </div>
        <a-modal v-model:visible="phoneVerifiedModel" :mask-closable="false" :width="400" draggable :footer="false"
            :closable="false">
            <template #title>
                身份认证
            </template>
            <div>
                <a-form ref="phoneVerifiedRef" class="login-form" :rules="phoneVerifiedRules" :model="phoneVerifiedForm"
                    :style="{ width: '350px' }" @submit="phoneVerifiedSubmit">
                    <a-form-item field="phone" label="手机号" validate-trigger="blur">
                        <a-input v-model="phoneVerifiedForm.phone" :max-length="11" placeholder="请输入手机号" allow-clear />
                    </a-form-item>
                    <a-form-item field="captcha" label="验证码">
                        <a-input v-model="phoneVerifiedForm.captcha" :max-length="4" placeholder="请输入验证码" allow-clear />
                        <a-button class="captcha-btn" :loading="captchaLoading" :disabled="captchaDisable" size="large"
                            style="margin-left: 10px;" @click="onCaptcha">
                            {{ captchaBtnName }}
                        </a-button>
                    </a-form-item>
                    <a-form-item>
                        <a-space>
                            <a-button @click="cancelPhoneVerified">取消</a-button>
                            <a-button type="primary" :loading="loading" html-type="submit">确认</a-button>
                        </a-space>
                    </a-form-item>
                    <Verify ref="verifyRef" :captcha-type="captchaType" :mode="captchaMode"
                        :img-size="{ width: '330px', height: '155px' }" @success="getCaptcha" />
                </a-form>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { getPaymentInfoByQrcode, paymentAuditConfirm } from '@/apis/exam/examineePaymentAudit'
import { applyUpload } from '@/apis/File/upload'
import { encryptByRsa } from '@/utils/encrypt'
import { getPaySmsCaptchaStatus, getPaySmsCaptcha } from '@/apis/common/captcha'
import * as Regexp from '@/utils/regexp'

const route = useRoute()
const classId = ref('')
const candidateId = ref('')
const enrollId = ref('')
const planId = ref('')
const isShow = ref(false)
const paymentInfo = ref<any>({
    id: 0,
    noticeNo: '',
    paymentProofUrl: '',
    auditStatus: 0,
    rejectReason: '',
    className: '',
    projectName: '',
    projectCode: '',
    categoryName: '',
    nickname: ''
})
const cardHovered = ref('');
const fileList = ref<any[]>([])
const phoneVerifiedModel = ref(false)
const loading = ref(false)
// 点击验证码动画
const captchaLoading = ref(false)
// 验证码按钮
const captchaDisable = ref(false)
const captchaTimer = ref()
// 下次获取验证码等待时间
const verifyRef = ref<InstanceType<any>>()
const captchaTime = ref(60)
const captchaType = ref('blockPuzzle')
const captchaMode = ref('pop')
const phoneVerifiedRef = ref(null)
const captchaBtnName = ref('获取验证码')
// 手机号验证数据
const phoneVerifiedForm = reactive({
    phone: '',
    captcha: '',
})

const auditStatus = ref(1)


// 表单验证规则
const phoneVerifiedRules = {
    phone: [
        { required: true, message: '请输入手机号' },
        { match: Regexp.Phone, message: '请输入正确的手机号' },
    ],
    captcha: [{ required: true, message: '请输入验证码' }],
}
// 重新提交
const restUpload = () => {
    Modal.confirm({
        title: '确认重新上传？',
        content: '重新上传将清空已提交的缴费凭证，是否继续？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
            auditStatus.value = 4
            fileList.value = []
            paymentInfo.value.auditStatus = 0
        },
    })
}

// 提交表单确认上传
const phoneVerifiedSubmit = async ({ values, errors }) => {
    try {
        if (errors) {
            return
        }
        loading.value = true
        const data = {
            phone: encryptByRsa(values.phone),
        }
        const res = await getPaySmsCaptchaStatus(data.phone, values.captcha)
        if (!res.data) {
            Message.error('验证码错误')
            return
        }
        // 保存
        const confirmRes = await paymentAuditConfirm({
            id: paymentInfo.value.id,
            paymentProofUrl: fileList.value.map(file => file.response?.url || file.url).join(','),
            auditStatus: auditStatus.value
        })
        if (confirmRes.data) {
            Message.success("提交成功")
            initInfo({
                classId: classId.value,
                candidateId: candidateId.value,
                enrollId: enrollId.value,
                planId: planId.value
            });
            phoneVerifiedModel.value = false
        }
    } catch (error) {
        if (error.message == '您已提交过缴费凭证，请勿重复提交！') {
            initInfo({
                classId: classId.value,
                candidateId: candidateId.value,
                enrollId: enrollId.value,
                planId: planId.value
            });
            phoneVerifiedModel.value = false
        }
    } finally {
        loading.value = false
    }
}
// 弹出行为验证码
const onCaptcha = async () => {
    if (captchaLoading.value) return
    const isInvalid = await phoneVerifiedRef.value?.validateField('phone')
    if (isInvalid) return
    // 重置行为参数
    verifyRef.value.instance.refresh()
    verifyRef.value.show()
}

const resetForm = () => {
    Object.assign(phoneVerifiedForm, {
        phone: '',
        captcha: '',
    })
}

// 获取验证码
const getCaptcha = async (captchaReq: BehaviorCaptchaReq) => {
    try {
        captchaLoading.value = true
        captchaBtnName.value = '发送中...'
        // 这里需要调用接口获取验证码
        await getPaySmsCaptcha(phoneVerifiedForm.phone, captchaReq, candidateId.value)
        captchaLoading.value = false
        captchaDisable.value = true
        captchaBtnName.value = `获取验证码(${(captchaTime.value -= 1)}s)`
        Message.success('短信发送成功')
        captchaTimer.value = window.setInterval(() => {
            captchaTime.value -= 1
            captchaBtnName.value = `获取验证码(${captchaTime.value}s)`
            if (captchaTime.value <= 0) {
                resetCaptcha()
            }
        }, 1000)
    } catch (e) {
        resetCaptcha()
    } finally {
        captchaLoading.value = false
    }
}

// 重置验证码
const resetCaptcha = () => {
    window.clearInterval(captchaTimer.value)
    captchaTime.value = 60
    captchaBtnName.value = '获取验证码'
    captchaDisable.value = false
}


// 关闭手机验证 弹窗
const cancelPhoneVerified = () => {
    resetForm()
    phoneVerifiedRef.value.resetFields()
    phoneVerifiedModel.value = false
}

const openPhoneVerifiedModel = () => {
    phoneVerifiedModel.value = true
}


// 图片类资料上传
const handleUpload = async (options: any, type: string) => {
    const file = options.fileItem.file
    // 格式校验（图片类）
    if (type === 'image' && !file.type.startsWith('image/')) {
        Message.warning(`仅支持图片格式`)
        options.onError?.()
        return
    }
    // 数量校验
    if ((fileList.value || []).length >= 3) {
        Message.warning(`最多只能上传3张图片`)
        options.onError?.()
        return
    }

    const formData = new FormData()
    formData.append('file', file)
    const res = await applyUpload(formData);
    if (res.data) {
        Message.success(`上传成功`)
        options.onSuccess?.()
        fileList.value.push({
            uid: options.fileItem.uid,
            url: res.data.url,
            name: file.name,
        })
    } else {
        options.onError?.()
    }
}
// 图片类资料删除
const handleRemove = (file: any) => {
    if (!fileList.value) return;
    const index = fileList.value.findIndex(item => item.uid === file.uid);
    if (index !== -1) {
        fileList.value.splice(index, 1);
    }
}

const initInfo = async (data: any) => {
    try {
        const res = await getPaymentInfoByQrcode(data);
        if (res.data) {
            paymentInfo.value = res.data
            const fileListStr = paymentInfo.value.paymentProofUrl
            if (fileListStr && paymentInfo.value.auditStatus != 0) {
                fileList.value = fileListStr.split(',')
            }
        } else {
            isShow.value = false
        }
    } catch (error) {
        isShow.value = false
    }
}
onMounted(() => {
    try {
        const query = route.query
        // 解码参数
        classId.value = query.classId ? decodeURIComponent(String(query.classId)) : ''
        candidateId.value = query.candidateId ? decodeURIComponent(String(query.candidateId)) : ''
        enrollId.value = query.enrollId ? decodeURIComponent(String(query.enrollId)) : ''
        planId.value = query.planId ? decodeURIComponent(String(query.planId)) : ''

        const hasAllParams = classId.value && candidateId.value && enrollId.value && planId.value
        isShow.value = hasAllParams

        if (!hasAllParams) {
            Message.error('二维码已被篡改或参数缺失，请重新获取')
        }
        initInfo({
            classId: classId.value,
            candidateId: candidateId.value,
            enrollId: enrollId.value,
            planId: planId.value
        });
    } catch (e) {
        Message.error('二维码解析失败，请重新扫描')
    }
})
</script>

<style scoped>
.status-text {
    font-weight: 500;
    font-size: 14px;
}

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
    padding: 0 10px;
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
    display: flex;
    justify-content: space-between;
    /* 左右分开 */
    align-items: center;
    /* 垂直居中 */
    margin-bottom: 10px;
}

.nickname {
    font-size: 14px;
    font-weight: 500;
    color: #333;
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

.payment-info {
    margin-top: 10px;
    font-size: 16px;
    color: #333;
}

.notice-no {
    color: #165dff;
    font-weight: 500;
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

/deep/ .arco-form-item-content-flex {
    justify-content: end
}

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

.tips-card.idCard-warning-tips {
    background: #f0f8ff;
    border-left: 4px solid #1890ff;
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

.doc-card-id {
    background: #fff;
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.3s ease, transform 0.2s ease;
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    gap: 24px;
    flex-wrap: nowrap;
}

.upload-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.doc-info-id {
    margin-bottom: 8px;
    text-align: center;
}

.doc-name-id {
    font-size: 14px;
    color: #1d2129;
    font-weight: 500;
}

.upload-wrapper-id {
    width: 100%;
}

.upload-btn-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 120px;
    border: 1px dashed #c0c4cc;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.upload-btn-icon:hover {
    border-color: #3b82f6;
    background-color: #f0f7ff;
}

.icon {
    font-size: 24px;
    color: #9ca3af;
    margin-bottom: 6px;
}

.upload-tip {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
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
</style>

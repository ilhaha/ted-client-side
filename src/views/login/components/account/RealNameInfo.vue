<template>
    <a-modal v-model:visible="visible" :mask-closable="false" :width="700" draggable :footer="false">
        <template #title>实名认证</template>

        <a-form layout="vertical">
            <!-- 身份证号 -->
            <a-form-item label="身份证号（用户名）" required>
                <a-input v-model="idNumber" placeholder="请输入身份证号" maxlength="18" disabled />
            </a-form-item>

            <!-- 上传身份证 -->
            <a-row :gutter="[16, 16]">
                <a-col :span="12">
                    <a-form-item label="身份证正面（人像面）" required extra="需清晰展示头像、姓名、身份证号">
                        <a-upload :action="`${uploadUrl}1`" list-type="picture-card" :file-list="frontFileList"
                            :show-upload-list="false" accept="image/jpeg,image/png,image/jpg"
                            @success="handleFrontSuccess" image-preview>
                            <img v-if="form.idCardPhotoFront" :src="form.idCardPhotoFront" alt="front"
                                style="width: 100%; height: auto;" />
                            <div v-else>
                                <plus-outlined />
                                <div style="margin-top: 8px;">上传正面</div>
                            </div>
                        </a-upload>
                    </a-form-item>
                </a-col>

                <a-col :span="12">
                    <a-form-item label="身份证反面（国徽面）" required extra="需清晰展示国徽和签发机关">
                        <a-upload :action="`${uploadUrl}0`" list-type="picture-card" :file-list="backFileList"
                            :show-upload-list="false" accept="image/jpeg,image/png,image/jpg"
                            @success="handleBackSuccess" image-preview>
                            <img v-if="form.idCardPhotoBack" :src="form.idCardPhotoBack" alt="back"
                                style="width: 100%; height: auto;" />
                            <div v-else>
                                <plus-outlined />
                                <div style="margin-top: 8px;">上传反面</div>
                            </div>
                        </a-upload>
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- 提交按钮 -->
            <div style="text-align: center; margin-top: 20px;">
                <a-button @click="handleCancel">取消</a-button>
                <a-button style="margin-left: 12px" type="primary" @click="submitForm">提交认证</a-button>
            </div>

            <!-- 温馨提示 -->
            <div style="color: #999; font-size: 13px; margin-top: 16px; text-align: center;">
                请确保上传的身份证照片清晰可辨，不得使用他人证件。<br />
                上传的身份证照片必须与上述身份证号 <strong>{{ idNumber }}</strong> 一致。实名认证信息仅用于考试报名等验证。
            </div>
        </a-form>
    </a-modal>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { saveExamIdcard } from "@/apis/exam/examIdcard"

const visible = ref(false)
const idNumber = ref('')
const uploadUrl = `${import.meta.env.VITE_API_PREFIX}/upload/file/idCard/`

const form = ref({
    realName: '',
    gender: '',
    nation: '',
    birthDate: '',
    address: '',
    idCardNumber: '',
    issuingAuthority: '',
    validStartDate: '',
    validEndDate: '',
    idCardPhotoFront: '',
    idCardPhotoBack: '',
})

const frontFileList = ref<any[]>([])
const backFileList = ref<any[]>([])


// 上传成功处理
const handleFrontSuccess = (file: any) => {
    const res = file.response
    if (res?.code !== "0") {
        Message.error(res?.msg || '上传失败')
        form.value.idCardPhotoFront = ''
        frontFileList.value = []
        return
    }
    form.value.idCardPhotoFront = res.data.url
    frontFileList.value = [file]
    const data = res.data
    form.value.realName = data.realName || ''
    form.value.gender = data.gender || ''
    form.value.nation = data.nation || ''
    form.value.birthDate = data.birthDate || ''
    form.value.address = data.address || ''
    form.value.idCardNumber = data.idCardNumber || ''
    Message.success('身份证正面上传成功')
}

const handleBackSuccess = (file: any) => {
    const res = file.response
    if (res?.code !== "0") {
        Message.error(res?.msg || '上传失败')
        form.value.idCardPhotoBack = ''
        backFileList.value = []
        return
    }
    form.value.idCardPhotoBack = res.data.url
    backFileList.value = [file]
    const data = res.data
    form.value.issuingAuthority = data.issuingAuthority || ''
    form.value.validStartDate = data.validStartDate || ''
    form.value.validEndDate = data.validEndDate || ''
    Message.success('身份证反面上传成功')
}

// 关闭弹窗重置
const resetForm = () => {
    form.value = {
        realName: '',
        gender: '',
        nation: '',
        birthDate: '',
        address: '',
        idCardNumber: '',
        issuingAuthority: '',
        validStartDate: '',
        validEndDate: '',
        idCardPhotoFront: '',
        idCardPhotoBack: '',
    }
    frontFileList.value = []
    backFileList.value = []
    idNumber.value = ''
}

// 取消按钮
const handleCancel = () => {
    visible.value = false
    resetForm()
}

// 提交
const submitForm = async () => {
    if (!form.value.idCardPhotoFront || !form.value.idCardPhotoBack) {
        Message.error('请上传身份证正反面照片')
        return
    }
    if (form.value.idCardNumber != idNumber.value) {
        Message.error('上传的身份证信息与用户名不匹配')
        return
    }
    const res = await saveExamIdcard(form.value)
    if (res?.code === "0") {
        Message.success('实名认证提交成功，请重新登录')
        visible.value = false
        resetForm()
    }
}

// 打开弹窗
const onOpen = (username: string) => {
    idNumber.value = username
    visible.value = true
}

defineExpose({ onOpen })
</script>
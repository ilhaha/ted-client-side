<template>
  <a-modal v-model:visible="visible" title="解析结果" :mask-closable="false" width="90%" :footer="false" :closable="false">
    <div class="import-modal-content">
      <!-- 顶部提示 -->
      <a-alert type="info" :closable="false" class="alert-box">
        《{{ improtFileName }}》文件共解析出 <b>{{ successList.length + failedList.length }}</b> 条数据。
        正常数据 <b>{{ successList.length }}</b> 条，
        存在问题的数据 <b>{{ failedList.length }}</b> 条，请查看下方详情。
      </a-alert>

      <!-- 成功数据 -->
      <div class="section">
        <div class="section-header">
          <span class="section-subtitle">以下数据将被导入系统，请确认无误后提交</span>
        </div>

        <a-table :columns="successColumns" :data="successList" :bordered="true" :scroll="{ x: 'max-content' }"
          :pagination="{ pageSize: 5 }" class="data-table">
          <template #idCard="{ record }">
            <a-space wrap>
              <a-image width="80" height="60" :src="record.idCardPhotoFront" :preview-props="{ zoomRate: 1.5 }"
                class="preview-image" fit="cover" @error="handleImageError" />
              <a-image width="80" height="60" :src="record.idCardPhotoBack" :preview-props="{ zoomRate: 1.5 }"
                class="preview-image" fit="cover" @error="handleImageError" />
            </a-space>
          </template>
          <template #facePhoto="{ record }">
            <a-space wrap>
              <a-image width="80" height="60" :src="record.facePhoto" :preview-props="{ zoomRate: 1.5 }"
                class="preview-image" fit="cover" @error="handleImageError" />
            </a-space>
          </template>

          <!-- 动态图片列 -->
          <template v-for="key in docKeys" #[key]="{ record }" :key="key">
            <a-space wrap>
              <a-image v-for="(path, index) in record.docMap[key]?.split(',')" :key="index" width="80" height="60"
                :src="path" :preview-props="{ zoomRate: 1.5 }" class="preview-image" fit="cover"
                @error="handleImageError" />
            </a-space>
          </template>

          <!-- 预览链接 -->
          <template #qualificationPath="{ record }">
            <a-link v-permission="['worker:workerApply:detail']" title="预览"
              @click="getPreviewUrl(record.qualificationPath)">
              预览
            </a-link>
          </template>

          <!-- 是否导入 -->
          <template #action="{ record }">
            <a-switch v-model="record.isUpload">
              <template #checked>是</template>
              <template #unchecked>否</template>
            </a-switch>
          </template>
        </a-table>
      </div>

      <!-- 错误数据 -->
      <div class="section error-section">
        <div class="section-header">
          <span class="section-subtitle">检测到以下数据存在异常，请根据提示修改后重新导入。</span>
        </div>

        <a-table :columns="failedColumns" :data="failedList" :bordered="true" :scroll="{ x: 'max-content' }"
          :pagination="{ pageSize: 5 }" class="data-table" />
      </div>

      <div class="footer-actions">
        <a-space>
          <a-popconfirm content="请确保已提交所选数据，并已下载错误信息，否则关闭后经文件解析得到的数据会丢失。确定要关闭吗？" ok-text="确认关闭" cancel-text="取消"
            @ok="handClose">
            <a-button>关闭</a-button>
          </a-popconfirm>
          <a-button v-if="failedList.length" type="outline" status="warning" @click="downloadFailedList">
            下载错误信息
          </a-button>
          <a-popconfirm content="确认是否提交您所选的数据？" ok-text="确认" cancel-text="取消" @ok="handleImport">
            <a-button type="primary" status="success" :disabled="!successList.length">
              确认导入
            </a-button>
          </a-popconfirm>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { isMobile } from '@/utils'
import { orgImport } from '@/apis/worker/workerApply'

const visible = ref(false)
const successList = ref<any[]>([])
const failedList = ref<any[]>([])
const docKeys = ref<string[]>([])

const props = defineProps<{
  improtFileName: string
}>()

// 成功列表列配置
const successColumns = ref<any[]>([
  { title: '姓名', dataIndex: 'candidateName', slotName: 'candidateName' },
  { title: '性别', dataIndex: 'gender', slotName: 'gender' },
  { title: '手机号', dataIndex: 'phone', slotName: 'phone' },
  { title: '身份证', dataIndex: 'idCard', slotName: 'idCard' },
  { title: '一寸免冠照', dataIndex: 'facePhoto', slotName: 'facePhoto' },
  { title: '报名资格申请表', dataIndex: 'qualificationPath', slotName: 'qualificationPath' }
])

// 失败列表列配置
const failedColumns = [
  { title: 'Excel行号', dataIndex: 'rowNum', slotName: 'rowNum' },
  { title: '姓名', dataIndex: 'excelName', slotName: 'excelName' },
  { title: '手机号', dataIndex: 'phone', slotName: 'phone' },
  { title: '错误信息', dataIndex: 'errorMessage', slotName: 'errorMessage' },
]
const handClose = () => {
  visible.value = false
  successColumns.value = [
    { title: '姓名', dataIndex: 'candidateName', slotName: 'candidateName' },
    { title: '性别', dataIndex: 'gender', slotName: 'gender' },
    { title: '手机号', dataIndex: 'phone', slotName: 'phone' },
    { title: '身份证', dataIndex: 'idCard', slotName: 'idCard' },
    { title: '一寸免冠照', dataIndex: 'facePhoto', slotName: 'facePhoto' },
    { title: '报名资格申请表', dataIndex: 'qualificationPath', slotName: 'qualificationPath' }
  ]
}
// 确认导入
const handleImport = async () => {
  const selected = successList.value.filter(i => i.isUpload)
  if (!selected.length) {
    Message.warning('请先选择需要导入的数据')
    return
  }

  const res = await orgImport(selected)
  if (res.data) {
    Message.success(`成功导入 ${selected.length} 条数据！`)

    const importedRowNums = new Set(selected.map(i => i.rowNum))
    successList.value = successList.value.filter(i => !importedRowNums.has(i.rowNum))
  }
}


// 下载错误信息
const downloadFailedList = () => {
  const csv = failedList.value
    .map(item => `${item.rowNum},${item.excelName},${item.phone},${item.errorMessage}`)
    .join('\n')
  const blob = new Blob([`行号,姓名,手机号,错误信息\n${csv}`], {
    type: 'text/csv;charset=utf-8;'
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = props.improtFileName + ' - 解析错误信息.csv'
  link.click()
}

// 打开弹窗并传入解析结果
const onOpen = (successData: any[], failedData: any[]) => {
  successList.value = successData
  failedList.value = failedData
  if (successList.value.length > 0) {
    const docMap = successList.value[0].docMap || {}
    docKeys.value = Object.keys(docMap)
    console.log(docKeys.value);

    // 添加动态列（避免重复添加）
    docKeys.value.forEach((key) => {
      if (!successColumns.value.find((col) => col.dataIndex === key)) {
        successColumns.value.push({
          title: key,
          dataIndex: key,
          slotName: key
        })
      }
    })
  }
  successColumns.value.push({
    title: '确认导入',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
  })
  visible.value = true
}


const getPreviewUrl = (url: string) => {
  if (!url) {
    Message.warning('暂无文件可预览');
    return;
  }
  // 提取文件扩展名
  const ext = url.split('.').pop()?.toLowerCase();
  if (ext == 'pdf') {
    //  PDF 直接在浏览器中预览
    window.open(url, '_blank');
  } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
    //  Office 文件使用微软在线预览
    const previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
    window.open(previewUrl, '_blank');
  } else {
    Message.warning('暂不支持此文件类型预览');
  }
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = "/images/ce853a5576cd3913a87d709a354cdef.png"; // 你的默认图片路径
  img.onerror = null; // 防止默认图片也加载失败时无限循环
};

defineExpose({ onOpen })
</script>

<style scoped>
.import-modal-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 8px;
}

.alert-box {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 6px;
  color: #333;
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
}

.section-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1d2129;
}

.section-subtitle {
  color: #86909c;
  font-size: 13px;
}

.error-section {
  background: #fff;
}

.data-table {
  border-radius: 6px;
  overflow: hidden;
}

.preview-image {
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.15s ease-in-out;
}

.preview-image:hover {
  transform: scale(1.05);
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>

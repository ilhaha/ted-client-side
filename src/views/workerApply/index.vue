<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-select v-model="queryForm.applyType" placeholder="来源" allow-clear class="search-input ml-2" @change="search">
          <a-option :value="0">扫码报考</a-option>
          <a-option :value="1">机构报考</a-option>
        </a-select>
        <a-select v-model="queryForm.status" placeholder="审核状态" allow-clear class="search-input ml-2" @change="search">
          <a-option :value="0">未审核</a-option>
          <a-option :value="1">已通过</a-option>
          <a-option :value="2">未通过</a-option>
          <a-option :value="3">虚假材料</a-option>
        </a-select>
        <a-input-search v-model="queryForm.candidateName" placeholder="请输入作业人员姓名" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>

      </template>
      <template #projectName="{ record }">
        {{ record.categoryName + " / " + record.projectName }}
      </template>
      <template #idCardPhotoFront="{ record }">
        <a-space v-if="record.idCardPhotoFront">
          <a-image width="80" height="60" :src="record.idCardPhotoFront" :preview-props="{ zoomRate: 1.5 }"
            class="preview-image" fit="cover" @error="handleImageError" />
          <a-image width="80" height="60" :src="record.idCardPhotoBack" :preview-props="{ zoomRate: 1.5 }"
            class="preview-image" fit="cover" @error="handleImageError" />
        </a-space>
        <span v-else>-</span>
      </template>
      <template #facePhoto="{ record }">
        <a-space v-if="record.facePhoto">
          <a-image width="80" height="60" :src="record.facePhoto" :preview-props="{ zoomRate: 1.5 }"
            class="preview-image" fit="cover" @error="handleImageError" />
        </a-space>
        <span v-else>-</span>
      </template>
      <template #qualificationPath="{ record }">
        <a-link v-permission="['worker:workerApply:detail']" title="预览报名资格申请表"
          @click="getPreviewUrl(record.qualificationPath)">预览</a-link>
      </template>
      <template v-for="col in docColumns" :key="col.title" #[`doc_${col.title}`]="{ record }">
        <span v-if="record.docMap && record.docMap[col.title]">
          <a-image v-for="(path, index) in record.docMap[col.title].split(',')" :key="index" width="80" height="60"
            :src="path" :preview-props="{ zoomRate: 1.5 }" class="preview-image" fit="cover"
            @error="handleImageError" />
        </span>
        <span v-else>-</span>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template #applyType="{ record }">
        <a-tag :color="getApplyTypeColor(record.applyType)">
          {{ getApplyTypeText(record.applyType) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-popconfirm :content="getConfirmMessage(record.status)" ok-text="确认" cancel-text="取消" @ok="remove(record)">
            <a-link v-permission="['worker:workerApply:delete']">
              {{ getActionTitle(record.status) }}
            </a-link>
          </a-popconfirm>
        </a-space>
      </template>


    </GiTable>

  </div>
</template>

<script setup lang="ts">
import { type WorkerApplyResp, type WorkerApplyQuery, listWorkerApply, deleteWorkerApply } from '@/apis/worker/workerApply'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { Message } from '@arco-design/web-vue'
import { useResetReactive } from '@/hooks'
import { useWindowSize } from '@vueuse/core'


defineOptions({ name: 'WorkerApply' })
const { width } = useWindowSize()
const [form, resetForm] = useResetReactive({
  status: undefined,
  applyType: undefined,
  remark: undefined,
  reviewIds: undefined
})

const queryForm = reactive<WorkerApplyQuery>({
  candidateName: undefined,
  status: undefined,
  applyType: undefined,
  isOrgQuery: true,
  classId: undefined,
  sort: ['id,desc']
})


const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable((page) => listWorkerApply({ ...queryForm, ...page }), { immediate: false })

const baseColumns = ref<TableInstanceColumns[]>([
  { title: '姓名', dataIndex: 'candidateName', slotName: 'candidateName', },
  { title: '性别', dataIndex: 'gender', slotName: 'gender', width: 80 },
  { title: '联系方式', dataIndex: 'phone', slotName: 'phone', width: 120 },
  { title: '报考项目', dataIndex: 'projectName', slotName: 'projectName' },
  { title: '来源', dataIndex: 'applyType', slotName: 'applyType' },
  { title: '身份证号', dataIndex: 'idCardNumber', slotName: 'idCardNumber' },
  { title: '身份证信息', dataIndex: 'idCardPhotoFront', slotName: 'idCardPhotoFront', width: 200 },
  { title: '一寸免冠照', dataIndex: 'facePhoto', slotName: 'facePhoto', width: 120 },
  { title: '资格申请表', dataIndex: 'qualificationPath', slotName: 'qualificationPath' },
])

const fixedColumns = ref<TableInstanceColumns[]>([

  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['worker:workerApply:detail', 'worker:workerApply:update', 'worker:workerApply:delete'])
  }
])

const columns = computed(() => {
  return [
    ...baseColumns.value,
    ...docColumns.value,
    { title: '状态', dataIndex: 'status', slotName: 'status' },
    ...fixedColumns.value
  ]
})


const remove = async (record: WorkerApplyResp) => {
  await deleteWorkerApply(record.id)
  Message.success("操作成功")
}
const onOpen = async (classId: string) => {
  queryForm.classId = classId
  reset()
}

// 重置
const reset = () => {
  queryForm.candidateName = undefined
  queryForm.applyType = undefined
  queryForm.status = undefined
  search()
}


const getPreviewUrl = (url: string) => {
  if (!url) {
    Message.warning('暂无文件可预览');
    return;
  }

  // 提取文件扩展名
  const ext = url.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
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

const getConfirmMessage = (status: number) => {
  switch (status) {
    case 0: return '确定要撤回该申请吗？'
    case 1: return '确定要将该成员移出班级吗？'
    case 2: return '确定要删除该记录吗？'
    case 3: return '确定要作废该条数据吗？'
    default: return '确定要执行该操作吗？'
  }
}

const getActionTitle = (status: number) => {
  switch (status) {
    case 0: // 未审核
      return '撤回申请'
    case 1: // 已通过
      return '移出班级'
    case 2: // 未通过
      return '删除'
    case 3: // 虚假材料
      return '作废'
    default:
      return '操作'
  }
}


const getApplyTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return 'blue'
    case 1:
      return 'orange'
    default:
      return 'gray'
  }
}

const getApplyTypeText = (status: number) => {
  switch (status) {
    case 0:
      return '扫码报考'
    case 1:
      return '机构报考'
    default:
      return ''
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '未审核'
    case 1:
      return '审核通过'
    case 2:
      return '审核不通过'
    case 3:
      return '虚假材料'
    default:
      return ''
  }
}


const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'blue'      // 未持有显示红色
    case 1:
      return 'green'    // 持有未到期显示绿色
    case 2:
      return 'orange'   // 持有已到期显示橙色
    case 3:
      return 'red'     // 即将到期显示蓝色
    default:
      return 'gray'
  }
}
const docColumns = computed(() => {
  const allDocNames = new Set<string>()
  dataList.value.forEach(item => {
    if (item.docMap) {
      Object.keys(item.docMap).forEach(key => allDocNames.add(key))
    }
  })
  return Array.from(allDocNames).map(name => ({
    title: name,
    dataIndex: name,
    slotName: `doc_${name}`
  }))
})


watch(
  () => queryForm.status,
  (val) => {
    const remarkIndex = fixedColumns.value.findIndex(c => c.dataIndex === 'remark')
    const needRemark = val !== 0
    if (needRemark && remarkIndex === -1) {
      fixedColumns.value.splice(0, 0, {
        title: '审核意见',
        dataIndex: 'remark',
        slotName: 'remark'
      })
    } else if (!needRemark && remarkIndex !== -1) {
      fixedColumns.value.splice(remarkIndex, 1)
    }
  },
  { immediate: true }
)



onMounted(async () => {
})

defineExpose({ onOpen })
</script>

<style scoped>
.arco-modal-body {
  padding: 0;
}
</style>

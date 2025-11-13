<template>
  <div class="gi_table_page">
    <GiTable
      title="机构培训价格管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-cascader
          v-model="queryForm.projectId"
          :options="categoryOptions"
          placeholder="请选择考试项目"
          allow-clear
          @change="search"
        />
        <a-button type="primary" @click="search">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button
          v-permission="['training:orgTrainingPrice:add']"
          type="primary"
          @click="onAdd"
        >
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button
          v-permission="['training:orgTrainingPrice:export']"
          @click="onExport"
        >
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <!-- <a-link v-permission="['training:orgTrainingPrice:detail']" title="详情" @click="onDetail(record)">详情</a-link> -->
          <a-link
            v-permission="['training:orgTrainingPrice:update']"
            title="修改"
            @click="onUpdate(record)"
            >修改</a-link
          >
          <a-link
            v-permission="['training:orgTrainingPrice:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <OrgTrainingPriceAddModal
      ref="OrgTrainingPriceAddModalRef"
      @save-success="search"
    />
    <OrgTrainingPriceDetailDrawer ref="OrgTrainingPriceDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import OrgTrainingPriceAddModal from "./OrgTrainingPriceAddModal.vue";
import OrgTrainingPriceDetailDrawer from "./OrgTrainingPriceDetailDrawer.vue";
import {
  type OrgTrainingPriceResp,
  type OrgTrainingPriceQuery,
  deleteOrgTrainingPrice,
  exportOrgTrainingPrice,
  listOrgTrainingPrice,
} from "@/apis/training/orgTrainingPrice";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import {
  type ProjectCategoryVO,
  getSelectCategoryProject,
} from "@/apis/training/org";

defineOptions({ name: "OrgTrainingPrice" });

const queryForm = reactive<OrgTrainingPriceQuery>({
  projectId: undefined,
  orgId: undefined,
  price: undefined,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listOrgTrainingPrice({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: "培训项目", dataIndex: "projectName", slotName: "projectName" },
  { title: "培训价格（元）", dataIndex: "price", slotName: "price" },
  { title: "创建人", dataIndex: "createUserString", slotName: "createUser" },
  { title: "创建时间", dataIndex: "createTime", slotName: "createTime" },
  { title: "更新时间", dataIndex: "updateTime", slotName: "updateTime" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "training:orgTrainingPrice:detail",
      "training:orgTrainingPrice:update",
      "training:orgTrainingPrice:delete",
    ]),
  },
]);

const categoryOptions = ref<ProjectCategoryVO[]>([]);

onMounted(async () => {
  const res = await getSelectCategoryProject();
  categoryOptions.value = res.data;
});

// 重置
const reset = () => {
  queryForm.projectId = undefined;
  queryForm.orgId = undefined;
  queryForm.price = undefined;
  search();
};

// 删除
const onDelete = (record: OrgTrainingPriceResp) => {
  return handleDelete(() => deleteOrgTrainingPrice(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportOrgTrainingPrice(queryForm));
};

const OrgTrainingPriceAddModalRef =
  ref<InstanceType<typeof OrgTrainingPriceAddModal>>();
// 新增
const onAdd = () => {
  OrgTrainingPriceAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: OrgTrainingPriceResp) => {
  OrgTrainingPriceAddModalRef.value?.onUpdate(record.id);
};

const OrgTrainingPriceDetailDrawerRef =
  ref<InstanceType<typeof OrgTrainingPriceDetailDrawer>>();
// 详情
const onDetail = (record: OrgTrainingPriceResp) => {
  OrgTrainingPriceDetailDrawerRef.value?.onOpen(record.id);
};
</script>

<style scoped lang="scss"></style>

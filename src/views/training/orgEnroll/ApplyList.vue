<template>
    <a-modal v-model:visible="visible" title="考试计划报考情况" :mask-closable="false" width="70%" :footer="false">
        <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
            :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
            :disabled-column-keys="['name']" @refresh="search">
            <template #toolbar-left>
                <a-input-search v-model="queryForm.className" placeholder="请输入班级名称" allow-clear @search="search" />
                <a-input-search v-model="queryForm.nickName" placeholder="请输入考生名称" allow-clear @search="search" />

                <a-button @click="reset">
                    <template #icon><icon-refresh /></template>
                    <template #default>重置</template>
                </a-button>
            </template>
            <template #toolbar-right>
                <!--        <a-button v-permission="['exam:enroll:add']" type="primary" @click="onAdd">-->
                <!--          <template #icon><icon-plus /></template>-->
                <!--          <template #default>新增</template>-->
                <!--        </a-button>-->
                <!-- <a-button v-permission="['exam:enroll:export']" @click="onExport">
            <template #icon><icon-download /></template>
            <template #default>导出</template>
          </a-button> -->
            </template>
            <template #action="{ record }">
                <a-space>
                    <a-link v-permission="['exam:enroll:delete']" status="danger" :disabled="record.disabled"
                        :title="record.disabled ? '不可取消报名' : '取消报名'" @click="onDelete(record)">
                        取消报名
                    </a-link>
                </a-space>
            </template>
        </GiTable>
    </a-modal>
</template>

<script setup lang="ts">
import {
    type EnrollResp,
    type EnrollQuery,
    deleteEnroll,
    listEnroll,
} from "@/apis/plan/enroll";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "Enroll" });

const visible = ref(false)

const queryForm = reactive<EnrollQuery>({
    nickName: undefined,
    className: undefined,
    planId: undefined,
    sort: ["te.id,desc"],
});

const openPlanId = ref()

const {
    tableData: dataList,
    loading,
    pagination,
    search,
    handleDelete,
} = useTable((page) => listEnroll({ ...queryForm, ...page }), {
    immediate: false,
});

const columns = ref<TableInstanceColumns[]>([
    { title: "班级名称", dataIndex: "className", slotName: "className" },
    { title: "考生姓名", dataIndex: "nickName", slotName: "nickName" },
    { title: "报名时间", dataIndex: "createTime", slotName: "createTime" },
    {
        title: "操作",
        dataIndex: "action",
        slotName: "action",
        width: 160,
        align: "center",
        fixed: !isMobile() ? "right" : undefined,
        show: has.hasPermOr([
            "exam:enroll:delete",
        ]),
    },
]);

// 重置
const reset = () => {
    queryForm.nickName = undefined;
    queryForm.className = undefined
    queryForm.planId = openPlanId.value
    search();
};

// 删除
const onDelete = (record: EnrollResp) => {
    return handleDelete(() => deleteEnroll(record.id), {
        content: `是否确定取消报名该条数据？`,
        showModal: true,
        successTip: '已取消'
    });
};

const onOpen = async (planId: string) => {
    queryForm.planId = planId
    openPlanId.value = planId
    search()
    visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
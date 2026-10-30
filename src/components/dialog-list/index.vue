<script setup lang="ts">
import type { ColumnsItem } from '@/components/table-entity/index.type';

import { computed, ref, watch } from 'vue';

import { useVbenModal } from '@/runtime/modal';

import TableEntlty from '@/components/table-entity/index.vue';
import { Search } from '@element-plus/icons-vue';
import { useQuery } from '@tanstack/vue-query';

import { $t as t } from '@/runtime/i18n';

/** ****************************** 类型 ********************************/

type DialogListFetchParams = {
  keyword?: string;
  page: number;
  per_page: number;
  params?: Record<string, any>;
};

type DialogListFetchResult = {
  items: Record<string, any>[];
  total: number;
};

/** ****************************** Props & Emits ********************************/

const props = withDefaults(
  defineProps<{
    visible: boolean;
    modelValue?: any | any[];
    multiple?: boolean;
    fetcher: (p: DialogListFetchParams) => Promise<DialogListFetchResult>;
    columns?: ColumnsItem[];
    rowKey?: string;
    dialogTitle?: string;
    dialogWidth?: number | string;
    tableHeight?: number;
    perPage?: number;
    /** 外部传入的筛选参数 */
    filterParams?: Record<string, any>;
  }>(),
  {
    modelValue: undefined,
    multiple: true,
    columns: () => [],
    rowKey: 'id',
    dialogTitle: '',
    dialogWidth: '960px',
    tableHeight: 420,
    perPage: 20,
    filterParams: () => ({}),
  },
);

const emit = defineEmits<{
  'update:visible': [v: boolean];
  'update:modelValue': [v: any | any[]];
  confirm: [rows: Record<string, any>[]];
}>();

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  zIndex: 3000,
  onCancel: () => cancel(),
  onConfirm: () => confirm(),
  onOpenChange: (isOpen) => {
    if (isOpen !== props.visible) {
      emit('update:visible', isOpen);
    }
  },
});

/** ****************************** 表格引用 ********************************/

const tableRef = ref<InstanceType<typeof TableEntlty>>();

/** ****************************** 搜索 + 分页 ********************************/

const keyword = ref('');
const page = ref(1);
const pageSize = ref(props.perPage);
const selectedKeys = ref<any[]>([]);

const queryKey = computed(() => [
  '__dialog-list__',
  props.rowKey,
  page.value,
  pageSize.value,
  keyword.value || '',
  JSON.stringify(props.filterParams),
]);

const { data: queryData, isFetching: loading } = useQuery({
  queryKey,
  queryFn: () =>
    props.fetcher({
      keyword: keyword.value || undefined,
      page: page.value,
      per_page: pageSize.value,
      params: props.filterParams,
    }),
  enabled: computed(() => props.visible),
  staleTime: 5 * 60 * 1000,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

const tableData = computed(() => queryData.value?.items ?? []);
const total = computed(() => queryData.value?.total ?? 0);

// 打开弹窗时初始化
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      modalApi.close();
      return;
    }
    const vals = Array.isArray(props.modelValue)
      ? props.modelValue
      : props.modelValue == null
        ? []
        : [props.modelValue];
    selectedKeys.value = vals;
    keyword.value = '';
    page.value = 1;
    pageSize.value = props.perPage;
    lastSelectedRows = [];
    modalApi.open();
  },
  { immediate: true },
);

function onSearch() {
  page.value = 1;
}

function onPageChange(p: number) {
  page.value = p;
}

function onPageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
}

/** ****************************** 选择与确认 ********************************/

const selectedCount = computed(() => selectedKeys.value.length);

let lastSelectedRows: Record<string, any>[] = [];

function onSelectionKeysUpdate(keys: any[]) {
  selectedKeys.value = keys;
}

function onSelectionChange(rows: Record<string, any>[]) {
  lastSelectedRows = rows;
}

function cancel() {
  modalApi.close();
}

function confirm() {
  const rows =
    lastSelectedRows.length > 0
      ? lastSelectedRows
      : (tableRef.value?.getSelectedRows() ?? []);
  const keys = props.multiple
    ? [...selectedKeys.value]
    : (selectedKeys.value[0] ?? null);
  emit('update:modelValue', keys);
  emit('confirm', rows);
  modalApi.close();
}

defineExpose({
  tableRef,
});
</script>

<template>
  <Modal
    :title="dialogTitle || t('components.asyncSelect.placeholder')"
    :class="`dialog-list__modal w-[${dialogWidth}]`"
    :cancel-text="t('components.dialogList.cancel')"
    :confirm-text="t('components.dialogList.confirm')"
  >
    <div class="dialog-list">
      <!-- 搜索栏 -->
      <div class="dialog-list__bar">
        <el-input
          v-model="keyword"
          :placeholder="t('components.dialogList.placeholder')"
          clearable
          style="width: 260px"
          @keyup.enter="onSearch"
          @clear="onSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="onSearch" />
          </template>
        </el-input>
        <span v-if="selectedCount > 0" class="dialog-list__count">
          {{
            t('components.dialogList.selectedCount', { count: selectedCount })
          }}
        </span>
      </div>

      <!-- 表格 -->
      <div class="dialog-list__table" v-loading="loading">
        <TableEntlty
          ref="tableRef"
          :columns="columns"
          :data="tableData"
          :height="tableHeight"
          :row-key="rowKey"
          :selected-keys="selectedKeys"
          selectable
          :multiple="multiple"
          :show-actions="false"
          show-pagination
          :total="total"
          :per_page="pageSize"
          :current_page="page"
          @update:selected-keys="onSelectionKeysUpdate"
          @update:per_page="onPageSizeChange"
          @selection-change="onSelectionChange"
          @page-change="onPageChange"
        />
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.dialog-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dialog-list__bar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.dialog-list__count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.dialog-list__table {
  width: 100%;
}
</style>

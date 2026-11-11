<script setup lang="ts">
import type {
  DialogListColumn,
  DialogListFetchParams,
  DialogListFetchResult,
} from './index.type';
import type {
  SearchFormItem,
  SearchFormValues,
} from '../search-form/index.type';

import { computed, ref, watch } from 'vue';

import { useVbenModal } from '@/runtime/modal';

import TableEntlty from '@/components/table-entity/index.vue';
import { keepPreviousData, useQuery } from '@tanstack/vue-query';

import { $t as t } from '@/runtime/i18n';
import { SearchForm } from '../search-form';

/** ****************************** 搜索元数据解析 ********************************/

// 与 CrudPage 的 SEARCH_FIELD_KEYS 保持一致：集合内的键铺到搜索字段层，
// 不在集合内的键合并进控件 props。
const SEARCH_FIELD_KEYS = new Set([
  'apiOptions',
  'component',
  'copyable',
  'defaultValue',
  'dictCode',
  'disabled',
  'hidden',
  'hideOnCreate',
  'hideOnEdit',
  'label',
  'newRow',
  'options',
  'optionSource',
  'placeholder',
  'props',
  'readonly',
  'required',
  'rules',
  'span',
  'tip',
  'type',
]);

function pickSearchFieldConfig(config: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(config).filter(([key]) => SEARCH_FIELD_KEYS.has(key)),
  );
}

function omitSearchFieldConfig(config: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(config).filter(([key]) => !SEARCH_FIELD_KEYS.has(key)),
  );
}

function resolveSearchColumn(column: DialogListColumn): SearchFormItem | null {
  const searchConfig = column.search;
  if (!searchConfig) return null;

  // 未列入搜索字段配置键的透传键合并进控件 props；显式 search.props 作底、
  // 透传键在后（顺序对齐 CrudPage 的 mergeFieldProps：后者覆盖前者）。
  const controlProps = omitSearchFieldConfig(searchConfig);
  const fieldProps = {
    ...(typeof searchConfig.props === 'object' && searchConfig.props
      ? searchConfig.props
      : {}),
    ...controlProps,
  };

  return {
    // 兜底同 CrudPage：未配置的字段级键取默认值
    hidden: false,
    readonly: false,
    required: false,
    rules: [],
    ...pickSearchFieldConfig(searchConfig),
    // prop 不在搜索字段配置键集合内，需显式取出；
    // prop/label/type 缺省时取列的 dataIndex（或 dataKey）/title 与 'text'
    prop: searchConfig.prop ?? column.dataIndex ?? column.dataKey,
    label: searchConfig.label ?? column.title,
    type: searchConfig.type ?? 'text',
    props: fieldProps,
  } as SearchFormItem;
}

/** ****************************** Props & Emits ********************************/

const props = withDefaults(
  defineProps<{
    visible: boolean;
    modelValue?: any | any[];
    multiple?: boolean;
    fetcher: (p: DialogListFetchParams) => Promise<DialogListFetchResult>;
    columns?: DialogListColumn[];
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

const searchFields = computed<SearchFormItem[]>(() =>
  props.columns
    .map((column) => resolveSearchColumn(column))
    .filter((field): field is SearchFormItem => !!field),
);

const showSearchForm = computed(() => searchFields.value.length > 0);

/** 实时表单值（SearchForm 双向绑定） */
const searchValues = ref<SearchFormValues>({});
/** 已提交的查询值快照：queryKey / fetcher 只用它，避免边输入边请求 */
const appliedSearch = ref<SearchFormValues>({});

const page = ref(1);
const pageSize = ref(props.perPage);
const selectedKeys = ref<any[]>([]);

const queryKey = computed(() => [
  '__dialog-list__',
  props.rowKey,
  page.value,
  pageSize.value,
  JSON.stringify(appliedSearch.value),
  JSON.stringify(props.filterParams),
]);

const { data: queryData, isFetching: loading } = useQuery({
  queryKey,
  queryFn: () =>
    props.fetcher({
      page: page.value,
      per_page: pageSize.value,
      params: { ...props.filterParams, ...appliedSearch.value },
    }),
  enabled: computed(() => props.visible),
  // 翻页请求期间保留上一页的 total。若中间短暂变成 0，ElPagination
  // 会把受控页码修正为 1，从而造成“翻页后页码被重置”。
  placeholderData: keepPreviousData,
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
    searchValues.value = {};
    appliedSearch.value = {};
    page.value = 1;
    pageSize.value = props.perPage;
    lastSelectedRows = [];
    modalApi.open();
  },
  { immediate: true },
);

// 提交搜索 / 重置：只刷新已提交查询值，不重置页码（靠 queryKey 变化触发请求）
function onSearchSubmit(values: SearchFormValues) {
  // 丢弃 undefined（如重置后的默认值），空值不参与合并、不覆盖 filterParams 同名键
  appliedSearch.value = Object.fromEntries(
    Object.entries(values).filter(([, v]) => v !== undefined),
  );
}

function onPageChange(p: number) {
  if (p === page.value) return;
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
      <!-- 搜索表单（由 columns[].search 元数据生成） -->
      <SearchForm
        v-if="showSearchForm"
        v-model="searchValues"
        :schema="searchFields"
        @search="onSearchSubmit"
        @reset="onSearchSubmit"
      />
      <div class="dialog-list__bar">
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

<script setup lang="ts">
import type { ColumnsItem } from '@/components/table-entity/index.type';

import type {
  AsyncSelectFetchParams,
  AsyncSelectFetchResult,
  SelectVal,
} from './async-select.type';

import { computed, ref, watch } from 'vue';

import moreDotIcon from '@/assets/svgs/more-dot.svg';
import DialogList from '@/components/dialog-list/index.vue';
import { useDictData } from '@/composables/use-dict-data';
import { ElIcon, ElSelectV2 } from 'element-plus';

import { $t as t } from '@/runtime/i18n';

import { loadMissingSelectedOptions } from './async-select.utils';

/** ****************************** 类型 ********************************/

type OptLabel = {
  flag: string;
  label: string;
  subtitle: string;
  raw: Record<string, any>;
};

type Opt = { value: number | string; label: OptLabel };
type OptionItem = Record<string, any>;

/** ****************************** Props & Emits ********************************/

const props = withDefaults(
  defineProps<{
    modelValue: SelectVal;
    multiple?: boolean;
    /** 数据获取函数，支持分页 + 搜索 */
    fetcher?: (p: AsyncSelectFetchParams) => Promise<AsyncSelectFetchResult>;
    /** 固定选项。传入后使用本地选项，不启用异步加载。 */
    options?: OptionItem[];
    /** 字典编码；未配置 fetcher 时自动使用缓存字典选项 */
    dictCode?: string;
    /** 对话框列表的列配置 */
    columns?: ColumnsItem[];
    /** 选项值字段名，默认 'id' */
    valueKey?: string;
    /** 选项标签字段名，根据 columns 第一列自动推断 */
    labelKey?: string;
    /** 副标题字段名 */
    subtitleKey?: string;
    placeholder?: string;
    disabled?: boolean;
    dialogTitle?: string;
    /** 每页条数，默认 20 */
    perPage?: number;
  }>(),
  {
    dictCode: undefined,
    multiple: false,
    fetcher: undefined,
    options: () => [],
    columns: () => [],
    valueKey: 'id',
    labelKey: '',
    placeholder: '',
    disabled: false,
    dialogTitle: '',
    subtitleKey: '',
    perPage: 20,
  },
);

const emit = defineEmits<{
  'update:modelValue': [v: SelectVal];
  change: [v: SelectVal, rows: Record<string, any>[]];
}>();

const { options: dictOptions } = useDictData(() => props.dictCode);
const resolvedOptions = computed<OptionItem[]>(() =>
  props.dictCode ? dictOptions.value : props.options,
);

/** ****************************** 列推断 ********************************/

/** 从 columns 自动推断 labelKey：取第一列的 dataKey */
const resolvedLabelKey = computed(() => {
  if (props.labelKey) return props.labelKey;
  const firstCol = props.columns?.[0];
  if (firstCol?.dataKey) return firstCol.dataKey as string;
  return 'label';
});

/** ****************************** 内部状态 ********************************/

const allItems = ref<Record<string, any>[]>([]);
const selectedOpts = ref<Opt[]>([]);
const currentPage = ref(0);
const loadingMore = ref(false);
const hasMore = ref(true);
const searchKeyword = ref('');
const dropdownOpen = ref(false);
const isAsync = computed(() => typeof props.fetcher === 'function');
const firstPageRequests = new Map<string, Promise<void>>();
let loadedFirstPageKey: null | string = null;

const innerValue = computed<SelectVal>({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const activeValues = computed<Array<number | string>>(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.filter(
      (item): item is number | string => item != null,
    );
  }
  return props.modelValue == null ? [] : [props.modelValue];
});

/** ****************************** 选项转换 ********************************/

function resolveValue(item: Record<string, any>): number | string {
  return (item[props.valueKey] ?? item.id ?? item.value ?? '') as
    | number
    | string;
}

function resolveLabel(item: Record<string, any>): string {
  const key = resolvedLabelKey.value;
  return String(item[key] ?? item.label ?? '');
}

function resolveSubtitle(item: Record<string, any>): string {
  if (!props.subtitleKey) return '';
  return String(item[props.subtitleKey] ?? '');
}

function toOpt(item: Record<string, any>): Opt {
  const label = item.label;
  const flag = typeof item.flag === 'string' ? item.flag : '';
  return {
    value: resolveValue(item),
    label: {
      label:
        typeof label === 'string' || typeof label === 'number'
          ? String(label)
          : resolveLabel(item),
      subtitle: resolveSubtitle(item),
      flag,
      raw: item,
    },
  };
}

/** ****************************** 选项合并 ********************************/

function sameValue(left: unknown, right: unknown) {
  return String(left) === String(right);
}

function alignWithActive(value: number | string) {
  const matched = activeValues.value.find((item) => sameValue(item, value));
  return matched ?? value;
}

function appendSelectedOptions(options: Opt[]) {
  for (const option of options) {
    const aligned = { ...option, value: alignWithActive(option.value) };
    if (
      !selectedOpts.value.find((item) => sameValue(item.value, aligned.value))
    ) {
      selectedOpts.value.push(aligned);
    }
  }
}

const selectOptions = computed<Opt[]>(() => {
  const fromQuery = allItems.value.map((item) => {
    const option = toOpt(item);
    return { ...option, value: alignWithActive(option.value) };
  });
  const extra = selectedOpts.value
    .map((option) => ({ ...option, value: alignWithActive(option.value) }))
    .filter(
      (option) =>
        activeValues.value.some((value) => sameValue(value, option.value)) &&
        !fromQuery.find((item) => sameValue(item.value, option.value)),
    );
  return [...fromQuery, ...extra];
});

watch(
  resolvedOptions,
  (options) => {
    if (!isAsync.value) {
      allItems.value = options ?? [];
      hasMore.value = false;
    }
  },
  { immediate: true },
);

/** ****************************** 懒加载分页 ********************************/

async function loadFirstPage(force = false) {
  const keyword = searchKeyword.value || undefined;
  const requestKey = keyword ?? '';
  if (!force && loadedFirstPageKey === requestKey) return;

  const pendingRequest = firstPageRequests.get(requestKey);
  if (pendingRequest) {
    await pendingRequest;
    return;
  }

  currentPage.value = 1;
  allItems.value = [];
  hasMore.value = true;
  const request = loadPage(1, keyword);
  firstPageRequests.set(requestKey, request);
  try {
    await request;
    if ((searchKeyword.value || undefined) === keyword) {
      loadedFirstPageKey = requestKey;
    }
  } finally {
    if (firstPageRequests.get(requestKey) === request) {
      firstPageRequests.delete(requestKey);
    }
  }
}

async function loadNextPage() {
  if (loadingMore.value || !hasMore.value) return;
  await loadPage(currentPage.value + 1);
}

async function loadPage(
  page: number,
  keyword = searchKeyword.value || undefined,
) {
  if (!props.fetcher) return;
  loadingMore.value = true;
  try {
    const result = await props.fetcher({
      page,
      per_page: props.perPage,
      keyword,
    });
    // An older search must not replace the results for a newer keyword.
    if ((searchKeyword.value || undefined) !== keyword) return;
    const items = result.items ?? [];
    if (page === 1) {
      allItems.value = items;
    } else {
      allItems.value.push(...items);
    }
    currentPage.value = page;
    hasMore.value = items.length >= props.perPage;
  } finally {
    loadingMore.value = false;
  }
}

/** ****************************** 下拉开关 ********************************/

async function onDropdownVisible(visible: boolean) {
  dropdownOpen.value = visible;
  if (visible && isAsync.value) {
    if (allItems.value.length === 0) {
      await loadFirstPage();
    }
  }
}

/** ****************************** 回显补全 ********************************/

watch(
  [activeValues, resolvedOptions],
  async ([values, localOptions]) => {
    if (values.length === 0) {
      selectedOpts.value = [];
      return;
    }
    appendSelectedOptions(
      localOptions
        .filter((item) =>
          values.some((value) => sameValue(value, resolveValue(item))),
        )
        .map(toOpt),
    );
    if (!isAsync.value || !props.fetcher) return;
    const options = await loadMissingSelectedOptions({
      activeValues: values,
      selectedValues: selectedOpts.value.map((item) => item.value),
      loadRows: () =>
        props.fetcher!({ page: 1, per_page: 9999 }).then((r) => r.items ?? []),
      resolveValue,
      toOption: toOpt,
    });
    appendSelectedOptions(options);
  },
  { immediate: true },
);

/** ****************************** 对话框选 ********************************/

const dialogVisible = ref(false);

function openDialog() {
  if (props.disabled) return;
  dialogVisible.value = true;
}

function onDialogConfirm(rows: Record<string, any>[]) {
  appendSelectedOptions(rows.map(toOpt));
  const newVal: SelectVal = props.multiple
    ? rows.map((r) => resolveValue(r))
    : rows[0]
      ? resolveValue(rows[0])
      : null;
  emit('update:modelValue', newVal);
  emit('change', newVal, rows);
}

async function loadDialogPage(params: AsyncSelectFetchParams) {
  if (props.fetcher) {
    const result = await props.fetcher(params);
    return { items: result.items ?? [], total: result.total };
  }
  const keyword = params.keyword?.trim().toLowerCase();
  const filtered = resolvedOptions.value.filter((item) => {
    if (!keyword) return true;
    return resolveLabel(item).toLowerCase().includes(keyword);
  });
  const start = (params.page - 1) * params.per_page;
  return {
    items: filtered.slice(start, start + params.per_page),
    total: filtered.length,
  };
}

/** ****************************** 计算属性 ********************************/

const computedPlaceholder = computed(
  () => props.placeholder || t('components.asyncSelect.placeholder'),
);
const computedDialogTitle = computed(
  () => props.dialogTitle || t('components.asyncSelect.placeholder'),
);

defineExpose({
  reload: () => loadFirstPage(true),
  allItems,
});
</script>

<template>
  <div class="async-select">
    <ElSelectV2
      v-model="innerValue"
      class="async-select__select"
      :options="selectOptions"
      :loading="loadingMore"
      :multiple="multiple"
      filterable
      clearable
      :remote="isAsync"
      remote-show-suffix
      :remote-method="
        isAsync
          ? (kw: string) => {
              if (searchKeyword !== kw) {
                searchKeyword = kw;
                loadedFirstPageKey = null;
              }
              loadFirstPage();
            }
          : undefined
      "
      :placeholder="computedPlaceholder"
      :disabled="disabled"
      v-bind="$attrs"
      @visible-change="onDropdownVisible"
      @end-reached="loadNextPage"
    >
      <template #label="slotProps">
        <span class="async-select__value">
          <img
            v-if="slotProps?.label?.flag"
            class="async-select__flag"
            :src="slotProps.label.flag"
            alt=""
          />
          <span class="async-select__value-text">
            {{ slotProps?.label?.label ?? '' }}
          </span>
        </span>
      </template>
      <template #default="slotProps">
        <div v-if="slotProps?.item" class="async-select__option">
          <p class="async-select__option-label">
            <img
              v-if="slotProps.item.label.flag"
              class="async-select__flag"
              :src="slotProps.item.label.flag"
              alt=""
            />
            <span class="async-select__option-text">
              {{ slotProps.item.label.label }}
            </span>
          </p>
          <p
            v-if="slotProps.item.label.subtitle"
            class="async-select__option-desc"
          >
            {{ slotProps.item.label.subtitle }}
          </p>
        </div>
      </template>
    </ElSelectV2>

    <!-- 弹窗选择按钮 -->
    <button
      v-if="columns.length > 0"
      type="button"
      class="async-select__inner-trigger"
      :class="{ 'is-disabled': disabled }"
      :title="t('components.asyncSelect.dialogSelect')"
      @mousedown.prevent
      @click.stop="openDialog"
    >
      <ElIcon>
        <img :src="moreDotIcon" :alt="t('components.asyncSelect.more')" />
      </ElIcon>
    </button>

    <!-- 弹窗列表 -->
    <DialogList
      v-if="columns.length > 0"
      :visible="dialogVisible"
      :columns="columns"
      :model-value="modelValue"
      :multiple="multiple"
      :fetcher="(p: AsyncSelectFetchParams) => loadDialogPage(p)"
      :row-key="valueKey"
      :dialog-title="computedDialogTitle"
      :per-page="perPage"
      @update:visible="dialogVisible = $event"
      @confirm="onDialogConfirm"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-select) {
  // width: 260px !important;
}

.async-select {
  position: relative;
  display: block;
  // width: 260px;
  width: 100%;
}

.async-select__select {
  // width: 260px;
}

.async-select :deep(.el-select__caret) {
  color: #666;
}

.async-select :deep(.el-select__wrapper.is-focused .el-select__caret) {
  color: var(--el-color-primary);
}

:deep(.el-select__caret) {
  right: 10px;
}

.async-select__inner-trigger {
  position: absolute;
  top: 50%;
  right: 2px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 4px;
  transform: translateY(-50%);
}

.async-select__inner-trigger:hover:not(.is-disabled) {
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
}

.async-select__inner-trigger.is-disabled {
  color: var(--el-text-color-placeholder);
  cursor: not-allowed;
}

.async-select__option {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  height: 100%;
  line-height: 1.3;
}

.async-select__option-label,
.async-select__option-desc {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.async-select__option-label {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.async-select__option-text,
.async-select__value-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.async-select__value {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  vertical-align: middle;
}

.async-select__flag {
  flex-shrink: 0;
  width: 18px;
  height: 12px;
  object-fit: cover;
}

.async-select__option-desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.async-select
  :deep(.el-select-dropdown__item.is-selected .async-select__option-label),
.async-select
  :deep(.el-select-dropdown__item.is-selected .async-select__option-desc),
.async-select
  :deep(.el-select-dropdown__item.selected .async-select__option-label),
.async-select
  :deep(.el-select-dropdown__item.selected .async-select__option-desc) {
  color: var(--el-color-primary);
}
</style>

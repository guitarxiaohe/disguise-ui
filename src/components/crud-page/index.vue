<script setup lang="ts">
import type { RequestResponse } from '@/runtime/request';

import type {
  FieldPropsResolver,
  SchemaFormField,
  SchemaFormGroup,
  SchemaFormMode,
} from '../schema-form/schema-form.type';
import type {
  SearchFormItem,
  SearchFormValues,
} from '../search-form/index.type';
import type {
  TableEntityActionName,
  TableEntityActionPayload,
  TableEntityExpose,
  TableEntityRowSortPayload,
} from '../table-entity/index.type';
import type {
  CrudPageProps,
  CrudPageRecord,
  CrudPageSearchSlotProps,
  CrudPageToolbarAction,
} from './index.type';

import { computed, defineComponent, h, nextTick, ref, useSlots } from 'vue';

import { useAccessStore } from '@/runtime/access';
import { downloadFileFromBlob } from '@/runtime/utils';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { requestClient } from '@/runtime/request';
import { $t as t } from '@/runtime/i18n';

import BaseCard from '../card/index.vue';
import { useDrawerFormPage } from '../drawer-form-page';
import SearchForm from '../search-form/index.vue';
import TableEntity from '../table-entity/index.vue';

const props = withDefaults(defineProps<CrudPageProps>(), {
  fields: () => [],
  data: () => [],
  rowKey: 'id',
  actions: undefined,
  pushToolbarActions: () => [],
  createTitle: '新增',
  editTitle: '编辑',
  viewTitle: '详情',
  addButtonText: '新增',
  showImport: true,
  showExport: true,
  importUrl: undefined,
  exportUrl: undefined,
  defaultValues: () => ({}),
  confirmDelete: true,
  deleteConfirmText: '确定要删除这条数据吗？',
  tableProps: () => ({}),
  searchFormProps: () => ({}),
  drawerProps: () => ({}),
  onCreate: undefined,
  onUpdate: undefined,
  onDelete: undefined,
  onBatchDelete: undefined,
  // onExport: undefined,
  exportConfig: undefined,
  resolveFormValues: undefined,
});

const emit = defineEmits<{
  action: [payload: TableEntityActionPayload];
  rowSort: [payload: TableEntityRowSortPayload];
  toolbarAction: [action: string];
}>();

defineSlots<{
  search: (props: CrudPageSearchSlotProps) => any;
  buttons: (props: { selectedRows: CrudPageRecord[] }) => any;
  [name: string]: any;
}>();
const slots = useSlots();
const tableRef = ref<TableEntityExpose>();
const currentMode = ref<SchemaFormMode>('create');
const currentRow = ref<CrudPageRecord>({});
const formOpenToken = ref(0);
const selectedRows = ref<CrudPageRecord[]>([]);
const searchValues = ref<SearchFormValues>({});
const tableQuery = ref<SearchFormValues>({});

const formFields = computed(() =>
  props.fields.filter((field) => field.form !== false),
);

const searchFields = computed<SearchFormItem[]>(() => {
  const configuredSchema = props.searchFormProps?.schema;
  if (configuredSchema?.length) return configuredSchema;
  return props.fields
    .filter((field) => field.search)
    .map((field) => resolveSearchField(field))
    .filter((field): field is SearchFormItem => !!field);
});

const showSearchForm = computed(() => searchFields.value.length > 0);

const tableColumns = computed(() =>
  props.fields
    .filter((field) => field.table !== false)
    .filter((field) => field.type !== 'group')
    .map((field) => {
      const tableConfig = typeof field.table === 'object' ? field.table : {};
      const cellType =
        tableConfig.type ??
        (field.type === 'picture' || field.type === 'file'
          ? field.type
          : undefined);
      const valueType =
        tableConfig.valueType ??
        (field.type === 'date' || field.type === 'datetime'
          ? field.type
          : undefined);
      return {
        ...tableConfig,
        ...(cellType ? { type: cellType } : {}),
        ...(valueType ? { valueType } : {}),
        dataIndex: tableConfig.dataIndex ?? field.prop,
        key: tableConfig.key ?? field.prop,
        title: tableConfig.title ?? field.label,
      };
    }),
);

const tableSlotNames = computed(() =>
  Object.keys(slots).filter(
    (name) => name.endsWith('Col') || name === 'actionsCol',
  ),
);

const formSlotNames = computed(() =>
  Object.keys(slots).filter(
    (name) =>
      !name.endsWith('Col') &&
      ![
        'actionsCol',
        'buttons',
        'default',
        'footer',
        'header',
        'prepend',
        'search',
      ].includes(name),
  ),
);

const resolvedActions = computed<TableEntityActionName[]>(() => {
  if (props.actions) return props.actions;
  const actions: TableEntityActionName[] = [];
  if (props.onUpdate) actions.push('edit');
  if (props.onDelete) actions.push('delete');
  return actions;
});
const showActions = computed(
  () => props.tableProps?.showActions ?? resolvedActions.value.length > 0,
);
const resolvedPermissionCode = computed(
  () => props.permissionCode ?? props.tableProps?.permissionCode ?? '',
);
const resolvedTableProps = computed(() => {
  const tableProps = props.tableProps ?? {};
  const importDialog = tableProps.importDialog;

  if (!props.importUrl && !importDialog) {
    return tableProps;
  }

  return {
    ...tableProps,
    importDialog: {
      ...importDialog,
      ...(typeof props.importUrl === 'string'
        ? { api: props.importUrl }
        : (props.importUrl ?? {})),
    },
  };
});

const resolvedSearchFormProps = computed(() => {
  const { schema, ...searchFormProps } = props.searchFormProps ?? {};
  return searchFormProps;
});

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

function resolveSearchField(
  field: SchemaFormField | SchemaFormGroup,
): null | SearchFormItem {
  if (field.type === 'group') {
    return resolveSearchGroup(field);
  }
  return resolveSearchItem(field);
}

function resolveSearchGroup(
  field: SchemaFormGroup & { search?: boolean | Record<string, any> },
): null | SearchFormItem {
  const searchConfig = field.search;
  if (!searchConfig) return null;
  const override = typeof searchConfig === 'object' ? searchConfig : {};
  const children = Array.isArray(override.children)
    ? override.children
    : field.children;
  return {
    ...field,
    ...pickSearchFieldConfig(override),
    children,
    hidden: override.hidden ?? false,
  } as SearchFormItem;
}

function resolveSearchItem(
  field: SchemaFormField & { search?: boolean | Record<string, any> },
): null | SearchFormItem {
  const searchConfig = field.search;
  if (!searchConfig) return null;

  const override = typeof searchConfig === 'object' ? searchConfig : {};
  const controlProps = omitSearchFieldConfig(override);
  const fieldProps = mergeFieldProps(field.props, controlProps);
  return {
    ...field,
    ...pickSearchFieldConfig(override),
    props: fieldProps,
    hidden: override.hidden ?? false,
    readonly: override.readonly ?? false,
    required: override.required ?? false,
    rules: override.rules ?? [],
  } as SearchFormItem;
}

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

function mergeFieldProps(
  baseProps: FieldPropsResolver | Record<string, any> | undefined,
  searchProps: Record<string, any>,
) {
  if (Object.keys(searchProps).length === 0) return baseProps;
  if (typeof baseProps === 'function') {
    return ((ctx) => ({
      ...baseProps(ctx),
      ...searchProps,
    })) as FieldPropsResolver;
  }
  return { ...(baseProps ?? {}), ...searchProps };
}

async function reloadWithSearchValues(values: SearchFormValues) {
  tableQuery.value = { ...values };
  await nextTick();
  await reload();
}

function handleSearch(values: SearchFormValues) {
  void reloadWithSearchValues(values);
}

function handleSearchReset() {
  void reloadWithSearchValues({});
}

function handleCustomSearch(values = searchValues.value) {
  searchValues.value = { ...values };
  handleSearch(searchValues.value);
}

function handleCustomSearchReset(values: SearchFormValues = {}) {
  searchValues.value = { ...values };
  void reloadWithSearchValues(searchValues.value);
}

const [Drawer, drawerApi] = useDrawerFormPage({
  ...props.drawerProps,
  schema: formFields.value,
  schemaFormProps: {
    groupGap: 12,
    ...props.drawerProps?.schemaFormProps,
  },
  onSubmit: async (values) => {
    const isCreate = currentMode.value === 'create';
    const handler = isCreate ? props.onCreate : props.onUpdate;
    if (!handler) {
      ElMessage.warning('当前操作没有配置提交处理函数');
      return false;
    }

    drawerApi.setState({ submitting: true });
    try {
      const updateValues = isCreate
        ? values
        : getUpdateValues(values, currentRow.value);
      const result = isCreate
        ? await props.onCreate?.(values)
        : await props.onUpdate?.(updateValues, currentRow.value);
      if (result === false) return false;

      ElMessage.success(
        currentMode.value === 'create' ? '新增成功' : '更新成功',
      );
      await reload();
      return true;
    } catch {
      ElMessage.error(currentMode.value === 'create' ? '新增失败' : '更新失败');
      return false;
    } finally {
      drawerApi.setState({ submitting: false });
    }
  },
});

function getTitle(mode: SchemaFormMode) {
  if (mode === 'create') return props.createTitle;
  if (mode === 'edit') return props.editTitle;
  return props.viewTitle;
}

function getRowValues(mode: SchemaFormMode, row?: CrudPageRecord) {
  const values =
    mode === 'create'
      ? { ...props.defaultValues, ...(row ?? {}) }
      : { ...(row ?? {}) };
  if (mode === 'create' && props.rowKey in values) {
    delete values[props.rowKey];
  }
  return values;
}

function getUpdateValues(values: CrudPageRecord, row: CrudPageRecord) {
  return {
    ...row,
    ...values,
  };
}

async function openForm(mode: SchemaFormMode, row?: CrudPageRecord) {
  currentMode.value = mode;
  currentRow.value = { ...(row ?? {}) };
  const token = ++formOpenToken.value;
  const shouldResolve = mode !== 'create' && !!props.resolveFormValues;

  drawerApi.open({
    ...props.drawerProps,
    loading: shouldResolve,
    mode,
    schema: formFields.value,
    schemaFormProps: {
      groupGap: 12,
      ...props.drawerProps?.schemaFormProps,
    },
    title: getTitle(mode),
    values: getRowValues(mode, row),
  });

  if (!shouldResolve) return;

  try {
    const values = await props.resolveFormValues?.(mode, row);
    if (token === formOpenToken.value && values) {
      currentRow.value = getUpdateValues(values, currentRow.value);
      drawerApi.setValues(values);
    }
  } catch {
    if (token === formOpenToken.value) {
      ElMessage.error('加载详情失败');
      drawerApi.close();
    }
  } finally {
    if (token === formOpenToken.value) {
      drawerApi.setState({ loading: false });
    }
  }
}

async function openCreate() {
  await openForm('create');
}

function resolveDeleteConfirmText(row: CrudPageRecord) {
  return typeof props.deleteConfirmText === 'function'
    ? props.deleteConfirmText(row)
    : props.deleteConfirmText;
}

async function remove(row: CrudPageRecord) {
  if (!props.onDelete) {
    ElMessage.warning('当前操作没有配置删除处理函数');
    return;
  }

  if (props.confirmDelete) {
    try {
      await ElMessageBox.confirm(resolveDeleteConfirmText(row), {
        type: 'warning',
      });
    } catch {
      return;
    }
  }

  try {
    const result = await props.onDelete(row);
    if (result === false) return;
    ElMessage.success('删除成功');
    await reload();
  } catch {
    ElMessage.error('删除失败');
  }
}

async function removeSelected() {
  const rows = [...selectedRows.value];
  if (rows.length === 0) return;

  if (!props.onDelete && !props.onBatchDelete) {
    ElMessage.warning('当前操作没有配置批量删除处理函数');
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 条数据吗？`, {
      type: 'warning',
    });
  } catch {
    return;
  }

  try {
    if (props.onBatchDelete) {
      const result = await props.onBatchDelete(rows);
      if (result === false) return;
    } else {
      for (const row of rows) {
        const result = await props.onDelete?.(row);
        if (result === false) return;
      }
    }
    ElMessage.success('删除成功');
    tableRef.value?.clearSelection();
    await reload();
  } catch {
    ElMessage.error('删除失败');
  }
}

function openImport() {
  if (!tableRef.value?.openImport()) {
    ElMessage.warning('当前页面没有配置导入功能');
  }
}

async function handleExport() {
  if (!props?.exportConfig) return;
  const { onExport, name, url } = props.exportConfig;
  if (onExport) {
    try {
      const accessStore = useAccessStore();
      const result = onExport({
        rows: selectedRows.value,
        queryParmas: searchValues.value,
      });
      const response = await requestClient.download<RequestResponse<Blob>>(
        normalizeRequestUrl(url),
        {
          responseReturn: 'raw',
          data: { ...result, token: accessStore.accessToken },
        },
      );
      const contentDisposition = getResponseHeader(
        response.headers,
        'content-disposition',
      );

      downloadFileFromBlob({
        fileName: resolveDownloadFileName(
          contentDisposition,
          name || 'export.xlsx',
        ),
        source: response.data,
      });
    } catch {
      ElMessage.error('导出失败');
    }
  }
}

// requestClient 已配置了 /api 前缀时，兼容调用方传入 /api/xxx。
function normalizeRequestUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;

  const baseURL = requestClient.getBaseUrl() || '';
  const basePath = /^https?:\/\//i.test(baseURL)
    ? new URL(baseURL).pathname
    : (baseURL.split(/[?#]/, 1)[0] ?? '');
  const normalizedBasePath = basePath.replace(/\/+$/, '');

  if (
    normalizedBasePath &&
    normalizedBasePath !== '/' &&
    (url === normalizedBasePath || url.startsWith(`${normalizedBasePath}/`))
  ) {
    return url.slice(normalizedBasePath.length) || '/';
  }

  return url;
}

function getResponseHeader(
  headers: RequestResponse<Blob>['headers'],
  name: string,
): string | undefined {
  if (typeof headers.get === 'function') {
    const headerValue = headers.get(name);
    return typeof headerValue === 'string' ? headerValue : undefined;
  }

  const headerValue = headers[name];
  return typeof headerValue === 'string' ? headerValue : undefined;
}

function resolveDownloadFileName(
  contentDisposition: string | undefined,
  fallback: string,
): string {
  const encodedFileName = contentDisposition?.match(
    /filename\*=UTF-8''([^;]+)/i,
  )?.[1];
  if (encodedFileName) {
    return decodeURIComponent(encodedFileName.replace(/^["']|["']$/g, ''));
  }

  return contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1] || fallback;
}

function renderToolbarAction(action: CrudPageToolbarAction) {
  if (action.component) {
    if (typeof action.component === 'function') {
      return (action.component as () => ReturnType<typeof h>)();
    }
    return h(action.component);
  }

  if (!action.name || !action.label) return null;

  return h(
    ElButton,
    {
      type: action.type ?? 'primary',
      onClick: () => emit('toolbarAction', action.name!),
    },
    () => action.label,
  );
}

const toolbarActionNodes = computed(() =>
  (props.pushToolbarActions ?? [])
    .map(renderToolbarAction)
    .filter((node): node is NonNullable<typeof node> => node !== null),
);

const ToolbarActions = defineComponent({
  name: 'CrudPageToolbarActions',
  setup() {
    return () => toolbarActionNodes.value;
  },
});

function handleAction({ action, row }: TableEntityActionPayload) {
  emit('action', { action, row });
  if (action === 'create') {
    openCreate();
    return;
  }
  if (action === 'view') {
    void openForm('view', row);
    return;
  }
  if (action === 'edit') {
    void openForm('edit', row);
    return;
  }
  if (action === 'copy') {
    void openForm('create', row);
    return;
  }
  if (action === 'delete') {
    remove(row);
  }
}

async function reload(page?: number) {
  await tableRef.value?.reload(page);
}

defineExpose({
  clearSelection: () => tableRef.value?.clearSelection(),
  close: drawerApi.close,
  getSelectedRows: () => tableRef.value?.getSelectedRows() ?? [],
  getSearchValues: () => ({ ...tableQuery.value }),
  drawerApi,
  openCreate,
  openEdit: (row: CrudPageRecord) => openForm('edit', row),
  openView: (row: CrudPageRecord) => openForm('view', row),
  reload,
});
</script>

<template>
  <BaseCard>
    <slot name="prepend"></slot>
    <slot
      v-if="$slots.search"
      name="search"
      :values="searchValues"
      :search="handleCustomSearch"
      :reset="handleCustomSearchReset"
    ></slot>
    <SearchForm
      v-else-if="showSearchForm"
      v-model="searchValues"
      class="crud-page__search"
      v-bind="resolvedSearchFormProps"
      :schema="searchFields"
      @search="handleSearch"
      @reset="handleSearchReset"
    >
      <template
        v-for="slotName in formSlotNames"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps"></slot>
      </template>
    </SearchForm>
    <TableEntity
      ref="tableRef"
      v-bind="resolvedTableProps"
      :row-key="props.rowKey"
      :columns="tableColumns"
      :data="props.data"
      :query="tableQuery"
      :actions="resolvedActions"
      :show-actions="showActions"
      :permission-code="resolvedPermissionCode"
      @selection-change="selectedRows = $event"
      @handle-action="handleAction"
      @row-sort="emit('rowSort', $event)"
    >
      <template #buttons>
        <slot name="buttons" :selected-rows="selectedRows">
          <ElButton
            v-access="[`${resolvedPermissionCode}:add`]"
            v-if="props.onCreate"
            type="primary"
            @click="openCreate"
          >
            {{ props.addButtonText }}
          </ElButton>

          <ElButton
            v-access="[`${resolvedPermissionCode}:remove`]"
            v-if="props.onDelete || props.onBatchDelete"
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="removeSelected"
          >
            {{ t('components.tableEntity.batchDelete') }}
          </ElButton>
          <ElButton
            v-if="props.showImport"
            v-access="[`${resolvedPermissionCode}:import`]"
            @click="openImport"
          >
            {{ t('components.tableEntity.import') }}
          </ElButton>
          <ElButton
            v-if="props.exportConfig"
            v-access="[`${resolvedPermissionCode}:export`]"
            @click="handleExport"
          >
            {{ t('components.tableEntity.export') }}
          </ElButton>
          <ToolbarActions />
        </slot>
      </template>

      <template
        v-for="slotName in tableSlotNames"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps"></slot>
      </template>
    </TableEntity>
  </BaseCard>

  <Drawer>
    <template
      v-for="slotName in formSlotNames"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot :name="slotName" v-bind="slotProps"></slot>
    </template>
    <template v-if="$slots.default">
      <slot name="default"></slot>
    </template>
    <template v-if="$slots.header" #header="slotProps">
      <slot name="header" v-bind="slotProps"></slot>
    </template>
    <template v-if="$slots.footer" #footer="slotProps">
      <slot name="footer" v-bind="slotProps"></slot>
    </template>
  </Drawer>
</template>

<style scoped>
.crud-page__search {
  margin-bottom: 16px;
}
</style>

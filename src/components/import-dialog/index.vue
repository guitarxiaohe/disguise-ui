<script setup lang="ts">
import type { UploadFile, UploadInstance } from 'element-plus';

import type { RequestResponse } from '@/runtime/request';

import type {
  ImportDialogEmits,
  ImportDialogMappingItem,
  ImportDialogMode,
  ImportDialogModeOption,
  ImportDialogParseResult,
  ImportDialogProps,
  ImportDialogStep,
  ImportDialogSubmitResult,
} from './index.type';

import { computed, ref, watch } from 'vue';

import { useVbenModal } from '@/runtime/modal';
import { downloadFileFromBlob } from '@/runtime/utils';

import {
  ArrowRight,
  Check,
  Close,
  Download,
  FullScreen,
  InfoFilled,
  Plus,
  ScaleToOriginal,
  SuccessFilled,
  WarningFilled,
} from '@element-plus/icons-vue';
import {
  ElButton,
  ElCheckbox,
  ElIcon,
  ElInput,
  ElMessage,
  ElOption,
  ElProgress,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTooltip,
  ElUpload,
} from 'element-plus';

import { requestClient } from '@/runtime/request';
import { $t as t } from '@/runtime/i18n';

const props = withDefaults(defineProps<ImportDialogProps>(), {
  api: undefined,
  templateUrl: undefined,
  templateMethod: 'POST',
  title: '',
  defaultMode: 'create',
  modes: undefined,
  accept: () => ['.xls', '.xlsx'],
  maxSize: 5,
  maxPreviewCount: 100,
  tips: undefined,
  targetFields: () => [],
  resetOnClose: true,
  modelValue: false,
  parseFile: undefined,
  submitImport: undefined,
  templateName: '导入模版',
});

const emit = defineEmits<ImportDialogEmits>();

const [Modal, modalApi] = useVbenModal({
  onOpenChange: (isOpen) => {
    if (isOpen !== props.modelValue) {
      emit('update:modelValue', isOpen);
    }
  },
});

/** ****************************** 基础状态 ********************************/

const uploadRef = ref<UploadInstance>();
const currentStep = ref<ImportDialogStep>('upload');
const selectedMode = ref<ImportDialogMode>(props.defaultMode);
const selectedFile = ref<File | null>(null);
const displayFileName = ref<string>('');
const sheetOptions = ref<Array<{ label: string; value: string }>>([]);
const selectedSheet = ref<string>('');
const previewColumns = ref<ImportDialogParseResult['previewColumns']>([]);
const previewRows = ref<Record<string, unknown>[]>([]);
const previewTotal = ref<number>(0);
const mappings = ref<ImportDialogMappingItem[]>([]);
const parsing = ref<boolean>(false);
const importing = ref<boolean>(false);
const fullscreen = ref<boolean>(false);
const progress = ref<number>(0);
const progressMessage = ref<string>('');
const result = ref<ImportDialogSubmitResult | null>(null);
const parseToken = ref<number>(0);

/** ****************************** 计算属性 ********************************/

// 弹窗标题
const dialogTitle = computed(() => {
  return props.title || t('components.importDialog.title');
});

// 传入 api 时由组件直接提交文件，否则使用外部传入的回调。
const isApiMode = computed(() => Boolean(props.api));

// 导入方式选项
const modeOptions = computed<ImportDialogModeOption[]>(() => {
  if (props.modes?.length) {
    return props.modes;
  }

  return [
    {
      label: t('components.importDialog.modeCreate'),
      value: 'create',
    },
    {
      label: t('components.importDialog.modeUpdate'),
      value: 'update',
    },
  ];
});

// 默认说明文案
const tipList = computed<string[]>(() => {
  if (props.tips?.length) {
    return props.tips;
  }

  return [
    t('components.importDialog.tipSize', { size: props.maxSize }),
    t('components.importDialog.tipHeader'),
    t('components.importDialog.tipFormula'),
    t('components.importDialog.tipArea'),
    t('components.importDialog.tipRelation'),
  ];
});

// 接受的文件后缀
const acceptText = computed<string>(() => props.accept.join(','));

// 上传区展示的文件类型
const acceptLabel = computed<string>(() => {
  return props.accept
    .map((item) => item.replace(/^\./, '').toUpperCase())
    .join('、');
});

// 当前是否在结果页
const isResultState = computed<boolean>(() => result.value !== null);

// 当前是否显示步骤条
const showSteps = computed<boolean>(
  () => !isResultState.value && !isApiMode.value,
);

// 预览汇总文案
const previewSummary = computed<string>(() => {
  return t('components.importDialog.previewSummary', {
    total: previewTotal.value,
    count: Math.min(previewRows.value.length, props.maxPreviewCount),
  });
});

// 上传区文件名
const uploadFileName = computed<string>(() => {
  return displayFileName.value || selectedFile.value?.name || '';
});

// 字段映射的源列选项
const sourceColumnOptions = computed(() => {
  return previewColumns.value.map((column) => ({
    label: column.label,
    value: column.label,
  }));
});

// 当前导入描述
const importingDescription = computed<string>(() => {
  return (
    progressMessage.value ||
    t('components.importDialog.importingProgress', {
      progress: progress.value,
    })
  );
});

// 结果页标题
const resultTitle = computed<string>(() => {
  if (!result.value) return '';
  if (result.value.title) return result.value.title;

  return result.value.success
    ? t('components.importDialog.successTitle')
    : t('components.importDialog.errorTitle');
});

// 结果页说明
const resultDescription = computed<string>(() => {
  if (!result.value) return '';
  if (result.value.description) return result.value.description;

  return result.value.success
    ? t('components.importDialog.successDescription')
    : t('components.importDialog.errorDescription');
});

// 步骤条配置
const stepItems = computed(() => {
  return [
    t('components.importDialog.stepUpload'),
    t('components.importDialog.stepPreview'),
    t('components.importDialog.stepMapping'),
    t('components.importDialog.stepImport'),
  ];
});

/** ****************************** 状态同步 ********************************/

// 弹窗关闭时重置内部状态
watch(
  () => props.modelValue,
  (visible, oldVisible) => {
    if (visible) {
      selectedMode.value = props.defaultMode;
      modalApi.open();
      return;
    }

    modalApi.close();
    fullscreen.value = false;
    modalApi.setState({ fullscreen: false });

    if (oldVisible && props.resetOnClose) {
      resetDialogState();
    }
  },
  { immediate: true },
);

/** ****************************** 交互方法 ********************************/

// 重置弹窗状态
function resetDialogState() {
  parseToken.value += 1;
  currentStep.value = 'upload';
  selectedFile.value = null;
  displayFileName.value = '';
  sheetOptions.value = [];
  selectedSheet.value = '';
  previewColumns.value = [];
  previewRows.value = [];
  previewTotal.value = 0;
  mappings.value = [];
  parsing.value = false;
  importing.value = false;
  progress.value = 0;
  progressMessage.value = '';
  result.value = null;
  uploadRef.value?.clearFiles();
}

// 重置解析结果
function resetParsedState() {
  sheetOptions.value = [];
  selectedSheet.value = '';
  previewColumns.value = [];
  previewRows.value = [];
  previewTotal.value = 0;
  mappings.value = [];
  result.value = null;
}

// 关闭弹窗
function closeDialog() {
  if (!isResultState.value) {
    emit('cancel');
  }
  emit('update:modelValue', false);
}

// 切换弹窗全屏
function toggleFullscreen() {
  fullscreen.value = !fullscreen.value;
  modalApi.setState({ fullscreen: fullscreen.value });
}

// 处理模板下载
async function handleDownloadTemplate() {
  if (!props.templateUrl) {
    emit('downloadTemplate');
    return;
  }

  try {
    const response = await requestClient.download<RequestResponse<Blob>>(
      normalizeRequestUrl(props.templateUrl),
      { method: props.templateMethod, responseReturn: 'raw' },
    );
    const contentDisposition = getResponseHeader(
      response.headers,
      'content-disposition',
    );

    downloadFileFromBlob({
      fileName: resolveDownloadFileName(
        contentDisposition,
        props.templateName || 'import-template.xlsx',
      ),
      source: response.data,
    });
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '模板下载失败'));
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

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

// 校验文件
function validateFile(file: File): boolean {
  const sizeInMb = file.size / 1024 / 1024;
  if (sizeInMb > props.maxSize) {
    ElMessage.error(
      t('components.importDialog.fileSizeExceeded', {
        size: props.maxSize,
      }),
    );
    return false;
  }

  if (!props.accept.length) return true;

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  const isAllowed = props.accept.some((acceptItem) => {
    const acceptValue = acceptItem.toLowerCase();
    if (acceptValue.startsWith('.')) {
      return fileName.endsWith(acceptValue);
    }
    return fileType === acceptValue;
  });

  if (!isAllowed) {
    ElMessage.error(
      t('components.importDialog.fileTypeInvalid', {
        types: acceptLabel.value,
      }),
    );
    return false;
  }

  return true;
}

// 构建字段映射
function buildMappings(
  parsedMappings: ImportDialogParseResult['mappings'],
): ImportDialogMappingItem[] {
  const parsedMap = new Map(
    (parsedMappings ?? []).map((item) => [item.targetField, item]),
  );

  return props.targetFields.map((field) => {
    const currentMapping = parsedMap.get(field.field);

    return {
      targetField: field.field,
      targetLabel: currentMapping?.targetLabel || field.label,
      sourceColumn: currentMapping?.sourceColumn || '',
      required: field.required ?? false,
      duplicateCheck: currentMapping?.duplicateCheck ?? false,
      allowDuplicateCheck: field.allowDuplicateCheck ?? true,
    };
  });
}

function normalizeImportResult(response: unknown): ImportDialogSubmitResult {
  const responseRecord =
    response && typeof response === 'object'
      ? (response as Record<string, unknown>)
      : {};
  const data =
    responseRecord.data && typeof responseRecord.data === 'object'
      ? (responseRecord.data as Record<string, unknown>)
      : responseRecord;

  const result: ImportDialogSubmitResult = {
    success:
      typeof data.success === 'boolean'
        ? data.success
        : responseRecord.success === false
          ? false
          : true,
  };

  if (typeof data.title === 'string') result.title = data.title;
  if (typeof data.description === 'string') {
    result.description = data.description;
  }
  if (typeof data.detail === 'string') {
    result.detail = data.detail;
  } else if (typeof data.message === 'string') {
    result.detail = data.message;
  } else if (typeof data.msg === 'string') {
    result.detail = data.msg;
  }
  if (typeof data.successCount === 'number') {
    result.successCount = data.successCount;
  }
  if (typeof data.failureCount === 'number') {
    result.failureCount = data.failureCount;
  }

  return result;
}

// 应用解析结果
function applyParseResult(parseResult: ImportDialogParseResult) {
  displayFileName.value =
    parseResult.fileName || selectedFile.value?.name || '';
  sheetOptions.value = parseResult.sheets;
  selectedSheet.value =
    parseResult.currentSheet || parseResult.sheets[0]?.value || '';
  previewColumns.value = parseResult.previewColumns;
  previewRows.value = parseResult.previewRows;
  previewTotal.value = parseResult.total;
  mappings.value = buildMappings(parseResult.mappings);
}

// 执行文件解析
async function runParse(sheet?: string) {
  if (!selectedFile.value) {
    ElMessage.warning(t('components.importDialog.fileRequired'));
    return;
  }

  if (!props.parseFile) {
    ElMessage.error('未配置文件解析方法');
    return;
  }

  const currentToken = ++parseToken.value;
  parsing.value = true;

  try {
    const parseResult = await props.parseFile({
      file: selectedFile.value,
      mode: selectedMode.value,
      sheet,
    });

    if (currentToken !== parseToken.value) return;

    applyParseResult(parseResult);
    currentStep.value = 'preview';
  } catch (error) {
    if (currentToken !== parseToken.value) return;

    const message =
      error instanceof Error
        ? error.message
        : t('components.importDialog.parseError');
    ElMessage.error(message);
  } finally {
    if (currentToken === parseToken.value) {
      parsing.value = false;
    }
  }
}

// 处理文件变更
function handleUploadChange(uploadFile: UploadFile) {
  const rawFile = uploadFile.raw;
  uploadRef.value?.clearFiles();

  if (!rawFile) return;
  if (!validateFile(rawFile)) return;

  selectedFile.value = rawFile;
  displayFileName.value = rawFile.name;
  currentStep.value = 'upload';
  resetParsedState();
  emit('fileChange', rawFile);
}

// 处理导入方式变更
function handleModeChange(value: boolean | number | string | undefined) {
  if (typeof value !== 'string') return;

  selectedMode.value = value;
  resetParsedState();
  currentStep.value = 'upload';
}

// 处理 sheet 切换
async function handleSheetChange(value: string) {
  if (!value || !selectedFile.value) return;
  await runParse(value);
}

// 校验映射数据
function validateMappings(): boolean {
  // if (!mappings.value.length) {
  //   ElMessage.warning(t('components.importDialog.mappingEmpty'));
  //   return false;
  // }

  const requiredField = mappings.value.find(
    (item) => item.required && !item.sourceColumn,
  );
  if (requiredField) {
    ElMessage.warning(
      t('components.importDialog.mappingRequired', {
        field: requiredField.targetLabel,
      }),
    );
    return false;
  }

  const selectedColumns = mappings.value
    .map((item) => item.sourceColumn)
    .filter(Boolean);
  if (new Set(selectedColumns).size !== selectedColumns.length) {
    ElMessage.warning(t('components.importDialog.mappingDuplicate'));
    return false;
  }

  return true;
}

// 进入下一步
async function handleNext() {
  if (currentStep.value === 'upload') {
    if (isApiMode.value) {
      await handleDirectImport();
      return;
    }

    await runParse();
    return;
  }

  if (currentStep.value === 'preview') {
    currentStep.value = 'mapping';
    return;
  }

  if (currentStep.value === 'mapping') {
    await handleImport();
  }
}

// 直传模式由后端完成解析和导入，前端只负责上传文件。
async function handleDirectImport() {
  if (!selectedFile.value) {
    ElMessage.warning(t('components.importDialog.fileRequired'));
    return;
  }

  if (!props.api) {
    ElMessage.error('未配置导入接口');
    return;
  }

  currentStep.value = 'importing';
  importing.value = true;
  progress.value = 8;
  progressMessage.value = t('components.importDialog.importingStart');

  try {
    const response = await requestClient.upload<unknown>(
      normalizeRequestUrl(props.api),
      {
        file: selectedFile.value,
        mode: selectedMode.value,
      },
      {
        onUploadProgress: (event) => {
          if (!event.total) return;
          handleProgress(8 + Math.round((event.loaded / event.total) * 84));
        },
      },
    );
    const submitResult = normalizeImportResult(response);

    progress.value = 100;
    result.value = submitResult;

    if (submitResult.success) {
      emit('success', submitResult);
    } else {
      emit('error', submitResult);
    }
  } catch (error) {
    const errorResult: ImportDialogSubmitResult = {
      success: false,
      detail: getErrorMessage(error, t('components.importDialog.importError')),
    };

    progress.value = 100;
    result.value = errorResult;
    emit('error', error instanceof Error ? error : errorResult);
  } finally {
    importing.value = false;
  }
}

// 返回上一步
function handlePrevious() {
  if (currentStep.value === 'mapping') {
    currentStep.value = 'preview';
    return;
  }

  if (currentStep.value === 'preview') {
    currentStep.value = 'upload';
  }
}

// 更新导入进度
function handleProgress(nextProgress: number, message?: string) {
  progress.value = Math.max(0, Math.min(100, Math.round(nextProgress)));
  if (message) {
    progressMessage.value = message;
  }
}

// 执行导入
async function handleImport() {
  if (!selectedFile.value) {
    ElMessage.warning(t('components.importDialog.fileRequired'));
    return;
  }

  if (!selectedSheet.value) {
    ElMessage.warning(t('components.importDialog.sheetRequired'));
    return;
  }

  if (!validateMappings()) {
    return;
  }

  currentStep.value = 'importing';
  importing.value = true;
  progress.value = 8;
  progressMessage.value = t('components.importDialog.importingStart');

  try {
    if (!props.submitImport) {
      throw new Error('未配置导入方法');
    }

    const submitResult = await props.submitImport({
      file: selectedFile.value,
      mode: selectedMode.value,
      sheet: selectedSheet.value,
      mappings: mappings.value,
      onProgress: handleProgress,
    });

    progress.value = 100;
    result.value = submitResult;

    if (submitResult.success) {
      emit('success', submitResult);
    } else {
      emit('error', submitResult);
    }
  } catch (error) {
    const errorResult: ImportDialogSubmitResult = {
      success: false,
      detail:
        error instanceof Error
          ? error.message
          : t('components.importDialog.importError'),
    };

    progress.value = 100;
    result.value = errorResult;
    emit('error', error instanceof Error ? error : errorResult);
  } finally {
    importing.value = false;
  }
}
</script>

<template>
  <Modal
    :title="dialogTitle"
    class="import-dialog__dialog w-[600px]"
    :closable="false"
    :close-on-click-modal="false"
    :close-on-press-escape="!importing"
    :fullscreen-button="false"
  >
    <template #title>
      <!-------------------------- 弹窗头部 -------------------------->
      <div class="import-dialog__header">
        <div class="import-dialog__title">{{ dialogTitle }}</div>
        <div class="import-dialog__header-actions">
          <ElButton
            text
            circle
            class="import-dialog__action"
            @click="toggleFullscreen"
          >
            <ElIcon :size="16">
              <ScaleToOriginal v-if="fullscreen" />
              <FullScreen v-else />
            </ElIcon>
          </ElButton>
          <ElButton
            text
            circle
            class="import-dialog__action"
            @click="closeDialog"
          >
            <ElIcon :size="16">
              <Close />
            </ElIcon>
          </ElButton>
        </div>
      </div>
    </template>

    <div class="import-dialog">
      <!-------------------------- 步骤条 -------------------------->
      <div v-if="showSteps" class="import-dialog__steps">
        <div
          v-for="(stepLabel, index) in stepItems"
          :key="stepLabel"
          class="import-dialog__step"
        >
          <div
            class="import-dialog__step-node"
            :class="{
              'is-active':
                (currentStep === 'upload' && index === 0) ||
                (currentStep === 'preview' && index === 1) ||
                (currentStep === 'mapping' && index === 2) ||
                (currentStep === 'importing' && index === 3),
              'is-done':
                (currentStep === 'preview' && index === 0) ||
                (currentStep === 'mapping' && index <= 1) ||
                (currentStep === 'importing' && index <= 2),
            }"
          >
            <ElIcon
              v-if="
                (currentStep === 'preview' && index === 0) ||
                (currentStep === 'mapping' && index <= 1) ||
                (currentStep === 'importing' && index <= 2)
              "
            >
              <Check />
            </ElIcon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="import-dialog__step-label">{{ stepLabel }}</div>
          <div
            v-if="index !== stepItems.length - 1"
            class="import-dialog__step-line"
            :class="{
              'is-active':
                (currentStep === 'preview' && index === 0) ||
                (currentStep === 'mapping' && index <= 1) ||
                (currentStep === 'importing' && index <= 2),
            }"
          ></div>
        </div>
      </div>

      <!-------------------------- 上传文件 -------------------------->
      <template v-if="currentStep === 'upload'">
        <div class="import-dialog__form-label">
          <span>{{ t('components.importDialog.modeLabel') }}</span>
          <ElTooltip :content="t('components.importDialog.modeHelp')">
            <ElIcon class="import-dialog__info">
              <InfoFilled />
            </ElIcon>
          </ElTooltip>
        </div>

        <ElRadioGroup
          :model-value="selectedMode"
          class="import-dialog__mode-group"
          @update:model-value="handleModeChange"
        >
          <ElRadio
            v-for="option in modeOptions"
            :key="option.value"
            :label="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </ElRadio>
        </ElRadioGroup>

        <ElUpload
          ref="uploadRef"
          class="import-dialog__upload"
          drag
          :auto-upload="false"
          :show-file-list="false"
          :accept="acceptText"
          :on-change="handleUploadChange"
        >
          <div class="import-dialog__upload-inner">
            <div class="import-dialog__upload-icon">
              <ElIcon :size="20">
                <Plus />
              </ElIcon>
            </div>
            <div class="import-dialog__upload-title">
              {{ t('components.importDialog.uploadPlaceholder') }}
              <span class="import-dialog__upload-link">
                {{ t('components.importDialog.selectUpload') }}
              </span>
            </div>
            <div class="import-dialog__upload-subtitle">
              {{
                t('components.importDialog.supportedTypes', {
                  types: acceptLabel,
                })
              }}
            </div>
            <div v-if="uploadFileName" class="import-dialog__upload-name">
              {{ uploadFileName }}
            </div>
          </div>
        </ElUpload>

        <div class="import-dialog__download">
          <ElIcon :size="14">
            <Download />
          </ElIcon>
          <span>{{ t('components.importDialog.templateText') }}</span>
          <button
            type="button"
            class="import-dialog__download-button"
            @click="handleDownloadTemplate"
          >
            {{ t('components.importDialog.downloadTemplate') }}
          </button>
        </div>

        <div class="import-dialog__tips">
          <div
            v-for="tip in tipList"
            :key="tip"
            class="import-dialog__tip-item"
          >
            {{ tip }}
          </div>
        </div>
      </template>

      <!-------------------------- 确认数据 -------------------------->
      <template v-else-if="currentStep === 'preview'">
        <div class="import-dialog__preview-header">
          <div class="import-dialog__preview-field">
            <div class="import-dialog__form-label">
              {{ t('components.importDialog.fileLabel') }}
            </div>
            <ElInput :model-value="uploadFileName" readonly />
          </div>

          <div class="import-dialog__preview-field">
            <div class="import-dialog__form-label">
              {{ t('components.importDialog.sheetLabel') }}
            </div>
            <ElSelect
              v-model="selectedSheet"
              class="import-dialog__sheet-select"
              :disabled="parsing"
              @change="handleSheetChange"
            >
              <ElOption
                v-for="sheet in sheetOptions"
                :key="sheet.value"
                :label="sheet.label"
                :value="sheet.value"
              />
            </ElSelect>
          </div>
        </div>

        <ElTable
          v-loading="parsing"
          :data="previewRows"
          border
          height="352"
          class="import-dialog__table"
        >
          <ElTableColumn
            v-for="column in previewColumns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth || 120"
            show-overflow-tooltip
          />
        </ElTable>

        <div class="import-dialog__preview-summary">{{ previewSummary }}</div>
      </template>

      <!-------------------------- 字段映射 -------------------------->
      <template v-else-if="currentStep === 'mapping'">
        <div class="import-dialog__mapping-header">
          <div>{{ t('components.importDialog.mappingExcelColumn') }}</div>
          <div></div>
          <div>{{ t('components.importDialog.mappingTargetField') }}</div>
          <div>{{ t('components.importDialog.mappingDuplicateLabel') }}</div>
        </div>

        <div class="import-dialog__mapping-body">
          <div
            v-for="mapping in mappings"
            :key="mapping.targetField"
            class="import-dialog__mapping-row"
          >
            <ElSelect
              v-model="mapping.sourceColumn"
              clearable
              :placeholder="t('common.pleaseSelect')"
            >
              <ElOption
                v-for="option in sourceColumnOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>

            <div class="import-dialog__mapping-arrow">
              <ElIcon :size="18">
                <ArrowRight />
              </ElIcon>
            </div>

            <div
              class="import-dialog__mapping-target"
              :class="{ 'is-required': mapping.required }"
            >
              {{ mapping.targetLabel }}
            </div>

            <div class="import-dialog__mapping-checkbox">
              <ElCheckbox
                v-model="mapping.duplicateCheck"
                :disabled="!mapping.allowDuplicateCheck"
              />
            </div>
          </div>
        </div>
      </template>

      <!-------------------------- 结果态 -------------------------->
      <template v-else-if="isResultState">
        <div
          class="import-dialog__result-illustration"
          :class="{
            'is-success': result?.success,
            'is-error': !result?.success,
          }"
        >
          <div class="import-dialog__result-card">
            <div class="import-dialog__result-layer"></div>
            <div class="import-dialog__result-layer is-front"></div>
          </div>
          <div class="import-dialog__result-badge">
            <ElIcon v-if="result?.success">
              <SuccessFilled />
            </ElIcon>
            <ElIcon v-else>
              <WarningFilled />
            </ElIcon>
          </div>
        </div>

        <div class="import-dialog__result-title">{{ resultTitle }}</div>
        <div class="import-dialog__result-description">
          {{ resultDescription }}
        </div>
        <div v-if="result?.detail" class="import-dialog__result-detail">
          {{ result.detail }}
        </div>
      </template>

      <!-------------------------- 导入中 -------------------------->
      <template v-else-if="currentStep === 'importing'">
        <div class="import-dialog__progress">
          <ElProgress
            :percentage="progress"
            :stroke-width="10"
            :show-text="false"
            color="var(--color-success)"
          />
          <div class="import-dialog__progress-icon">
            <ElIcon color="var(--color-success)">
              <SuccessFilled />
            </ElIcon>
          </div>
        </div>

        <div class="import-dialog__progress-title">
          {{ t('components.importDialog.importingTitle') }}
        </div>
        <div class="import-dialog__progress-description">
          {{ importingDescription }}
        </div>
        <div class="import-dialog__progress-hint">
          {{ t('components.importDialog.importingHint') }}
        </div>
      </template>
    </div>

    <template #footer>
      <!-------------------------- 弹窗底部 -------------------------->
      <div class="import-dialog__footer">
        <template v-if="currentStep === 'preview' || currentStep === 'mapping'">
          <ElButton @click="handlePrevious">
            {{ t('components.importDialog.previous') }}
          </ElButton>
          <ElButton
            type="primary"
            :loading="parsing || importing"
            @click="handleNext"
          >
            {{
              currentStep === 'mapping'
                ? t('components.importDialog.startImport')
                : t('components.importDialog.next')
            }}
          </ElButton>
        </template>

        <template v-else-if="currentStep === 'upload'">
          <ElButton
            type="primary"
            :loading="parsing || importing"
            @click="handleNext"
          >
            {{
              isApiMode
                ? t('components.importDialog.startImport')
                : t('components.importDialog.next')
            }}
          </ElButton>
        </template>

        <template v-else>
          <ElButton @click="closeDialog">
            {{ t('common.close') }}
          </ElButton>
        </template>
      </div>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
.import-dialog {
  --import-dialog-primary: hsl(var(--primary));
  --import-dialog-primary-foreground: hsl(var(--primary-foreground));
  --import-dialog-primary-soft: hsl(var(--primary) / 8%);
  --import-dialog-primary-softer: hsl(var(--primary) / 4%);
  --import-dialog-primary-shadow: hsl(var(--primary) / 18%);

  color: var(--color-text-primary);
}

.import-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 4px;
}

.import-dialog__header-actions {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.import-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.import-dialog__action {
  color: var(--color-text-secondary);
}

.import-dialog__action:hover {
  color: var(--import-dialog-primary);
  background: var(--import-dialog-primary-soft);
}

.import-dialog__steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  margin: 4px 12px 24px;
}

.import-dialog__step {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.import-dialog__step-node {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.import-dialog__step-node.is-active,
.import-dialog__step-node.is-done {
  color: var(--import-dialog-primary);
  border-color: var(--import-dialog-primary);
}

.import-dialog__step-node.is-active {
  color: var(--import-dialog-primary-foreground);
  background: var(--import-dialog-primary);
}

.import-dialog__step-label {
  font-size: 12px;
  line-height: 18px;
  color: var(--color-text-secondary);
  text-align: center;
}

.import-dialog__step-line {
  position: absolute;
  top: 11px;
  left: calc(50% + 18px);
  width: calc(100% - 36px);
  height: 1px;
  background: hsl(var(--border));
}

.import-dialog__step-line.is-active {
  background: var(--import-dialog-primary);
}

.import-dialog__form-label {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.import-dialog__info {
  color: var(--color-text-secondary);
}

.import-dialog__mode-group {
  margin-bottom: 18px;
}

.import-dialog__upload {
  margin-bottom: 16px;
}

.import-dialog__upload :deep(.el-upload-dragger) {
  padding: 20px 24px;
  background: linear-gradient(
    180deg,
    hsl(var(--card)) 0%,
    var(--import-dialog-primary-softer) 100%
  );
  border: 1px dashed hsl(var(--border));
  border-radius: 8px;
}

.import-dialog__upload-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 112px;
}

.import-dialog__upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--import-dialog-primary-foreground);
  background: var(--import-dialog-primary);
  border-radius: 6px;
  box-shadow: 0 10px 22px var(--import-dialog-primary-shadow);
}

.import-dialog__upload-title {
  font-size: 14px;
  color: var(--color-text-primary);
}

.import-dialog__upload-link {
  margin-left: 4px;
  color: var(--import-dialog-primary);
}

.import-dialog__upload-subtitle,
.import-dialog__upload-name {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.import-dialog__download {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 14px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.import-dialog__download-button {
  padding: 0;
  color: var(--import-dialog-primary);
  cursor: pointer;
  background: transparent;
  border: none;
}

.import-dialog__tips {
  padding: 10px 12px;
  background: var(--color-bg-hover);
  border-radius: 8px;
}

.import-dialog__tip-item {
  position: relative;
  padding-left: 12px;
  font-size: 12px;
  line-height: 24px;
  color: var(--color-text-secondary);
}

.import-dialog__tip-item::before {
  position: absolute;
  left: 0;
  content: '·';
}

.import-dialog__preview-header {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 16px;
  margin-bottom: 16px;
}

.import-dialog__sheet-select {
  width: 100%;
}

.import-dialog__table {
  margin-bottom: 12px;
}

.import-dialog__preview-summary {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.import-dialog__mapping-header,
.import-dialog__mapping-row {
  display: grid;
  grid-template-columns: 1fr 36px 1fr 96px;
  gap: 14px;
  align-items: center;
}

.import-dialog__mapping-header {
  padding: 0 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.import-dialog__mapping-body {
  max-height: 328px;
  padding-right: 6px;
  overflow-y: auto;
}

.import-dialog__mapping-row {
  padding: 0 8px;
  margin-bottom: 12px;
}

.import-dialog__mapping-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--import-dialog-primary);
}

.import-dialog__mapping-target {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.import-dialog__mapping-target.is-required::before {
  margin-right: 4px;
  color: var(--color-danger);
  content: '*';
}

.import-dialog__mapping-checkbox {
  display: flex;
  justify-content: center;
}

.import-dialog__progress {
  position: relative;
  margin: 32px 32px 18px;
}

.import-dialog__progress-icon {
  position: absolute;
  top: -2px;
  right: -20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.import-dialog__progress-title,
.import-dialog__result-title {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
}

.import-dialog__progress-description,
.import-dialog__progress-hint,
.import-dialog__result-description,
.import-dialog__result-detail {
  font-size: 13px;
  line-height: 22px;
  color: var(--color-text-secondary);
  text-align: center;
}

.import-dialog__progress-hint {
  margin-top: 8px;
}

.import-dialog__result-illustration {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 132px;
  margin: 0 auto 18px;
}

.import-dialog__result-card {
  position: relative;
  width: 88px;
  height: 72px;
}

.import-dialog__result-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    hsl(var(--primary) / 10%) 0%,
    hsl(var(--primary) / 45%) 40%,
    var(--import-dialog-primary) 100%
  );
  border-radius: 16px;
  opacity: 0.65;
  transform: translateY(-10px) scale(0.92);
}

.import-dialog__result-layer.is-front {
  box-shadow: 0 18px 30px hsl(var(--primary) / 20%);
  opacity: 1;
  transform: translateY(0) scale(1);
}

.import-dialog__result-badge {
  position: absolute;
  right: 44px;
  bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 20px;
  background: hsl(var(--card));
  border-radius: 50%;
}

.import-dialog__result-illustration.is-success .import-dialog__result-badge {
  color: var(--color-success);
}

.import-dialog__result-illustration.is-error .import-dialog__result-badge {
  color: var(--color-danger);
}

.import-dialog__result-detail {
  margin-top: 6px;
}

.import-dialog__footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

[data-theme='dark'] .import-dialog__upload :deep(.el-upload-dragger),
html.dark .import-dialog__upload :deep(.el-upload-dragger) {
  background: linear-gradient(
    180deg,
    hsl(var(--card)) 0%,
    hsl(var(--primary) / 10%) 100%
  );
}
</style>

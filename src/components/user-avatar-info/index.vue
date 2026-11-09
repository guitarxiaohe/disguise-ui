<script setup lang="ts">
import type { Component } from 'vue';

import {
  computed,
  markRaw,
  nextTick,
  ref,
  useSlots,
  watch,
  watchEffect,
} from 'vue';
import { ElAvatar, ElDrawer, ElTooltip } from 'element-plus';
import { useI18n } from '@/runtime/i18n';
import type { UserAvatarDrawerField } from '@/runtime/context';
import { getUserAvatarDrawerFields } from '@/runtime/context';

import { useImageUrl } from '@/composables/use-image-url';
import {
  Briefcase,
  Building2,
  Cake,
  CalendarDays,
  Image,
  Mail,
  Mars,
  Phone,
  User,
  Venus,
} from 'lucide-vue-next';

/** ****************************** props ********************************/
const props = withDefaults(
  defineProps<{
    userId?: number | string;
    name?: string;
    subtitle?: string;
    src?: string;
    gender?: UserAvatarGenderInput;
    size?: number;
    avatar?: Record<string, unknown>;
    drawerAvatarSize?: number;
    age?: number | string;
    workYears?: number | string;
    email?: string;
    phone?: string;
    department?: string;
    jobLevel?: string;
    enableDrawer?: boolean;
    drawerTitle?: string;
    drawerSize?: number | string;
    drawerProps?: Record<string, unknown>;
    drawerFields?: UserAvatarDrawerField[];
    nickName?: string;
    deptName?: string;
    sex?: string;
  }>(),
  {
    nickName: '',
    deptName: '',
    userId: undefined,
    name: undefined,
    subtitle: '',
    size: 30,
    sex: '',
    gender: undefined,
    avatar: undefined,
    age: undefined,
    workYears: undefined,
    email: undefined,
    phone: undefined,
    department: undefined,
    jobLevel: undefined,
    enableDrawer: true,
    drawerTitle: undefined,
    drawerSize: '40%',
    drawerProps: undefined,
    drawerAvatarSize: 64,
    drawerFields: undefined,
  },
);
const { ensureImageBaseUrl, resolveImageUrl } = useImageUrl();
void ensureImageBaseUrl();

export type UserAvatarGenderInput =
  | 1
  | 2
  | ''
  | 'F'
  | 'f'
  | 'female'
  | 'M'
  | 'm'
  | 'male'
  | 'unknown'
  | '女'
  | '男';

/**
 * 抽屉详情卡片字段配置（UserAvatarDrawerField）定义在 @/runtime/context，
 * 可通过 setupDisguise({ userAvatarDrawerFields }) 全局注入，
 * 组件 drawerFields prop 优先于全局配置。
 */

const drawerVisible = defineModel<boolean>('drawerVisible', { default: false });
const drawerRendered = ref(false);

watch(
  drawerVisible,
  (v) => {
    if (v) drawerRendered.value = true;
  },
  { immediate: true },
);

function onDrawerClosed() {
  drawerRendered.value = false;
}

const { t } = useI18n();
const slots = useSlots();

/** ****************************** 展示数据（全部来自 props） ********************************/
const displayName = computed(() => props.nickName || props.name || '');
const displaySubtitle = computed(() => props.subtitle || props.deptName || '');
const displayAge = computed(() => props.age);
const displayWorkYears = computed(() => props.workYears);
const displayJobLevel = computed(() => props.jobLevel);
const displayEmail = computed(() => props.email);
const displayPhone = computed(() => props.phone);
const displayDepartment = computed(
  () => props.department || props.deptName || '',
);

const drawerName = computed(() => props.nickName || props.name || '');
const drawerUserId = computed(() => props.userId);
const hasDrawerDefaultSlot = computed(() => !!slots.default);

/** 判断性别来源 */
const genderSource = computed<'female' | 'male' | 'unknown'>(() => {
  if (
    props.gender !== undefined &&
    props.gender !== null &&
    props.gender !== ''
  ) {
    return props.gender as 'female' | 'male' | 'unknown';
  }
  const sex = props.sex;
  if (sex === '0') return 'male';
  if (sex === '1') return 'female';
  return 'unknown';
});

/** 抽屉性别与触发器一致（不再读远程数据） */
const drawerGenderSource = computed(() => genderSource.value);

/** 统一使用性别作为主题色依据 */
const isFemaleTheme = computed(() => genderSource.value === 'female');

// ======== 动态主题配置 ========
const themeClass = computed(() =>
  isFemaleTheme.value ? 'theme-female' : 'theme-male',
);

// 触发器性别文字颜色
const metaClass = computed(() => ({
  '!text-blue-600': genderSource.value === 'male',
  '!text-pink-500': genderSource.value === 'female',
}));

const drawerGenderLabel = computed(() => {
  if (drawerGenderSource.value === 'male')
    return t('components.userAvatarInfo.genderMale');
  if (drawerGenderSource.value === 'female')
    return t('components.userAvatarInfo.genderFemale');
  return t('components.userAvatarInfo.genderUnknown');
});

const drawerShowGenderBadge = computed(
  () =>
    drawerGenderSource.value === 'male' ||
    drawerGenderSource.value === 'female',
);

const showGenderBadge = computed(
  () => genderSource.value === 'male' || genderSource.value === 'female',
);

const showPresenceBadge = computed(
  () => props.userId != null && String(props.userId) !== '',
);

/** 无远程在线状态，保持离线态展示 */
const isUserOnline = computed(() => false);

const genderIconSize = computed(() =>
  Math.max(10, Math.min(16, Math.round(props.size * 0.36))),
);

const mergedAvatarProps = computed(() => ({
  ...props.avatar,
  size: props.size,
  src: resolveImageUrl(props.src || '--'),
  shape: 'circle' as const,
}));

const drawerTitleText = computed(
  () => props.drawerTitle ?? t('components.userAvatarInfo.drawerTitle'),
);

const drawerIconMap: Record<string, Component> = {
  avatar: markRaw(Image),
  name: markRaw(User),
  gender: markRaw(Mars),
  age: markRaw(Cake),
  workYears: markRaw(CalendarDays),
  email: markRaw(Mail),
  phone: markRaw(Phone),
  department: markRaw(Building2),
  jobLevel: markRaw(Briefcase),
  position: markRaw(Briefcase),
};

/** 未传 drawerFields 时的默认字段（保持原有顺序与文案） */
const defaultDrawerFields: UserAvatarDrawerField[] = [
  { key: 'name' },
  { key: 'gender' },
  { key: 'age' },
  { key: 'workYears' },
  { key: 'jobLevel' },
  { key: 'phone' },
  { key: 'email' },
  { key: 'department' },
];

/** 内置字段 key -> 默认国际化文案 key */
const drawerFieldLabelKeys: Record<string, string> = {
  name: 'components.userAvatarInfo.fieldName',
  gender: 'components.userAvatarInfo.fieldGender',
  age: 'components.userAvatarInfo.fieldAge',
  workYears: 'components.userAvatarInfo.fieldWorkYears',
  jobLevel: 'components.userAvatarInfo.fieldJobLevel',
  phone: 'components.userAvatarInfo.fieldPhone',
  email: 'components.userAvatarInfo.fieldEmail',
  department: 'components.userAvatarInfo.fieldDepartment',
};

/** 内置字段 key -> 展示值（全部来自现有 props 的 display* 计算属性） */
const drawerFieldValues = computed<Record<string, string>>(() => ({
  name: drawerName.value,
  gender: drawerGenderLabel.value,
  age: displayField(displayAge.value),
  workYears: displayField(displayWorkYears.value),
  jobLevel: displayField(displayJobLevel.value),
  phone: displayField(displayPhone.value),
  email: displayField(displayEmail.value),
  department: displayField(displayDepartment.value),
}));

const drawerDetailItems = computed(() => {
  const fields =
    props.drawerFields ??
    getUserAvatarDrawerFields().value ??
    defaultDrawerFields;
  return fields.map((field) => {
    const labelKey = drawerFieldLabelKeys[field.key];
    const value =
      field.value !== undefined
        ? displayField(field.value)
        : (drawerFieldValues.value[field.key] ?? displayField(undefined));
    return {
      key: field.key,
      label: field.label ?? (labelKey ? t(labelKey) : field.key),
      icon: field.icon ?? drawerIconMap[field.key] ?? drawerIconMap.name,
      value,
    };
  });
});

const mergedDrawerProps = computed(() => ({
  appendToBody: true,
  destroyOnClose: false,
  ...props.drawerProps,
}));

const triggerAriaLabel = computed(() =>
  props.enableDrawer
    ? `${t('components.userAvatarInfo.ariaLabel')}, ${t('components.userAvatarInfo.clickToViewDetail')}`
    : t('components.userAvatarInfo.ariaLabel'),
);

function displayField(v: unknown) {
  if (v === undefined || v === null || v === '')
    return t('components.userAvatarInfo.empty');
  return String(v);
}

const drawerDepartment = computed(() => displayField(displayDepartment.value));

function onTriggerClick() {
  if (!props.enableDrawer) return;
  drawerVisible.value = true;
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (!props.enableDrawer) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    drawerVisible.value = true;
  }
}

/** ****************************** 副标题省略与 hover 全文 ********************************/
const subtitleRef = ref<HTMLElement | null>(null);
const subtitleOverflow = ref(false);

function measureSubtitleOverflow() {
  const el = subtitleRef.value;
  if (!el) {
    subtitleOverflow.value = false;
    return;
  }
  subtitleOverflow.value = el.scrollWidth > el.clientWidth + 1;
}

watchEffect((onCleanup) => {
  const el = subtitleRef.value;
  if (!el || typeof ResizeObserver === 'undefined') {
    subtitleOverflow.value = false;
    return;
  }
  measureSubtitleOverflow();
  const ro = new ResizeObserver(() => measureSubtitleOverflow());
  ro.observe(el);
  onCleanup(() => ro.disconnect());
});

watch(
  () => displaySubtitle.value,
  () => nextTick(measureSubtitleOverflow),
);

function openDrawer() {
  drawerVisible.value = true;
}
function closeDrawer() {
  drawerVisible.value = false;
}

defineExpose({ openDrawer, closeDrawer });
</script>

<template>
  <div class="inline-block max-w-full">
    <!-- Trigger -->
    <div
      class="inline-flex items-center min-w-0 max-w-full gap-2 outline-none rounded-md"
      :class="{
        'cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-100':
          enableDrawer,
      }"
      :role="enableDrawer ? 'button' : undefined"
      :tabindex="enableDrawer ? 0 : undefined"
      :aria-label="triggerAriaLabel"
      :aria-disabled="!enableDrawer"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <div class="relative flex-shrink-0 w-fit">
        <ElAvatar
          class="inline-flex flex-shrink-0 items-center justify-center align-middle"
          v-bind="mergedAvatarProps"
        >
          <slot name="avatar">{{ displayName?.slice(0, 1) }}</slot>
        </ElAvatar>

        <!-- Gender Badge -->
        <span
          v-if="showGenderBadge"
          class="absolute -top-0.5 -right-0.5 z-[1] box-border inline-flex items-center justify-center w-3 h-3 pointer-events-none rounded-full border-2 border-white bg-white"
          :class="genderSource === 'male' ? 'text-blue-600' : 'text-pink-500'"
          aria-hidden="true"
        >
          <Mars
            v-if="genderSource === 'male'"
            :size="genderIconSize"
            :stroke-width="2.5"
          />
          <Venus v-else :size="genderIconSize" :stroke-width="2.5" />
        </span>

        <!-- Presence Badge -->
        <span
          v-if="showPresenceBadge"
          class="absolute right-0 bottom-0 z-[1] box-border w-2.5 h-2.5 pointer-events-none rounded-full border-2 border-white"
          :class="isUserOnline ? 'bg-emerald-500' : 'bg-gray-300'"
          aria-hidden="true"
        ></span>
      </div>

      <div
        class="flex flex-col flex-1 justify-center min-w-0 text-sm leading-[1.35]"
        :class="metaClass"
      >
        <div
          class="overflow-hidden text-ellipsis text-[13px] font-medium whitespace-nowrap"
        >
          <slot name="name">{{ displayName }}</slot>
        </div>
        <div v-if="displaySubtitle || $slots.subtitle" class="w-full min-w-0">
          <ElTooltip
            placement="top"
            :disabled="!subtitleOverflow"
            :show-after="200"
            popper-class="max-w-[min(90vw,380px)]"
          >
            <template #content>
              <div
                class="max-w-[min(90vw,360px)] text-[10px] leading-[1.45] break-words whitespace-normal"
              >
                <slot name="subtitle">{{ displaySubtitle }}</slot>
              </div>
            </template>
            <div
              ref="subtitleRef"
              class="min-w-0 overflow-hidden text-ellipsis text-[10px] whitespace-nowrap"
              :class="subtitleOverflow ? 'cursor-help' : ''"
            >
              <slot name="subtitle">{{ displaySubtitle }}</slot>
            </div>
          </ElTooltip>
        </div>
      </div>
    </div>

    <!-- Drawer (通过 themeClass 控制全局主题) -->
    <ElDrawer
      v-if="drawerRendered"
      v-model="drawerVisible"
      :size="drawerSize"
      class="user-avatar-info-drawer"
      :class="themeClass"
      v-bind="mergedDrawerProps"
      @closed="onDrawerClosed"
    >
      <template #header>
        <div class="flex items-center w-full min-h-[24px] gap-3">
          <span class="flex-1 font-semibold text-gray-900">{{
            drawerTitleText
          }}</span>
        </div>
      </template>

      <div v-if="hasDrawerDefaultSlot" class="text-sm text-gray-900">
        <slot></slot>
      </div>

      <div v-else class="flex flex-col gap-5 pt-2.5">
        <!-------------------------- 用户摘要 (Hero) -------------------------->
        <!-- 背景动态切换：男性浅蓝，女性浅粉 -->
        <section
          class="relative flex flex-col items-center sm:flex-row gap-5 min-h-[140px] p-6 overflow-hidden rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
          :class="
            isFemaleTheme
              ? 'bg-gradient-to-br from-pink-50 to-rose-100'
              : 'bg-gradient-to-br from-sky-50 to-indigo-100'
          "
        >
          <!-- 装饰光晕 -->
          <div
            class="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_70%)] rounded-full pointer-events-none"
          ></div>

          <div class="relative z-[1] flex-shrink-0">
            <slot name="drawer-avatar">
              <!-- 头像动态切换：粉色渐变/蓝色渐变 -->
              <ElAvatar
                :size="props.drawerAvatarSize"
                :src="mergedAvatarProps.src"
                class="!text-[24px] !font-semibold !text-white !border-[3px] !border-white"
                :class="
                  isFemaleTheme
                    ? '!bg-gradient-to-br !from-pink-400 !to-rose-500 !shadow-[0_4px_12px_rgba(244,63,94,0.2)]'
                    : '!bg-gradient-to-br !from-blue-400 !to-blue-500 !shadow-[0_4px_12px_rgba(59,130,246,0.2)]'
                "
              >
                {{ drawerName?.slice(0, 1) }}
              </ElAvatar>
            </slot>
          </div>

          <div class="relative z-[1] min-w-0 text-center sm:text-left">
            <div class="flex flex-col sm:flex-row items-center gap-3">
              <slot name="drawer-name">
                <strong
                  class="text-xl font-semibold text-slate-800 tracking-wide"
                >
                  {{ drawerName || t('components.userAvatarInfo.nameEmpty') }}
                </strong>
              </slot>
              <!-- 标签动态切换 -->
              <span
                v-if="drawerShowGenderBadge"
                class="px-2.5 py-0.5 text-xs font-medium leading-5 rounded-xl"
                :class="
                  isFemaleTheme
                    ? 'text-pink-600 bg-pink-600/10'
                    : 'text-blue-600 bg-blue-600/10'
                "
              >
                {{ drawerGenderLabel }}
              </span>
            </div>

            <div
              class="flex flex-wrap justify-center sm:justify-start gap-3 mt-2.5 text-[13px] text-slate-500"
            >
              <span
                v-if="drawerUserId"
                class="flex items-center px-2 py-0.5 font-mono bg-white/60 rounded-md"
              >
                {{ t('components.userAvatarInfo.fieldId') }}: {{ drawerUserId }}
              </span>
              <span v-if="drawerDepartment" class="flex items-center">
                {{ drawerDepartment }}
              </span>
            </div>
          </div>
        </section>

        <!-------------------------- 信息卡片 (Grid) -------------------------->
        <section class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="item in drawerDetailItems"
            :key="item.key"
            class="group flex items-center gap-4 min-w-0 p-4 sm:p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm transition-all duration-200"
          >
            <!-- 图标底色动态切换 -->
            <div
              class="flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-[10px] transition-colors"
              :class="
                isFemaleTheme
                  ? 'text-pink-500 bg-pink-50 group-hover:bg-pink-100'
                  : 'text-blue-500 bg-blue-50 group-hover:bg-blue-100'
              "
            >
              <component :is="item.icon" :size="18" :stroke-width="2" />
            </div>
            <div class="flex flex-col gap-1 min-w-0">
              <div class="text-xs text-slate-400">{{ item.label }}</div>
              <div
                class="overflow-hidden text-ellipsis text-sm font-semibold text-slate-800 whitespace-nowrap"
                :title="item.value"
              >
                {{ item.value }}
              </div>
            </div>
          </div>
        </section>
      </div>
    </ElDrawer>
  </div>
</template>

<style lang="scss">
/*
  由于 ElDrawer 挂载在 body 下，需要保留全局覆盖样式
*/
.user-avatar-info-drawer .el-drawer__header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  min-height: 32px;
  padding: 18px 24px 10px;
  margin: 0;
  color: #1e293b;
}

.user-avatar-info-drawer .el-drawer__body {
  padding: 16px 24px 24px;
  background-color: #f8fafc;
}

.user-avatar-info-drawer .el-drawer {
  background: #f8fafc;
}

.user-avatar-info-drawer .el-avatar > img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}

/* 卡片悬停效果：通过 CSS 变量动态控制边框和阴影颜色 */
.user-avatar-info-drawer.theme-male .group:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -4px rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.user-avatar-info-drawer.theme-female .group:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -4px rgba(244, 63, 94, 0.15);
  border-color: rgba(244, 63, 94, 0.3);
}
</style>

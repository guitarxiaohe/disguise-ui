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
  'user-avatar-info__meta--male': genderSource.value === 'male',
  'user-avatar-info__meta--female': genderSource.value === 'female',
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
  <div class="user-avatar-info">
    <!-- Trigger -->
    <div
      class="user-avatar-info__trigger"
      :class="{ 'user-avatar-info__trigger--interactive': enableDrawer }"
      :role="enableDrawer ? 'button' : undefined"
      :tabindex="enableDrawer ? 0 : undefined"
      :aria-label="triggerAriaLabel"
      :aria-disabled="!enableDrawer"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <div class="user-avatar-info__avatar-wrap">
        <ElAvatar class="user-avatar-info__avatar" v-bind="mergedAvatarProps">
          <slot name="avatar">{{ displayName?.slice(0, 1) }}</slot>
        </ElAvatar>

        <!-- Gender Badge -->
        <span
          v-if="showGenderBadge"
          class="user-avatar-info__gender-badge"
          :class="themeClass"
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
          class="user-avatar-info__presence-badge"
          :class="{ 'user-avatar-info__presence-badge--online': isUserOnline }"
          aria-hidden="true"
        ></span>
      </div>

      <div class="user-avatar-info__meta" :class="metaClass">
        <div class="user-avatar-info__name">
          <slot name="name">{{ displayName }}</slot>
        </div>
        <div
          v-if="displaySubtitle || $slots.subtitle"
          class="user-avatar-info__subtitle-wrap"
        >
          <ElTooltip
            placement="top"
            :disabled="!subtitleOverflow"
            :show-after="200"
            popper-class="user-avatar-info-tooltip"
          >
            <template #content>
              <div class="user-avatar-info-tooltip__content">
                <slot name="subtitle">{{ displaySubtitle }}</slot>
              </div>
            </template>
            <div
              ref="subtitleRef"
              class="user-avatar-info__subtitle"
              :class="{
                'user-avatar-info__subtitle--overflow': subtitleOverflow,
              }"
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
        <div class="user-avatar-info-drawer__header">
          <span class="user-avatar-info-drawer__title">{{
            drawerTitleText
          }}</span>
        </div>
      </template>

      <div
        v-if="hasDrawerDefaultSlot"
        class="user-avatar-info-drawer__custom-content"
      >
        <slot></slot>
      </div>

      <div v-else class="user-avatar-info-drawer__content">
        <!-------------------------- 用户摘要 (Hero) -------------------------->
        <!-- 背景动态切换：男性浅蓝，女性浅粉 -->
        <section class="user-avatar-info-drawer__hero">
          <!-- 装饰光晕 -->
          <div class="user-avatar-info-drawer__glow"></div>

          <div class="user-avatar-info-drawer__avatar-wrap">
            <slot name="drawer-avatar">
              <!-- 头像动态切换：粉色渐变/蓝色渐变 -->
              <ElAvatar
                :size="props.drawerAvatarSize"
                :src="mergedAvatarProps.src"
                class="user-avatar-info-drawer__avatar"
              >
                {{ drawerName?.slice(0, 1) }}
              </ElAvatar>
            </slot>
          </div>

          <div class="user-avatar-info-drawer__summary">
            <div class="user-avatar-info-drawer__name-row">
              <slot name="drawer-name">
                <strong class="user-avatar-info-drawer__name">
                  {{ drawerName || t('components.userAvatarInfo.nameEmpty') }}
                </strong>
              </slot>
              <!-- 标签动态切换 -->
              <span
                v-if="drawerShowGenderBadge"
                class="user-avatar-info-drawer__gender"
              >
                {{ drawerGenderLabel }}
              </span>
            </div>

            <div class="user-avatar-info-drawer__meta">
              <span v-if="drawerUserId" class="user-avatar-info-drawer__id">
                {{ t('components.userAvatarInfo.fieldId') }}: {{ drawerUserId }}
              </span>
              <span
                v-if="drawerDepartment"
                class="user-avatar-info-drawer__department"
              >
                {{ drawerDepartment }}
              </span>
            </div>
          </div>
        </section>

        <!-------------------------- 信息卡片 (Grid) -------------------------->
        <section class="user-avatar-info-drawer__grid">
          <div
            v-for="item in drawerDetailItems"
            :key="item.key"
            class="user-avatar-info-drawer__card"
          >
            <!-- 图标底色动态切换 -->
            <div class="user-avatar-info-drawer__icon">
              <component :is="item.icon" :size="18" :stroke-width="2" />
            </div>
            <div class="user-avatar-info-drawer__field">
              <div class="user-avatar-info-drawer__label">{{ item.label }}</div>
              <div class="user-avatar-info-drawer__value" :title="item.value">
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
/* 样式随组件发布，不依赖宿主生成 Tailwind utilities。抽屉和 tooltip 会传送至 body。 */
.user-avatar-info {
  display: inline-block;
  max-width: 100%;
}

.user-avatar-info__trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  border-radius: 6px;
  outline: none;
}

.user-avatar-info__trigger--interactive {
  cursor: pointer;

  &:focus-visible {
    box-shadow: 0 0 0 2px oklch(93.2% 0.032 255.585);
  }
}

.user-avatar-info__avatar-wrap {
  position: relative;
  flex-shrink: 0;
  width: fit-content;
}

.user-avatar-info__avatar.el-avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.user-avatar-info__gender-badge,
.user-avatar-info__presence-badge {
  position: absolute;
  z-index: 1;
  box-sizing: border-box;
  pointer-events: none;
  border: 2px solid #fff;
  border-radius: 50%;
}

.user-avatar-info__gender-badge {
  top: -2px;
  right: -2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  background: #fff;

  &.theme-male {
    color: oklch(54.6% 0.245 262.881);
  }

  &.theme-female {
    color: oklch(65.6% 0.241 354.308);
  }
}

.user-avatar-info__presence-badge {
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  background: oklch(87.2% 0.01 258.338);

  &--online {
    background: #10b981;
  }
}

.user-avatar-info__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  font-size: 14px;
  line-height: 1.35;

  &--male {
    color: oklch(54.6% 0.245 262.881);
  }

  &--female {
    color: oklch(65.6% 0.241 354.308);
  }
}

.user-avatar-info__name,
.user-avatar-info__subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-avatar-info__name {
  font-size: 13px;
  font-weight: 500;
}

.user-avatar-info__subtitle-wrap {
  width: 100%;
  min-width: 0;
}

.user-avatar-info__subtitle {
  min-width: 0;
  font-size: 10px;

  &--overflow {
    cursor: help;
  }
}

.user-avatar-info-tooltip.el-popper {
  max-width: min(90vw, 380px);
}

.user-avatar-info-tooltip__content {
  max-width: min(90vw, 360px);
  font-size: 10px;
  line-height: 1.45;
  overflow-wrap: break-word;
  white-space: normal;
}

.user-avatar-info-drawer {
  --user-avatar-accent: oklch(62.3% 0.214 259.815);
  --user-avatar-strong: oklch(54.6% 0.245 262.881);
  --user-avatar-soft: oklch(97% 0.014 254.604);
  --user-avatar-hover: oklch(93.2% 0.032 255.585);
  --user-avatar-hero-from: oklch(97.7% 0.013 236.62);
  --user-avatar-hero-to: oklch(93% 0.034 272.788);
  --user-avatar-from: oklch(70.7% 0.165 254.624);
  --user-avatar-to: oklch(62.3% 0.214 259.815);
  --user-avatar-shadow: 59, 130, 246;

  &.theme-female {
    --user-avatar-accent: oklch(65.6% 0.241 354.308);
    --user-avatar-strong: oklch(59.2% 0.249 0.584);
    --user-avatar-soft: oklch(97.1% 0.014 343.198);
    --user-avatar-hover: oklch(94.8% 0.028 342.258);
    --user-avatar-hero-from: oklch(97.1% 0.014 343.198);
    --user-avatar-hero-to: oklch(94.1% 0.03 12.58);
    --user-avatar-from: oklch(71.8% 0.202 349.761);
    --user-avatar-to: oklch(64.5% 0.246 16.439);
    --user-avatar-shadow: 244, 63, 94;
  }

  &.el-drawer {
    line-height: 1.5;
  }

  .el-drawer__header {
    display: flex;
    box-sizing: border-box;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    min-height: 32px;
    padding: 18px 24px 10px;
    margin: 0;
    color: #1e293b;
  }

  .el-drawer__body {
    padding: 16px 24px 24px;
    background-color: #f8fafc;
  }

  .el-avatar > img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }
}

.user-avatar-info-drawer__header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 24px;
}

.user-avatar-info-drawer__title {
  flex: 1;
  font-weight: 600;
  color: #111827;
}

.user-avatar-info-drawer__custom-content {
  font-size: 14px;
  color: #111827;
}

.user-avatar-info-drawer__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 10px;
}

.user-avatar-info-drawer__hero {
  position: relative;
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-height: 140px;
  padding: 24px;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(
    to bottom right in oklab,
    var(--user-avatar-hero-from),
    var(--user-avatar-hero-to)
  );
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 60%);
}

.user-avatar-info-drawer__glow {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  pointer-events: none;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgb(255 255 255 / 80%) 0%,
    rgb(255 255 255 / 0%) 70%
  );
}

.user-avatar-info-drawer__avatar-wrap {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.user-avatar-info-drawer .user-avatar-info-drawer__avatar.el-avatar {
  box-sizing: border-box;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  border: 3px solid #fff;
  background: linear-gradient(
    to bottom right in oklab,
    var(--user-avatar-from),
    var(--user-avatar-to)
  );
  box-shadow: 0 4px 12px rgba(var(--user-avatar-shadow), 0.2);
}

.user-avatar-info-drawer__summary {
  position: relative;
  z-index: 1;
  min-width: 0;
  text-align: center;
}

.user-avatar-info-drawer__name-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.user-avatar-info-drawer__name {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: oklch(27.9% 0.041 260.031);
}

.user-avatar-info-drawer__gender {
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  color: var(--user-avatar-strong);
  border-radius: 12px;
  background: color-mix(in oklab, var(--user-avatar-strong) 10%, transparent);
}

.user-avatar-info-drawer__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
  font-size: 13px;
  color: oklch(55.4% 0.046 257.417);
}

.user-avatar-info-drawer__id,
.user-avatar-info-drawer__department {
  display: flex;
  align-items: center;
}

.user-avatar-info-drawer__id {
  padding: 2px 8px;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  border-radius: 6px;
  background: rgb(255 255 255 / 60%);
}

.user-avatar-info-drawer__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.user-avatar-info-drawer__card {
  display: flex;
  box-sizing: border-box;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 16px;
  border: 1px solid oklch(92.9% 0.013 255.508 / 80%);
  border-radius: 12px;
  background: #fff;
  box-shadow:
    0 1px 3px 0 #0000001a,
    0 1px 2px -1px #0000001a;
  transition:
    transform 200ms,
    border-color 200ms,
    box-shadow 200ms;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(var(--user-avatar-shadow), 0.3);
    box-shadow: 0 6px 16px -4px rgba(var(--user-avatar-shadow), 0.15);
  }
}

.user-avatar-info-drawer__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--user-avatar-accent);
  border-radius: 10px;
  background: var(--user-avatar-soft);
  transition: background-color 150ms;

  .user-avatar-info-drawer__card:hover & {
    background: var(--user-avatar-hover);
  }
}

.user-avatar-info-drawer__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.user-avatar-info-drawer__label {
  font-size: 12px;
  line-height: 16px;
  color: oklch(70.4% 0.04 256.788);
}

.user-avatar-info-drawer__value {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: oklch(27.9% 0.041 260.031);
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .user-avatar-info-drawer__hero,
  .user-avatar-info-drawer__name-row {
    flex-direction: row;
  }

  .user-avatar-info-drawer__summary {
    text-align: left;
  }

  .user-avatar-info-drawer__meta {
    justify-content: flex-start;
  }

  .user-avatar-info-drawer__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .user-avatar-info-drawer__card {
    padding: 20px;
  }
}
</style>

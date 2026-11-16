import type { DisguiseUserData } from '@/runtime/user';

import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import {
  getUserDataLoader,
  getUserDataSourceVersion,
  getUserLookupFields,
} from '@/runtime/context';
import { USER_DATA_ALL_QUERY_KEY } from '@/runtime/user';

export interface AvatarCellProps {
  row?: Record<string, any>;
  value?: unknown;
  field?: string;
  cellProps?: Record<string, any>;
}

const INFO_KEYS = [
  'userId',
  'nickName',
  'subtitle',
  'gender',
  'sex',
  'age',
  'workYears',
  'jobLevel',
  'email',
  'phone',
  'department',
  'deptName',
  'size',
  'drawerAvatarSize',
  'drawerTitle',
  'drawerSize',
  'drawerProps',
  'drawerFields',
  'enableDrawer',
] as const;

function isBlank(value: unknown) {
  return value === undefined || value === null || value === '';
}

/** 分层转换别名，保证显式 cellProps.src 等属性也能覆盖远程 avatar。 */
function toAvatarProps(data: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const key of INFO_KEYS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  const name = data.name ?? data.userName;
  if (name !== undefined) out.name = name;
  const src = typeof data.avatar === 'string' ? data.avatar : data.src;
  if (src !== undefined) out.src = src;
  const avatar =
    data.avatar && typeof data.avatar === 'object'
      ? data.avatar
      : data.avatarProps;
  if (avatar !== undefined) out.avatar = avatar;
  return out;
}

/** 在单元格 setup 中调用一次，列值变化只更新匹配，不重复建立查询订阅。 */
export function useAvatarCell(props: AvatarCellProps) {
  const loader = getUserDataLoader();
  const lookupField = computed(() => {
    const fields = getUserLookupFields().value;
    return props.field && Object.hasOwn(fields, props.field)
      ? fields[props.field]
      : undefined;
  });

  // 未注入用户源时保留纯展示用法，不额外要求宿主安装 VueQueryPlugin。
  const query = loader.value
    ? useQuery({
        queryKey: computed(() => [
          ...USER_DATA_ALL_QUERY_KEY,
          getUserDataSourceVersion().value,
        ]),
        queryFn: () => loader.value?.() ?? Promise.resolve([]),
        enabled: computed(
          () => !!loader.value && !!lookupField.value && !isBlank(props.value),
        ),
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
      })
    : undefined;

  const user = computed<DisguiseUserData | undefined>(() => {
    const field = lookupField.value;
    if (!field || isBlank(props.value)) return undefined;
    return query?.data.value?.find(
      (item) =>
        !isBlank(item[field]) && String(item[field]) === String(props.value),
    );
  });

  return computed(() => {
    const mapped = !!lookupField.value;
    // 旧用法先合并整行与 cellProps，再解析别名，保持 name/userName、avatar/src 的原有优先级。
    if (!mapped) {
      return toAvatarProps({ ...props.row, ...props.cellProps });
    }
    // createBy 等关联列不能从业务行借用 userId、昵称、邮箱或头像。
    const inline =
      !mapped || props.field === lookupField.value
        ? toAvatarProps(props.row ?? {})
        : {};
    const explicit = toAvatarProps(props.cellProps ?? {});
    const hasDetails =
      !!user.value ||
      [inline, explicit].some((data) =>
        [
          'userId',
          'name',
          'nickName',
          'src',
          'email',
          'phone',
          'deptName',
          'department',
        ].some((key) => !isBlank(data[key])),
      );
    return {
      ...(mapped
        ? {
            name: isBlank(props.value) ? '--' : String(props.value),
            enableDrawer: hasDetails,
          }
        : {}),
      ...inline,
      ...toAvatarProps(user.value ?? {}),
      ...explicit,
    };
  });
}

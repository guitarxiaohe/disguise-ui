import type { UserAvatarGenderInput } from '../components/user-avatar-info/index.vue';

/** 宿主提供的用户展示数据；后端字段在 setupDisguise 的取数函数中统一转换。 */
export interface DisguiseUserData {
  userId?: number | string;
  userName?: string;
  name?: string;
  nickName?: string;
  avatar?: string;
  src?: string;
  subtitle?: string;
  gender?: UserAvatarGenderInput;
  sex?: string;
  age?: number | string;
  workYears?: number | string;
  jobLevel?: string;
  email?: string;
  phone?: string;
  department?: string;
  deptName?: string;
}

/** 业务列字段 → 用户数据中的匹配字段，如 createBy → userName。 */
export type UserLookupFields = Record<string, keyof DisguiseUserData>;

/** 可用于 invalidateQueries / resetQueries，刷新资料或清除登录态相关缓存。 */
export const USER_DATA_ALL_QUERY_KEY = ['disguise-ui', 'user', 'all'] as const;

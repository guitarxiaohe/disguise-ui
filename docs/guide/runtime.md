# 运行时注入

`setupDisguise` 是组件库和宿主后台之间的边界。字典、上传、权限、请求和文案都从这里进入，组件源码里不写死接口地址。

## 配置项

| 名称                     | 类型                                               | 说明                                                                                             |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `locale`                 | `string`                                           | 内置文案语言，默认 `zh-CN`                                                                       |
| `messages`               | `Record<string, Record<string, unknown>>`          | 覆盖内置文案，key 路径与组件里的 `t()` 一致                                                      |
| `translateLanguages`     | `TranslateLanguage[]`（`{ code, label }`）         | 多语言表单默认语言列表；字段 `translateConfig.language` 可覆盖。不传或为空时回退到内置 12 种语言 |
| `request`                | `DisguiseRequestClient`                            | 导入、导出使用的请求客户端                                                                       |
| `fetchAllDictData`       | `() => Promise<Record<string, DictValueItem[]>>`   | 按字典编码返回字典项。不传时字典标签显示原始值                                                   |
| `fetchAllUserData`       | `(() => Promise<DisguiseUserData[]>) \| null`      | 头像列按需读取的用户展示数据；`null` 关闭查询。在挂载应用前注入，并安装 `VueQueryPlugin`         |
| `userLookupFields`       | `Record<string, keyof DisguiseUserData>`           | 业务列字段到用户匹配字段的映射，如 `{ createBy: 'userName' }`；默认不解析关联用户                |
| `uploadFile`             | `(file, options?) => Promise<{ url, cache_url? }>` | 图片和附件上传                                                                                   |
| `imageBaseUrl`           | `string`                                           | 相对图片路径要拼接的域名                                                                         |
| `hasAccess`              | `(codes: string[]) => boolean`                     | 返回 `false` 时隐藏对应权限按钮。不传时全部显示                                                  |
| `getAccessToken`         | `() => string`                                     | 导出请求附带的 token                                                                             |
| `cardShadow`             | `'always' \| 'hover' \| 'never'`                   | `BaseCard` 阴影                                                                                  |
| `paginationConfig`       | `PaginationConfig`                                 | 表格分页配置；支持 `pageSizes`、`pageNumField`、`pageSizeField` 等                               |
| `userAvatarDrawerFields` | `UserAvatarDrawerField[]`                          | `UserAvatarInfo` 抽屉详情字段的全局配置，组件 `drawerFields` prop 优先于它                       |

## 表格分页

`TableEntity` 异步数据源和 `change` 事件默认收到 `pageNum`、`pageSize`。可通过 `paginationConfig` 注入后端使用的字段名；未配置字段分别回退为 `pageNum` 和 `pageSize`。

```ts
setupDisguise({
  paginationConfig: {
    pageNumField: 'current',
    pageSizeField: 'size',
  },
});
```

配置后，异步数据源和分页/排序触发的 `change` 载荷都会带 `current`、`size`。`pageSizes`、`layout`、`background` 等 Element Plus 分页器选项仍可一起放在 `paginationConfig` 中。

## 多语言表单

在应用启动或语言接口返回后注入一次，`SchemaForm`、`CrudPage` 和 `DrawerFormPage` 中启用 `translateConfig` 的字段都会使用这份列表，包括语言 Tab、翻译源语言/目标语言选项及逐语言校验。

```ts
import { setupDisguise } from 'disguise-ui';

setupDisguise({
  translateLanguages: [
    { code: 'zh_cn', label: '简体中文' },
    { code: 'en', label: 'English' },
  ],
});
```

字段只需配置 `translateConfig: {}` 即可使用全局语言。单个字段配置非空的 `translateConfig.language` 时，会完全覆盖全局列表。优先级为：字段语言 > 全局语言 > 内置 12 种语言。空数组按未配置处理；再次调用 `setupDisguise` 可更新全局列表，未传此项则保留已注入的配置。

## 字典

字典只请求一次，默认缓存 30 分钟。`DictTag`、`select` / `radio` / `checkbox` 的 `optionSource: 'dict'`，以及 `AsyncSelect` 的 `dictCode` 都读同一份缓存。

```ts
setupDisguise({
  fetchAllDictData: async () => ({
    sys_status: [
      { code: '1', name: '启用', color: 'success' },
      { code: '0', name: '停用', color: 'danger' },
    ],
  }),
});
```

## 头像列用户数据

在应用挂载前注册用户数据源和字段映射，`TableEntity` 与 `CrudPage` 的 `avatar` 列就会按当前单元格值解析用户，无需在每一列的 `cellProps` 中调用查询 composable。

```ts
import { setupDisguise } from 'disguise-ui';

setupDisguise({
  fetchAllUserData: async () => {
    const users = await fetchVisibleUsers();
    return users.map((user) => ({
      userId: user.userId,
      userName: user.userName,
      nickName: user.nickName,
      avatar: user.avatar,
      sex: user.sex,
      email: user.email,
      phone: user.phonenumber,
      deptName: user.dept?.deptName,
    }));
  },
  userLookupFields: {
    createBy: 'userName',
    updateBy: 'userName',
    userId: 'userId',
  },
});
```

`fetchVisibleUsers` 由宿主实现，负责权限和后端分页，返回当前账号允许查看的用户；普通用户列表接口不一定有权限访问，也不保证单次请求返回全部用户。

字段只需声明：

```ts
{
  prop: 'createBy',
  label: '创建人',
  type: 'text',
  form: false,
  table: { type: 'avatar' },
}
```

这里是用 `row.createBy` 匹配用户的 `userName`，并非匹配用户自身的 `createBy`。按用户名匹配保持大小写，用户 ID 的数字与字符串可互相匹配，`0` 也视为有效值。

数据源按需触发，多个单元格共享查询与 30 分钟缓存，未使用的缓存 60 分钟后回收。列值变化会重新匹配用户，不重复建立查询订阅；替换数据源函数会切换到独立缓存。仅切换语言且继续使用同一个函数时保留缓存。

显式 `cellProps` 优先于查询结果。未配置映射的列仍读取行内用户字段；映射字段与用户匹配字段相同（如 `userId → userId`）时，也保留行内信息作为补充。`createBy → userName` 这样的关联列不读取业务行的用户信息，避免误显示其他用户。加载中、查不到或请求失败时显示原始值，空值显示 `--`；没有用户详情时默认关闭详情抽屉。未注入数据源的纯行内头像不额外依赖 `VueQueryPlugin`。

用户资料修改后，可用宿主已安装的 QueryClient 刷新共享缓存：

```ts
import { USER_DATA_ALL_QUERY_KEY } from 'disguise-ui';

await queryClient.invalidateQueries({ queryKey: USER_DATA_ALL_QUERY_KEY });
```

登出、切换账号或查看用户的权限变化时，应立即重置共享缓存，清除旧展示数据并重新读取当前权限下的数据。数据源也应检查登录态与权限，无权限时返回空数组：

```ts
await queryClient.resetQueries({ queryKey: USER_DATA_ALL_QUERY_KEY });
```

`UserAvatarInfo` 本身保持纯展示，只接收 props；自动用户解析由表格头像单元格完成。再次调用 `setupDisguise` 时，未传用户配置会保留已有配置；`userLookupFields: {}` 清空映射，`fetchAllUserData: null` 关闭查询。

## 上传

`ImageUpload`、`PictureUpload` 和表单里的 `picture` / `file` 字段都会调用 `uploadFile`。

```ts
setupDisguise({
  uploadFile: async (file, options) => {
    options?.onProgress?.(30);
    const result = await uploadToOss(file);
    options?.onProgress?.(100);
    return { url: result.url };
  },
});
```

`options.baseFolder` 和 `options.addWatermark` 来自上传组件的同名 props。

## UserAvatarInfo 抽屉字段

`UserAvatarInfo` 抽屉详情卡片展示哪些字段、字段名和顺序，可以全局注入一套配置，个别组件再用 `drawerFields` prop 覆盖。字段配置类型为 `UserAvatarDrawerField`（`{ key, label?, icon?, value? }`），详见 [UserAvatarInfo](../components/user-avatar-info.md#自定义抽屉字段)。

```ts
setupDisguise({
  userAvatarDrawerFields: [
    { key: 'name' },
    { key: 'department' },
    { key: 'email' },
  ],
});
```

## 远程实体

`registerEntity` 把一个业务键映射到取数函数，供 `async-select` 使用：

```ts
import { registerEntity } from 'disguise-ui';

registerEntity({
  key: 'dept',
  valueKey: 'id',
  labelKey: 'name',
  subtitleKey: 'leader',
  columns: [{ title: '部门名称', dataKey: 'name', key: 'name' }],
  fetch: async (params) => {
    const result = await fetchDeptList({
      page: params.page,
      pageSize: params.per_page,
      keyword: params.keyword,
      ids: params.selectedValues,
    });
    return { items: result.list, total: result.total };
  },
});
```

远程实体应直接透传 `page` / `per_page`，并返回当前页数据和总数；不要先请求全量数据再在前端过滤和切片。

这份文档站就是按上面的方式注入了一套本地 mock：字典、部门和上传都走内存数据，所以示例可以离线交互。

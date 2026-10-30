# 运行时注入

`setupDisguise` 是组件库和宿主后台之间的边界。字典、上传、权限、请求和文案都从这里进入，组件源码里不写死接口地址。

## 配置项

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `locale` | `string` | 内置文案语言，默认 `zh-CN` |
| `messages` | `Record<string, Record<string, unknown>>` | 覆盖内置文案，key 路径与组件里的 `t()` 一致 |
| `request` | `DisguiseRequestClient` | 导入、导出使用的请求客户端 |
| `fetchAllDictData` | `() => Promise<Record<string, DictValueItem[]>>` | 按字典编码返回字典项。不传时字典标签显示原始值 |
| `uploadFile` | `(file, options?) => Promise<{ url, cache_url? }>` | 图片和附件上传 |
| `imageBaseUrl` | `string` | 相对图片路径要拼接的域名 |
| `hasAccess` | `(codes: string[]) => boolean` | 返回 `false` 时隐藏对应权限按钮。不传时全部显示 |
| `getAccessToken` | `() => string` | 导出请求附带的 token |
| `cardShadow` | `'always' \| 'hover' \| 'never'` | `BaseCard` 阴影 |

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

## 远程实体

`registerEntity` 把一个业务键映射到取数函数，供 `async-select` 使用：

```ts
import { paginateLocally, registerEntity } from 'disguise-ui';

registerEntity({
  key: 'dept',
  valueKey: 'id',
  labelKey: 'name',
  subtitleKey: 'leader',
  columns: [{ title: '部门名称', dataKey: 'name', key: 'name' }],
  fetch: async (params) => {
    const rows = await fetchDeptList();
    return paginateLocally(rows, params, ['name']);
  },
});
```

接口本身分页时，直接透传 `page` / `per_page`；一次性返回全量时用 `paginateLocally` 做前端过滤和切片。

这份文档站就是按上面的方式注入了一套本地 mock：字典、部门和上传都走内存数据，所以示例可以离线交互。

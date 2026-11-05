<script setup lang="ts">
import { ref } from 'vue';

import { PictureUpload } from 'disguise-ui';

const cover = ref('');
const multiple = ref<string[]>([]);
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <div>
      <p
        style="
          margin: 0 0 8px;
          font-size: 13px;
          color: var(--el-text-color-secondary);
        "
      >
        单图：自定义占位、上传中与图片卡片
      </p>
      <PictureUpload v-model="cover" :width="120" :height="120">
        <template #placeholder>
          <div
            style="
              display: flex;
              height: 100%;
              align-items: center;
              justify-content: center;
              color: var(--el-color-primary);
              font-size: 14px;
            "
          >
            上传封面
          </div>
        </template>

        <template #loading="{ progress }">
          <div
            style="
              display: flex;
              height: 100%;
              align-items: center;
              justify-content: center;
              font-size: 13px;
            "
          >
            上传中 {{ progress }}%
          </div>
        </template>

        <template #picture="{ url, preview, remove }">
          <div style="position: relative; width: 100%; height: 100%">
            <img
              :src="url"
              alt=""
              style="
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
                cursor: pointer;
              "
              @click="preview"
            />
            <button
              type="button"
              style="
                position: absolute;
                right: 4px;
                bottom: 4px;
                padding: 2px 6px;
                color: #fff;
                font-size: 12px;
                background: rgb(0 0 0 / 55%);
                border: 0;
                border-radius: 4px;
                cursor: pointer;
              "
              @click="remove"
            >
              删除
            </button>
          </div>
        </template>
      </PictureUpload>
    </div>

    <div>
      <p
        style="
          margin: 0 0 8px;
          font-size: 13px;
          color: var(--el-text-color-secondary);
        "
      >
        多图：picture 插槽会为每张图片调用一次
      </p>
      <PictureUpload v-model="multiple" :max-count="3">
        <template #placeholder="{ multiple: isMultiple }">
          <div
            style="
              display: flex;
              height: 100%;
              align-items: center;
              justify-content: center;
              color: var(--el-color-primary);
              font-size: 14px;
            "
          >
            {{ isMultiple ? '添加图片' : '上传图片' }}
          </div>
        </template>

        <template #picture="{ url, index, preview, remove }">
          <div style="position: relative; width: 100%; height: 100%">
            <img
              :src="url"
              alt=""
              style="
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
                cursor: pointer;
              "
              @click="preview"
            />
            <span
              style="
                position: absolute;
                top: 4px;
                left: 4px;
                padding: 0 6px;
                color: #fff;
                font-size: 12px;
                background: rgb(0 0 0 / 55%);
                border-radius: 10px;
              "
            >
              {{ index + 1 }}
            </span>
            <button
              type="button"
              style="
                position: absolute;
                right: 4px;
                bottom: 4px;
                padding: 2px 6px;
                color: #fff;
                font-size: 12px;
                background: rgb(0 0 0 / 55%);
                border: 0;
                border-radius: 4px;
                cursor: pointer;
              "
              @click="remove"
            >
              删除
            </button>
          </div>
        </template>
      </PictureUpload>
    </div>
  </div>
</template>

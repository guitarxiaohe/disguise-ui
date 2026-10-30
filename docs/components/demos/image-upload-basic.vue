<script setup lang="ts">
import { ref } from 'vue';

import { ImageUpload } from 'disguise-ui';

const url = ref('');
</script>

<template>
  <ImageUpload v-model="url" />
</template>

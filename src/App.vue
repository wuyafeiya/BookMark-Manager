<template>
  <main-layout />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MainLayout from './layouts/MainLayout.vue'

export default defineComponent({
  name: 'App',
  components: {
    MainLayout
  }
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

/* 禁用双击缩放 */
* {
  touch-action: manipulation;
}

/* 优化移动端点击效果 */
@media (hover: none) {
  a:active,
  button:active {
    opacity: 0.7;
  }
}
</style> 

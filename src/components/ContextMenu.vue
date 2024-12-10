<template>
  <div v-show="visible" class="context-menu" :style="position">
    <div class="menu-items">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  name: 'ContextMenu',
  props: {
    visible: Boolean
  },
  setup() {
    const position = ref({ top: '0px', left: '0px' })

    const setPosition = (e: MouseEvent) => {
      position.value = {
        top: `${e.clientY}px`,
        left: `${e.clientX}px`
      }
    }

    return {
      position,
      setPosition
    }
  }
})
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 1000;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  min-width: 160px;
}

.menu-items {
  display: flex;
  flex-direction: column;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item .el-icon {
  font-size: 16px;
  color: #666;
}
</style> 

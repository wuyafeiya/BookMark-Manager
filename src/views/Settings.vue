<template>
  <div class="settings">
    <h2>系统设置</h2>
    
    <div class="settings-section">
      <div class="section-header">
        <h3>数据管理</h3>
      </div>
      <div class="section-content">
        <div class="danger-zone">
          <div class="danger-action">
            <div class="action-info">
              <h4>删除所有书签</h4>
              <p>此操作将永久删除所有书签数据，无法恢复</p>
            </div>
            <el-button 
              type="danger" 
              @click="confirmClearBookmarks"
            >
              删除所有数据
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useBookmarkStore } from '../stores/bookmark'
import { ElMessageBox, ElMessage } from 'element-plus'

export default defineComponent({
  name: 'Settings',
  setup() {
    const store = useBookmarkStore()

    const confirmClearBookmarks = () => {
      ElMessageBox.confirm(
        '此操作将永久删除所有书签数据，是否继续？',
        '警告',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      ).then(() => {
        store.clearAllBookmarks()
        ElMessage.success('所有书签已删除')
      }).catch(() => {})
    }

    return {
      confirmClearBookmarks
    }
  }
})
</script>

<style scoped>
.settings {
  padding: 24px;
}

.settings-section {
  background: white;
  border-radius: 8px;
  margin-top: 24px;
}

.section-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.section-content {
  padding: 24px;
}

.danger-zone {
  border: 1px solid #ffa39e;
  border-radius: 8px;
  padding: 16px;
}

.danger-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
}

.action-info p {
  margin: 0;
  color: #666;
  font-size: 12px;
}
</style> 

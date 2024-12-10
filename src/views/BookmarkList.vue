<template>
  <div class="bookmark-list">
    <div class="header">
      <h2>{{ currentCategory?.name }}</h2>
      <span class="count">共 {{ currentCategory?.count }} 个书签</span>
    </div>
    
    <div class="bookmark-grid">
      <div v-for="bookmark in displayBookmarks" :key="bookmark.id" class="bookmark-card">
        <div class="bookmark-actions">
          <el-dropdown trigger="click">
            <el-button class="action-btn" type="text">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="editBookmark(bookmark)">
                  <el-icon><Edit /></el-icon>编辑
                </el-dropdown-item>
                <el-dropdown-item @click="deleteBookmark(bookmark)" class="danger">
                  <el-icon><Delete /></el-icon>删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="bookmark-preview" @click="openUrl(bookmark.url)">
          <div class="bookmark-icon">
            <img 
              v-if="bookmark.icon" 
              :src="bookmark.icon" 
              :alt="bookmark.title"
              class="favicon"
            >
            <el-icon v-else><Link /></el-icon>
          </div>
        </div>
        
        <div class="bookmark-content">
          <h3 class="bookmark-title">{{ bookmark.title }}</h3>
          <p class="bookmark-url">{{ bookmark.url }}</p>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑书签"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="editForm.url" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveBookmark">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useBookmarkStore } from '../stores/bookmark'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MoreFilled, Edit, Delete, Link } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'BookmarkList',
  components: {
    MoreFilled,
    Edit,
    Delete,
    Link
  },
  setup() {
    const route = useRoute()
    const store = useBookmarkStore()
    
    const categoryId = computed(() => route.params.id as string)
    const currentCategory = computed(() => 
      store.categories.find(c => c.id === categoryId.value)
    )

    const displayBookmarks = computed(() => 
      store.getCategoryBookmarks(categoryId.value)
    )

    const editDialogVisible = ref(false)
    const editForm = ref({
      id: '',
      title: '',
      url: ''
    })

    const openUrl = (url: string) => {
      window.open(url, '_blank')
    }

    const editBookmark = (bookmark: any) => {
      editForm.value = { ...bookmark }
      editDialogVisible.value = true
    }

    const saveBookmark = () => {
      store.updateBookmark(editForm.value)
      editDialogVisible.value = false
      ElMessage.success('保存成功')
    }

    const deleteBookmark = (bookmark: any) => {
      ElMessageBox.confirm(
        '确定要删除这个书签吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        store.deleteBookmark(bookmark.id)
        ElMessage.success('删除成功')
      }).catch(() => {})
    }

    const getRandomPastelColor = () => {
      const colors = [
        '#E3F2FD', // 浅蓝
        '#E8F5E9', // 浅绿
        '#FFF3E0', // 浅橙
        '#F3E5F5', // 浅紫
        '#E1F5FE', // 天蓝
        '#E0F7FA', // 青色
        '#F1F8E9', // 浅黄绿
        '#FBE9E7', // 浅红
        '#EFEBE9', // 浅棕
        '#F3F3F3'  // 浅灰
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    // 获取图标颜色
    const getIconColor = (url: string) => {
      const colors = {
        'github.com': '#24292e',
        'google.com': '#4285f4',
        'youtube.com': '#ff0000',
        'twitter.com': '#1da1f2',
        'facebook.com': '#1877f2',
        'linkedin.com': '#0a66c2',
        'npm': '#cb3837',
        'dev.to': '#0a0a0a',
        'medium.com': '#000000',
        'stackoverflow.com': '#f48024',
        'default': '#00b96b'
      }

      const domain = new URL(url).hostname.toLowerCase()
      for (const [key, value] of Object.entries(colors)) {
        if (domain.includes(key)) {
          return value
        }
      }
      return colors.default
    }

    // 获取图标文本（取标题的第一个字母）
    const getIconText = (title: string) => {
      return title.charAt(0).toUpperCase()
    }

    return {
      currentCategory,
      displayBookmarks,
      editDialogVisible,
      editForm,
      editBookmark,
      saveBookmark,
      deleteBookmark,
      getRandomPastelColor,
      openUrl,
      getIconColor,
      getIconText
    }
  }
})
</script>

<style scoped>
.bookmark-list {
  padding: 24px;
}

.header {
  margin-bottom: 24px;
}

.bookmark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.bookmark-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #eee;
  position: relative;
}

.bookmark-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  opacity: 0;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
}

.bookmark-card:hover .bookmark-actions {
  opacity: 1;
}

.bookmark-preview {
  height: 160px;
  background-color: #ffffff;
  background-image: 
    linear-gradient(#f1f1f1 1px, transparent 1px),
    linear-gradient(90deg, #f1f1f1 1px, transparent 1px);
  background-size: 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.bookmark-card[data-type="tech"] .bookmark-preview {
  background: linear-gradient(45deg, #e8f5e9, #c8e6c9);
}

.bookmark-card[data-type="design"] .bookmark-preview {
  background: linear-gradient(45deg, #fff3e0, #ffe0b2);
}

.bookmark-card[data-type="social"] .bookmark-preview {
  background: linear-gradient(45deg, #e1f5fe, #b3e5fc);
}

.bookmark-card[data-type="other"] .bookmark-preview {
  background: linear-gradient(45deg, #f3e5f5, #e1bee7);
}

.bookmark-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favicon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.bookmark-icon .el-icon {
  font-size: 24px;
  color: #666;
}

.bookmark-content {
  padding: 16px;
}

.bookmark-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-url {
  font-size: 13px;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-btn {
  color: #666;
  font-size: 24px;
  padding: 8px;
}

.action-btn:hover {
  transform: scale(1.1);
  color: #333;
}

.danger {
  color: #f56c6c;
}

.danger:hover {
  background: #fff1f0;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media screen and (max-width: 768px) {
  .bookmark-list {
    padding: 12px;
  }

  .bookmark-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .bookmark-card {
    padding: 12px;
  }

  .bookmark-title {
    font-size: 14px;
  }

  .bookmark-url {
    font-size: 12px;
  }
}
</style> 

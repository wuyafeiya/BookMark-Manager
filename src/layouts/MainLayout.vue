<template>
  <div class="layout">
    <!-- 移动端菜单按钮 -->
    <div class="mobile-header" v-show="isMobile">
      <el-button class="menu-btn" @click="showSidebar = true">
        <el-icon><Menu /></el-icon>
      </el-button>
      <span class="mobile-title">{{ currentTitle }}</span>
    </div>

    <!-- 移动端侧边栏抽屉 -->
    <el-drawer
      v-model="showSidebar"
      direction="ltr"
      size="80%"
      :with-header="false"
      class="mobile-sidebar"
    >
      <div class="mobile-sidebar-content">
        <aside class="sidebar">
          <div class="logo">
            <el-icon class="logo-icon"><Bookmark /></el-icon>
            <span class="logo-text">书签管理</span>
          </div>
          <div class="menu">
            <router-link to="/dashboard" class="menu-item">
              <el-icon><DataBoard /></el-icon>
              仪表盘
            </router-link>
            
            <div class="menu-group">
              <div class="menu-group-header" @click="toggleBookmarks">
                <el-icon><Folder /></el-icon>
                <span>书签管理</span>
                <el-icon class="arrow-icon" :class="{ 'is-expanded': isBookmarksExpanded }">
                  <CaretRight />
                </el-icon>
              </div>
              <div class="menu-group-content" v-show="isBookmarksExpanded">
                <div v-if="bookmarkCategories.length === 0" class="empty-tip">
                  暂无书签分类
                </div>
                <div class="category-list">
                  <router-link 
                    v-for="category in bookmarkCategories" 
                    :key="category.id"
                    :to="`/bookmarks/${category.id}`"
                    class="submenu-item"
                  >
                    <el-icon class="category-icon">
                      <FolderOpened v-if="$route.params.id === category.id" />
                      <Folder v-else />
                    </el-icon>
                    <span class="category-name">{{ category.name }}</span>
                    <span class="count">({{ category.count }})</span>
                  </router-link>
                </div>
              </div>
            </div>

            <router-link to="/settings" class="menu-item">
              <el-icon><Setting /></el-icon>
              系统设置
            </router-link>
          </div>
        </aside>
      </div>
    </el-drawer>

    <!-- 桌面端侧边栏 -->
    <aside class="sidebar" v-show="!isMobile">
      <div class="logo">
        <el-icon class="logo-icon"><Bookmark /></el-icon>
        <span class="logo-text">书签管理</span>
      </div>
      <div class="menu">
        <router-link to="/dashboard" class="menu-item">
          <el-icon><DataBoard /></el-icon>
          仪表盘
        </router-link>
        
        <div class="menu-group">
          <div class="menu-group-header" @click="toggleBookmarks">
            <el-icon><Folder /></el-icon>
            <span>书签管理</span>
            <el-icon class="arrow-icon" :class="{ 'is-expanded': isBookmarksExpanded }">
              <CaretRight />
            </el-icon>
          </div>
          <div class="menu-group-content" v-show="isBookmarksExpanded">
            <div v-if="bookmarkCategories.length === 0" class="empty-tip">
              暂无书签分类
            </div>
            <div class="category-list">
              <router-link 
                v-for="category in bookmarkCategories" 
                :key="category.id"
                :to="`/bookmarks/${category.id}`"
                class="submenu-item"
              >
                <el-icon class="category-icon">
                  <FolderOpened v-if="$route.params.id === category.id" />
                  <Folder v-else />
                </el-icon>
                <span class="category-name">{{ category.name }}</span>
                <span class="count">({{ category.count }})</span>
              </router-link>
            </div>
          </div>
        </div>

        <router-link to="/settings" class="menu-item">
          <el-icon><Setting /></el-icon>
          系统设置
        </router-link>
      </div>
    </aside>

    <div class="main-content">
      <header class="header">
        <div class="search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索书签..."
            :prefix-icon="Search"
            @input="handleSearch"
            clearable
          />
          <div v-if="showSearchResults" class="search-results">
            <div v-if="searchResults.length === 0" class="no-results">
              无搜索结果
            </div>
            <div
              v-else
              v-for="result in searchResults"
              :key="result.id"
              class="search-item"
              @click="handleSearchItemClick(result)"
            >
              <div class="search-item-title">{{ result.title }}</div>
              <div class="search-item-url">{{ result.url }}</div>
              <div class="search-item-category">{{ result.category }}</div>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <el-button 
            type="success" 
            class="create-folder-btn"
            @click="showCreateFolderDialog"
          >
            <el-icon><FolderAdd /></el-icon>
            创建收藏夹
          </el-button>
          <input
            type="file"
            accept=".html"
            ref="fileInput"
            @change="handleFileUpload"
            style="display: none"
          />
          <el-button type="primary" @click="triggerFileInput">
            <el-icon><Upload /></el-icon>
            导入书签
          </el-button>
          <el-button @click="exportBookmarks">
            <el-icon><Download /></el-icon>
            导出书签
          </el-button>
        </div>
      </header>

      <!-- 创建收藏夹对话框 -->
      <el-dialog
        v-model="createFolderVisible"
        title="创建收藏夹"
        width="400px"
        class="create-folder-dialog"
        :show-close="false"
        :close-on-click-modal="false"
      >
        <el-form 
          :model="folderForm"
          :rules="folderRules"
          ref="folderFormRef"
          label-position="top"
        >
          <el-form-item 
            label="收藏夹名称" 
            prop="name"
            :rules="[
              { required: true, message: '请输入收藏夹名称', trigger: 'blur' },
              { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
            ]"
          >
            <el-input 
              v-model="folderForm.name"
              placeholder="请输入收藏夹名称"
              maxlength="20"
              show-word-limit
              @keyup.enter="createFolder"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="cancelCreate">取消</el-button>
            <el-button type="primary" @click="createFolder">
              创建
            </el-button>
          </div>
        </template>
      </el-dialog>

      <main class="content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch, onUnmounted } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useBookmarkStore } from '../stores/bookmark'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'MainLayout',
  components: {
    ...ElementPlusIconsVue
  },
  setup() {
    const searchQuery = ref('')
    const showSearchResults = ref(false)
    const searchResults = ref([])
    const store = useBookmarkStore()
    const { categories } = storeToRefs(store)
    const fileInput = ref<HTMLInputElement | null>(null)
    
    // 添加移动端相关的状态
    const showSidebar = ref(false)
    const isMobile = ref(false)
    const route = useRoute()

    // 获取当前页面标题
    const currentTitle = computed(() => {
      if (route.path.includes('/bookmarks/')) {
        const categoryId = route.params.id as string
        const category = store.categories.find(c => c.id === categoryId)
        return category?.name || '书签管理'
      }
      return {
        '/dashboard': '仪表盘',
        '/settings': '系统设置'
      }[route.path] || '书签管理'
    })

    // 检查是否为移动设备
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
    }

    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        if (!target.closest('.search')) {
          showSearchResults.value = false
        }
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })

    // 监听路由变化，关闭侧边栏
    watch(route, () => {
      showSidebar.value = false
    })

    const triggerFileInput = () => {
      fileInput.value?.click()
    }

    const handleFileUpload = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const content = await readFileContent(file)
        console.log(content)        
        store.importBookmarks(content)
        ElMessage.success('书签导入成功')
      } catch (error) {
        console.error('Error reading file:', error)
        ElMessage.error('导入失败')
      }
    }

    const readFileContent = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = (e) => reject(e)
        reader.readAsText(file)
      })
    }

    const handleSearch = () => {
      if (searchQuery.value) {
        searchResults.value = store.searchBookmarks(searchQuery.value)
        showSearchResults.value = true
      } else {
        searchResults.value = []
        showSearchResults.value = false
      }
    }

    const handleSearchItemClick = (bookmark: any) => {
      window.open(bookmark.url, '_blank')
      showSearchResults.value = false
      searchQuery.value = ''
    }

    const createFolderVisible = ref(false)
    const folderForm = ref({ name: '' })
    const folderFormRef = ref()

    const showCreateFolderDialog = () => {
      createFolderVisible.value = true
      nextTick(() => {
        folderFormRef.value?.resetFields()
      })
    }

    const cancelCreate = () => {
      createFolderVisible.value = false
      folderForm.value.name = ''
    }

    const createFolder = () => {
      folderFormRef.value?.validate((valid: boolean) => {
        if (valid) {
          store.addCategory(folderForm.value.name)
          ElMessage.success('创建成功')
          createFolderVisible.value = false
          folderForm.value.name = ''
        }
      })
    }

    const exportBookmarks = () => {
      store.exportBookmarks()
      ElMessage.success('书签导出成功')
    }

    return {
      searchQuery,
      searchResults,
      showSearchResults,
      handleSearch,
      handleSearchItemClick,
      Search: ElementPlusIconsVue.Search,
      bookmarkCategories: categories,
      fileInput,
      triggerFileInput,
      handleFileUpload,
      // 添加新的返回值
      showSidebar,
      isMobile,
      currentTitle,
      createFolderVisible,
      folderForm,
      folderFormRef,
      showCreateFolderDialog,
      cancelCreate,
      createFolder,
      exportBookmarks
    }
  },
  data() {
    return {
      isBookmarksExpanded: true
    }
  },
  methods: {
    toggleBookmarks() {
      this.isBookmarksExpanded = !this.isBookmarksExpanded
    }
  }
})
</script>

<style scoped>
.layout {
  background-color: #ffffff;
  color: #333333;
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #eee;
  width: 240px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logo {
  padding: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  color: #00b96b;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.menu-item {
  color: #333;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  border-radius: 6px;
  margin: 4px 0;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.router-link-active {
  background: #e6f7f4;
  color: #00b96b;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  border-bottom: 1px solid #eee;
  padding: 0 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.create-folder-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.search input {
  width: 320px;
  padding: 8px 12px;
  border-radius: 6px;
}

.content {
  flex: 1;
  padding: 24px;
  background: #f5f5f5;
  overflow-y: auto;
}

.menu-group {
  margin: 8px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-group-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #333;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 500;
}

.menu-group-header:hover {
  background: #f5f5f5;
}

.menu-group-header i {
  margin-right: 8px;
}

.icon-arrow {
  margin-left: auto;
  transition: transform 0.3s;
}

.icon-arrow.is-expanded {
  transform: rotate(90deg);
}

.menu-group-content {
  flex: 1;
  overflow-y: visible;
  padding-left: 12px;
}

.submenu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  border-radius: 4px;
  gap: 8px;
  margin-left: 12px;
  position: relative;
}

.submenu-item::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  width: 12px;
  height: 1px;
  background: #eee;
}

.submenu-item::after {
  content: '';
  position: absolute;
  left: -12px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #eee;
}

.submenu-item:last-child::after {
  height: 50%;
}

.submenu-item:first-child::after {
  top: 50%;
}

.category-icon {
  font-size: 16px;
  color: inherit;
  opacity: 0.8;
}

.category-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.submenu-item:hover {
  background: #f5f5f5;
}

.submenu-item.router-link-active {
  color: #00b96b;
  background: #e6f7f4;
}

.submenu-item.router-link-active .category-icon {
  color: #00b96b;
}

.count {
  margin-left: 4px;
  font-size: 12px;
  color: #999;
}

.empty-tip {
  padding: 8px 16px;
  color: #999;
  font-size: 14px;
}

.el-icon {
  font-size: 18px;
}

.logo .el-icon {
  font-size: 24px;
  color: #00b96b;
}

.menu-item .el-icon {
  margin-right: 8px;
}

.arrow-icon {
  margin-left: auto;
  font-size: 16px;
  transition: transform 0.3s;
}

.arrow-icon.is-expanded {
  transform: rotate(90deg);
}

.search {
  position: relative;
  width: 320px;
}

.search :deep(.el-input__wrapper) {
  background-color: #f7f7f7;
  box-shadow: none !important;
  border: 1px solid #eee;
  transition: all 0.3s;
}

.search :deep(.el-input__wrapper):hover {
  border-color: #ddd;
  background-color: #f5f5f5;
}

.search :deep(.el-input__wrapper.is-focus) {
  border-color: #00b96b;
  background-color: #fff;
}

.search :deep(.el-input__inner) {
  height: 36px;
  color: #333;
}

.search :deep(.el-input__inner::placeholder) {
  color: #999;
}

.search :deep(.el-input__prefix-inner) {
  color: #999;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1000;
  border: 1px solid #eee;
}

.search-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background: #f5f5f5;
}

.search-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-item-url {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-item-category {
  font-size: 12px;
  color: #00b96b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-results {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.theme-switch {
  display: none;
}

.menu {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
}

/* 美化菜单滚动条 */
.menu::-webkit-scrollbar {
  width: 6px;
}

.menu::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.menu::-webkit-scrollbar-track {
  background: transparent;
}

.category-list {
  overflow-y: visible;
}

/* 主内容区域滚动条 */
.content::-webkit-scrollbar {
  width: 6px;
}

.content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

/* 添加响应式布局 */
@media screen and (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    max-height: 60px;
    overflow: hidden;
    transition: max-height 0.3s;
  }

  .sidebar.expanded {
    max-height: 100vh;
  }

  .logo {
    padding: 12px;
  }

  .menu {
    padding: 0 12px 12px;
  }

  .main-content {
    height: calc(100vh - 60px);
  }

  .header {
    padding: 0 12px;
  }

  .search {
    width: 100%;
  }

  .search-results {
    width: calc(100vw - 24px);
  }
}

/* 修改抽屉相关样式 */
:deep(.el-drawer) {
  background: #f5f5f5;
}

:deep(.el-drawer__body) {
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.mobile-sidebar-content {
  height: 100%;
  overflow-y: auto;
}

.mobile-sidebar .sidebar {
  width: 100%;
  height: auto;
  min-height: 100%;
  border-right: none;
  overflow: visible;
}

.mobile-sidebar .menu {
  flex: 1;
  overflow-y: visible;
  padding-bottom: env(safe-area-inset-bottom); /* 适配全面屏 */
}

@media screen and (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .mobile-header {
    display: flex;
    height: 50px;
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    z-index: 100;
    align-items: center;
    padding-top: env(safe-area-inset-top); /* 适配全面屏 */
  }

  .main-content {
    height: calc(100vh - 50px);
    padding-bottom: env(safe-area-inset-bottom); /* 适配全面屏 */
  }
}

:deep(.create-folder-dialog) {
  border-radius: 8px;
}

:deep(.create-folder-dialog .el-dialog__header) {
  margin: 0;
  padding: 20px 20px 0;
}

:deep(.create-folder-dialog .el-dialog__body) {
  padding: 20px;
}

:deep(.create-folder-dialog .el-form-item__label) {
  font-weight: 500;
  padding-bottom: 8px;
}

:deep(.create-folder-dialog .el-input__wrapper) {
  box-shadow: none;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

:deep(.create-folder-dialog .el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

:deep(.create-folder-dialog .el-input__wrapper.is-focus) {
  border-color: #00b96b;
}

:deep(.create-folder-dialog .el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #f0f0f0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media screen and (max-width: 768px) {
  .header-actions {
    flex-wrap: wrap;
  }

  .header-actions .el-button {
    flex: 1;
    min-width: 140px;
  }
}
</style> 

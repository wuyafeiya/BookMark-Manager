<template>
  <div class="dashboard">
    <h2>仪表盘</h2>
    
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Collection /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ store.totalBookmarksCount }}</div>
          <div class="stat-label">总书签数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><FolderOpened /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ store.categories.length }}</div>
          <div class="stat-label">分类数量</div>
        </div>
      </div>
    </div>

    <!-- 分类分布图表 -->
    <div class="chart-section">
      <div class="chart-card">
        <h3>书签分类分布</h3>
        <div class="chart-container" ref="chartRef"></div>
      </div>
    </div>

    <!-- 快速访问 -->
    <div class="quick-access">
      <h3>快速访问</h3>
      <div class="quick-grid">
        <div v-for="category in topCategories" :key="category.id" class="quick-card">
          <router-link :to="`/bookmarks/${category.id}`">
            <el-icon class="category-icon">
              <component :is="getCategoryIcon(category.name)" />
            </el-icon>
            <span class="category-name">{{ category.name }}</span>
            <div class="quick-count">{{ category.count }}个书签</div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 系统信息 -->
    <div class="system-info">
      <div class="info-card">
        <h3>系统信息</h3>
        <ul>
          <li>
            <span>存储状态</span>
            <span>{{ (JSON.stringify(store.bookmarks).length / 1024).toFixed(2) }} KB</span>
          </li>
          <li>
            <span>最后更新</span>
            <span>{{ lastUpdated }}</span>
          </li>
          <li>
            <span>浏览器</span>
            <span>{{ browserInfo }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, onUnmounted } from 'vue'
import { useBookmarkStore } from '../stores/bookmark'
import * as echarts from 'echarts'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export default defineComponent({
  name: 'Dashboard',
  components: {
    ...ElementPlusIconsVue  // 使用展开运算符注册所有图标
  },
  setup() {
    const store = useBookmarkStore()
    const chartRef = ref<HTMLElement | null>(null)
    let chart: echarts.ECharts | null = null

    const topCategories = computed(() => 
      [...store.categories]
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    )

    const lastUpdated = computed(() => {
      const date = new Date()
      return date.toLocaleString()
    })

    const browserInfo = computed(() => {
      const ua = navigator.userAgent
      if (ua.includes('Chrome')) return 'Chrome'
      if (ua.includes('Firefox')) return 'Firefox'
      if (ua.includes('Safari')) return 'Safari'
      if (ua.includes('Edge')) return 'Edge'
      return '未知浏览器'
    })

    const initChart = () => {
      if (chartRef.value) {
        chart = echarts.init(chartRef.value)
        updateChart()
      }
    }

    const updateChart = () => {
      if (!chart) return

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: store.categories.map(category => ({
              name: category.name,
              value: category.count
            }))
          }
        ]
      }

      chart.setOption(option)
    }

    // 监听窗口大小变化
    const handleResize = () => {
      chart?.resize()
    }

    const getCategoryIcon = (name: string) => {
      const lowerName = name.toLowerCase()
      if (lowerName.includes('工作')) return 'Briefcase'
      if (lowerName.includes('学习') || lowerName.includes('教程')) return 'Reading'
      if (lowerName.includes('娱乐')) return 'VideoPlay'
      if (lowerName.includes('工具')) return 'Tools'
      if (lowerName.includes('技术')) return 'Monitor'
      if (lowerName.includes('收藏')) return 'Star'
      if (lowerName.includes('其他')) return 'More'
      if (lowerName.includes('文���')) return 'Document'
      if (lowerName.includes('视频')) return 'Film'
      if (lowerName.includes('音乐')) return 'Headset'
      if (lowerName.includes('新闻')) return 'News'
      if (lowerName.includes('社交')) return 'ChatDotRound'
      return 'Folder' // 默认图标
    }

    onMounted(() => {
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chart?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return {
      store,
      topCategories,
      lastUpdated,
      browserInfo,
      chartRef,
      getCategoryIcon
    }
  }
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #e6f7f4;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.stat-icon .el-icon {
  font-size: 24px;
  color: #00b96b;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.chart-section,
.quick-access,
.system-info {
  margin-top: 24px;
}

.chart-card,
.quick-grid,
.info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.quick-card {
  text-align: center;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.3s;
}

.quick-card a {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  color: #333;
  text-decoration: none;
}

.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.quick-card .el-icon {
  font-size: 24px;
  color: #00b96b;
  margin-bottom: 12px;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.quick-count {
  font-size: 12px;
  color: #666;
}

.system-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.system-info li {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  color: #666;
}

.system-info li:last-child {
  border-bottom: none;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.quick-card .category-icon {
  font-size: 28px;
  color: #00b96b;
  margin-bottom: 12px;
  background: #e6f7f4;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-card:hover .category-icon {
  transform: scale(1.1);
  transition: transform 0.3s;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

@media screen and (max-width: 768px) {
  .dashboard {
    padding: 12px;
    gap: 12px;
  }

  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: 24px;
  }

  .chart-card,
  .quick-grid,
  .info-card {
    padding: 16px;
  }

  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-card a {
    padding: 16px;
  }

  .category-name {
    font-size: 14px;
  }
}

/* 小屏幕手机 */
@media screen and (max-width: 480px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }

  .quick-grid {
    grid-template-columns: 1fr;
  }
}
</style> 

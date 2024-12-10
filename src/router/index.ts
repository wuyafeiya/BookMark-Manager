import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import BookmarkList from '../views/BookmarkList.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        title: '仪表盘',
        icon: 'dashboard'
      }
    },
    {
      path: '/bookmarks/:id',
      name: 'BookmarkList',
      component: BookmarkList
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue'),
      meta: {
        title: '系统设置',
        icon: 'settings'
      }
    }
  ]
})

export default router 

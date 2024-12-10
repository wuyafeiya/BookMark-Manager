<template>
  <div class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex-1 max-w-lg">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索书签..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <button
          @click="$emit('import')"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          添加书签
        </button>
        <div class="flex items-center space-x-2">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="用户头像"
            class="w-8 h-8 rounded-full"
          />
          <span class="text-gray-700">访客用户</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')

defineEmits<{
  (e: 'import'): void
  (e: 'search', query: string): void
}>()
</script> 

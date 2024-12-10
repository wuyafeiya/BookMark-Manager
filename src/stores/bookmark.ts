import { defineStore } from 'pinia'

interface Bookmark {
  id: string
  title: string
  url: string
  addDate: string
  icon?: string
  categoryId?: string
}

interface Category {
  id: string
  name: string
  count: number
}

export const useBookmarkStore = defineStore('bookmark', {
  state: () => {
    // 从 localStorage 读取数据，如果没有则使用空数组
    const savedState = localStorage.getItem('bookmarkState')
    if (savedState) {
      return JSON.parse(savedState)
    }
    return {
      bookmarks: [] as Bookmark[],
      categories: [] as Category[]
    }
  },

  actions: {
    importBookmarks(htmlContent: string) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      
      // 找到 "Bookmarks Bar" 文件夹
      const folders = Array.from(doc.getElementsByTagName('h3'))
      const bookmarksBarFolder = folders.find(folder => 
        folder.textContent?.includes('Bookmarks Bar') || 
        folder.textContent?.includes('书签栏')
      )
      
      if (!bookmarksBarFolder) {
        console.error('未找到书签栏')
        return
      }

      // 清空现有数据
      this.categories = []
      this.bookmarks = []
      
      // 获取书签栏下的所有内容
      const dl = bookmarksBarFolder.nextElementSibling
      if (dl) {
        // 先处理直接在书签栏下的书签
        const directBookmarks = Array.from(dl.children).filter(child => 
          child.tagName === 'DT' && child.querySelector('a')
        )
        
        if (directBookmarks.length > 0) {
          const categoryId = crypto.randomUUID()
          const bookmarks = directBookmarks.map(dt => {
            const a = dt.querySelector('a')
            return {
              id: crypto.randomUUID(),
              title: a?.textContent || '',
              url: a?.href || '',
              addDate: a?.getAttribute('add_date') || '',
              icon: a?.getAttribute('icon') || '',
              categoryId
            }
          })

          this.bookmarks.push(...bookmarks)
          this.categories.push({
            id: categoryId,
            name: 'Bookmarks Bar',
            count: bookmarks.length
          })
        }

        // 处理文件夹
        const subFolders = Array.from(dl.getElementsByTagName('h3'))
        subFolders.forEach(folder => {
          const categoryId = crypto.randomUUID()
          const categoryName = folder.textContent || '未分类'
          const parentDL = folder.parentElement?.nextElementSibling

          if (parentDL) {
            const bookmarkElements = parentDL.getElementsByTagName('a')
            const bookmarks = Array.from(bookmarkElements).map(a => ({
              id: crypto.randomUUID(),
              title: a.textContent || '',
              url: a.href,
              addDate: a.getAttribute('add_date') || '',
              icon: a.getAttribute('icon') || '',
              categoryId
            }))

            if (bookmarks.length > 0) {
              this.bookmarks.push(...bookmarks)
              this.categories.push({
                id: categoryId,
                name: categoryName,
                count: bookmarks.length
              })
            }
          }
        })
      }

      // 保存到 localStorage
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('bookmarkState', JSON.stringify({
        bookmarks: this.bookmarks,
        categories: this.categories
      }))
    },

    updateBookmark(bookmark: Bookmark) {
      const index = this.bookmarks.findIndex((b: Bookmark) => b.id === bookmark.id)
      if (index > -1) {
        this.bookmarks[index] = { ...this.bookmarks[index], ...bookmark }
        this.saveToLocalStorage()
      }
    },

    deleteBookmark(bookmarkId: string) {
      const index = this.bookmarks.findIndex((b: Bookmark) => b.id === bookmarkId)
      if (index > -1) {
        this.bookmarks.splice(index, 1)
        // 更新分类计数
        const categoryId = this.bookmarks[index].categoryId
        const category = this.categories.find((c: Category) => c.id === categoryId)
        if (category) {
          category.count--
        }
        this.saveToLocalStorage()
      }
    },

    clearAllBookmarks() {
      this.bookmarks = []
      this.categories = []
      this.saveToLocalStorage()
    }
  },

  getters: {
    getCategoryBookmarks: (state) => {
      return (categoryId: string) => {
        return state.bookmarks.filter((b: Bookmark) => b.categoryId === categoryId)
      }
    },
    searchBookmarks: (state) => {
      return (query: string) => {
        if (!query) return []
        const lowerQuery = query.toLowerCase()
        return state.bookmarks.filter((bookmark: Bookmark) => 
          bookmark.title.toLowerCase().includes(lowerQuery) ||
          bookmark.url.toLowerCase().includes(lowerQuery)
        ).map((bookmark: Bookmark) => ({
          ...bookmark,
          category: state.categories.find((c: Category) => c.id === bookmark.categoryId)?.name
        }))
      }
    },
    totalBookmarksCount: (state) => {
      const uniqueBookmarks = new Set(state.bookmarks.map((b: Bookmark) => b.id))
      return uniqueBookmarks.size
    }
  }
}) 

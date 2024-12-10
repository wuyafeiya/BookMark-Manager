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
      
      // 清空现有数据
      this.categories = []
      this.bookmarks = []
      
      // 获取所有 DT 元素（包含文件夹）
      const dts = Array.from(doc.getElementsByTagName('dt'))
      
      // 处理每个 DT 元素
      dts.forEach(dt => {
        const h3 = dt.querySelector('h3')
        if (h3) {
          // 跳过 Bookmarks Bar
          if (h3.textContent?.includes('Bookmarks Bar') || 
              h3.textContent?.includes('书签栏')) {
            return
          }

          const categoryId = crypto.randomUUID()
          const categoryName = h3.textContent || '未分类'
          
          // 直接从当前 dt 获取下一个 dl
          const dl = dt.querySelector('dl')
          if (dl) {
            const bookmarkElements = dl.getElementsByTagName('a')
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
        }
      })

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
    },

    // 添加新的分类
    addCategory(name: string) {
      const newCategory = {
        id: crypto.randomUUID(),
        name,
        count: 0
      }
      this.categories.push(newCategory)
      this.saveToLocalStorage()
      return newCategory
    },

    // 添加书签到指定分类
    addBookmark(bookmark: Partial<Bookmark>, categoryId: string) {
      const newBookmark = {
        id: crypto.randomUUID(),
        title: bookmark.title || '',
        url: bookmark.url || '',
        addDate: new Date().toISOString(),
        icon: bookmark.icon || '',
        categoryId
      }
      this.bookmarks.push(newBookmark)
      
      // 更新分类计数
      const category = this.categories.find(c => c.id === categoryId)
      if (category) {
        category.count++
      }
      
      this.saveToLocalStorage()
      return newBookmark
    },

    exportBookmarks() {
      // 创建书签的 HTML 结构
      const generateBookmarkHTML = () => {
        let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
        <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
        <TITLE>Bookmarks</TITLE>
        <H1>Bookmarks</H1>
        <DL><p>\n`

        // 遍历分类
        this.categories.forEach(category => {
          html += `    <DT><H3>${category.name}</H3>\n    <DL><p>\n`
          
          // 获取该分类下的书签
          const bookmarks = this.bookmarks.filter(b => b.categoryId === category.id)
          bookmarks.forEach(bookmark => {
            // 添加 ICON 属性
            const iconAttr = bookmark.icon ? ` ICON="${bookmark.icon}"` : ''
            html += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${bookmark.addDate}"${iconAttr}>${bookmark.title}</A>\n`
          })
          
          html += `    </DL><p>\n`
        })

        html += `</DL><p>`
        return html
      }

      // 创建并下载文件
      const html = generateBookmarkHTML()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookmarks_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
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

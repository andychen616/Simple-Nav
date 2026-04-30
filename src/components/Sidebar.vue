<template>
  <div class="relative h-full" ref="sidebar">
    <!-- 半透明+毛玻璃 -->
    <aside 
      class="sidebar-container bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg h-full overflow-y-auto transition-all duration-300 backdrop-blur-light"
      :class="{
        'w-34 p-4': !isCollapsed,
        'min-w-[4rem] max-w-[4rem] px-2': isCollapsed
      }"
      @mouseenter="showToggle = true"
      @mouseleave="showToggle = false">
      
      <!-- 网站标题区域 -->
      <div class="flex items-center" :class="{'mb-4 pl-2': !isCollapsed, 'py-3 justify-center': isCollapsed}">
        <router-link 
          to="/"
          @click.native="resetCategory">
         <i class="fas fa-globe text-purple-500 text-base"></i>
        </router-link>
        <!-- 添加 router-link 实现跳转 -->
        <router-link 
          to="/"
          class="ml-2 font-bold text-purple-600 dark:text-purple-400"
          :class="{ 'hidden': isCollapsed }"
          @click.native="resetCategory"
        >
          天若有情
        </router-link>
      </div>

      <ul>
        <!-- 遍历 大分类 parentCategory -->
        <li v-for="parent in parentCategories" :key="parent" class="mb-2">
          <button
            @click="selectParent(parent)"
            class="flex items-center w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200"
            @mouseenter="showChildCategories(parent, $event)"
            @mouseleave="hideChildCategories"
          >
            <i class="fas" :class="getCategoryIcon(parent)"></i>
            <span class="ml-2" :class="{ 'hidden': isCollapsed }">{{ parent }}</span>
            
            <!-- 悬停显示子分类浮层 -->
            <div 
              v-if="showChildCategoryTooltip && currentHoverParent === parent"
              class="absolute left-full ml-2 px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md shadow-lg z-50 min-w-[120px]"
              :style="{ top: tooltipPosition }"
            >
              <div v-for="cat in parentToCategories[parent]" :key="cat" class="py-1 px-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer" @click.stop="selectCategory(cat)">
                {{ cat }}
              </div>
              <div class="absolute -left-3 top-3 w-2 h-2 bg-white dark:bg-gray-700 transform rotate-45"></div>
            </div>
          </button>
        </li>
      </ul>
      
      <!-- 收缩按钮 -->
      <button 
        v-if="showToggle"
        @click="$emit('toggle-sidebar')"
        class="absolute bottom-2 left-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200"
      >
        <i class="fas" :class="isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>
      
      <div class="mt-auto">
        <router-link 
          to="/about" 
          class="flex items-center w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200"
        >
          <i class="fas fa-info-circle mr-0.1"></i>
          <span class="ml-2" :class="{ 'hidden': isCollapsed }">关于本站</span>
        </router-link>
      </div>
    </aside>
  </div>
</template>

<script>
export default {
  props: ['isCollapsed', 'parentCategories', 'parentToCategories'], // 接收大分类数据
  data() {
    return {
      showToggle: false,
      currentHoverParent: null,
      showChildCategoryTooltip: false,
      tooltipPosition: '0px'
    };
  },
  methods: {
    // 悬停显示子分类
    showChildCategories(parent, event) {
      this.currentHoverParent = parent;
      this.showChildCategoryTooltip = true;
      const rect = event.currentTarget.getBoundingClientRect();
      this.tooltipPosition = `${rect.top + window.scrollY + 8}px`;
    },
    // 隐藏子分类
    hideChildCategories() {
      this.showChildCategoryTooltip = false;
      this.currentHoverParent = null;
    },
    // 点击大分类
    selectParent(parent) {
      this.$emit('select-parent', parent);
    },
    // 点击子分类
    selectCategory(category) {
      this.$emit('select-category', category);
    },
    getCategoryIcon(category) {
      if (category === '我的收藏') {
        return 'fas fa-star';
      }
      const savedIcons = localStorage.getItem('categoryIcons');
      const iconMap = savedIcons ? JSON.parse(savedIcons) : {};
      return iconMap[category] || 'fas fa-question-circle';
    },
    resetCategory() {
      this.$emit('select-category', null);
    },
  },
};
</script>

<style scoped>
/* 添加平滑过渡效果 */
aside {
  transition: width 0.3s ease, box-shadow 0.3s ease;
}

/* 按钮样式 */
button {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

button:hover {
  transition-delay: 0.1s;
}

/* 提示框动画 */
div[class*="bg-gray-"] {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-5px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
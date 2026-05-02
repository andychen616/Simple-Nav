<template>
  <!-- 送到 body，真正全屏居中 -->
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 max-h-[90vh]">
        <h2 class="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">
          <i class="fas fa-plus-circle mr-2"></i> 网址添加
        </h2>

        <div v-if="error" class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
          <i class="fas fa-times-circle text-red-500 mr-2"></i>
          <span class="text-red-700 dark:text-red-300">{{ error }}</span>
        </div>

        <div v-if="success" class="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/30">
          <i class="fas fa-check-circle text-green-500 mr-2"></i>
          <span class="text-green-700 dark:text-green-300">{{ success }}</span>
        </div>

        <form @submit.prevent="submitWebsite">
          <div class="mb-4">
            <label for="category" class="mb-2 block text-gray-700 dark:text-gray-300">
              分类 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <select
                id="category"
                v-model="formData.selectedCategory"
                class="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="handleCategoryChange"
              >
                <option value="">选择现有分类</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
                <option value="custom">自定义分类</option>
              </select>
            </div>

            <div v-if="formData.selectedCategory === 'custom'" class="mt-2">
              <input
                type="text"
                v-model="formData.category"
                class="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入自定义分类名称"
                required
              />
            </div>

            <input type="hidden" v-model="formData.category" :required="!formData.selectedCategory || formData.selectedCategory === 'custom'" />
          </div>

          <div class="mb-4">
            <label for="name" class="mb-2 block text-gray-700 dark:text-gray-300">
              名称 <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              class="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入网站名称"
              required
            />
          </div>

          <div class="mb-4">
            <label for="url" class="mb-2 block text-gray-700 dark:text-gray-300">
              网址 <span class="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="url"
              v-model="formData.url"
              class="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入网站URL，如：https://example.com"
              required
              pattern="https?://.+"
            />
          </div>

          <div class="mb-4">
            <label for="icon" class="mb-2 block text-gray-700 dark:text-gray-300">图标</label>
            <input
              type="text"
              id="icon"
              v-model="formData.icon"
              class="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入图标URL（可选）"
            />
          </div>

          <div class="mb-4">
            <label for="description" class="mb-2 block text-gray-700 dark:text-gray-300">描述</label>
            <textarea
              id="description"
              v-model="formData.description"
              class="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入网站描述（可选）"
              rows="3"
            ></textarea>
          </div>

          <div class="mb-4">
            <label for="sort" class="mb-2 block text-gray-700 dark:text-gray-300">排序</label>
            <input
              type="number"
              id="sort"
              v-model.number="formData.sortOrder"
              class="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入排序值（可选，数字越大越靠前）"
              min="0"
            />
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="cancel"
              class="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              提交
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script>
// 脚本完全、完全不动！！！
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {
        selectedCategory: '',
        category: '',
        name: '',
        url: '',
        icon: '',
        description: '',
        sortOrder: 0
      },
      error: '',
      success: '',
      loading: false
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetForm();
      }
    }
  },
  methods: {
    resetForm() {
      this.formData = {
        selectedCategory: '',
        category: '',
        name: '',
        url: '',
        icon: '',
        description: '',
        sortOrder: 0
      };
      this.error = '';
      this.success = '';
    },
    handleCategoryChange() {
      if (this.formData.selectedCategory && this.formData.selectedCategory !== 'custom') {
        this.formData.category = this.formData.selectedCategory;
      } else if (this.formData.selectedCategory === 'custom') {
        this.formData.category = '';
      }
    },
    async submitWebsite() {
      this.loading = true;
      this.error = '';
      this.success = '';
      try {
        if (!this.formData.category || !this.formData.name || !this.formData.url) {
          this.error = '请填写所有必填字段';
          return;
        }
        const urlPattern = /^https?:\/\//;
        if (!urlPattern.test(this.formData.url)) {
          this.error = '网址格式不正确，请以http://或https://开头';
          return;
        }
        const websiteData = {
          category: this.formData.category,
          name: this.formData.name,
          url: this.formData.url,
          icon: this.formData.icon || '',
          description: this.formData.description || '',
          order: this.formData.sortOrder || 0
        };
        await this.$emit('submit', websiteData);
        this.success = '网址提交成功！';
        setTimeout(() => {
          this.resetForm();
          this.$emit('close');
        }, 1500);
      } catch (err) {
        this.error = err.message || '提交失败，请稍后重试';
        console.error('提交网站错误:', err);
      } finally {
        this.loading = false;
      }
    },
    cancel() {
      this.$emit('close');
      this.resetForm();
    }
  }
};
</script>
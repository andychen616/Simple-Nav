<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          <i class="fas fa-lock mr-2"></i> 验证密码
        </h2>

        <div v-if="isLocked" class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
          <span class="text-yellow-700 dark:text-yellow-300">
            密码错误次数过多，已锁定。请在 {{ remainingLockTime }} 秒后重试。
          </span>
        </div>

        <div v-else-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
          <i class="fas fa-times-circle text-red-500 mr-2"></i>
          <span class="text-red-700 dark:text-red-300">{{ error }}</span>
        </div>

        <form @submit.prevent="validatePassword" v-if="!isLocked">
          <div class="mb-4">
            <label for="password" class="block text-gray-700 dark:text-gray-300 mb-2">提交密码</label>
            <input
              type="password"
              id="password"
              v-model="password"
              class="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-600"
              placeholder="请输入密码"
              required
              autofocus
            />
          </div>

          <div v-if="errorCount > 0" class="mb-4 text-sm text-yellow-700 dark:text-yellow-300">
            错误次数：{{ errorCount }}/3
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="cancel"
              class="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>验证
            </button>
          </div>
        </form>

        <div v-else class="flex justify-end">
          <button
            @click="cancel"
            class="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
// 脚本完全不动
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
      password: '',
      error: '',
      loading: false,
      errorCount: parseInt(localStorage.getItem('submitPasswordErrorCount')) || 0,
      lockedUntil: parseInt(localStorage.getItem('submitPasswordLockedUntil')) || 0,
      lockTimer: null
    };
  },
  computed: {
    isLocked() {
      return Date.now() < this.lockedUntil;
    },
    remainingLockTime() {
      if (!this.isLocked) return 0;
      const remaining = Math.ceil((this.lockedUntil - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetError();
        this.startLockTimer();
      } else {
        this.stopLockTimer();
      }
    }
  },
  mounted() {
    this.startLockTimer();
  },
  beforeUnmount() {
    this.stopLockTimer();
  },
  methods: {
    resetError() {
      this.error = '';
    },
    startLockTimer() {
      if (this.isLocked) {
        this.lockTimer = setInterval(() => {
          if (!this.isLocked) {
            this.resetLock();
            this.stopLockTimer();
          }
        }, 1000);
      }
    },
    stopLockTimer() {
      if (this.lockTimer) {
        clearInterval(this.lockTimer);
        this.lockTimer = null;
      }
    },
    resetLock() {
      this.errorCount = 0;
      this.lockedUntil = 0;
      localStorage.removeItem('submitPasswordErrorCount');
      localStorage.removeItem('submitPasswordLockedUntil');
    },
    async validatePassword() {
      this.loading = true;
      this.error = '';
      try {
        const correctPassword = import.meta.env.VITE_SUBMIT_PASSWORD || '860927';
        if (this.password === correctPassword) {
          this.resetLock();
          this.$emit('password-validated');
          this.$emit('close');
        } else {
          this.errorCount++;
          localStorage.setItem('submitPasswordErrorCount', this.errorCount);
          if (this.errorCount >= 3) {
            this.lockedUntil = Date.now() + 5 * 60 * 1000;
            localStorage.setItem('submitPasswordLockedUntil', this.lockedUntil);
            this.error = '密码错误次数过多，已锁定5分钟。';
          } else {
            this.error = `密码错误，请重试。剩余次数：${3 - this.errorCount}`;
          }
        }
      } catch (err) {
        this.error = '验证过程中出现错误，请稍后重试。';
        console.error('密码验证错误:', err);
      } finally {
        this.loading = false;
        this.password = '';
      }
    },
    cancel() {
      this.$emit('close');
      this.password = '';
    }
  }
};
</script>
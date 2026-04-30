<template>
  <footer class="bg-transparent py-4 text-center text-sm text-gray-600 dark:text-gray-400">
    <div>© {{ new Date().getFullYear() }} made with ♥️ by <a class="text-purple-600" href="https://github.com/andychen616/Simple-Nav">Andy Chen</a></div>
    <div>已稳定运行: {{ uptime }}</div> 
    <div><a href="http://beian.miit.gov.cn/" rel="nofollow" target="_blank"> 湘ICP备2026084128号-1 </a></div>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      startDate: new Date('2025-03-01'),
      currentYear: new Date().getFullYear(),
      now: new Date() // 新增当前时间响应式数据
    };
  },
  mounted() {
    // 每秒更新当前时间
    this.timer = setInterval(() => {
      this.now = new Date();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  computed: {
    uptime() {
      const diffTime = Math.abs(this.now - this.startDate);
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);
      
      return `${days}天${hours}小时${minutes}分${seconds}秒`;
    }
  }
};
</script>
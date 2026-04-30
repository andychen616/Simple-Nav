<template>
  <div class="h-screen flex flex-col">
    <div class="flex flex-1 overflow-hidden relative">
      <main class="flex-1 flex flex-col p-4 overflow-y-auto">
        <div class="flex-grow max-w-5xl mx-auto w-full">
          <h1 
            class="text-3xl font-bold mb-6 text-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors cursor-pointer"
            @click="$router.push('/')"
          >
            关于 天若有情
          </h1>
          <div class="prose dark:prose-invert">
            <div class="grid grid-cols-2 gap-6 mb-8">
              <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <i class="fas fa-rocket text-blue-500 text-xl mb-2"></i>
                <h3 class="text-xl font-semibold mb-2">项目简介</h3>
                <p class="text-gray-600 dark:text-gray-300">
                  天若有情网址导航，是一个收录优质资源、清爽实用的个人导航站点。站点基于开源项目Simple-Nav搭建，数据管理依托维基云表格，部署服务由腾讯云EdgeOne 提供。
                </p>
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
              <i class="fas fa-star text-yellow-500 text-xl mb-2"></i>
              <h3 class="text-xl font-semibold mb-2">功能特点</h3>
              <ul class="list-disc pl-4 text-gray-600 dark:text-gray-300">
                <li>智能本地搜索功能</li>
                <li>响应式侧边栏布局</li>
                <li>黑暗模式自动适配</li>                  
                <li>多分类资源管理</li>
                <li>从维基云表格获取数据，无需数据库</li>
              </ul>
            </div>
            
            <!-- 数据统计区块 -->
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <i class="fas fa-chart-line text-green-500 text-xl mb-2"></i>
              <h3 class="text-xl font-semibold mb-2">数据统计</h3>
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div class="text-2xl font-bold text-blue-500">{{ websiteCount }}个</div>
                  <div class="text-sm text-gray-500">收录网站</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-purple-500">100%</div>
                  <div class="text-sm text-gray-500">可用性监测</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-green-500">{{ lastUpdateTime || '2025-12-17' }}</div>
                  <div class="text-sm text-gray-500">自动更新</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer class="mt-8" />
      </main>
    </div>
  </div>
</template>

<script>
import Footer from '../components/Footer.vue';
import { fetchData } from '../api/fetchData';

export default {
  components: { Footer },
  data() {
    return {
      darkMode: localStorage.getItem('darkMode') === 'true',
      websiteCount: 0,
      lastUpdateTime: ''
    }
  },
  async created() {
    try {
      const data = await fetchData();
      this.websiteCount = data.length;
      
      // 找出最新的更新时间
      if (data.length > 0) {
        // 筛选出有更新时间的记录
        const recordsWithUpdateTime = data.filter(item => item.updatedAt);
        if (recordsWithUpdateTime.length > 0) {
          // 找出最新的时间
          const latestRecord = recordsWithUpdateTime.reduce((latest, current) => {
            return new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest;
          });
          // 格式化时间为 YYYY-MM-DD
          this.lastUpdateTime = new Date(latestRecord.updatedAt).toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      this.websiteCount = 0;
    }
  }
}
</script>
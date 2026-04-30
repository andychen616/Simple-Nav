const baseUrl = 'https://api.vika.cn/fusion/v1/datasheets';
const fieldKey = 'name';
const DEFAULT_ICON_URL = '/default.ico';

// 全局数据结构（兼容原有代码 + 新增父分类）
export const websiteData = {
  originalList: [],       // 原始网站列表（原有）
  parentCategories: [],   // 大分类 parentCategory
  parentToCategories: {}, // 父分类 => 子分类列表
  categoryToSites: {},    // 子分类 => 网站列表
};

export async function fetchData() {
  try {
    // 从localStorage读取API配置
    const apiKey = import.meta.env.VITE_VIKA_API_KEY || localStorage.getItem('apiKey');
    const datasheetId = import.meta.env.VITE_VIKA_DATASHEET_ID || localStorage.getItem('datasheetId');
    const viewId = import.meta.env.VITE_VIKA_VIEW_ID || localStorage.getItem('viewId');
    
    // 检查配置是否完整
    if (!apiKey || !datasheetId || !viewId) {
      throw new Error('API配置不完整，请前往设置页面配置');
    }
    
    // 动态构建API URL
    const apiUrl = `${baseUrl}/${datasheetId}/records?viewId=${viewId}&fieldKey=${fieldKey}&pageSize=1000`;
    
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API请求失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error('API请求失败');
    }
    
    const responseData = await response.json();
    console.log('API返回数据:', responseData);
    
    if (!responseData || !responseData.data || !responseData.data.records || !Array.isArray(responseData.data.records)) {
      throw new Error(`返回数据格式不正确: ${JSON.stringify(responseData)}`);
    }
    
    // 打印第一条记录的完整信息，查看是否包含更新时间
    if (responseData.data.records.length > 0) {
      console.log('完整记录信息:', responseData.data.records[0]);
    }
    
    // 处理原始数据
    const rawSites = responseData.data.records.map(record => {
      if (!record.fields || !record.fields.category || !record.fields.name) {
        console.warn('缺少必填字段的记录:', record);
        return null;
      }
      return {
        id: record.recordId,
        parentCategory: record.fields.parentCategory || '未分类',  // 🔥 新增
        category: record.fields.category,
        name: record.fields.name,
        url: record.fields.url,
        description: record.fields.description || '',
        icon: record.fields.icon || DEFAULT_ICON_URL,
        sortOrder: record.fields.order ? parseInt(record.fields.order) : 0,
        updatedAt: record.updatedAt || record.fields.updatedAt || null
      };
    }).filter(Boolean).sort((a, b) => b.sortOrder - a.sortOrder);

    // 保存原始数据
    websiteData.originalList = rawSites;

    // 核心：按 parentCategory 分组
    groupDataByParentCategory(rawSites);

    // 保持原有返回值不变，你的其他代码完全不用改
    return rawSites;

  } catch (error) {
    console.error('数据获取失败:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

//数据分组函数（父分类、子分类、网站映射）
function groupDataByParentCategory(sites) {
  const parentSet = new Set();
  const parentMap = {};
  const siteMap = {};

  sites.forEach(item => {
    const { parentCategory, category, ...site } = item;

    // 收集所有父分类
    parentSet.add(parentCategory);

    // 父分类 => 子分类
    if (!parentMap[parentCategory]) {
      parentMap[parentCategory] = new Set();
    }
    parentMap[parentCategory].add(category);

    // 子分类 => 网站
    if (!siteMap[category]) {
      siteMap[category] = [];
    }
    siteMap[category].push(site);
  });

  // 赋值到全局
  websiteData.parentCategories = Array.from(parentSet).sort();
  websiteData.parentToCategories = Object.fromEntries(
    Object.entries(parentMap).map(([k, v]) => [k, Array.from(v).sort()])
  );
  websiteData.categoryToSites = siteMap;
}

// 添加网址到维格云表格
export async function addWebsite(websiteData) {
  try {
    const apiKey = import.meta.env.VITE_VIKA_API_KEY || localStorage.getItem('apiKey');
    const datasheetId = import.meta.env.VITE_VIKA_DATASHEET_ID || localStorage.getItem('datasheetId');
    
    if (!apiKey || !datasheetId) {
      throw new Error('API配置不完整，请前往设置页面配置');
    }
    
    const apiUrl = `${baseUrl}/${datasheetId}/records?fieldKey=name`;
    
    const requestBody = {
      records: [
        {
          fields: {
            parentCategory: websiteData.parentCategory || '未分类',  // 🔥 同步新增
            category: websiteData.category,
            name: websiteData.name,
            url: websiteData.url,
            icon: websiteData.icon,
            description: websiteData.description,
            order: websiteData.order.toString()
          }
        }
      ],
      fieldKey: "name"
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API请求失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error('API请求失败');
    }
    
    const responseData = await response.json();
    console.log('API返回数据:', responseData);
    
    if (!responseData || !responseData.data || !responseData.data.records || !Array.isArray(responseData.data.records)) {
      throw new Error(`返回数据格式不正确: ${JSON.stringify(responseData)}`);
    }
    
    return responseData.data.records[0];
  } catch (error) {
    console.error('数据提交失败:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}
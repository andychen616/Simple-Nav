const baseUrl = 'https://api.vika.cn/fusion/v1/datasheets';
const fieldKey = 'name';
const DEFAULT_ICON_URL = '/default.ico';

// 全局数据结构（兼容原有代码 + 新增父分类 + 图标）
export const websiteData = {
  originalList: [],
  parentCategories: [],
  parentToCategories: {},
  categoryToSites: {},
  categoryIconMap: {}, // 新增图标映射
};

export async function fetchData() {
  try {
    const apiKey = import.meta.env.VITE_VIKA_API_KEY || localStorage.getItem('apiKey');
    const datasheetId = import.meta.env.VITE_VIKA_DATASHEET_ID || localStorage.getItem('datasheetId');
    const viewId = import.meta.env.VITE_VIKA_VIEW_ID || localStorage.getItem('viewId');
    
    if (!apiKey || !datasheetId || !viewId) {
      throw new Error('API配置不完整，请前往设置页面配置');
    }
    
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
    
    if (!responseData || !responseData.data || !responseData.data.records || !Array.isArray(responseData.data.records)) {
      throw new Error(`返回数据格式不正确: ${JSON.stringify(responseData)}`);
    }
    
    // 处理原始数据
    const rawSites = responseData.data.records.map(record => {
      if (!record.fields || !record.fields.category || !record.fields.name) {
        console.warn('缺少必填字段的记录:', record);
        return null;
      }
      return {
        id: record.recordId,
        parentCategory: record.fields.parentCategory || '未分类',
        category: record.fields.category,
        name: record.fields.name,
        url: record.fields.url,
        description: record.fields.description || '',
        icon: record.fields.icon || DEFAULT_ICON_URL,
        parentIcon: record.fields.parentIcon || '', // 从维格云读取图标
        sortOrder: record.fields.order ? parseInt(record.fields.order) : 0,
        updatedAt: record.updatedAt || record.fields.updatedAt || null
      };
    }).filter(Boolean).sort((a, b) => b.sortOrder - a.sortOrder);

    websiteData.originalList = rawSites;

    groupDataByParentCategory(rawSites);

    // 自动生成大分类图标
    buildCategoryIconMap(rawSites);

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

// 原有分组逻辑 100% 不变
function groupDataByParentCategory(sites) {
  const parentSet = new Set();
  const parentMap = {};
  const siteMap = {};

  sites.forEach(item => {
    const parentCategory = item.parentCategory;
    const category = item.category;

    parentSet.add(parentCategory);

    if (!parentMap[parentCategory]) {
      parentMap[parentCategory] = new Set();
    }
    parentMap[parentCategory].add(category);

    if (!siteMap[category]) {
      siteMap[category] = [];
    }
    siteMap[category].push(item);
  });

  websiteData.parentCategories = Array.from(parentSet).sort();
  websiteData.parentToCategories = Object.fromEntries(
    Object.entries(parentMap).map(([k, v]) => [k, Array.from(v).sort()])
  );
  websiteData.categoryToSites = siteMap;
}

// 🔥 新增：构建分类图标（完全不影响原有逻辑）
function buildCategoryIconMap(sites) {
  const iconMap = {};

  sites.forEach(item => {
    const parent = item.parentCategory;
    const icon = item.parentIcon;
    if (parent && icon && !iconMap[parent]) {
      iconMap[parent] = icon;
    }
  });

  // 默认图标
  iconMap['我的收藏'] = iconMap['我的收藏'] || 'fa-star';
  iconMap['关于本站'] = iconMap['关于本站'] || 'fa-info-circle';

  websiteData.categoryIconMap = iconMap;
}

// 原有 addWebsite 逻辑 100% 不变
export async function addWebsite(websiteData) {
  try {
    const apiKey = import.meta.env.VITE_VIKA_API_KEY || localStorage.getItem('datasheetId');
    const datasheetId = import.meta.env.VITE_VIKA_DATASHEET_ID || localStorage.getItem('datasheetId');
    
    if (!apiKey || !datasheetId) {
      throw new Error('API配置不完整，请前往设置页面配置');
    }
    
    const apiUrl = `${baseUrl}/${datasheetId}/records?fieldKey=name`;
    
    const requestBody = {
      records: [
        {
          fields: {
            parentCategory: websiteData.parentCategory || '未分类',
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
/**
 * 磁盘类型常量和工具函数
 */

const DRIVE_TYPES = {
  UNKNOWN: 0,
  NO_ROOT: 1,
  REMOVABLE: 2,
  LOCAL: 3,
  NETWORK: 4,
  OPTICAL: 5,
  RAM: 6
};

const DRIVE_TYPE_NAMES = {
  [DRIVE_TYPES.UNKNOWN]: '未知设备',
  [DRIVE_TYPES.NO_ROOT]: '无根目录',
  [DRIVE_TYPES.REMOVABLE]: '可移动磁盘',
  [DRIVE_TYPES.LOCAL]: '本地磁盘',
  [DRIVE_TYPES.NETWORK]: '网络驱动器',
  [DRIVE_TYPES.OPTICAL]: '光盘驱动器',
  [DRIVE_TYPES.RAM]: '虚拟内存'
};

// 常见厂商及常用别名（包含缩写/旧品牌名/常见写法）
const VENDOR_ALIASES = {
  'western digital': 'Western Digital',
  'wdc': 'Western Digital',
  'wd ': 'Western Digital',
  'wd-': 'Western Digital',
  'seagate': 'Seagate',
  'st ': 'Seagate', // 型号多以 ST 开头（避免过度匹配，仅空格后）
  'samsung': 'Samsung',
  'intel': 'Intel',
  'kingston': 'Kingston',
  'crucial': 'Crucial',
  'sandisk': 'SanDisk',
  'toshiba': 'Toshiba',
  'hitachi': 'Hitachi',
  'hgst': 'HGST',
  'micron': 'Micron',
  'sk hynix': 'SK hynix',
  'hynix': 'SK hynix',
  'adata': 'ADATA',
  'apacer': 'Apacer',
  'plextor': 'Plextor',
  'patriot': 'Patriot',
  'pny': 'PNY',
  'team': 'TEAMGROUP',
  'teamgroup': 'TEAMGROUP',
  'transcend': 'Transcend',
  'gigabyte': 'Gigabyte',
  'msi': 'MSI',
  'lenovo': 'Lenovo',
  'asus': 'ASUS',
  'apple': 'Apple',
  'hikvision': 'Hikvision',
  'netac': 'Netac',
  'biwin': 'Biwin',
  'kingbank': 'Kingbank'
};

/**
 * 获取驱动器类型描述
 */
function getDriveTypeString(type) {
  return DRIVE_TYPE_NAMES[type] || DRIVE_TYPE_NAMES[DRIVE_TYPES.UNKNOWN];
}

/**
 * 从设备标题中提取厂商名称
 */
function extractVendor(caption) {
  if (!caption) return 'Unknown';
  const text = String(caption).toLowerCase();

  // 1) 别名匹配（大小写不敏感）
  for (const key of Object.keys(VENDOR_ALIASES)) {
    if (text.includes(key)) {
      return VENDOR_ALIASES[key];
    }
  }

  // 2) 首词别名映射（如 WDC、TOSHIBA 等）
  const firstToken = String(caption).split(/[\s-]+/)[0].toLowerCase();
  if (VENDOR_ALIASES[firstToken]) {
    return VENDOR_ALIASES[firstToken];
  }

  // 3) 首词作为回退（尽量提供有意义的值）
  return String(caption).split(/[\s-]+/)[0] || 'Unknown';
}

module.exports = {
  DRIVE_TYPES,
  getDriveTypeString,
  extractVendor
};
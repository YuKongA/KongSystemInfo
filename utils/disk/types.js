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

const KNOWN_VENDORS = [
  'Western Digital',
  'Seagate',
  'Samsung',
  'Intel',
  'Kingston',
  'Crucial',
  'SanDisk'
];

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
  const vendor = KNOWN_VENDORS.find(v => caption.includes(v));
  return vendor || caption.split(' ')[0] || 'Unknown';
}

module.exports = {
  DRIVE_TYPES,
  getDriveTypeString,
  extractVendor
}; 
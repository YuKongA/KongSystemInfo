/**
 * 获取驱动器类型描述
 * @param {number} type - 驱动器类型代码
 * @returns {string} 驱动器类型描述
 */
function getDriveTypeString(type) {
  const types = {
    0: '未知设备',
    1: '无根目录',
    2: '可移动磁盘',
    3: '本地磁盘',
    4: '网络驱动器',
    5: '光盘驱动器',
    6: '虚拟内存'
  };
  return types[type] || '未知设备';
}

/**
 * 从设备标题中提取厂商名称
 * @param {string} caption - 设备标题
 * @returns {string} 厂商名称
 */
function extractVendor(caption) {
  if (!caption) return 'Unknown';
  const vendors = ['Western Digital', 'Seagate', 'Samsung', 'Intel', 'Kingston', 'Crucial', 'SanDisk'];
  return vendors.find(vendor => caption.includes(vendor)) || caption.split(' ')[0] || 'Unknown';
}

module.exports = {
  getDriveTypeString,
  extractVendor
}; 
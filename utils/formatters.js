/**
 * 格式化工具函数集合
 */

/**
 * 格式化字节大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小字符串
 */
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 获取使用率对应的状态类名
 * @param {number} usage - 使用率百分比
 * @returns {string} 状态类名
 */
function getStatusClass(usage) {
  if (usage >= 90) return 'danger';
  if (usage >= 70) return 'warning';
  return '';
}

/**
 * 获取使用率对应的状态文本
 * @param {number} usage - 使用率百分比
 * @returns {string} 状态文本
 */
function getStatusText(usage) {
  if (usage >= 90) return '警告';
  if (usage >= 70) return '注意';
  return '正常';
}

/**
 * 格式化运行时间
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间字符串
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}天 ${hours}小时 ${minutes}分钟`;
}

module.exports = {
  formatBytes,
  getStatusClass,
  getStatusText,
  formatUptime
}; 
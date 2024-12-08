const { execPromise } = require('./exec');

/**
 * 磁盘信息处理工具
 */

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

/**
 * 解析 WMIC CSV 输出
 * @param {string} output - WMIC 命令输出
 * @returns {Array} 解析后的对象数组
 */
function parseWmicCsvOutput(output) {
  const lines = output.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
}

/**
 * 获取 Windows 系统下的详细磁盘信息
 * @returns {Promise<Object>} 磁盘信息对象
 */
async function getWindowsDiskDetails() {
  try {
    const [physicalDiskInfo, logicalDiskInfo] = await Promise.all([
      execPromise('wmic diskdrive get Caption,Size,Model,InterfaceType,SerialNumber /format:csv'),
      execPromise('wmic logicaldisk get DeviceID,FileSystem,Size,FreeSpace,DriveType /format:csv')
    ]);

    return {
      physical: parseWmicCsvOutput(physicalDiskInfo.stdout),
      logical: parseWmicCsvOutput(logicalDiskInfo.stdout)
    };
  } catch (error) {
    console.error('Error getting Windows disk details:', error);
    return null;
  }
}

module.exports = {
  getDriveTypeString,
  extractVendor,
  getWindowsDiskDetails
};
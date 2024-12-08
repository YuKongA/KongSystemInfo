const { execPromise } = require('./exec');

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
    const [physicalDiskInfo, logicalDiskInfo, partitionInfo] = await Promise.all([
      execPromise('wmic diskdrive get Caption,Size,Model,InterfaceType,SerialNumber /format:csv'),
      execPromise('wmic logicaldisk get DeviceID,FileSystem,Size,FreeSpace,DriveType /format:csv'),
      execPromise('wmic partition get DeviceID,DiskIndex,Size,Type /format:csv')
    ]);

    return {
      physical: parseWmicCsvOutput(physicalDiskInfo.stdout),
      logical: parseWmicCsvOutput(logicalDiskInfo.stdout),
      partitions: parseWmicCsvOutput(partitionInfo.stdout)
    };
  } catch (error) {
    console.error('Error getting Windows disk details:', error);
    return null;
  }
}

module.exports = {
  getWindowsDiskDetails
}; 
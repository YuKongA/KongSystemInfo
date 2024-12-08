/**
 * Unix系统磁盘信息获取
 */

const fs = require('fs');

/**
 * 获取Unix系统驱动器信息
 */
async function getUnixDrives() {
  try {
    const info = fs.statfsSync('/');
    const total = info.blocks * info.bsize;
    const free = info.bfree * info.bsize;

    return [{
      drive: '/',
      fileSystem: 'Unknown',
      total,
      free,
      used: total - free,
      type: '本地磁盘',
      isRemovable: false,
      isSystem: true,
      model: 'Unknown',
      serial: 'Unknown',
      vendor: 'Unknown',
      device: '/',
      interfaceType: 'Unknown',
      mediaType: 'Unknown'
    }];
  } catch (error) {
    console.error('获取Unix驱动器信息失败:', error);
    return [];
  }
}

module.exports = {
  getUnixDrives
}; 
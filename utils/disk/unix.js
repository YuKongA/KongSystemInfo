/**
 * Unix系统磁盘信息获取
 */

const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');

/**
 * 获取macOS的文件系统信息
 */
function getMacOSFileSystem(mountPoint) {
  try {
    const output = execSync('mount', { encoding: 'utf8' });
    const mountLine = output.split('\n').find(line => line.includes(mountPoint));
    if (mountLine) {
      const match = mountLine.match(/\((.*?)(,|$)/);
      return match ? match[1].trim() : 'Unknown';
    }
    return 'Unknown';
  } catch (e) {
    return 'Unknown';
  }
}

/**
 * 获取Unix系统驱动器信息
 */
async function getUnixDrives() {
  try {
    const isMacOS = os.platform() === 'darwin';
    const info = fs.statfsSync('/');
    const total = info.blocks * info.bsize;
    const free = info.bfree * info.bsize;

    // 获取文件系统类型
    let fileSystem = 'Unknown';
    if (isMacOS) {
      fileSystem = getMacOSFileSystem('/');
    }

    return [{
      drive: '/',
      fileSystem,
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
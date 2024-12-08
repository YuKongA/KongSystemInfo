/**
 * 磁盘信息工具集合
 */

const { getWindowsDrives } = require('./windows');
const { getUnixDrives } = require('./unix');

/**
 * 获取驱动器信息
 */
async function getDrives() {
  return process.platform === 'win32' ? 
    await getWindowsDrives() : 
    await getUnixDrives();
}

module.exports = {
  getDrives
}; 
/**
 * 磁盘信息工具集合
 */

const { getDrives: getDrivesImpl } = require('./disks');

/**
 * 获取驱动器信息
 */
async function getDrives() {
  if (process.platform !== 'win32') {
    return [];
  }
  return await getDrivesImpl();
}

module.exports = {
  getDrives
};
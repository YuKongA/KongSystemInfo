/**
 * 系统信息工具集合
 */

const os = require('os');
const { getOSInfo } = require('./os');
const { getCpuLoad, getCpuInfo } = require('./cpu');
const { getGpuInfo } = require('./gpu');
const { getNetworkInfo } = require('./network');

/**
 * 获取系统信息
 */
async function getSystemInfo() {
  try {
    const [cpuInfo, graphics] = await Promise.all([
      getCpuInfo(),
      getGpuInfo()
    ]);

    return {
      // 基本信息
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      
      // 内存信息
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      
      // CPU信息
      ...cpuInfo,
      
      // 其他信息
      uptime: os.uptime(),
      userInfo: os.userInfo(),
      graphics
    };
  } catch (error) {
    console.error('获取系统信息失败:', error);
    return null;
  }
}

module.exports = {
  getOSInfo,
  getCpuLoad,
  getSystemInfo,
  getNetworkInfo,
};
/**
 * GPU相关工具函数
 */

const { graphics } = require('systeminformation');

/**
 * 格式化显卡信息
 */
function formatGraphicsInfo(controllers) {
  return controllers.map(({
    model, vendor, vram, driverVersion: driver,
    bus, memoryTotal, memoryUsed
  }) => ({
    model, vendor, vram, driver, bus, memoryTotal, memoryUsed
  }));
}

/**
 * 获取GPU信息
 */
async function getGpuInfo() {
  const gpuInfo = await graphics();
  return formatGraphicsInfo(gpuInfo.controllers);
}

module.exports = {
  getGpuInfo
}; 
/**
 * CPU相关工具函数
 */

const os = require('os');
const { cpu } = require('systeminformation');

/**
 * 获取CPU时间信息
 */
function getCpuTimes() {
  return os.cpus().map(cpu => ({
    idle: cpu.times.idle || 0,
    total: Object.values(cpu.times).reduce((acc, time) => acc + time, 0)
  }));
}

/**
 * 计算使用率百分比
 */
function calculateUsagePercent(idleDiff, totalDiff) {
  if (totalDiff === 0) return 0;
  const usage = 100 - (idleDiff / totalDiff * 100);
  return Math.round(usage * 100) / 100;
}

/**
 * 计算CPU使用率
 */
function calculateCpuUsage(startMeasure, endMeasure) {
  let totalIdleDiff = 0;
  let totalDiff = 0;

  const coreUsages = startMeasure.map((start, i) => {
    const end = endMeasure[i];
    const idleDiff = end.idle - start.idle;
    const diffTotal = end.total - start.total;
    
    totalIdleDiff += idleDiff;
    totalDiff += diffTotal;
    
    return calculateUsagePercent(idleDiff, diffTotal);
  });

  const totalUsage = calculateUsagePercent(totalIdleDiff, totalDiff);
  return { totalUsage, coreUsages };
}

/**
 * 获取CPU负载信息
 */
async function getCpuLoad() {
  return new Promise((resolve) => {
    const startMeasure = getCpuTimes();

    setTimeout(() => {
      const endMeasure = getCpuTimes();
      const { totalUsage, coreUsages } = calculateCpuUsage(startMeasure, endMeasure);
      
      resolve({
        average: totalUsage,
        cores: coreUsages
      });
    }, 1000);
  });
}

/**
 * 获取CPU基本信息
 */
async function getCpuInfo() {
  const cpuDetails = await cpu();
  const cpus = os.cpus().map(({ model, speed, times }) => ({ 
    model, speed, times 
  }));

  return {
    cpus,
    cpuCount: cpus.length,
    cpuDetails
  };
}

module.exports = {
  getCpuLoad,
  getCpuInfo
}; 
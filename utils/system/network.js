/**
 * 网络信息相关工具函数
 */

const { networkInterfaces } = require('systeminformation');

/**
 * 格式化网卡信息
 */
function formatInterfaces(interfaces) {
  return interfaces.map((iface) => ({
    iface: iface.iface,
    name: iface.ifaceName || iface.iface,
    type: iface.type,
    mac: iface.mac,
    ipv4: iface.ip4,
    ipv6: iface.ip6,
    speed: iface.speed,
    operstate: iface.operstate,
    duplex: iface.duplex,
    internal: iface.internal,
  }));
}

/**
 * 获取网络接口信息
 */
async function getNetworkInfo() {
  const ifaces = await networkInterfaces();
  return formatInterfaces(ifaces);
}

module.exports = {
  getNetworkInfo,
};
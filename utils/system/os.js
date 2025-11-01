/**
 * 操作系统相关工具函数
 */

const WINDOWS_11_BUILD = 22000;

function getWindowsVersion(release) {
  const parts = String(release).split('.');
  const buildNumber = parseInt(parts[2], 10);
  return buildNumber >= WINDOWS_11_BUILD ? 'Windows 11' : 'Windows 10';
}

function getOSInfo(platform, release) {
  if (platform !== 'win32') {
    return 'Unsupported OS';
  }
  return getWindowsVersion(release);
}

module.exports = {
  getOSInfo
};
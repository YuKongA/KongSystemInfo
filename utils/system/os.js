/**
 * 操作系统相关工具函数
 */

const WINDOWS_11_BUILD = 22000;

const MAC_VERSIONS = {
  '22': 'Ventura',
  '21': 'Monterey',
  '20': 'Big Sur',
  '19': 'Catalina',
  '18': 'Mojave',
  '17': 'High Sierra'
};

/**
 * 获取Windows版本
 */
function getWindowsVersion(release) {
  const buildNumber = parseInt(release.split('.')[2]);
  return buildNumber >= WINDOWS_11_BUILD ? 'Windows 11' : 'Windows 10';
}

/**
 * 获取macOS版本
 */
function getMacVersion(release) {
  const majorVersion = release.split('.')[0];
  return `macOS ${MAC_VERSIONS[majorVersion] || release}`;
}

/**
 * 获取操作系统信息
 */
function getOSInfo(platform, release) {
  const osMap = {
    win32: () => getWindowsVersion(release),
    darwin: () => getMacVersion(release),
    linux: () => `Linux ${release}`
  };

  const getOS = osMap[platform] || (() => `${platform} ${release}`);
  return platform === 'win32' ? getOS() : getOS();
}

module.exports = {
  getOSInfo
}; 
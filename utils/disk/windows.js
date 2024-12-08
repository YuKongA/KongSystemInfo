/**
 * Windows系统磁盘信息获取
 */

const { execPromise } = require('../exec');
const { parseWmicCsvOutput } = require('./parser');
const { DRIVE_TYPES, getDriveTypeString, extractVendor } = require('./types');

/**
 * 获取Windows磁盘详细信息
 */
async function getWindowsDiskDetails() {
  try {
    const [physicalDiskInfo, logicalDiskInfo] = await Promise.all([
      execPromise('wmic diskdrive get Caption,Size,Model,InterfaceType,SerialNumber /format:csv'),
      execPromise('wmic logicaldisk get DeviceID,FileSystem,Size,FreeSpace,DriveType /format:csv')
    ]);

    return {
      physical: parseWmicCsvOutput(physicalDiskInfo.stdout),
      logical: parseWmicCsvOutput(logicalDiskInfo.stdout)
    };
  } catch (error) {
    console.error('获取Windows磁盘信息失败:', error);
    return null;
  }
}

/**
 * 格式化Windows驱动器信息
 */
function formatWindowsDrive(logicalDisk, physicalDisk) {
  const driveType = parseInt(logicalDisk.DriveType);
  const size = parseInt(logicalDisk.Size) || 0;
  const freeSpace = parseInt(logicalDisk.FreeSpace) || 0;

  return {
    drive: logicalDisk.DeviceID,
    fileSystem: logicalDisk.FileSystem,
    total: size,
    free: freeSpace,
    used: size - freeSpace,
    type: getDriveTypeString(driveType),
    isRemovable: driveType === DRIVE_TYPES.REMOVABLE,
    isSystem: driveType === DRIVE_TYPES.LOCAL,
    model: physicalDisk?.Model || 'Unknown',
    serial: physicalDisk?.SerialNumber || 'Unknown',
    vendor: physicalDisk ? extractVendor(physicalDisk.Caption) : 'Unknown',
    device: physicalDisk?.Caption || 'Unknown',
    interfaceType: physicalDisk?.InterfaceType || 'Unknown',
    mediaType: physicalDisk?.MediaType || 'Unknown'
  };
}

/**
 * 获取Windows驱动器信息
 */
async function getWindowsDrives() {
  try {
    const diskDetails = await getWindowsDiskDetails();
    if (!diskDetails?.logical?.length) return [];

    return diskDetails.logical.map(logicalDisk => 
      formatWindowsDrive(logicalDisk, diskDetails.physical[0])
    );
  } catch (error) {
    console.error('获取Windows驱动器信息失败:', error);
    return [];
  }
}

module.exports = {
  getWindowsDrives
}; 
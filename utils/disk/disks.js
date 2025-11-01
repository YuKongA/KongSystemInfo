/**
 * 系统磁盘信息获取
 */

const { execPromise } = require('../exec');
const { parseWmicCsvOutput, parseWmicListOutput } = require('./parser');
const { DRIVE_TYPES, getDriveTypeString, extractVendor } = require('./types');

/**
 * 获取磁盘详细信息
 */
async function getDiskDetails() {
  try {
    const [physicalDiskInfo, logicalDiskInfo] = await Promise.all([
      execPromise('wmic diskdrive get DeviceID,Caption,Size,Model,InterfaceType,SerialNumber /format:csv'),
      execPromise('wmic logicaldisk get DeviceID,FileSystem,Size,FreeSpace,DriveType /format:csv')
    ]);

    return {
      physical: parseWmicCsvOutput(physicalDiskInfo.stdout),
      logical: parseWmicCsvOutput(logicalDiskInfo.stdout)
    };
  } catch (error) {
    console.error('获取磁盘信息失败:', error);
    return null;
  }
}

/**
 * 获取盘符与物理磁盘的关联关系
 */
async function getDiskAssociations() {
  try {
    const [driveToPartitionRaw, logicalToPartitionRaw] = await Promise.all([
      execPromise('wmic path Win32_DiskDriveToDiskPartition get Antecedent,Dependent /format:list'),
      execPromise('wmic path Win32_LogicalDiskToPartition get Antecedent,Dependent /format:list')
    ]);

    return {
      driveToPartition: parseWmicListOutput(driveToPartitionRaw.stdout),
      logicalToPartition: parseWmicListOutput(logicalToPartitionRaw.stdout)
    };
  } catch (error) {
    console.error('获取盘符关联信息失败:', error);
    return { driveToPartition: [], logicalToPartition: [] };
  }
}

function extractPhysicalNumber(str) {
  const match = String(str).match(/PHYSICALDRIVE(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function extractPartitionKey(str) {
  const match = String(str).match(/Win32_DiskPartition\.DeviceID=\"([^\"]+)\"/i);
  return match ? match[1] : null;
}

function extractLogicalLetter(str) {
  const match = String(str).match(/Win32_LogicalDisk\.DeviceID=\"([A-Z]:)\"/i);
  return match ? match[1] : null;
}

function buildLetterToPhysicalMap(diskDetails, associations) {
  const partitionToPhysical = new Map();
  for (const rec of associations.driveToPartition) {
    const physicalNum = extractPhysicalNumber(rec.Antecedent);
    const partitionKey = extractPartitionKey(rec.Dependent);
    if (physicalNum !== null && partitionKey) {
      partitionToPhysical.set(partitionKey, physicalNum);
    }
  }

  const letterToPhysicalNum = new Map();
  for (const rec of associations.logicalToPartition) {
    const partitionKey = extractPartitionKey(rec.Antecedent);
    const letter = extractLogicalLetter(rec.Dependent);
    if (partitionKey && letter && partitionToPhysical.has(partitionKey)) {
      letterToPhysicalNum.set(letter.toUpperCase(), partitionToPhysical.get(partitionKey));
    }
  }

  const physicalByNum = new Map();
  for (const pd of diskDetails.physical || []) {
    const num = extractPhysicalNumber(pd.DeviceID || pd.Caption || '');
    if (num !== null) {
      physicalByNum.set(num, pd);
    }
  }

  const letterToPhysicalDisk = new Map();
  for (const [letter, num] of letterToPhysicalNum.entries()) {
    letterToPhysicalDisk.set(letter, physicalByNum.get(num));
  }
  return letterToPhysicalDisk;
}

/**
 * 格式化驱动器信息
 */
function formatDrive(logicalDisk, physicalDisk) {
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
 * 获取驱动器信息
 */
async function getDrives() {
  try {
    const diskDetails = await getDiskDetails();
    if (!diskDetails?.logical?.length) return [];
    const associations = await getDiskAssociations();
    const letterMap = buildLetterToPhysicalMap(diskDetails, associations);

    return diskDetails.logical.map(logicalDisk => {
      const physical = letterMap.get(String(logicalDisk.DeviceID).toUpperCase()) || diskDetails.physical[0];
      return formatDrive(logicalDisk, physical);
    });
  } catch (error) {
    console.error('获取驱动器信息失败:', error);
    return [];
  }
}

module.exports = {
  getDrives
};
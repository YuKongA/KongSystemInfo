const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
const si = require('systeminformation')
const { getWindowsDiskDetails } = require('./utils/wmic')
const { getDriveTypeString, extractVendor } = require('./utils/system')

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'Kong System Info',
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.setMinimumSize(800, 600)
  
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools()
  }

  win.loadFile('index.html')
  win.setMenu(null)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 处理磁盘信息请求
ipcMain.handle('get-disk-info', async () => {
  try {
    const drives = await getDrives()
    const systemInfo = await getSystemInfo()

    return { drives, systemInfo }
  } catch (err) {
    console.error('Error getting system info:', err)
    return { drives: [], systemInfo: null }
  }
})

// 获取驱动器信息
async function getDrives() {
  if (process.platform === 'win32') {
    return await getWindowsDrives()
  }
  return await getUnixDrives()
}

// 获取 Windows 驱动器信息
async function getWindowsDrives() {
  const diskDetails = await getWindowsDiskDetails()
  if (!diskDetails) return []

  return diskDetails.logical.map(logicalDisk => {
    const driveType = parseInt(logicalDisk.DriveType)
    const physicalDisk = diskDetails.physical[0]

    return {
      drive: logicalDisk.DeviceID,
      fileSystem: logicalDisk.FileSystem,
      total: parseInt(logicalDisk.Size) || 0,
      free: parseInt(logicalDisk.FreeSpace) || 0,
      used: parseInt(logicalDisk.Size) - parseInt(logicalDisk.FreeSpace) || 0,
      type: getDriveTypeString(driveType),
      isRemovable: driveType === 2,
      isSystem: driveType === 3,
      model: physicalDisk?.Model || 'Unknown',
      serial: physicalDisk?.SerialNumber || 'Unknown',
      vendor: physicalDisk ? extractVendor(physicalDisk.Caption) : 'Unknown',
      device: physicalDisk?.Caption || 'Unknown',
      interfaceType: physicalDisk?.InterfaceType || 'Unknown',
      mediaType: physicalDisk?.MediaType || 'Unknown'
    }
  })
}

// 获取 Unix 系统驱动器信息
async function getUnixDrives() {
  const info = fs.statfsSync('/')
  return [{
    drive: '/',
    fileSystem: 'Unknown',
    total: info.blocks * info.bsize,
    free: info.bfree * info.bsize,
    used: (info.blocks - info.bfree) * info.bsize,
    type: '本地磁盘',
    isRemovable: false,
    isSystem: true,
    model: 'Unknown',
    serial: 'Unknown',
    vendor: 'Unknown',
    device: '/',
    interfaceType: 'Unknown',
    mediaType: 'Unknown'
  }]
}

// 获取系统信息
async function getSystemInfo() {
  const gpuInfo = await si.graphics()
  
  return {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpus: os.cpus().map(cpu => ({
      model: cpu.model,
      speed: cpu.speed,
      times: cpu.times
    })),
    cpuCount: os.cpus().length,
    uptime: os.uptime(),
    userInfo: os.userInfo(),
    graphics: gpuInfo.controllers.map(gpu => ({
      model: gpu.model,
      vendor: gpu.vendor,
      vram: gpu.vram,
      driver: gpu.driverVersion,
      bus: gpu.bus,
      memoryTotal: gpu.memoryTotal,
      memoryUsed: gpu.memoryUsed
    }))
  }
}
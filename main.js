const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
const { graphics, cpu } = require('systeminformation')
const { getWindowsDiskDetails, getDriveTypeString, extractVendor } = require('./utils/disk')

// 全局变量和配置
const CONFIG = {
  window: {
    width: 1080,
    height: 720,
    minWidth: 1080,
    minHeight: 720,
    title: 'KongSystemInfo',
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true
    }
  },
  devMenu: [
    {
      label: '开发',
      submenu: [
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: (_, window) => window?.webContents.toggleDevTools()
        }
      ]
    }
  ]
}

let mainWindow = null

/**
 * 创建主窗口
 */
function createWindow() {
  try {
    mainWindow = new BrowserWindow(CONFIG.window)
    mainWindow.setMinimumSize(CONFIG.window.minWidth, CONFIG.window.minHeight)

    // 设置菜单
    const menu = Menu.buildFromTemplate(CONFIG.devMenu)
    Menu.setApplicationMenu(menu)
    mainWindow.setMenuBarVisibility(false)

    // 开发环境下自动打开开发者工具
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools()
    }

    mainWindow.loadFile('index.html')
  } catch (error) {
    console.error('创建窗口失败:', error)
  }
}

/**
 * 获取系统信息
 * @returns {Promise<Object>} 系统信息对象
 */
async function getSystemInfo() {
  try {
    const [gpuInfo, cpuInfo] = await Promise.all([
      graphics(),
      cpu()
    ])

    const cpus = os.cpus().map(({ model, speed, times }) => ({ 
      model, 
      speed, 
      times 
    }))

    return {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus,
      cpuCount: cpus.length,
      cpuDetails: cpuInfo,
      uptime: os.uptime(),
      userInfo: os.userInfo(),
      graphics: gpuInfo.controllers.map(({
        model, vendor, vram, driverVersion: driver,
        bus, memoryTotal, memoryUsed
      }) => ({
        model, vendor, vram, driver, bus, memoryTotal, memoryUsed
      }))
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
    return null
  }
}

/**
 * 获取驱动器信息
 * @returns {Promise<Array>} 驱动器信息数组
 */
async function getDrives() {
  try {
    return process.platform === 'win32' ? 
      await getWindowsDrives() : 
      await getUnixDrives()
  } catch (error) {
    console.error('获取驱动器信息失败:', error)
    return []
  }
}

/**
 * 获取 Windows 驱动器信息
 * @returns {Promise<Array>} Windows 驱动器信息数组
 */
async function getWindowsDrives() {
  try {
    const diskDetails = await getWindowsDiskDetails()
    if (!diskDetails?.logical?.length) return []

    return diskDetails.logical.map(logicalDisk => {
      const driveType = parseInt(logicalDisk.DriveType)
      const physicalDisk = diskDetails.physical[0]
      const size = parseInt(logicalDisk.Size) || 0
      const freeSpace = parseInt(logicalDisk.FreeSpace) || 0

      return {
        drive: logicalDisk.DeviceID,
        fileSystem: logicalDisk.FileSystem,
        total: size,
        free: freeSpace,
        used: size - freeSpace,
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
  } catch (error) {
    console.error('获取Windows驱动器信息失败:', error)
    return []
  }
}

/**
 * 获取 Unix 系统驱动器信息
 * @returns {Promise<Array>} Unix 驱动器信息数组
 */
async function getUnixDrives() {
  try {
    const info = fs.statfsSync('/')
    const total = info.blocks * info.bsize
    const free = info.bfree * info.bsize

    return [{
      drive: '/',
      fileSystem: 'Unknown',
      total,
      free,
      used: total - free,
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
  } catch (error) {
    console.error('获取Unix驱动器信息失败:', error)
    return []
  }
}

// IPC 通信处理
ipcMain.handle('get-disk-info', async () => {
  try {
    const [drives, systemInfo] = await Promise.all([
      getDrives(),
      getSystemInfo()
    ])
    return { drives, systemInfo }
  } catch (error) {
    console.error('获取系统信息失败:', error)
    return { drives: [], systemInfo: null }
  }
})

// 应用生命周期事件处理
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
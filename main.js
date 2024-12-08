const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const { getDrives } = require('./utils/disk')
const { getSystemInfo, getCpuLoad } = require('./utils/system')

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

// IPC 通信处理
ipcMain.handle('get-disk-info', async () => {
  try {
    const drives = await getDrives();
    return { drives };
  } catch (error) {
    console.error('获取磁盘信息失败:', error);
    return { drives: [] };
  }
});

// 添加系统信息处理程序
ipcMain.handle('get-system-info', async () => {
  try {
    return await getSystemInfo();
  } catch (error) {
    console.error('获取系统信息失败:', error);
    return null;
  }
});

// 添加CPU负载处理程序
ipcMain.handle('get-cpu-load', async () => {
  try {
    return await getCpuLoad();
  } catch (error) {
    console.error('获取CPU负载失败:', error);
    return null;
  }
});

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
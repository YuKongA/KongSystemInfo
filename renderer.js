function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

function getProgressBarClass(usage) {
  if (usage >= 90) return 'danger';
  if (usage >= 70) return 'warning';
  return '';
}

function getStatusClass(usage) {
  if (usage >= 90) return 'status-danger';
  if (usage >= 70) return 'status-warning';
  return 'status-normal';
}

function getStatusText(usage) {
  if (usage >= 90) return '警告';
  if (usage >= 70) return '注意';
  return '正常';
}

// 添加一个操作系统识别函数
function getOSInfo(platform, release) {
  let osName = '';
  let osVersion = '';

  switch (platform) {
    case 'win32':
      // Windows 11 的内部版本号大于等于 22000
      const buildNumber = parseInt(release.split('.')[2]);
      osName = buildNumber >= 22000 ? 'Windows 11' : 'Windows 10';
      break;
    case 'darwin':
      osName = 'macOS';
      const macVersions = {
        '22': 'Ventura',
        '21': 'Monterey',
        '20': 'Big Sur',
        '19': 'Catalina',
        '18': 'Mojave',
        '17': 'High Sierra'
      };
      const majorVersion = release.split('.')[0];
      osVersion = macVersions[majorVersion] || release;
      break;
    case 'linux':
      osName = 'Linux';
      try {
        osVersion = release;
      } catch (error) {
        osVersion = release;
      }
      break;
    default:
      osName = platform;
      osVersion = release;
  }

  // Windows 不显示版本号，其他系统显示
  return platform === 'win32' ? osName : `${osName} ${osVersion}`;
}

function updateSystemInfo(systemInfo) {
  const systemInfoDiv = document.getElementById('system-info');

  // 格式化运行时间
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  // 格式化 CPU 使用率
  const formatCPUUsage = (times) => {
    const total = Object.values(times).reduce((acc, val) => acc + val, 0);
    const idle = times.idle;
    return ((1 - idle / total) * 100).toFixed(1) + '%';
  };

  const cpuModel = systemInfo.cpus[0].model;
  const memoryUsage = ((1 - systemInfo.freeMemory / systemInfo.totalMemory) * 100).toFixed(1);
  const osInfo = getOSInfo(systemInfo.platform, systemInfo.release);

  // 架构信息部分
  const getArchText = (arch) => {
    switch (arch) {
      case 'x64':
        return '64位';
      case 'x32':
      case 'ia32':
        return '32位';
      default:
        return arch;
    }
  };

  // 内存信息部分
  const memorySection = `
    <div class="system-info-section">
      <h4>内存信息</h4>
      <div class="system-info-grid">
        <p><strong>总内存:</strong> ${formatBytes(systemInfo.totalMemory)}</p>
        <p><strong>可用内存:</strong> ${formatBytes(systemInfo.freeMemory)}</p>
        <p><strong>已用内存:</strong> ${formatBytes(systemInfo.totalMemory - systemInfo.freeMemory)}</p>
        <div class="memory-usage-wrapper">
          <p><strong>内存使用率:</strong> ${memoryUsage}%</p>
          <div class="progress-bar">
            <div class="progress-bar-fill ${getProgressBarClass(parseFloat(memoryUsage))}" 
                 style="width: ${memoryUsage}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // 显卡信息部分
  const gpuSection = systemInfo.graphics.map((gpu, index) => `
    <div class="system-info-section">
      <h4>显卡信息 ${systemInfo.graphics.length > 1 ? (index + 1) : ''}</h4>
      <div class="system-info-grid">
        <p><strong>显卡型号:</strong> ${gpu.model || 'Unknown'}</p>
        <p><strong>制造商:</strong> ${gpu.vendor || 'Unknown'}</p>
        ${gpu.vram ? `<p><strong>显存大小:</strong> ${gpu.vram} MB</p>` : ''}
        ${gpu.driver ? `<p><strong>驱动版本:</strong> ${gpu.driver}</p>` : ''}
        ${gpu.bus ? `<p><strong>总线:</strong> ${gpu.bus}</p>` : ''}
        ${gpu.memoryTotal ? `
          <div class="memory-usage-wrapper">
            <p><strong>显存使用率:</strong> ${((gpu.memoryUsed / gpu.memoryTotal) * 100).toFixed(1)}%</p>
            <div class="progress-bar">
              <div class="progress-bar-fill ${getProgressBarClass(parseFloat((gpu.memoryUsed / gpu.memoryTotal) * 100))}" 
                   style="width: ${(gpu.memoryUsed / gpu.memoryTotal) * 100}%"></div>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  systemInfoDiv.innerHTML = `
    <div class="system-info-container">
      <div class="system-info-section">
        <h4>系统信息</h4>
        <div class="system-info-grid">
          <p><strong>操作系统:</strong> ${osInfo} (${getArchText(systemInfo.arch)})</p>
          <p><strong>主机名:</strong> ${systemInfo.hostname}</p>
          <p><strong>用户名:</strong> ${systemInfo.userInfo.username}</p>
          <p><strong>运行时间:</strong> ${formatUptime(systemInfo.uptime)}</p>
        </div>
      </div>

      <div class="system-info-section">
        <h4>处理器信息</h4>
        <div class="system-info-grid">
          <p><strong>CPU型号:</strong> ${cpuModel}</p>
          <p><strong>CPU核心数:</strong> ${systemInfo.cpuCount}</p>
          <p><strong>CPU频率:</strong> ${systemInfo.cpus[0].speed}MHz</p>
          <p><strong>CPU使用率:</strong> ${formatCPUUsage(systemInfo.cpus[0].times)}</p>
        </div>
      </div>

      ${memorySection}
      
      ${gpuSection}
    </div>
  `;
}

function updateDetailedDiskInfo(drive) {
  const diskDetailsDiv = document.getElementById('disk-details');
  const diskTypeClass = drive.isSystem ? 'system-disk' : drive.isRemovable ? 'removable-disk' : '';
  const usage = ((drive.used / drive.total) * 100).toFixed(2);

  const detailsHtml = `
    <div class="disk-details">
      <div class="disk-header">
        <h3>${drive.model !== 'Unknown' ? drive.model : drive.drive}</h3>
        <span class="disk-type-badge ${diskTypeClass}">
          ${drive.type}
        </span>
      </div>
      <div class="disk-info-grid">
        <div class="disk-info-item">
          <strong>设备路径</strong>
          <span>${drive.drive}</span>
        </div>
        <div class="disk-info-item">
          <strong>厂商</strong>
          <span>${drive.vendor}</span>
        </div>
        <div class="disk-info-item copyable" onclick="copyToClipboard('${drive.serial}')">
          <strong>序列号</strong>
          <span>${drive.serial}</span>
        </div>
        <div class="disk-info-item">
          <strong>接口类型</strong>
          <span>${drive.interfaceType}</span>
        </div>
        <div class="disk-info-item">
          <strong>文件系统</strong>
          <span>${drive.fileSystem}</span>
        </div>
        <div class="disk-info-item">
          <strong>总容量</strong>
          <span>${formatBytes(drive.total)}</span>
        </div>
        <div class="disk-info-item">
          <strong>可用空间</strong>
          <span>${formatBytes(drive.free)}</span>
        </div>
        <div class="disk-info-item">
          <strong>已用空间</strong>
          <span>${formatBytes(drive.used)}</span>
        </div>
        <div class="disk-info-item">
          <strong>使用率</strong>
          <div class="progress-bar">
            <div class="progress-bar-fill ${getProgressBarClass(parseFloat(usage))}" 
                 style="width: ${usage}%"></div>
          </div>
          <span>${usage}%</span>
        </div>
      </div>
    </div>
  `;

  diskDetailsDiv.innerHTML += detailsHtml;
}

async function updateDiskInfo() {
  const diskList = document.getElementById('disk-list');
  const diskDetails = document.getElementById('disk-details');
  const response = await window.electronAPI.getDiskInfo();
  const { drives, systemInfo } = response;

  // 记住当前滚动位置
  const scrollPosition = window.scrollY;

  updateSystemInfo(systemInfo);

  diskList.innerHTML = '';
  diskDetails.innerHTML = '';

  // 按物理磁盘型号分组
  const diskGroups = drives.reduce((groups, drive) => {
    const key = drive.model;
    if (!groups[key]) {
      groups[key] = {
        model: drive.model,
        vendor: drive.vendor,
        serial: drive.serial,
        interfaceType: drive.interfaceType,
        mediaType: drive.mediaType,
        partitions: []
      };
    }
    groups[key].partitions.push({
      drive: drive.drive,
      fileSystem: drive.fileSystem,
      total: drive.total,
      free: drive.free,
      used: drive.used,
      type: drive.type,
      isSystem: drive.isSystem,
      isRemovable: drive.isRemovable
    });
    return groups;
  }, {});

  // 显示合并后的磁盘详细信息
  Object.values(diskGroups).forEach(disk => {
    const detailsHtml = `
      <div class="disk-details">
        <div class="disk-header">
          <h3>${disk.model !== 'Unknown' ? disk.model : disk.partitions[0].drive}</h3>
          <span class="disk-type-badge ${disk.partitions[0].isSystem ? 'system-disk' : disk.partitions[0].isRemovable ? 'removable-disk' : ''}">
            ${disk.partitions[0].type}
          </span>
        </div>
        <div class="disk-info-grid">
          <div class="disk-info-item">
            <strong>厂商</strong>
            <span>${disk.vendor}</span>
          </div>
          <div class="disk-info-item">
            <strong>序列号</strong>
            <span>${disk.serial}</span>
          </div>
          <div class="disk-info-item">
            <strong>接口类型</strong>
            <span>${disk.interfaceType}</span>
          </div>
          ${disk.partitions.map(partition => `
            <div class="disk-info-item">
              <strong>分区 ${partition.drive}</strong>
              <span>文件系统: ${partition.fileSystem}</span>
              <span>总容量: ${formatBytes(partition.total)}</span>
              <span>可用空间: ${formatBytes(partition.free)}</span>
              <span>已用空间: ${formatBytes(partition.used)}</span>
              <span>使用率: ${((partition.used / partition.total) * 100).toFixed(2)}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    diskDetails.innerHTML += detailsHtml;
  });

  // 保持原有的表格显示
  drives.forEach(drive => {
    const usage = ((drive.used / drive.total) * 100).toFixed(2);
    const progressBarClass = getProgressBarClass(parseFloat(usage));
    const statusClass = getStatusClass(parseFloat(usage));
    const statusText = getStatusText(parseFloat(usage));

    const row = `
      <tr>
        <td>${drive.drive}</td>
        <td>${drive.type}</td>
        <td>${drive.fileSystem}</td>
        <td>${formatBytes(drive.total)}</td>
        <td>${formatBytes(drive.used)}</td>
        <td>${formatBytes(drive.free)}</td>
        <td>
          <div class="usage-wrapper">
            <div class="progress-bar">
              <div class="progress-bar-fill ${progressBarClass}" style="width: ${usage}%"></div>
            </div>
            <span class="usage-percent">${usage}%</span>
          </div>
        </td>
        <td class="${statusClass}">${statusText}</td>
      </tr>
    `;
    diskList.innerHTML += row;
  });

  // 处理页面滚动
  if (!window.isInitialLoad) {
    window.scrollTo(0, 0);
    window.isInitialLoad = true;
  } else {
    window.scrollTo(0, scrollPosition);
  }
}

// 页面加载完成后获取磁盘信息
document.addEventListener('DOMContentLoaded', () => {
  // 初始化
  window.isInitialLoad = false;
  updateDiskInfo();

  // 添加展开/收起事件监听
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.querySelector('.toggle-btn').dataset.target;
      const targetElement = document.getElementById(targetId);
      const toggleBtn = header.querySelector('.toggle-btn');
      const isCollapsed = toggleBtn.classList.contains('collapsed');

      // 切换按钮状态
      toggleBtn.classList.toggle('collapsed');
      targetElement.classList.toggle('collapsed');
      
      // 切换内容显示状态
      if (isCollapsed) {
        targetElement.style.display = 'block';
        setTimeout(() => {
          targetElement.style.maxHeight = targetElement.scrollHeight + 'px';
          targetElement.style.opacity = '1';
        }, 0);
      } else {
        targetElement.style.maxHeight = '0';
        targetElement.style.opacity = '0';
        setTimeout(() => {
          targetElement.style.display = 'none';
        }, 300); // 等待动画完成
      }
    });
  });
});

// 每60秒更新一次信息
setInterval(updateDiskInfo, 60000); 
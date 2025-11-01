async function initTheme() {
  const isDark = await window.electronAPI.getSystemTheme()
  updateTheme(isDark)
  
  // 监听主题变化
  window.electronAPI.onThemeChange((event, isDark) => {
    updateTheme(isDark)
  })
}

function updateTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

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

// 操作系统识别（仅 Windows 支持）
function getOSInfo(platform, release) {
  if (platform !== 'win32') return '不支持的系统';
  const build = parseInt(String(release).split('.')[2], 10);
  return build >= 22000 ? 'Windows 11' : 'Windows 10';
}

function updateSystemInfo(systemInfo, cpuLoad) {
  const systemInfoDiv = document.getElementById('system-info');
  if (!systemInfo) {
    systemInfoDiv.innerHTML = `
      <div class="system-info-container">
        <div class="system-info-section">
          <h4>系统信息</h4>
          <div class="system-info-grid">
            <p><strong>状态:</strong> 加载中…</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // 格式化运行时间
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days} 天 ${hours} 小时 ${minutes} 分钟 ${secs} 秒`;
  };

  const memoryUsage = ((1 - systemInfo.freeMemory / systemInfo.totalMemory) * 100).toFixed(1);
  const cpuUsage = cpuLoad ? cpuLoad.average.toFixed(1) : '0';
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
        <p><strong>内存使用率:</strong> ${memoryUsage}%</p>
      </div>
    </div>
  `;

  // 显卡信息部分
  const gpuSection = systemInfo.graphics.map((gpu, index) => `
    <div class="system-info-section">
      <h4>显卡信息 ${systemInfo.graphics.length > 1 ? (index + 1) : ''}</h4>
      <div class="system-info-grid">
        <p><strong>型号:</strong> ${gpu.model || 'Unknown'}</p>
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

  // 修改处理器信息部分
  const cpuSection = `
    <div class="system-info-section">
      <h4>处理器信息</h4>
      <div class="system-info-grid">
        <p><strong>型号:</strong> ${systemInfo.cpus[0].model}</p>
        <p><strong>逻辑处理器:</strong> ${systemInfo.cpuCount}</p>
        <p><strong>基准速率:</strong> ${systemInfo.cpus[0].speed}MHz</p>
        <p><strong>CPU 利用率:</strong> ${cpuUsage}%</p>
      </div>
    </div>
  `;

  systemInfoDiv.innerHTML = `
    <div class="system-info-container">
      <div class="system-info-section">
        <h4>系统信息</h4>
        <div class="system-info-grid">
          <p><strong>操作系统:</strong> ${osInfo} (${getArchText(systemInfo.arch)})</p>
          <p><strong>主机名称:</strong> ${systemInfo.hostname}</p>
          <p><strong>用户名称:</strong> ${systemInfo.userInfo.username}</p>
          <p><strong>运行时间:</strong> ${formatUptime(systemInfo.uptime)}</p>
        </div>
      </div>

      ${cpuSection}

      ${memorySection}
      
      ${gpuSection}
    </div>
  `;
}

// 创建磁盘信息卡片的通用函数
function createDiskCard(disk, partitions) {
  const diskTypeClass = disk.isSystem ? 'system-disk' : disk.isRemovable ? 'removable-disk' : '';

  return `
    <div class="disk-details">
      <div class="disk-header">
        <h3>${disk.model !== 'Unknown' ? disk.model : disk.partitions[0].drive}</h3>
        <span class="disk-type-badge ${diskTypeClass}">${disk.type}</span>
      </div>
      ${createDiskInfoGrid(disk)}
      ${createPartitionsTable(partitions)}
    </div>
  `;
}

// 创建磁盘基本信息网格
function createDiskInfoGrid(disk) {
  const infoItems = [
    { label: '厂商', value: disk.vendor },
    { label: '序列号', value: disk.serial },
    { label: '接口类型', value: disk.interfaceType }
  ];

  return `
    <div class="disk-info-grid">
      ${infoItems.map(item => `
        <div class="disk-info-item">
          <strong>${item.label}</strong>
          <span>${item.value}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// 创建分区表格
function createPartitionsTable(partitions) {
  return `
    <table class="disk-partitions-table">
      <thead>
        <tr>
          <th>分区</th>
          <th>文件系统</th>
          <th>总容量</th>
          <th>已用空间</th>
          <th>可用空间</th>
          <th>使用率</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${partitions.map(partition => createPartitionRow(partition)).join('')}
      </tbody>
    </table>
  `;
}

// 创建分区行
function createPartitionRow(partition) {
  const usage = ((partition.used / partition.total) * 100).toFixed(2);
  return `
    <tr>
      <td>${partition.drive}</td>
      <td>${partition.fileSystem}</td>
      <td>${formatBytes(partition.total)}</td>
      <td>${formatBytes(partition.used)}</td>
      <td>${formatBytes(partition.free)}</td>
      <td>
        <div class="usage-wrapper">
          <div class="progress-bar">
            <div class="progress-bar-fill ${getProgressBarClass(parseFloat(usage))}" 
                 style="width: ${usage}%"></div>
          </div>
          <span class="usage-percent">${usage}%</span>
        </div>
      </td>
      <td data-status="${getStatusClass(parseFloat(usage))}">${getStatusText(parseFloat(usage))}</td>
    </tr>
  `;
}

// 更新信息
async function updateInfo() {
  // 仅支持 Electron 环境
  const diskDetails = document.getElementById('disk-details');
  const { drives } = await window.electronAPI.getDiskInfo();
  const cpuLoad = await window.electronAPI.getCpuLoad();
  const systemInfo = await window.electronAPI.getSystemInfo();
  const networkData = await window.electronAPI.getNetworkInfo();
  const scrollPosition = window.scrollY;

  updateSystemInfo(systemInfo, cpuLoad);
  diskDetails.innerHTML = '';

  // 按物理磁盘分组
  const diskGroups = groupDisksByModel(drives);

  // 渲染磁盘信息
  const diskCards = Object.values(diskGroups)
    .map(disk => createDiskCard(disk, disk.partitions))
    .join('');
  diskDetails.innerHTML = diskCards || `
    <div class="system-info-section">
      <h4>磁盘信息</h4>
      <div class="system-info-grid">
        <p><strong>状态:</strong> 加载中…</p>
      </div>
    </div>
  `;

  // 处理页面滚动
  handleScroll(scrollPosition);

  // 更新网络信息
  updateNetworkInfo(networkData);
}

// -------- 网络信息与温度监控渲染 --------

function updateNetworkInfo(networkData) {
  const container = document.getElementById('network-details');
  const { interfaces = [] } = networkData || {};

  const cards = interfaces.map((iface) => {
    return `
      <div class="system-info-section">
        <h4>${iface.name}</h4>
        <div class="system-info-grid">
          <p><strong>类型:</strong> ${iface.type || '-'}</p>
          <p><strong>状态:</strong> ${iface.operstate || '-'}</p>
          <p><strong>速率:</strong> ${iface.speed ? iface.speed + ' Mbps' : '-'}</p>
          <p><strong>IPv4:</strong> ${iface.ipv4 || '-'}</p>
          <p><strong>IPv6:</strong> ${iface.ipv6 || '-'}</p>
          <p><strong>MAC:</strong> ${iface.mac || '-'}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="system-info-container">
      ${cards.length ? cards.join('') : `
        <div class="system-info-section">
          <h4>网络信息</h4>
          <div class="system-info-grid">
            <p><strong>状态:</strong> 加载中…</p>
          </div>
        </div>
      `}
    </div>
  `;
}

// 已移除温度监控渲染


// 按物理磁盘型号分组
function groupDisksByModel(drives) {
  return drives.reduce((groups, drive) => {
    const key = drive.model;
    if (!groups[key]) {
      groups[key] = {
        model: drive.model,
        vendor: drive.vendor,
        serial: drive.serial,
        interfaceType: drive.interfaceType,
        mediaType: drive.mediaType,
        type: drive.type,
        isSystem: drive.isSystem,
        isRemovable: drive.isRemovable,
        partitions: []
      };
    }
    groups[key].partitions.push(drive);
    return groups;
  }, {});
}

// 处理页面滚动
function handleScroll(scrollPosition) {
  if (!window.isInitialLoad) {
    window.scrollTo(0, 0);
    window.isInitialLoad = true;
  } else {
    window.scrollTo(0, scrollPosition);
  }
}

// 页面加载完成后获取磁盘信息
document.addEventListener('DOMContentLoaded', () => {
  // 添加展开/收起事件监听（数据加载前即可操作）
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      const toggleBtn = header.querySelector('.toggle-btn');
      const targetId = toggleBtn.dataset.target;
      const targetElement = document.getElementById(targetId);
      const isExpanded = targetElement.getAttribute('data-expanded') === 'true';

      if (!isExpanded) {
        // 展开
        toggleBtn.classList.remove('collapsed');
        targetElement.style.display = 'block';
        targetElement.style.opacity = '1';
        targetElement.style.maxHeight = '0px';
        requestAnimationFrame(() => {
          targetElement.style.maxHeight = targetElement.scrollHeight + 'px';
        });

        const onOpenEnd = (e) => {
          if (e.propertyName === 'max-height') {
            targetElement.style.maxHeight = '';
            targetElement.setAttribute('data-expanded', 'true');
            targetElement.removeEventListener('transitionend', onOpenEnd);
          }
        };
        targetElement.addEventListener('transitionend', onOpenEnd);
      } else {
        // 收起
        toggleBtn.classList.add('collapsed');
        targetElement.style.maxHeight = targetElement.scrollHeight + 'px';
        targetElement.style.opacity = '1';
        requestAnimationFrame(() => {
          targetElement.style.maxHeight = '0px';
          targetElement.style.opacity = '0';
        });

        const onCloseEnd = (e) => {
          if (e.propertyName === 'max-height') {
            targetElement.style.display = 'none';
            targetElement.setAttribute('data-expanded', 'false');
            targetElement.removeEventListener('transitionend', onCloseEnd);
          }
        };
        targetElement.addEventListener('transitionend', onCloseEnd);
      }
    });
  });

  // 初始化展开状态
  document.querySelectorAll('.section-content').forEach(el => {
    if (!el.getAttribute('data-expanded')) {
      el.setAttribute('data-expanded', 'true');
    }
    el.style.display = 'block';
  });

  // 初始化主题与数据加载
  initTheme();
  window.isInitialLoad = false;
  updateInfo();
});

// 每秒更新一次信息
setInterval(updateInfo, 1000);
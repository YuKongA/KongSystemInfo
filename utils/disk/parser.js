/**
 * WMIC输出解析工具
 */

/**
 * 解析 WMIC CSV 输出
 * @param {string} output - WMIC 命令输出
 * @returns {Array} 解析后的对象数组
 */
function parseWmicCsvOutput(output) {
  const lines = output.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || '';
      return obj;
    }, {});
  });
}

/**
 * 解析 WMIC List 输出 (key=value，每条记录之间以空行分隔)
 * @param {string} output - WMIC 命令输出 (/format:list)
 * @returns {Array} 解析后的对象数组
 */
function parseWmicListOutput(output) {
  const lines = output.split(/\r?\n/);
  const records = [];
  let current = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      // 记录分隔
      if (Object.keys(current).length) {
        records.push(current);
        current = {};
      }
      continue;
    }
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      current[key] = value;
    }
  }

  // 推入最后一条记录
  if (Object.keys(current).length) {
    records.push(current);
  }
  return records;
}

module.exports = {
  parseWmicCsvOutput,
  parseWmicListOutput
};
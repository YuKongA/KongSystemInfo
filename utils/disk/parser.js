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

module.exports = {
  parseWmicCsvOutput
}; 
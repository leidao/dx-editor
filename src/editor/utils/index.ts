
/** 判断是否是window系统 */
export const isWindows =
  navigator.platform.toLowerCase().includes('win') ||
  navigator.userAgent.includes('Windows')

/** 兼容了精度问题的保留小数方法 */
export const toFixed = (num: string | number | undefined, digits: number = 2): number | string => {
  if (!num) return ''
  const factor = Math.pow(10, digits);
  return Math.round(+num * factor) / factor;
}
/** 判断数组内每一项的某个属性是否相等 */
export const isSame = (arr: any[], attr: string): string | number => {
  if (arr.length === 0) return ''; // 空数组则认为所有元素相同
  const firstX = arr[0][attr];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i][attr] !== firstX) {
      return '';
    }
  }
  return firstX;
}

/** 或者一组坐标数组中的最大最小坐标 */
export const getMaxMin = (points: { x: number, y: number }[]) => {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  points.forEach(point => {
    if (point.x < minX) minX = point.x
    if (point.y < minY) minY = point.y
    if (point.x > maxX) maxX = point.x
    if (point.y > maxY) maxY = point.y
  })
  return {minX,minY,maxX,maxY}
}
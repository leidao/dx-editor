/** 解析svg路径为dom */
export const loadSVG = (svgUrl: string): Promise<Document> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', svgUrl, true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        // 使用 DOMParser 解析响应内容
        const parser = new DOMParser();
        const svgDocument = parser.parseFromString(xhr.responseText, 'image/svg+xml');
        resolve(svgDocument)
      } else {
        console.error('Failed to load SVG:', xhr.statusText);
      }
    };
    xhr.onerror = function () {
      reject('Network error while fetching SVG.')
    };
    xhr.send();
  })
}

/**
 * 找出离 value 最近的 segment 的倍数值
 */
export const getClosestTimesVal = (value: number, segment: number) => {
  const n = Math.floor(value / segment)
  const left = segment * n
  const right = segment * (n + 1)
  // console.log('====', value, segment, n, left, right)
  return value - left <= right - value ? left : right
}

export const toURL = (text: string, fileType?: 'text' | 'svg'): string => {
  let url = encodeURIComponent(text)
  if (fileType === 'text') url = 'data:text/plain;charset=utf-8,' + url
  else if (fileType === 'svg') url = 'data:image/svg+xml,' + url
  return url
}

  /**
   * 步长研究，参考 figma
   * 1
   * 2
   * 5
   * 10（对应 500% 往上） 找到规律了： 50 / zoom = 步长
   * 25（对应 200% 往上）
   * 50（对应 100% 往上）
   * 100（对应 50% 往上）
   * 250
   * 500
   * 1000
   * 2500
   * 5000
   */
export const getStepByZoom = (zoom: number) => {
  const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
  const step = 50 / zoom
  for (let i = 0, len = steps.length; i < len; i++) {
    if (steps[i] >= step) return steps[i]
  }
  return steps[0]
}

/** 判断是否是window系统 */
export const isWindows =
  navigator.platform.toLowerCase().includes('win') ||
  navigator.userAgent.includes('Windows')
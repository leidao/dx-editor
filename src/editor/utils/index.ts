/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-08-30 15:33:08
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-09 10:58:02
 */

import { IUI } from "@leafer-ui/interface";

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

export interface AABB {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** 或者一组坐标数组中的最大最小坐标 */
export const getMaxMin = (points: { x: number, y: number }[]): AABB => {
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
  return { minX, minY, maxX, maxY }
}

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

/** 获取两个坐标的长度 */
export const getDistance =(x1:number, y1:number, x2:number, y2:number)=> {
  const deltaX = Math.abs(x2 - x1);
  const deltaY = Math.abs(y2 - y1);
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}


export const getStepByZoom = (zoom: number) => {
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
  const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
  const step = 50 / zoom
  for (let i = 0, len = steps.length; i < len; i++) {
    if (steps[i] >= step) return steps[i]
  }
  return steps[0]
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
export const traverse =(graph: IUI, callback: (graph: IUI) => void) =>{
  (graph?.children || []).forEach(item => {
    callback(item)
    traverse(item, callback)
  })
}
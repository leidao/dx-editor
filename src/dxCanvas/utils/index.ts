export * from './Creator'
import { Vector2 } from '../math'
import { IObject } from "../objects"

export const getDprScale = () => {
  let ratio = 1
  const screen = window.screen as any
  const ua = navigator.userAgent.toLowerCase()
  if (window.devicePixelRatio !== undefined) ratio = window.devicePixelRatio
  else if (~ua.indexOf('msie')) {
    if (screen.deviceXDPI && screen.logicalXDPI)
      ratio = screen.deviceXDPI / screen.logicalXDPI
  } else if (window.outerWidth !== undefined && window.innerWidth !== undefined)
    ratio = window.outerWidth / window.innerWidth

  ratio = Math.round(ratio * 100) / 100 // 保留2位小数，否则直接return ratio会因小数太多而模糊
  return ratio
}

/** 拷贝基本数据 */
export const copyPrimitive =(data:IObject,source:IObject)=>{
  Object.keys(source).forEach(key => {
    const value = source[key]
    if (typeof value !== 'object' && value !== null) {
      data[key] = value
    }
  })
}


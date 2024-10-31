/*
 * @Description: 动画
 * @Author: ldx
 * @Date: 2023-12-11 15:03:42
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-22 14:54:15
 */

import { Clock } from './clock'

class Animation {
  animationId: number | null = null
  stopAnimation = false
  callback: (time: number) => void
  clock = new Clock()
  constructor(callback: (time: number) => void) {
    this.callback = callback
  }
  start = () => {
    if (this.stopAnimation) return
    const time = this.clock.getElapsedTime()
    this.callback(time)
    this.animationId = requestAnimationFrame(this.start)
  }
  stop = () => {
    this.stopAnimation = true
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.stopAnimation = false
  }
}

export { Animation }

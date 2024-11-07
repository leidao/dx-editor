/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-10-13 19:14:05
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-07 09:38:23
 */

import { Bounds, Object2D } from "@/dxCanvas"


class VirtualGroup {
  // 子集
  children: Object2D[] = []
  /** 类型 */
  tag = 'virtualGroup'
  /** 名称 */
  name = '虚拟组'
  editable = true
  /** 编辑类型 */
  public get editOuter() { return 'EditOuter' }
  /** 编辑类型 */
  public get editInner() { return 'EditInner' }
  // 边界盒子
  bounds = new Bounds()
  constructor() { }

  /* 添加元素 */
  add(...objs: Object2D[]) {
    for (const obj of objs) {
      this.children.push(obj)
    }
    this.computeBoundsBox()
    return this
  }

  /* 清空children */
  // TODO 可以做销毁，目前是浅清空
  clear() {
    this.children = []
    this.bounds.clear()
    return this
  }
  computeBoundsBox = () => {
    const { children, bounds } = this
    bounds.clear()
    children.forEach(object => {
      bounds.expand(object.bounds.min,object.bounds.max)
    })
    return this
  }

}
export { VirtualGroup }
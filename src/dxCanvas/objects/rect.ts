/*
 * @Description: 矩形
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-31 14:17:56
 */

import { IObject, Object2D, Object2DType } from './Object2D'
import { Line, LineType } from './Line'
import { StandStyle, StandStyleType } from '../style'
import { Vector2 } from '../math'
import { Creator } from '../utils'

export type RectType = Object2DType & {
  style?: StandStyleType
  hoverStyle?: StandStyleType
  selectStyle?: StandStyleType
  width?: number
  height?: number
  pickingBuffer?: number
}

export class Rect extends Object2D {
  name = '矩形'
  width = 0
  height = 0
  _style: StandStyle = new StandStyle()
  public get tag() { return 'Rect' }
  constructor(attr: LineType = {}) {
    super()
    this.setOption(attr)
  }

  /* 属性设置 */
  setOption(attr: LineType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'position':
        case 'scale':
          this[key].fromArray(val)
          break
        case 'tag':
          break
        default:
          this[key] = val
      }
    }
  }

  /** 设置点位 */
  setRect(width: number, height: number) {
    this.width = width
    this.height = height
    this.computeBoundsBox()
  }

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { width, height, _style } = this
    // 应用样式
    this.applyStyle(ctx)
    // 绘制图像
    ctx.beginPath()
    // 绘图
    for (const method of _style.drawOrder) {
      _style[`${method}Style`] &&
        ctx[`${method}Rect`](0, 0, width, height)
    }
  }

  /** 获取包围盒数据 */
  computeBoundsBox(updateParentBoundsBox = true) {
    const {
      width,
      height,
      bounds: { min, max },
      pickingBuffer
    } = this
    // 根据点计算边界
    min.set(width < 0 ? width : 0, height < 0 ? height : 0)
    max.set(width > 0 ? width : 0, height > 0 ? height : 0)
    min.applyMatrix3(this.worldMatrix)
    max.applyMatrix3(this.worldMatrix)
    this.bounds.expand(min.clone(),max.clone())
    updateParentBoundsBox && this.parent?.computeBoundsBox()
  }

   /** 点位是否在图形中 */
   isPointInGraph(point: Vector2) {
    const isPointInBounds = this.isPointInBounds(point)
    return isPointInBounds ? this : false
  }

  toJSON() {
    const object = super.toJSON();
    object.width = this.width
    object.height = this.height
    return object
  }

  clone(): Rect {
    const data = this.toJSON()
    return new Rect(data)
  }
  static one(data: IObject): Rect {
    return new Rect(data)
  }
}

Creator.register(Rect)
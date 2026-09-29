/*
 * @Description: 矩形
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-06 09:41:04
 */

import { IObject, Object2D, Object2DType } from './Object2D'
import { StandStyle, StandStyleType } from '../style'
import { generateUUID, Vector2 } from '../math'
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
  style: StandStyleType = {}
  public get tag() { return 'Rect' }
  constructor(attr: RectType = {}) {
    super()
    this.setOption(attr)
  }

  /* 属性设置 */
  setOption(attr: RectType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'position':
        case 'scale':
          this[key].fromArray(val as [number, number])
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
    this.bounds.clear()
    for (const x of [0, this.width]) for (const y of [0, this.height]) {
      const point = new Vector2(x, y).applyMatrix3(this.worldMatrix)
      this.bounds.expand(point)
    }

    updateParentBoundsBox && this.parent?.computeBoundsBox()
  }

  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2) {
    if (!this.isPointInBounds(point)) return false
    const local = point.clone().applyMatrix3(this.worldMatrix.clone().invert())
    return local.x >= Math.min(0, this.width) && local.x <= Math.max(0, this.width) &&
      local.y >= Math.min(0, this.height) && local.y <= Math.max(0, this.height) ? this : false
  }

  toJSON() {
    const object = super.toJSON();
    object.width = this.width
    object.height = this.height
    return object
  }

  clone(): Rect {
    const data = this.toJSON()
    data.uuid = generateUUID()
    return Rect.one(data)
  }
  static one(data: IObject): Rect {
    return new Rect(data)
  }
}

Creator.register(Rect)

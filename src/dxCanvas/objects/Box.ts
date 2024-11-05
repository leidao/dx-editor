/*
 * @Description: 矩形
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-05 10:55:57
 */

import { IObject, Object2D, Object2DType } from './Object2D'
import { Line, LineType } from './Line'
import { StandStyle, StandStyleType } from '../style'
import { Vector2 } from '../math'
import { Creator } from '../utils'
import { Group } from '.'

export type BoxType = Object2DType & {
  style?: StandStyleType
  hoverStyle?: StandStyleType
  selectStyle?: StandStyleType
  padding?: [number, number]
  cornerRadius?: number
  pickingBuffer?: number
}

export class Box extends Group {
  name = '矩形'
  width = 0
  height = 0
  padding = [0, 0]
  cornerRadius = 0
  public get tag() { return 'Box' }
  constructor(attr: BoxType = {}) {
    super()
    this.setOption(attr)
  }

  /* 属性设置 */
  setOption(attr: BoxType) {
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



  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { _style, children, cornerRadius } = this
    // 应用样式
    this.applyStyle(ctx)
    const { width, height } = this.bounds
    const x = -width/2, y = -height/2
    console.log('===', width, height,x,y);
    
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y); // 移动到左上角
    ctx.lineTo(x + width - cornerRadius, y); // 画线到右上角
    ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius); // 圆角
    ctx.lineTo(x + width, y + height - cornerRadius); // 画线到右下角
    ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius); // 圆角
    ctx.lineTo(x + cornerRadius, y + height); // 画线到左下角
    ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius); // 圆角
    ctx.lineTo(x, y + cornerRadius); // 画线到左上角
    ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius); // 圆角
    ctx.closePath(); // 关闭路径
    // 绘图
    for (const method of _style.drawOrder) {
      _style[`${method}Style`] &&
        ctx[method]();
    }
    ctx.restore()
    /* 绘制子对象 */
    for (const obj of children) {
      obj.draw(ctx)
    }
    ctx.save()
  }

  /** 获取包围盒数据 */
  computeBoundsBox = (updateChildBoundsBox = false) => {
    const { children, bounds, padding: [w, h] } = this
    bounds.clear()
    children.forEach(object => {
      updateChildBoundsBox && object.computeBoundsBox(false)
      bounds.expand(object.bounds.min, object.bounds.max)
    })
    bounds.min.x -= w / 2
    bounds.min.y -= h / 2
    bounds.max.x += w / 2
    bounds.max.y += h / 2
    this.parent?.computeBoundsBox()
  }

  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2) {
    const isPointInBounds = this.isPointInBounds(point)
    return isPointInBounds ? this : false
  }

  toJSON() {
    const object = super.toJSON();
    object.padding = this.padding
    object.cornerRadius = this.cornerRadius
    object.children = this.children.map(item => item.toJSON())
    return object
  }

  clone(): Box {
    const data = this.toJSON()
    return new Box(data)
  }
  static one(data: IObject): Box {
    return new Box(data)
  }
}

Creator.register(Box)
/*
 * @Description: 线段
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-01 09:24:43
 */
import { Vector2 } from '../math/Vector2'
import { StandStyle, StandStyleType } from '../style/StandStyle'
import { copyPrimitive, Creator } from '../utils'
import { IObject, Object2D, Object2DType } from './Object2D'
import { crtPath, distancePointToLineSegment } from './ObjectUtils'

export type LineType = Object2DType & {
  style?: StandStyleType
  hoverStyle?: StandStyleType
  selectStyle?: StandStyleType
  points?: [number, number][]
  pickingBuffer?: number
}

export class Line extends Object2D {
  _style: StandStyle = new StandStyle()
  /** 图层拾取缓存机制，如 1px 宽度的线鼠标很难拾取(点击)到, 通过设置该参数可扩大拾取的范围 */
  pickingBuffer = 4
  name = '线段'
  private points: [number, number][] = []
  /** 类型 */
  public get tag() { return 'Line' }
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
  setPoints(points: [number, number][]) {
    this.points = points
    this.computeBoundsBox()
  }
  /** 追加点位 */
  addPoints(...rest: [number, number][]) {
    this.points.push(...rest)
    this.computeBoundsBox()
  }
  /** 替换坐标 */
  replacePoints(i: number, n: number, ...rest: [number, number][]) {
    const { points } = this
    points.splice(i, n, ...rest)
    this.computeBoundsBox()
  }
  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { points } = this
    if (points.length === 0) return
    // 应用样式
    this.applyStyle(ctx)
    // 绘制图像
    ctx.beginPath()
    const flatPoints = points.flat()
    crtPath(ctx, flatPoints)
    ctx.stroke()
  }
  /** 获取包围盒数据 */
  computeBoundsBox(updateParentBoundsBox = true) {
    const {
      points,
      bounds: { min, max },
      pickingBuffer
    } = this
    // 根据点计算边界
    this.bounds.clear()
    for (const [x, y] of points) {
      const point = new Vector2(x, y)
      min.expandMin(point)
      max.expandMax(point)
    }
    min.x-=pickingBuffer/2
    min.y-=pickingBuffer/2
    max.x+=pickingBuffer/2
    max.y+=pickingBuffer/2
    min.applyMatrix3(this.worldMatrix)
    max.applyMatrix3(this.worldMatrix)
    this.bounds.expand(min.clone(),max.clone())
    updateParentBoundsBox && this.parent?.computeBoundsBox()
  }
  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2) {
    const isPointInBounds = this.isPointInBounds(point)
    if (isPointInBounds) {
      const { points, pickingBuffer } = this
      const scene = this.getScene()
      if (!scene) return false
      // 计算线宽，包围盒计算时需要考虑线宽
      const len = this._style.lineWidth * scene.camera.zoom / 2
      const worldPoint = points.map(([x, y]) => {
        return new Vector2(x, y).applyMatrix3(this.worldMatrix)
      })
      for (let i = 0; i < worldPoint.length - 1; i++) {
        const p1 = worldPoint[i]
        const p2 = worldPoint[i + 1]
        // 这里转成像素来判断，鼠标范围更精确
        const distance = distancePointToLineSegment(scene.getPageByWorld(point.x,point.y), scene.getPageByWorld(p1.x,p1.y),scene.getPageByWorld(p2.x,p2.y))
        if (Math.abs(distance) <= pickingBuffer + len) {
          return this
        }
      }
    }
    return false
  }

  toJSON() {
    const object = super.toJSON();
    object.points = JSON.parse(JSON.stringify(this.points))
    // object.style = JSON.parse(JSON.stringify(this.style))
    return object
  }
  clone(): Line {
    const data = this.toJSON()
    return new Line(data)
  }
  static one(data: IObject): Line {
    return new Line(data)
  }
}

Creator.register(Line)
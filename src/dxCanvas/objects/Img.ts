/*
 * @Description: 图片
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-30 17:50:31
 */
import { Matrix3 } from '../math/Matrix3'
import { Vector2 } from '../math/Vector2'
import { BasicStyle, BasicStyleType } from '../style/BasicStyle'
import { Object2D, Object2DType, IObject } from './Object2D'
import { ImgEvent } from '../event'
import { copyPrimitive, Creator } from '../utils'
type ImgType = Object2DType & {
  image?: CanvasImageSource
  offset?: [number, number]
  size?: [number, number]
  view?: View | undefined
  src?: string
}

type View = {
  x: number
  y: number
  width: number
  height: number
}



export class Img extends Object2D {
  /** 图像 */
  private image = new Image()
  /** 偏移值 */
  public offset: Vector2 = new Vector2()
  /** 图像大小 */
  public size: Vector2 = new Vector2(300, 150)
  /** 图像裁剪范围 */
  public view: View | undefined
  /** 样式 */
  public _style: BasicStyle = new BasicStyle()
  name = '图像'
  /** 类型 */
  public get tag() { return 'Img' }
  constructor(attr: ImgType = {}) {
    super()
    this.setOption(attr)
    this.image.onload = (event) => {
      const scene = this.getScene()
      if (scene) scene.render()
      this.dispatchEvent(ImgEvent.LOAD, new ImgEvent('load', event))
    }
  }
  get src() { return this.image.src }
  set src(value: string) {
    if (this.image instanceof Image) {
      this.image.src = value
    }
  }
  /* 属性设置 */
  setOption(attr: ImgType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'src':
          if (this.image instanceof Image) {
            this.image.src = val 
          }
          break
        case 'position':
        case 'scale':
        case 'offset':
        case 'size':
          this[key] = new Vector2(...val)
          break
        case 'tag':
          break
        default:
          this[key] = val
      }
    }
  }

  /* 世界模型矩阵*偏移矩阵 */
  get moMatrix(): Matrix3 {
    const {
      offset: { x, y }
    } = this
    return super.worldMatrix.multiply(new Matrix3().makeTranslation(x, y))
  }

  /* 视图投影矩阵*世界模型矩阵*偏移矩阵  */
  get pvmoMatrix(): Matrix3 {
    const {
      offset: { x, y }
    } = this
    return super.pvmMatrix.multiply(new Matrix3().makeTranslation(x, y))
  }
  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    
    const { image, offset, size, view } = this
    // 应用样式
    this.applyStyle(ctx)
    // document.getElementById('root')?.children[0].appendChild(image)
    /**
     * 在画布指定位置绘制原图
      ctx.drawimage(image, dx, dy);
      在画布指定位置按原图大小绘制指定大小的图
      ctx.drawimage(image, dx, dy, dwidth, dheight);
      剪切图像，并在画布上绘制被剪切的部分
      ctx.drawimage(image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
     */
    // 绘制图像
    if (view) {
      ctx.drawImage(
        image,
        view.x,
        view.y,
        view.width,
        view.height,
        offset.x,
        offset.y,
        size.x,
        size.y
      )
    } else {
      ctx.drawImage(image, offset.x, offset.y, size.x, size.y)
    }
  }


  /* 计算边界盒子 */
  computeBoundsBox(updateParentBoundsBox = true) {
    const {
      bounds: { min, max },
      size,
      offset,
    } = this
    this.bounds.clear()
    min.copy(offset)
    max.addVectors(offset, size)
    min.applyMatrix3(this.worldMatrix)
    max.applyMatrix3(this.worldMatrix)
    updateParentBoundsBox && this.parent?.computeBoundsBox()
  }

  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2) {
    const isPointInBounds = this.isPointInBounds(point)
    return isPointInBounds ? this : false
  }

  toJSON() {
    const object = super.toJSON();
    object.offset = this.offset.toArray()
    object.size = this.size.toArray()
    object.src = this.style.src || this.src
    if (this.view) object.view = JSON.parse(JSON.stringify(this.view))
    return object
  }
  clone() {
    const data = this.toJSON()
    return new Img(data)
  }
  static one(data: IObject) {
    return new Img(data)
  }

}

Creator.register(Img)
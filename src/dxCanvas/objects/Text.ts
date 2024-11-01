import { Matrix3, Vector2 } from '../math'
import { BasicStyle, TextStyle, TextStyleType } from '../style'
import { copyPrimitive, Creator } from '../utils'
import { IObject, Object2D, Object2DType } from './Object2D'
const chineseRegex = /[\u4e00-\u9fa5]/
/* 构造参数的类型 */
type TextType = Object2DType & {
  text?: string
  maxWidth?: number | undefined
  style?: TextStyleType
  hoverStyle?: TextStyleType
  selectStyle?: TextStyleType
  offset?: [number, number]
}

/* 虚拟上下文对象 */
const virtuallyCtx = document
  .createElement('canvas')
  .getContext('2d') as CanvasRenderingContext2D

/* 文字对齐方式引起的偏移量 */
export const alignRatio = {
  start: 0,
  left: 0,
  center: -0.5,
  end: -1,
  right: -1
}
export const baselineRatio = {
  top: 0,
  middle: -0.5,
  bottom: -1,
  hanging: -0.05,
  alphabetic: -0.78,
  ideographic: -1
}

class Text extends Object2D {
  private text = ''
  maxWidth: number | undefined
  _style: TextStyle = new TextStyle()
  offset = new Vector2(0, 0)
  pickingBuffer = 4
  name = '文本'
  /** 类型 */
  public get tag() { return 'Text' }
  constructor(attr: TextType = {}) {
    super()
    this.setOption(attr)
  }
  /* 世界模型矩阵*偏移矩阵 */
  get worldMatrix(): Matrix3 {
    const {
      offset: { x, y }
    } = this
    return super.worldMatrix.multiply(new Matrix3().makeTranslation(x, y))
  }
  /** 设置文字内容 */
  setText(text: string) {
    this.text = text
    this.computeBoundsBox()
  }
  /** 获取文字内容 */
  getText(): string {
    return this.text
  }
  /* 视图投影矩阵*世界模型矩阵*偏移矩阵  */
  get pvmMatrix(): Matrix3 {
    const {
      offset: { x, y }
    } = this
    return super.pvmMatrix.multiply(new Matrix3().makeTranslation(x, y))
  }

  /* 属性设置 */
  setOption(attr: TextType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'position':
        case 'scale':
        case 'offset':
          this[key].fromArray(val)
          break
        case 'tag':
          break
        default:
          this[key] = val
      }
    }
  }

  /* 文本尺寸 */
  get size(): Vector2 {
    const { _style, text, maxWidth } = this
    _style.setFont(virtuallyCtx)

    // const width = virtuallyCtx.measureText(text).width
    // const w = maxWidth === undefined ? width : Math.min(width, maxWidth)
    let width = 0
    let fontSize = _style.fontSize || 12
    // text.split('\n').forEach((item, i) => {
    //   let currentWidth = 0
    //   for (let i = 0; i < item.length; i++) {
    //     const char = item[i]
    //     const flag = chineseRegex.test(char)
    //     const charWidth = virtuallyCtx.measureText(char).width
    //     currentWidth += flag ? charWidth : Number(charWidth.toFixed(2))
    //   }
    //   width = Math.max(currentWidth, width)
    //   fontSize = fontSize*(i+1)
    // })
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const flag = chineseRegex.test(char)
      const charWidth = virtuallyCtx.measureText(char).width
      width += flag ? charWidth : Number(charWidth.toFixed(2))
    }

    const w = maxWidth === undefined ? width : Math.min(width, maxWidth)

    return new Vector2(w, fontSize)
  }

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const {
      text,
      offset: { x, y },
      maxWidth,
      _style
    } = this
    // 应用样式
    this.applyStyle(ctx)
    // const { x: scaleX, y: scaleY } = this.worldScale
    // let textScale = Math.max(Math.abs(scaleX), Math.abs(scaleY))

    // const fontSize = (style.fontSize || 12) * textScale
    // if (fontSize < 12) textScale *= 12 / fontSize
    // const [, , , , d] = new Matrix3().copy(this.pvmMatrix).scale(1 / textScale, 1 / textScale).elements
    // 绘图
    // text.split('\n').forEach((item, i) => {
    //   for (const method of style.drawOrder) {
    //     style[`${method}Style`] && ctx[`${method}Text`](item, x, y + i * 10, maxWidth)
    //   }
    // })
    for (const method of _style.drawOrder) {
      _style[`${method}Style`] && ctx[`${method}Text`](text, x, y, maxWidth)
    }

  }

  /* 计算边界盒子 */
  computeBoundsBox(updateParentBoundsBox = true) {
    const {
      bounds: { min, max },
      size,
      offset,
      _style: { textAlign, textBaseline },
    } = this
    min.set(
      offset.x + size.x * alignRatio[textAlign],
      offset.y + size.y * baselineRatio[textBaseline]
    )
    max.addVectors(min, size)
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
    object.offset = this.offset.toArray()
    object.text = this.text
    // object.style = JSON.parse(JSON.stringify(this.style))
    return object
  }
  clone(): Text {
    const data = this.toJSON()
    return new Text(data)
  }
  one(data: IObject): Text {
    return new Text(data)
  }

}

Creator.register(Text)

export { Text }

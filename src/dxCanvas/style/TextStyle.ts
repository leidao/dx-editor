/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-12 14:32:31
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-04 13:50:20
 */
import { StandStyle, StandStyleType } from './StandStyle'

type FontStyle = 'normal' | 'italic'
type FontWeight = 100|200|300|400|500|600|700|800|900

export type TextStyleType = {
  fontStyle?: FontStyle
  fontWeight?: FontWeight
  fontSize?: number
  fontFamily?: string
  textAlign?: CanvasTextAlign
  textBaseline?: CanvasTextBaseline
} & StandStyleType

class TextStyle extends StandStyle {
  fontStyle: FontStyle = 'normal'
  fontWeight: FontWeight = 400
  fontSize = 12
  fontFamily = 'arial'
  textAlign: CanvasTextAlign = 'start'
  textBaseline: CanvasTextBaseline = 'alphabetic'

  constructor(attr: TextStyleType = {}) {
    super()
    this.setOption(attr)
  }

  /* 设置样式 */
  setOption(attr: TextStyleType = {}) {
    Object.assign(this, attr)
  }

  /* 应用样式 */
  apply(ctx: CanvasRenderingContext2D) {
    super.apply(ctx)
    this.setFont(ctx)
    ctx.textAlign = this.textAlign
    ctx.textBaseline = this.textBaseline
  }

  /* font 相关样式 */
  setFont(ctx: CanvasRenderingContext2D) {
    ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px  ${this.fontFamily}`
  }
}
export { TextStyle }

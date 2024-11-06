/*
 * @Description: 网格
 * @Author: ldx
 * @Date: 2024-08-28 14:10:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-05 16:14:49
 */
import { IObject, Object2D, Object2DType, StandStyle, StandStyleType, Vector2 } from '@/dxCanvas'
import globalConfig from '../config'
import { getClosestTimesVal, getStepByZoom } from '../utils'

export type GuidelineType = Object2DType & {
  style?: StandStyleType
  coord?:[number,number]
}

export class Guideline extends Object2D {
  name = '辅助线'
  hittable = false
  editable = false
  index = Infinity
  enableCamera = false
  get tag() { return 'Guideline' }
  _style: StandStyle = new StandStyle()
  style: StandStyleType = {}
  coord = new Vector2()
  constructor(attr: GuidelineType = {}) {
    super()
    this.setOption(attr)
  }

  /* 属性设置 */
  setOption(attr: GuidelineType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'position':
        case 'scale':
        case 'coord':
          this[key].fromArray(val)
          break
        case 'tag':
          break
        default:
          this[key] = val
      }
    }
  }

  drawShape = (ctx: CanvasRenderingContext2D) => {
    const scene = this.getScene()
    if(!scene) return
    if(!globalConfig.guidelineVisible) return
    const { viewportWidth, viewportHeight } = scene.viewPort
    // 应用样式
    this.applyStyle(ctx)
    const { coord } = this
  
    ctx.beginPath();
    ctx.moveTo(0, coord.y);
    ctx.lineTo(viewportWidth, coord.y);
    ctx.stroke()
    ctx.closePath()
    ctx.beginPath();
    ctx.moveTo(coord.x,0);
    ctx.lineTo(coord.x, viewportHeight);
    ctx.stroke()
    ctx.closePath(); 
  }

}
/*
 * @Description: 网格
 * @Author: ldx
 * @Date: 2024-08-28 14:10:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-05 16:18:44
 */
import { degToRad, IObject, Object2D, Scene } from '@/dxCanvas'
import globalConfig from '../config'
import { getClosestTimesVal, getStepByZoom } from '../utils'
export class Ruler extends Object2D {
  name = '标尺'
  hittable = false
  editable = false
  index = -Infinity
  enableCamera = false
  get tag() { return 'Ruler' }

  /** 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const scene = this.getScene()
    if (!scene) return
    const { viewportWidth, viewportHeight } = scene.viewPort
    // 背景色
    ctx.save()
    ctx.fillStyle = globalConfig.rulerBgColor
    ctx.fillRect(0, 0, viewportWidth, 20)
    ctx.fillRect(0, 0, 20, viewportHeight)
    ctx.restore()

    this.drawXRuler(ctx, scene)
    this.drawYRuler(ctx, scene)

    // 绘制 border
    ctx.save()
    ctx.strokeStyle = globalConfig.rulerBorderColor
    // 水平 border
    ctx.beginPath()
    ctx.moveTo(0, 20)
    ctx.lineTo(viewportWidth, 20)
    ctx.stroke()
    // 垂直 border
    ctx.beginPath()
    ctx.moveTo(20, 0)
    ctx.lineTo(20, viewportHeight)
    ctx.stroke()
    ctx.restore()
    
    // 把左上角的小矩形上的刻度盖掉
    ctx.save()
    ctx.fillStyle = globalConfig.rulerBgColor
    ctx.fillRect(0, 0, 20, 20)
    ctx.fillStyle = globalConfig.rulerTextColor
    ctx.fillText('px', 4, 12)
    ctx.restore()
  }

  drawXRuler(ctx: CanvasRenderingContext2D, scene: Scene) {
    const { viewportWidth } = scene.viewPort
    const zoom = scene.camera.zoom
    const stepInScene = getStepByZoom(zoom)
    const { x: x1 } = scene.getWorldByPage(0, 0)
    let startX = getClosestTimesVal(x1, stepInScene)
    const { x: x2 } = scene.getWorldByPage(viewportWidth, 0)
    const endX = getClosestTimesVal(x2, stepInScene)
    // console.log('drawXRuler', x1, startX, x2, endX, zoom, stepInScene);
    while (startX <= endX) {
      ctx.save()
      const x = (startX - x1) * zoom
      ctx.strokeStyle = globalConfig.rulerLineColor
      ctx.beginPath()
      ctx.moveTo(x, 14)
      ctx.lineTo(x, 20)
      ctx.stroke()
      ctx.fillStyle = globalConfig.rulerTextColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${startX}`, x, 8)
      startX += stepInScene
      ctx.restore()
    }
  }
  drawYRuler(ctx: CanvasRenderingContext2D, scene: Scene) {
    const { viewportHeight } = scene.viewPort
    const zoom = scene.camera.zoom
    const stepInScene = getStepByZoom(zoom)
    const { y: y1 } = scene.getWorldByPage(0, 0)
    let startY = getClosestTimesVal(y1, stepInScene)
    const { y: y2 } = scene.getWorldByPage(0, viewportHeight)
    const endY = getClosestTimesVal(y2, stepInScene)
    // console.log('startXY',y1,startY,y2,endY,zoom,stepInScene);
    while (startY <= endY) {
      ctx.save()
      const y = (startY - y1) * zoom
      ctx.strokeStyle = globalConfig.rulerLineColor
      ctx.beginPath()
      ctx.moveTo(14, y)
      ctx.lineTo(20, y)
      ctx.stroke()
      ctx.fillStyle = globalConfig.rulerTextColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.translate(8, y)
      ctx.rotate(degToRad(-90))
      ctx.fillText(`${startY}`, 0,0)
      startY += stepInScene
      ctx.restore()
    }

  }

}
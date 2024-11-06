/*
 * @Description: 网格
 * @Author: ldx
 * @Date: 2024-08-28 14:10:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-06 14:36:28
 */
import { IObject, Object2D, Scene, StandStyle, StandStyleType } from '@/dxCanvas'
import globalConfig from '../config'
import { getClosestTimesVal, getStepByZoom } from '../utils'
export class Grid extends Object2D {
  name = '网格'
  hittable = false
  editable = false
  index = -Infinity
  enableCamera = false
  style: StandStyleType = {}
  _style: StandStyle = new StandStyle()
  get tag() { return 'Grid' }
  drawShape = (ctx: CanvasRenderingContext2D) => {
    const scene = this.getScene()
    if (!scene) return
    this.drawXLine(ctx, scene)
    this.drawYLine(ctx, scene)
  }
  drawXLine(ctx: CanvasRenderingContext2D, scene: Scene) {
    const { viewportWidth, viewportHeight } = scene.viewPort
    const zoom = scene.camera.zoom
    const stepInScene = getStepByZoom(zoom)
    const { x: x1 } = scene.getWorldByPage(0, 0)
    let startX = getClosestTimesVal(x1, stepInScene)
    const { x: x2 } = scene.getWorldByPage(viewportWidth, 0)
    const endX = getClosestTimesVal(x2, stepInScene) + stepInScene
    // startX = startX % globalConfig.gridSize ? startX - globalConfig.gridSize / 2 : startX - globalConfig.gridSize
    while (startX % globalConfig.gridSize) {
      startX -= stepInScene
    }
    // startX -= stepInScene
    // console.log('drawXLine', startX, endX, stepInScene,globalConfig.gridSize);
    ctx.save()
    while (startX <= endX) {
      // const { x } = scene.getWorldByPage(startX, 0)
      const x = (startX - x1) * zoom
      ctx.strokeStyle = globalConfig.gridColor
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, viewportHeight)
      ctx.stroke()
      ctx.closePath()
      startX += globalConfig.gridSize
    }
    ctx.restore()
  }
  drawYLine(ctx: CanvasRenderingContext2D, scene: Scene) {
    const { viewportWidth, viewportHeight } = scene.viewPort
    const zoom = scene.camera.zoom
    const stepInScene = getStepByZoom(zoom)
    const { y: y1 } = scene.getWorldByPage(0, 0)
    let startY = getClosestTimesVal(y1, stepInScene)
    const { y: y2 } = scene.getWorldByPage(0, viewportHeight)
    const endY = getClosestTimesVal(y2, stepInScene) + stepInScene
    // startY = startY % globalConfig.gridSize ? startY - globalConfig.gridSize / 2 : startY - globalConfig.gridSize
    while (startY % globalConfig.gridSize) {
      startY -= stepInScene
    }
    // startY -= stepInScene
    // console.log('startY', endY);
    ctx.save()
    while (startY <= endY) {
      const y = (startY - y1) * zoom
      // const { y } = scene.getWorldByPage(0, startY)
      ctx.strokeStyle = globalConfig.gridColor
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(viewportWidth, y)
      ctx.stroke()
      ctx.closePath()
      startY += globalConfig.gridSize
    }
    ctx.restore()
  }
}
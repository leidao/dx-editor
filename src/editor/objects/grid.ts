/*
 * @Description: 网格
 * @Author: ldx
 * @Date: 2024-08-28 14:10:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-08 17:29:04
 */
import globalConfig from '../config'
import { App, Group, Line, MoveEvent, ResizeEvent, ZoomEvent } from "leafer-ui";
import { getStepByZoom, getClosestTimesVal } from '@/editor/utils'
export default class Grid {
  group = new Group()
  constructor(private app: App) {
    this.app.ground.add(this.group)
    this.listen()
    this.drawShape()
  }
  get visible(): boolean {
    return this.group.visible || false
  }
  set visible(visible: boolean) {
    this.group.visible = visible
    this.drawShape()
  }
  drawShape = () => {
    if (this.visible) {
      this.group.clear()
      this.drawXLine()
      this.drawYLine()
    }
  }

  drawXLine = () => {
    const zoom = this.getZoom()
    const stepInScene = getStepByZoom(zoom)
    const { x: x1 } = this.app.getPagePoint({ x: 0, y: 0 })
    let startX = getClosestTimesVal(x1, stepInScene)
    const { x: x2 } = this.app.getPagePoint({ x: this.app.width!, y: 0 })
    const endX = getClosestTimesVal(x2, stepInScene) + stepInScene
    startX = startX % globalConfig.gridSize ? startX - globalConfig.gridSize / 2 : startX - globalConfig.gridSize
    // console.log('startX', startX, endX, stepInScene);
    while (startX <= endX) {
      const x = this.app.getWorldPointByPage({ x: startX, y: 0 }).x
      const line = new Line({
        width: this.app.height,
        strokeWidth: 1,
        stroke: globalConfig.gridColor,
        rotation: 90,
        x: x,
        y: 0,
      })
      this.group.add(line)
      startX += globalConfig.gridSize
    }
  }
  drawYLine =() => {
    const zoom = this.getZoom()
    const stepInScene = getStepByZoom(zoom)
    const { y: y1 } = this.app.getPagePoint({ x: 0, y: 0 })
    let startY = getClosestTimesVal(y1, stepInScene)
    const { y: y2 } = this.app.getPagePoint({ x: 0, y: this.app.height! })
    const endY = getClosestTimesVal(y2, stepInScene) + stepInScene
    startY = startY % globalConfig.gridSize ? startY - globalConfig.gridSize / 2 : startY - globalConfig.gridSize
    // console.log('startY', endY);
    while (startY <= endY) {
      const y = (startY - y1) * zoom
      const line = new Line({
        width: this.app.width,
        strokeWidth: 1,
        stroke: globalConfig.gridColor,
        x: 0,
        y: y,
      })
      this.group.add(line)
      startY += globalConfig.gridSize
    }
  }

  listen() {
    this.app.tree.on(MoveEvent.MOVE, this.drawShape)
    this.app.tree.on(ZoomEvent.ZOOM, this.drawShape)
    this.app.tree.on(ResizeEvent.RESIZE, this.drawShape)
  }
  destroy() {
    this.app.tree.off(MoveEvent.MOVE, this.drawShape)
    this.app.tree.off(ZoomEvent.ZOOM, this.drawShape)
    this.app.tree.off(ResizeEvent.RESIZE, this.drawShape)
  }
  getZoom(): number {
    if (this.app.tree) {
      if (typeof this.app.tree.scale === 'number') {
        return this.app.tree.scale
      } else {
        return 1
      }
    } else {
      return 1
    }
  }
}
/*
 * @Description: 网格
 * @Author: ldx
 * @Date: 2024-08-28 14:10:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-29 10:52:49
 */
import globalConfig from '../config'
import { App, Group, LayoutEvent, Line, ResizeEvent } from "leafer-ui";
import { getStepByZoom, getClosestTimesVal } from './ruler'
export default class Grid {
  group = new Group()
  constructor(private app: App) {
    this.app.ground.add(this.group)
    this.listen()
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
    // console.log('startX', endX, stepInScene);
    while (startX <= endX) {
      const x = (startX - x1) * zoom
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
  drawYLine = () => {
    const zoom = this.getZoom()
    const stepInScene = getStepByZoom(zoom)
    const { y: y1 } = this.app.getPagePoint({ x: 0, y: 0 })
    let startY = getClosestTimesVal(y1, stepInScene)
    const { y: y2 } = this.app.getPagePoint({ x: 0, y: this.app.height! })
    const endY = getClosestTimesVal(y2, stepInScene) + stepInScene
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
    this.app.tree.on(LayoutEvent.AFTER, this.drawShape)
    this.app.tree.on(ResizeEvent.RESIZE, this.drawShape)
  }
  destroy() {
    this.app.tree.off(LayoutEvent.AFTER, this.drawShape)
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
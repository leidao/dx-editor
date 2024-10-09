/*
 * @Description: 辅助线
 * @Author: ldx
 * @Date: 2024-08-28 14:10:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-08 09:35:09
 */
import globalConfig from '../config'
import { App, Line, MoveEvent, ResizeEvent, Event, PointerEvent } from "leafer-ui";
import { getClosestTimesVal } from '../utils';
import _ from 'lodash';
export default class HelpLine {
  xLine!: Line
  yLine!: Line
  lineColor = '#f00'
  constructor(private app: App) {
    this.xLine = new Line({
      width: this.app.width,
      strokeWidth: 1,
      stroke: globalConfig.helpLineColor,
      x: 0,
      y: 0,
      dashPattern: [5, 5],
      visible: this.visible
    })
    this.yLine = new Line({
      width: this.app.height,
      strokeWidth: 1,
      stroke: globalConfig.helpLineColor,
      rotation: 90,
      dashPattern: [5, 5],
      visible: this.visible
    })
    this.app.sky.add(this.xLine)
    this.app.sky.add(this.yLine)
    this.listen()
  }
  private _visible = false
  get visible(): boolean {
    return this._visible
  }
  set visible(visible: boolean) {
    this._visible = visible
    this.xLine.visible = visible
    this.yLine.visible = visible
    if(!visible){
      this.xLine.y = 0
      this.yLine.x = 0
    }
  }
  drawShape = _.throttle((event: Event) => {
    if (!globalConfig.helpLineVisible) return
    if (!this.visible) return
    if (event.type === 'resize' && event instanceof ResizeEvent) {
      this.xLine.width = event.width
      this.yLine.width = event.height
    } else if (event.type === 'pointer.move' && event instanceof PointerEvent) {
      const pagePoint = this.app.getPagePoint({ x: event.x, y: event.y })
      let x = getClosestTimesVal(pagePoint.x, globalConfig.moveSize)
      let y = getClosestTimesVal(pagePoint.y, globalConfig.moveSize)
      const worldPoint = this.app.getWorldPointByPage({x,y})
      this.xLine.y = worldPoint.y
      this.yLine.x = worldPoint.x
    } else if (event.type === 'move' && event instanceof MoveEvent) {
      this.xLine.y = (this.xLine.y || 0) + event.moveY
      this.yLine.x = (this.yLine.x || 0) + event.moveX
    }
  },16)
  listen() {
    this.app.on(PointerEvent.MOVE, this.drawShape)
    this.app.tree.on(MoveEvent.MOVE, this.drawShape)
    this.app.tree.on(ResizeEvent.RESIZE, this.drawShape)
  }
  destroy() {
    this.app.off(PointerEvent.MOVE, this.drawShape)
    this.app.tree.off(MoveEvent.MOVE, this.drawShape)
    this.app.tree.off(ResizeEvent.RESIZE, this.drawShape)
  }




}
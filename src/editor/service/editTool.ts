/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-09 15:28:57
 */
import { IEditorMoveEvent, IUI } from "@leafer-in/interface"
import { EditToolCreator, registerEditTool, PointerEvent, DragEvent } from "leafer-editor"
import globalConfig from '../config'
import EditSelect from "./editSelect"
import { getClosestTimesVal } from "../utils"

export type HoverEvent = {
  element: IUI 
  type: 'hover' | 'hoverEnter' | 'hoverLeave'
  event: PointerEvent
}
export type SelectEvent = {
  element: IUI 
  type: 'select' | 'unSelect'
  event: PointerEvent | null
}


@registerEditTool()
export default abstract class EditTool {
  static registerEditTool() {
    EditToolCreator.register(this)
  }
  moveData = {x:0,y:0}
  constructor(public selector: EditSelect) { }
  /** 元素移动 */
  onMove(event: DragEvent) {
    const { list, app, dragging, downData } = this.selector
    // const { moveX, moveY, target } = event
    const { moveSize, gridSize } = globalConfig
    const distance = app.getWorldPointByPage({ x: moveSize, y: 0 }, app.leafer, true).x
    let moveX = 0, moveY = 0

    if (dragging) {
      let x = getClosestTimesVal(event.x, distance)
      let y = getClosestTimesVal(event.y, distance)
      let x2 = getClosestTimesVal(downData.x, distance)
      let y2 = getClosestTimesVal(downData.y, distance)
      moveX = x - x2
      moveY = y - y2
      // moveX = Math.round(diffX / distance) * distance
      // moveY = Math.round(diffY / distance) * distance
    } else {
      moveX = event.moveX === 0 ? moveX : event.moveX > 0 ? distance : -distance
      moveY = event.moveY === 0 ? moveY : event.moveY > 0 ? distance : -distance
    }
    if (moveX === 0 && moveY === 0) return
    this.moveData.x = moveX
    this.moveData.y = moveY
    this.selector.downData = event
    app.lockLayout()
    list.forEach(target => {
      target.moveWorld(moveX, moveY)
    })
    app.unlockLayout()
  }
  /** 移入元素 */
  abstract onHoverEnter(event: HoverEvent): void
  /** 在元素上移动 */
  abstract onHover(event: HoverEvent): void
  /** 移出元素 */
  abstract onHoverLeave(event: HoverEvent): void
  /** 选中元素 */
  abstract onSelect(event: SelectEvent): void
  /** 取消元素选中 */
  abstract onUnSelect(event: SelectEvent): void
  onLoad() {
    console.log('onLoad');
  }
  onUpdate() {
    console.log('onUpdate');
  }
  onUnload() {
    console.log('onUnload');
  }
}

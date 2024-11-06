/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-06 15:36:04
 */

import { EditToolCreator, registerEditTool, } from "./EditToolCreator"
import { PointerEvent, DragEvent, EditorEvent } from '../../event'
import globalConfig from '../../config'
// import EditSelect from "./editSelect"
import { getClosestTimesVal } from "../../utils"
import { Object2D } from "@/dxCanvas";
import { EditorView } from "@/dxEditor";
import { IPointerEvent } from "@/dxCanvas/event";

export default class EditTool {
  public get tag() { return 'EditTool' }
  static registerEditTool() {
    EditToolCreator.register(this)
  }
  editBoxMap = new Map()
  // moveData = { x: 0, y: 0 }
  constructor(public editor: EditorView) { }
  /** 元素移动 */
  onDrag(event: DragEvent) {
    const { list, dragging, downData } = this.editor.selector
    const origin = event.origin as IPointerEvent
    const { moveSize, gridSize } = globalConfig
    // console.log('===',event.origin);
    const distance = this.editor.tree.getPageLenByWorld(moveSize, 0).x
    // console.log('distance',distance);

    let moveX = 0, moveY = 0

    if (dragging) {
      let x = getClosestTimesVal(origin!.x, distance)
      let y = getClosestTimesVal(origin!.y, distance)
      let x2 = getClosestTimesVal(downData!.x, distance)
      let y2 = getClosestTimesVal(downData!.y, distance)
      // console.log('====',x,y,x2,y2,origin!.x,downData!.x);

      moveX = x - x2
      moveY = y - y2
      // moveX = Math.round(diffX / distance) * distance
      // moveY = Math.round(diffY / distance) * distance
    } else {
      moveX = event.moveX === 0 ? moveX : event.moveX > 0 ? distance : -distance
      moveY = event.moveY === 0 ? moveY : event.moveY > 0 ? distance : -distance
    }
    if (moveX === 0 && moveY === 0) return
    // this.moveData.x = moveX
    // this.moveData.y = moveY
    this.editor.selector.downData = origin
    // console.log('moveX, moveY',moveX, moveY);
    const coord = this.editor.tree.getWorldLenByPage(moveX, moveY)

    list.forEach(element => {
      element.position.add(coord)
      element.computeBoundsBox(true)
    })
    return true
  }
  onDragEnd(event: DragEvent) {
    const { list } = this.editor.selector
    list.forEach(element => {
      element.computeBoundsBox(true)
    })
  }
  onHoverEnter(event: EditorEvent) {
    const element = event.target as Object2D
    this.editor.cursor.setCursor('move')
    if (this.editor.selector.leafList.has(element)) return
    element.state = 'hoverEnter'
    this.updateEditBox(element)
  }
  onHover(event: EditorEvent) {
    // ew-resize 'ns-resize'
  }
  onHoverLeave(event: EditorEvent) {
    const element = event.target as Object2D
    this.editor.cursor.setCursor('auto')
    if (this.editor.selector.leafList.has(element)) return
    element.state = 'hoverLeave'
    this.updateEditBox(element)
  }

  onSelect(event: EditorEvent) {
    const element = event.target as Object2D
    this.editor.cursor.setCursor('move')
    element.state = 'select'
    this.updateEditBox(element)

  }
  onUnSelect(event: EditorEvent) {
    const element = event.target as Object2D
    this.editor.cursor.setCursor('auto')
    element.state = 'none'
    this.updateEditBox(element)
  }
  updateEditBox(element: Object2D) {
    this.editor.tree.render()
  }
}

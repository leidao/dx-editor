/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-11-06 18:00:04
 */

import { EditToolCreator, registerEditTool, } from "./EditToolCreator"
import { PointerEvent, DragEvent, EditorEvent } from '../../event'
import globalConfig from '../../config'
// import EditSelect from "./editSelect"
import { getClosestTimesVal } from "../../utils"
import { Object2D, Vector2 } from "@/dxCanvas";
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
    const coord = this.editor.tree.getWorldLenByPage(event.moveX, event.moveY)
    event.target?.position.add(coord)
    event.target?.computeBoundsBox(true)
  }
  onDragEnd(event: DragEvent) {
    event.target?.computeBoundsBox(true)
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

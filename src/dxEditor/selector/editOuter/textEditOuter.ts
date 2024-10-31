/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-09-27 16:04:35
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-30 17:56:31
 */

import { Text } from "@/dxCanvas"
import EditTool from "../editTool/editTool"
import { EditorEvent } from "@/dxEditor/event"

export default class TextEditOuter extends EditTool {
  public get tag() { return 'TextEditOuter' }

  onHoverEnter(event: EditorEvent) {
    const element = event.target as Text
    this.editor.cursor.setCursor('move')
    if (this.editor.selector.leafList.has(element)) return
    element.state = 'hoverEnter'
    this.updateEditBox(element)
  }
  onHover(event: EditorEvent) {
    // ew-resize 'ns-resize'
  }
  onHoverLeave(event: EditorEvent) {
    const element = event.target as Text
    this.editor.cursor.setCursor('auto')
    if (this.editor.selector.leafList.has(element)) return
    element.state = 'hoverLeave'
    this.updateEditBox(element)
  }

  onSelect(event: EditorEvent) {
    const element = event.target as Text
    this.editor.cursor.setCursor('move')
    element.state = 'select'
    this.updateEditBox(element)

  }
  onUnSelect(event: EditorEvent) {
    const element = event.target as Text
    this.editor.cursor.setCursor('auto')
    element.state = 'none'
    this.updateEditBox(element)
  }
  updateEditBox(element: Text) {
    this.editor.tree.render()
  }
}


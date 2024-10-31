/*
 * @Description: 操作图形
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-29 16:32:49
 */

import { EditorView } from '@/dxEditor'
import ToolBase from './toolBase'
import { DragEvent, PointerEvent } from '@/dxEditor/event'
import { IPointerEvent } from '@/dxCanvas/event'
export default class ToolDragCanvas extends ToolBase {
  readonly type = 'dragCanvas'
  constructor(editor: EditorView) {
    super(editor)
  }
  onDown = (event: PointerEvent) => {
    this.editor.orbitControler.pointerdown(event.origin as IPointerEvent)
    this.editor.cursor.setCursor('grabbing')
  }
  onUp = () => {
    this.editor.orbitControler.pointerup()
    this.editor.cursor.setCursor('grab')
  }
  onDrag = (event: DragEvent) => {
    this.editor.orbitControler.pointermove(event.origin as IPointerEvent)
  }
  active() {
    this.editor.selector.hittable = false
    this.editor.cursor.setCursor('grab')
    this.editor.addEventListener(PointerEvent.DOWN, this.onDown)
    this.editor.addEventListener(PointerEvent.UP, this.onUp)
    this.editor.addEventListener(DragEvent.DRAG, this.onDrag)
  }
  inactive() {
    this.editor.cursor.setCursor('auto')
    this.editor.selector.hittable = true
    this.editor.removeEventListener(PointerEvent.DOWN, this.onDown)
    this.editor.removeEventListener(PointerEvent.UP, this.onUp)
    this.editor.removeEventListener(DragEvent.DRAG, this.onDrag)
  }
}


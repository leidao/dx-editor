/*
 * @Description: 绘制线段
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-11 15:01:20
 */
import { v4 } from 'uuid'
import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { DragEvent, Line } from 'leafer-editor'
import _ from 'lodash'
import { updateLinePoints } from './common'


export default class ToolDrawLine extends ToolBase {
  readonly keyboard = 'l'
  readonly type = 'drawLine'
  line!: Line
  constructor(view: EditorView) {
    super(view)
  }

  start = (e: DragEvent) => {
    const { x, y } = this.app.getPagePoint({ x: e.x, y: e.y })
    this.line = new Line({
      editable: true,
      strokeWidth: 2,
      stroke: '#ff0000',
      x, y,
      name: '线段',
      id: v4()
    })
    this.app.tree.add(this.line)
  }

  drag = _.throttle((e: DragEvent) => {
    if (this.line) {
      const { x, y } = this.app.getPagePointByClient(e.origin as any)
      updateLinePoints(this.line, { x, y }, 3)
    }
  }, 16)

  end = () => {
    this.app.tree.emit('add')
  }
  active() {
    this.app.editor.visible = false
    this.app.tree.hitChildren = false
    this.app.on(DragEvent.START, this.start)
    this.app.on(DragEvent.DRAG, this.drag)
    this.app.on(DragEvent.END, this.end)
  }
  inactive() {
    this.app.editor.visible = true
    this.app.tree.hitChildren = true
    this.app.off(DragEvent.START, this.start)
    this.app.off(DragEvent.DRAG, this.drag)
    this.app.off(DragEvent.END, this.end)
  }

}

